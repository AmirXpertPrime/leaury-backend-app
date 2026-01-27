const Customer = require("../models/Customer");

exports.deleteCustomerApi = async (req, res) => {
  try {
    const { id } = req.query;

    const customer = await Customer.findOneAndUpdate(
      {
        shopify_customer_id: id,
        isDeleted: false,
      },
      { isDeleted: true },
      { new: true }
    );
    console.log('customer============', customer);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found ",
      });
    }

    res.status(200).json({
      message: "Customer deleted successfully",
      customer,
    });
  } catch (error) {
    console.error("Delete Customer API Error:", error);
    res.status(500).json({
      message: "Failed to delete customer",
      error: error.message,
      status: 500,
    });
  }
};
