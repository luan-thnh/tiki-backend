const express = require('express');
const orderController = require('../controllers/order.controller');
const orderRouter = express.Router();

orderRouter.get('/', orderController.getAllOrder);
orderRouter.get('/:userId', orderController.getOrderByUserId);
orderRouter.post('/', orderController.createNewOrder);
orderRouter.put('/:orderId', orderController.updateOrderById);
orderRouter.delete('/:orderId', orderController.deleteOrderById);

orderRouter.get('/details/:orderId', orderController.getOrderDetails);
orderRouter.get('/details/:userId/:productId', orderController.getProductOrderByUserId);
orderRouter.put('/details/:orderId', orderController.updateOrderDetailsByOrderId);
orderRouter.get('/cart/:userId', orderController.getProductToCart);
orderRouter.delete('/cart/:orderId/:productId', orderController.deleteProductInCart);

module.exports = orderRouter;
