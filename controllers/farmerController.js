// controllers/farmerController.js
const Farmer = require('../models/Farmer');

exports.getAllFarmers = async (req, res) => {
  try {
    const farmers = await Farmer.find();
    res.status(200).json({
      message: 'Farmer entries fetched successfully',
      status: 'success',
      data: farmers
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch farmer entries',
      status: 'error',
      data: null
    });
  }
};


exports.getFarmerById = async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) {
      return res.status(404).json({
        message: 'Entry not found',
        status: 'error',
        data: null
      });
    }
    res.status(200).json({
      message: 'Farmer entry fetched successfully',
      status: 'success',
      data: farmer
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch entry',
      status: 'error',
      data: null
    });
  }
};

// POST create farmer entry
exports.createFarmer = async (req, res) => {
  try {
    const { blogTitle, blogurl, date, description, category, readTime, severity, author } = req.body;

    if (!author) {
      return res.status(400).json({
        message: 'Author is required',
        status: 'error',
        data: null
      });
    }

    const newFarmer = new Farmer({
      blogTitle,
      blogurl,
      date,
      description,
      category,
      readTime,
      severity,
      author,  
    });

    const savedFarmer = await newFarmer.save();

    res.status(201).json({
      message: 'Farmer entry created successfully',
      status: 'success',
      data: savedFarmer
    });
  } catch (err) {
    res.status(400).json({
      message: 'Failed to create entry',
      status: 'error',
      data: null
    });
  }
};


// PUT update farmer entry
exports.updateFarmer = async (req, res) => {
  try {
    const updatedFarmer = await Farmer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedFarmer) {
      return res.status(404).json({
        message: 'Entry not found',
        status: 'error',
        data: null
      });
    }
    res.status(200).json({
      message: 'Farmer entry updated successfully',
      status: 'success',
      data: updatedFarmer
    });
  } catch (err) {
    res.status(400).json({
      message: 'Failed to update entry',
      status: 'error',
      data: null
    });
  }
};

// DELETE farmer entry
exports.deleteFarmer = async (req, res) => {
  try {
    const deleted = await Farmer.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        message: 'Entry not found',
        status: 'error',
        data: null
      });
    }
    res.status(200).json({
      message: 'Farmer entry deleted successfully',
      status: 'success',
      data: deleted
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to delete entry',
      status: 'error',
      data: null
    });
  }
};
