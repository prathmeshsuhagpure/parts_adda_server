const Dealer = require("../models/dealer");

exports.applyDealer = async (req, res) => {
  try {
    const {
      shopName,
      ownerName,
      gstNumber,
      panNumber,
      phone,
      email,
      address,
      city,
      state,
      pincode,
    } = req.body;

    const dealer = new Dealer({
      userId: req.user.id,
      shopName,
      ownerName,
      gstNumber,
      panNumber,
      phone,
      email,
      address,
      city,
      state,
      pincode,
    });

    await dealer.save();

    res.status(201).json({
      success: true,
      message: "Dealer application submitted successfully",
      dealer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
