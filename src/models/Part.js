const mongoose = require("mongoose");

const sellerListingSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerName: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    mrp: Number,
    dealerPrice: Number, // B2B price
    stock: { type: Number, default: 0, min: 0 },
    isFreeDelivery: { type: Boolean, default: false },
    deliveryDays: { type: Number, default: 3 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    isActive: { type: Boolean, default: true },
  },
  { _id: true },
);

const compatibilitySchema = new mongoose.Schema(
  {
    make: { type: String, required: true },
    model: { type: String, required: true },
    yearFrom: { type: Number, required: true },
    yearTo: { type: Number, required: true },
    fuelType: String,
    variant: String,
  },
  { _id: false },
);

const partSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    description: String,
    oemNumber: String,
    partNumber: String,
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    images: [String],
    specifications: mongoose.Schema.Types.Mixed, // { 'Material': 'Aluminum', 'Weight': '1.2 kg', ... }
    compatibility: [compatibilitySchema],
    sellerListings: [sellerListingSchema],
    // Aggregated fields (updated via hooks)
    price: { type: Number, default: 0 }, // min price across sellers
    mrp: Number,
    stock: { type: Number, default: 0 }, // total across sellers
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    tags: [String],
  },
  { timestamps: true },
);

partSchema.index({ brandId: 1, categoryId: 1 });
partSchema.index({ "compatibility.make": 1, "compatibility.model": 1 });
partSchema.index({ oemNumber: 1 }, { sparse: true });
partSchema.index({ name: "text", description: "text", tags: "text" });

// Sync min price & stock from listings
partSchema.methods.syncAggregates = function () {
  const active = this.sellerListings.filter((s) => s.isActive && s.stock > 0);
  if (active.length > 0) {
    this.price = Math.min(...active.map((s) => s.price));
    this.mrp = Math.max(...active.map((s) => s.mrp || s.price));
    this.stock = active.reduce((sum, s) => sum + s.stock, 0);
  } else {
    this.stock = 0;
  }
};

const Part = mongoose.model("Part", partSchema);
module.exports = Part;
