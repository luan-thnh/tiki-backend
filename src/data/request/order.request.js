const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

const orderStatus = {
  1: 'in cart',
  2: 'new orders',
  3: 'verified',
  4: 'delivering',
  5: 'delivered',
  6: 'completed',
  7: 'denied',
};

class OrderRequest {
  constructor(order) {
    this.id = order.id;
    this.userId = order.user_id;
    this.username = order.username;
    this.email = order.email;
    this.avatar = order.avatar || '';
    this.totalPrice = order.total_price;
    this.orderTime = order.order_time;
    this.status = orderStatus[order.status || 1];
    this.productId = order.product_id;
    this.productName = order.product_name || '';
    this.quantity = order.quantity || 0;
    this.unitPrice = order.unit_price || 0;
    this.createdAt = order.created_at;
    this.updatedAt = order.updated_at;
  }
}

class OrderDetailsRequest {
  constructor(order) {
    this.id = order.id;
    this.orderId = order.order_id;
    this.productId = order.product_id;
    this.productName = order.product_name;
    this.quantity = order.quantity || 0;
    this.unitPrice = order.unit_price || 0;
  }
}

module.exports = { OrderRequest, OrderDetailsRequest };
