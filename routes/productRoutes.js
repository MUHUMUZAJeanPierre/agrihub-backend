const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
router.get('/', productController.getAllProducts);
// Fetch products created by the authenticated farmer
router.get('/my-products', authMiddleware, productController.getMyProducts);



router.get('/:id', productController.getProductById);

router.post('/',  authMiddleware ,productController.createProduct);
router.put('/:id',  authMiddleware,productController.updateProduct);
router.delete('/:id', authMiddleware,productController.deleteProduct);


module.exports = router;
