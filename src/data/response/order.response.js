const orderStatus = {
  1: 'in cart',
  2: 'new orders',
  3: 'verified',
  4: 'delivering',
  5: 'delivered',
  6: 'completed',
  7: 'denied',
};

class OrderResponse {
  constructor(order) {
    this.id = order.id;
    this.userId = order.userId;
    this.username = order.username;
    this.avatar = order.avatar || '';
    this.email = order.email;
    this.totalPrice = order.totalPrice;
    this.status = orderStatus[order.status || 1];
    this.orderTime = order.orderTime;
    this.createdAt = order.createdAt || 0;
    this.updatedAt = order.updatedAt || 0;
  }
}

class OrderDetailResponse {
  constructor(order) {
    this.orderId = order.id;
    this.orderId = order.orderId;
    this.productId = order.productId;
    this.productName = order.productName || '';
    this.quantity = order.quantity || 0;
    this.unitPrice = parseFloat(order.unitPrice) || 0;
    this.totalPrice = parseFloat(order.totalPrice) || 0;
  }
}

class OrderCartResponse {
  constructor(cart) {
    this.order = cart.order_id;
    this.orderDetailsId = cart.id;
    this.productId = cart.product_id;
    this.productName = cart.product_name.trim();
    this.thumbnailUrl = cart.thumbnail_url.trim();
    this.totalPrice = cart.total_price;
    this.totalPriceAll = cart.total_price_all;
    this.unitPrice = cart.unit_price;
    this.quantity = cart.quantity;
    this.shopName = cart.shop_name.trim();
  }
}

module.exports = { OrderResponse, OrderDetailResponse, OrderCartResponse };
