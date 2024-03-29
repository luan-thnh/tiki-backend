const express = require('express');
const productController = require('../controllers/product.controller');
const { checkUserLogin, checkAdminLogin } = require('../middleware/checkLogin.middleware');
const productRouter = express.Router();

productRouter.get('/', productController.getAllProduct);
productRouter.get('/:productId', productController.getProductById);
productRouter.post('/', productController.createNewProduct);
productRouter.post('/all', productController.createAllProduct);
productRouter.put('/:productId', productController.updateProductById);
productRouter.delete('/:productId', checkAdminLogin, productController.deleteProductById);

module.exports = productRouter;
