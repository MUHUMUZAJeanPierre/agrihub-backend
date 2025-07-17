const Product = require('../models/Product');


exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
};


exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ message: 'Invalid product ID', error: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      current_price,
      past_price,
      img,
      category,
      region
    } = req.body;

    // ✅ Get farmer from authenticated user
    const farmer = req.user?.id;

    if (!farmer) {
      return res.status(400).json({
        message: 'Farmer ID is required (from authenticated token)',
        status: 'error',
        data: null
      });
    }

    if (!title || !description || !current_price || !past_price || !img || !category) {
      return res.status(400).json({
        message: 'Missing required fields',
        status: 'error',
        data: null
      });
    }

    const allowedCategories = [
      'vegetables', 'fruits', 'grains', 'tubers', 'legumes',
      'seeds', 'herbs', 'oil_crops', 'cereals', 'packaged'
    ];

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        message: `Invalid category. Allowed categories are: ${allowedCategories.join(', ')}`,
        status: 'error',
        data: null
      });
    }

    const newProduct = new Product({
      title,
      description,
      current_price,
      past_price,
      img,
      category,
      region,
      farmer // ✅ Assign authenticated user ID here
    });

    const savedProduct = await newProduct.save();

    return res.status(201).json({
      message: 'Product created successfully',
      status: 'success',
      data: savedProduct
    });

  } catch (err) {
    console.error('Create Product Error:', err.message);
    return res.status(500).json({
      message: 'Failed to create product',
      status: 'error',
      data: null,
      error: err.message
    });
  }
};



exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to update this product' });
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update product', error: err.message });
  }
};



exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to delete this product' });
    }

    await product.deleteOne();
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete product', error: err.message });
  }
};


exports.getMyProducts = async (req, res) => {
  try {
    const farmerId = req.user.id;

    const products = await Product.find({ farmer: farmerId }).sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Fetched your products successfully',
      status: 'success',
      data: products,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch your products',
      status: 'error',
      error: err.message,
    });
  }
};
