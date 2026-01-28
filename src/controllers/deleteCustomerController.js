const Customer = require("../models/Customer");
const { validateNumericId } = require("../utils/validators");

exports.deleteCustomerApi = async (req, res, next) => {
  try {
    const { id } = req.query;

    // Validate input
    const shopifyId = validateNumericId(id, "Customer ID");

    // Find and soft-delete customer
    const customer = await Customer.findOneAndUpdate(
      {
        shopify_customer_id: shopifyId,
        isDeleted: false,
      },
      { isDeleted: true },
      { new: true }
    );

    if (!customer) {
      const error = new Error("Customer not found");
      error.status = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      status: 200,
      message: "Customer deleted successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};
