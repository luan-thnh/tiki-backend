const express = require('express');
const orderController = require('../controllers/order.controller');
const orderRouter = express.Router();

orderRouter.get('/', orderController.getAllOrder);
orderRouter.get('/:userId', orderController.getOrderByUserId);
orderRouter.post('/', orderController.createNewOrder);
orderRouter.put('/:orderId', orderController.updateOrderById);
orderRouter.put('/:orderId/status', orderController.updateStatusOrder);
orderRouter.delete('/:orderId', orderController.deleteOrderById);

orderRouter.get('/details/:orderId', orderController.getOrderDetails);
orderRouter.get('/details/:userId/:productId', orderController.getProductOrderByUserId);
orderRouter.put('/details/:orderId', orderController.updateOrderDetailsByOrderId);
orderRouter.get('/cart/:userId', orderController.getProductToCart);
orderRouter.delete('/cart/:orderId/:productId', orderController.deleteProductInCart);

orderRouter.post('/checkout', orderController.createOrderCheckout);
orderRouter.post('/:orderID/capture', orderController.createOrderCapture);

module.exports = orderRouter;
