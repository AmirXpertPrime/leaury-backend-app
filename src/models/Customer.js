const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    shopify_customer_id: { 
      type: Number, 
      required: true,
      unique: true,
      sparse: true,
    },
    first_name: { 
      type: String, 
      trim: true,
    },
    last_name: { 
      type: String, 
      trim: true,
    },
    email: { 
      type: String, 
      required: true,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/.+\@.+\..+/, "Please provide a valid email"],
    },
    phone: { 
      type: String, 
      trim: true,
    },
    address1: { 
      type: String, 
      trim: true,
    },
    city: { 
      type: String, 
      trim: true,
    },
    province: { 
      type: String, 
      trim: true,
    },
    zip: { 
      type: String, 
      trim: true,
    },
    country: { 
      type: String, 
      trim: true,
    },
    isDeleted: { 
      type: Boolean, 
      default: false,
      index: true,
    },
  },
  { 
    timestamps: true,
  },
);

// Indexes for common queries
customerSchema.index({ shopify_customer_id: 1, isDeleted: 1 });
customerSchema.index({ email: 1 });

module.exports = mongoose.model("Customer", customerSchema);
