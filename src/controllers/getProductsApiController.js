const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');
const OrderLineItem = require('../models/OrderLineItem');

const {
    escapeRegex,
    buildTagContainsRegex,
    getPagination,
    normalizeMinMax,
    priceToNumberExpr,
    priceRangeExpr,
    unpackFacetResult,
} = require('../utils/helper');

async function buildProductFilter({ search, minPrice, maxPrice, productType }) {
    const and = [{ status: 'active' }];
    const normalized = normalizeMinMax(minPrice, maxPrice);
    const hasPriceFilter = normalized.hasFilter;

    const trimmedSearch = (search || '').trim();
    const regex = trimmedSearch ? new RegExp(escapeRegex(trimmedSearch), 'i') : null;
    const variantIdsBySearchPromise = regex
        ? ProductVariant.distinct('product_id', {
            $or: [
                { sku: regex },
                { title: regex },
                { barcode: regex },
                { option1: regex },
                { option2: regex },
                { option3: regex },
            ],
        })
        : Promise.resolve([]);

    const priceExpr = hasPriceFilter
        ? priceRangeExpr({ minPrice: normalized.min, maxPrice: normalized.max })
        : null;
    const variantIdsByPricePromise = priceExpr
        ? ProductVariant.distinct('product_id', priceExpr)
        : Promise.resolve([]);

    const [variantProductIds, variantProductIdsByPrice] = await Promise.all([
        variantIdsBySearchPromise,
        variantIdsByPricePromise,
    ]);

    if (regex) {
        const or = [
            { title: regex },
            { vendor: regex },
            { product_type: regex },
            { tags: regex },
            { sku: regex },
        ];

        if (variantProductIds.length) {
            or.push({ _id: { $in: variantProductIds } });
        }

        const asNumber = Number(trimmedSearch);
        if (!Number.isNaN(asNumber)) {
            or.push({ shopify_id: asNumber });
        }

        and.push({ $or: or });
    }

    const trimmedProductType = String(productType || '').trim();
    if (trimmedProductType) {
        const productTypeRegex = new RegExp(`^${escapeRegex(trimmedProductType)}$`, 'i');
        const tagRegex = buildTagContainsRegex(trimmedProductType) || new RegExp(escapeRegex(trimmedProductType), 'i');
        and.push({
            $or: [{ product_type: productTypeRegex }, { tags: tagRegex }],
        });
    }

    if (priceExpr) {
        const priceOr = [priceExpr];
        if (variantProductIdsByPrice.length) {
            priceOr.push({ _id: { $in: variantProductIdsByPrice } });
        }

        and.push({ $or: priceOr });
    }

    return and.length === 1 ? and[0] : { $and: and };
}

const PRODUCT_FIELDS_PROJECTION = Object.freeze({
    shopify_id: 1,
    title: 1,
    body_html: 1,
    vendor: 1,
    product_type: 1,
    tags: 1,
    status: 1,
    price: 1,
    compare_at_price: 1,
    sku: 1,
    inventory_quantity: 1,
    main_image_src: 1,
    images: 1,
    options: 1,
});

exports.getProductsApi = async (req, res, next) => {
    try {
        const { page, limit, skip } = getPagination(req.query, { defaultLimit: 10 });
        const filter = await buildProductFilter({
            search: req.query.search,
            minPrice: req.query.minPrice,
            maxPrice: req.query.maxPrice,
            productType: req.query.product_type,
        });

        const variantCollection = ProductVariant.collection.name;
        const orderLineItemCollection = OrderLineItem.collection.name;
        const sort = String(req.query.sort || 'featured').trim();
        let productsWithVariants = [];
        let totalProducts = 0;

        const dataPipeline = (() => {
            // Price sorting: sort by "effective" price = min(product.price, min(variant.price))
            if (sort === 'low-high' || sort === 'high-low') {
                const effectivePriceMissingSentinel = 1e18;
                const direction = sort === 'high-low' ? -1 : 1;

                return [
                    {
                        $lookup: {
                            from: variantCollection,
                            localField: '_id',
                            foreignField: 'product_id',
                            as: 'productVariant',
                        },
                    },
                    {
                        $addFields: {
                            __productPriceNum: priceToNumberExpr(),
                            __variantMinPrice: {
                                $min: {
                                    $map: {
                                        input: '$productVariant',
                                        as: 'v',
                                        in: priceToNumberExpr('$$v.price'),
                                    },
                                },
                            },
                        },
                    },
                    {
                        $addFields: {
                            __effectiveSortPrice: {
                                $min: [
                                    { $ifNull: ['$__productPriceNum', effectivePriceMissingSentinel] },
                                    { $ifNull: ['$__variantMinPrice', effectivePriceMissingSentinel] },
                                ],
                            },
                        },
                    },
                    { $sort: { __effectiveSortPrice: direction, _id: 1 } },
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $project: {
                            ...PRODUCT_FIELDS_PROJECTION,
                            productVariant: 1,
                        },
                    },
                ];
            }

            // Best selling: sort by sum(OrderLineItem.quantity) per product
            if (sort === 'best_selling') {
                return [
                    {
                        $lookup: {
                            from: orderLineItemCollection,
                            let: { pid: '$_id' },
                            pipeline: [
                                { $match: { $expr: { $eq: ['$product_id', '$$pid'] } } },
                                {
                                    $group: {
                                        _id: null,
                                        qty: { $sum: { $ifNull: ['$quantity', 0] } },
                                    },
                                },
                            ],
                            as: '__sales',
                        },
                    },
                    {
                        $addFields: {
                            __soldQty: { $ifNull: [{ $first: '$__sales.qty' }, 0] },
                        },
                    },
                    { $sort: { __soldQty: -1, _id: 1 } },
                    { $skip: skip },
                    { $limit: limit },
                    { $project: PRODUCT_FIELDS_PROJECTION },
                    {
                        $lookup: {
                            from: variantCollection,
                            localField: '_id',
                            foreignField: 'product_id',
                            as: 'productVariant',
                        },
                    },
                ];
            }

            // Date sorting: use shopify_created_at, fallback to shopify_published_at
            if (sort === 'new-old' || sort === 'old-new') {
                const direction = sort === 'old-new' ? 1 : -1;
                return [
                    {
                        $addFields: {
                            __dateSort: { $ifNull: ['$shopify_created_at', '$shopify_published_at'] },
                        },
                    },
                    { $sort: { __dateSort: direction, _id: 1 } },
                    { $skip: skip },
                    { $limit: limit },
                    { $project: PRODUCT_FIELDS_PROJECTION },
                    {
                        $lookup: {
                            from: variantCollection,
                            localField: '_id',
                            foreignField: 'product_id',
                            as: 'productVariant',
                        },
                    },
                ];
            }

            // Featured (default) or unknown sort: stable default ordering
            return [
                { $sort: { _id: 1 } },
                { $skip: skip },
                { $limit: limit },
                { $project: PRODUCT_FIELDS_PROJECTION },
                {
                    $lookup: {
                        from: variantCollection,
                        localField: '_id',
                        foreignField: 'product_id',
                        as: 'productVariant',
                    },
                },
            ];
        })();

        // Note: price filter affects which products match, but sorting is driven by `sort`.
        // Keeping all sorting in the DB ensures pagination remains correct.
        const facetResult = await Product.aggregate([
            { $match: filter },
            {
                $facet: {
                    data: dataPipeline,
                    total: [{ $count: 'count' }],
                },
            },
        ]);

        const unpacked = unpackFacetResult(facetResult);
        productsWithVariants = unpacked.data;
        totalProducts = unpacked.totalCount;

        return res.status(200).json({
            success: true,
            status: 200,
            message: 'Products fetched successfully',
            data: productsWithVariants,
            pagination: {
                total_products: totalProducts,
                total_pages: Math.ceil(totalProducts / limit),
                current_page: page,
                per_page: limit,
            },
        });

    } catch (err) {
        next(err);
    }
};