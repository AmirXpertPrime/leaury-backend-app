exports.getCategoriesApi = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const img = (p) => `${baseUrl}${p}`;

    return res.status(200).json({
      success: true,
      message: 'Product categories fetched successfully',
      data: [
        {
          id: 1,
          name: 'Shoes',
          image: img('/images/categories/shoes.png'),
          created_at: '2025-11-12T22:05:53.000000Z',
          updated_at: '2025-11-12T22:05:53.000000Z',
          product_sub_category: [
            {
              id: 1,
              category_id: 1,
              name: 'Boots',
              image: img('/images/subcategories/boots.png'),
              created_at: '2025-11-12T22:05:53.000000Z',
              updated_at: '2025-11-12T22:05:53.000000Z',
              deleted_at: null,
            },
            {
              id: 2,
              category_id: 1,
              name: 'Loafers',
              image: img('/images/subcategories/loafers.png'),
              created_at: '2025-11-12T22:05:53.000000Z',
              updated_at: '2025-11-12T22:05:53.000000Z',
              deleted_at: null,
            },
            {
              id: 3,
              category_id: 1,
              name: 'Sandals',
              image: img('/images/subcategories/sandals.png'),
              created_at: '2025-11-12T22:05:53.000000Z',
              updated_at: '2025-11-12T22:05:53.000000Z',
              deleted_at: null,
            },
            {
              id: 4,
              category_id: 1,
              name: 'Exclusive',
              image: img('/images/subcategories/exclusive.png'),
              created_at: '2025-11-12T22:05:53.000000Z',
              updated_at: '2025-11-12T22:05:53.000000Z',
              deleted_at: null,
            },
            {
              id: 5,
              category_id: 1,
              name: 'Derby',
              image: img('/images/subcategories/derby.png'),
              created_at: '2025-11-12T22:05:53.000000Z',
              updated_at: '2025-11-12T22:05:53.000000Z',
              deleted_at: null,
            },
          ],
        },
        {
          id: 2,
          name: 'Bags',
          image: img('/images/categories/bags.png'),
          created_at: '2025-11-12T22:05:53.000000Z',
          updated_at: '2025-11-12T22:05:53.000000Z',
          product_sub_category: [
            {
              id: 7,
              category_id: 2,
              name: 'Backpack',
              image: img('/images/subcategories/backpack.png'),
              created_at: '2025-11-12T22:05:53.000000Z',
              updated_at: '2025-11-12T22:05:53.000000Z',
              deleted_at: null,
            },
            {
              id: 8,
              category_id: 2,
              name: 'Women Bag',
              image: img('/images/subcategories/women_bag.png'),
              created_at: '2025-11-12T22:05:53.000000Z',
              updated_at: '2025-11-12T22:05:53.000000Z',
              deleted_at: null,
            },
            {
              id: 9,
              category_id: 2,
              name: 'Briefcase Leather Bag',
              image: img('/images/subcategories/briefcase_leather_bag.png'),
              created_at: '2025-11-12T22:05:53.000000Z',
              updated_at: '2025-11-12T22:05:53.000000Z',
              deleted_at: null,
            },
            {
              id: 10,
              category_id: 2,
              name: 'Crossbody Bag',
              image: img('/images/subcategories/crossbody_bag.png'),
              created_at: '2025-11-12T22:05:53.000000Z',
              updated_at: '2025-11-12T22:05:53.000000Z',
              deleted_at: null,
            },
            {
              id: 11,
              category_id: 2,
              name: 'Duffle bag',
              image: img('/images/subcategories/duffle_bag.png'),
              created_at: '2025-11-12T22:05:53.000000Z',
              updated_at: '2025-11-12T22:05:53.000000Z',
              deleted_at: null,
            },
          ],
        },
        {
          id: 3,
          name: 'Accessories',
          image: img('/images/categories/accessories.png'),
          created_at: '2025-11-12T22:05:53.000000Z',
          updated_at: '2025-11-12T22:05:53.000000Z',
          product_sub_category: [
            {
              id: 12,
              category_id: 3,
              name: 'Bifold Wallet',
              image: img('/images/subcategories/bifold_bag.png'),
              created_at: '2025-11-12T22:05:53.000000Z',
              updated_at: '2025-11-12T22:05:53.000000Z',
              deleted_at: null,
            },
            {
              id: 13,
              category_id: 3,
              name: 'Long Wallet',
              image: img('/images/subcategories/long_wallet.png'),
              created_at: '2025-11-12T22:05:53.000000Z',
              updated_at: '2025-11-12T22:05:53.000000Z',
              deleted_at: null,
            },
            {
              id: 14,
              category_id: 3,
              name: 'Pouch',
              image: img('/images/subcategories/pouch.png'),
              created_at: '2025-11-12T22:05:53.000000Z',
              updated_at: '2025-11-12T22:05:53.000000Z',
              deleted_at: null,
            },
            {
              id: 16,
              category_id: 3,
              name: 'Fancy',
              image: img('/images/subcategories/fancy.png'),
              created_at: '2025-11-12T22:05:53.000000Z',
              updated_at: '2025-11-12T22:05:53.000000Z',
              deleted_at: null,
            },
          ],
        },
      ],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


