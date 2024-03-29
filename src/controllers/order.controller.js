const { OrderRequest, OrderDetailsRequest } = require('../data/request/order.request');
const OrderRepository = require('../repositories/order.repository');
const executeQuery = require('../utils/executeQuery.util');
const { OrderResponse, OrderDetailResponse, OrderCartResponse } = require('../data/response/order.response');
const { createOrder, captureOrder } = require('../utils/paypalApi.util');
const { HttpError } = require('../middleware/errorHandler.middleware');

const orderController = {
  getAllOrder: async (req, res, next) => {
    try {
      const PAGE = req.query.page || 1;
      const LIMIT = req.query.limit || 5;
      const TOTAL_ELEMENTS = await executeQuery('SELECT COUNT(id) as count FROM orders');
      const TOTAL_PAGES = Math.ceil(TOTAL_ELEMENTS[0].count / LIMIT);

      const params = {
        ...req.query,
        limit: LIMIT,
        offset: (PAGE - 1) * LIMIT,
      };

      const orders = await OrderRepository.findAllOrder(params);
      const ordersReq = orders.map((order) => new OrderRequest(order));
      const ordersRes = ordersReq.map((order) => new OrderResponse(order));

      res.status(200).json({
        message: 'Thành công',
        data: {
          pagination: {
            page: PAGE,
            limit: LIMIT,
            totalPages: TOTAL_PAGES,
            totalElements: TOTAL_ELEMENTS[0].count,
          },
          orders: ordersRes,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  getOrderByUserId: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const order = await OrderRepository.findOrderByUserId(userId);
      if (!order) {
        return next(new HttpError('Order not found', 404));
      }

      const orderReq = new OrderRequest(order);
      const orderRes = new OrderResponse(orderReq);

      res.status(200).json({
        message: 'Thành công',
        data: orderRes,
      });
    } catch (error) {
      next(error);
    }
  },

  getOrderDetails: async (req, res, next) => {
    try {
      const { orderId } = req.params;

      const orderDetails = await OrderRepository.findOrderDetailsById(orderId);

      if (!orderDetails) {
        return next(new HttpError('Order not found', 404));
      }

      const orderReq = new OrderRequest(orderDetails);
      const orderDetailsRes = new OrderDetailResponse(orderReq);

      res.status(200).json({
        message: 'Thành công',
        data: orderDetailsRes,
      });
    } catch (error) {
      next(error);
    }
  },

  getProductOrderByUserId: async (req, res, next) => {
    try {
      const { userId, productId } = req.params;

      const orderDetails = await OrderRepository.findProductOrderByUserId(productId, userId);

      if (!orderDetails) {
        return next(new HttpError('Product order not found', 404));
      }

      const orderReq = new OrderDetailsRequest(orderDetails);
      const orderDetailsRes = new OrderDetailResponse(orderReq);

      res.status(200).json({
        message: 'Thành công',
        data: orderDetailsRes,
      });
    } catch (error) {
      next(error);
    }
  },

  getProductToCart: async (req, res, next) => {
    try {
      const { userId } = req.params;

      const cart = await OrderRepository.findProductToCart(userId);

      console.log({ cart });

      if (!cart) {
        return next(new HttpError('Cart not found', 404));
      }

      const cartRes = cart.map((c) => new OrderCartResponse(c));

      res.status(200).json({
        message: 'Thành công',
        data: cartRes,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteProductInCart: async (req, res, next) => {
    try {
      const { orderId, productId } = req.params;

      await OrderRepository.findRemoveProductInCart(orderId, productId);
      res.status(204).json({
        message: 'Thành công',
      });
    } catch (error) {
      next(error);
    }
  },

  createNewOrder: async (req, res, next) => {
    try {
      const newOrder = req.body;
      const orderStatus = {
        1: 'in cart',
        2: 'new orders',
        3: 'verified',
        4: 'delivering',
        5: 'delivered',
        6: 'completed',
        7: 'denied',
      };

      newOrder.status = orderStatus[newOrder.status || 1];

      const createdOrder = await OrderRepository.createOneOrderWithProductHandling(newOrder);

      res.status(200).json({
        message: 'Thành công',
        data: createdOrder,
      });
    } catch (error) {
      next(error);
    }
  },

  updateOrderById: async (req, res, next) => {
    try {
      const orderId = req.params.id;
      const updatedOrderData = req.body;

      const existingOrder = await OrderRepository.findOrderByUserId(orderId);
      if (!existingOrder) {
        return next(new HttpError('Order not found', 404));
      }

      const updatedOrder = await OrderRepository.findUpdateOrderDetailsById(updatedOrderData, orderId);
      res.status(200).json({
        message: 'Thành công',
        data: updatedOrder,
      });
    } catch (error) {
      next(error);
    }
  },

  updateOrderDetailsByOrderId: async (req, res, next) => {
    try {
      const { orderId } = req.params;
      const { productId, userId } = req.body;

      const existingOrderDetails = await OrderRepository.findProductOrderByUserId(productId, userId);

      if (!existingOrderDetails) {
        return next(new HttpError('Product order not found', 404));
      }

      const orderDetailsReq = new OrderRequest(existingOrderDetails);
      const mergedOrder = Object.assign({}, orderDetailsReq, req.body);
      const orderDetailsRes = new OrderDetailResponse(mergedOrder);

      const updatedOrderDetails = await OrderRepository.findUpdateOrderDetailsByIdWithProductHandling(
        orderDetailsRes,
        orderId
      );

      res.status(200).json({
        message: 'Thành công',
        data: updatedOrderDetails,
      });
    } catch (error) {
      next(error);
    }
  },

  updateStatusOrder: async (req, res, next) => {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        return next(new HttpError('Order ID not found', 404));
      }

      await OrderRepository.findUpdateStatus(orderId);

      res.status(200).json({
        message: 'Thành công',
      });
    } catch (error) {
      next(error);
    }
  },

  deleteOrderById: async (req, res, next) => {
    try {
      const orderId = req.params.id;

      const existingOrder = await OrderRepository.findOrderById(orderId);
      if (!existingOrder) {
        return next(new HttpError('Order not found', 404));
      }

      await OrderRepository.findRemoveOrderById(orderId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  createOrderCheckout: async (req, res) => {
    try {
      const { cart } = req.body;
      const { jsonResponse, httpStatusCode } = await createOrder(cart);
      res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
      console.error('Failed to create order:', error);
      res.status(500).json({ error: 'Failed to create order.' });
    }
  },

  createOrderCapture: async (req, res) => {
    try {
      const { orderID } = req.params;
      const { jsonResponse, httpStatusCode } = await captureOrder(orderID);
      res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
      console.error('Failed to create order:', error);
      res.status(500).json({ error: 'Failed to capture order.' });
    }
  },
};

module.exports = orderController;
