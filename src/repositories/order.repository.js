const executeQuery = require('../utils/executeQuery.util');

module.exports = OrderRepository = {
  // GET: Get All Order with Username
  findAllOrder: async ({ sortByName, sortByDate, limit, offset }) => {
    let query = `
    SELECT orders.*, users.avatar, users.username, users.email
    FROM orders
    JOIN users ON orders.user_id = users.uuid
    WHERE 1=1
  `;

    if (sortByName === 'asc') {
      query += ' ORDER BY orders.total_price ASC';
    } else if (sortByName === 'desc') {
      query += ' ORDER BY orders.total_price DESC';
    }

    if (sortByDate === 'newest') {
      query += ' ORDER BY orders.updated_at DESC';
    } else if (sortByDate === 'oldest') {
      query += ' ORDER BY orders.updated_at ASC';
    }

    query += `
    LIMIT ${limit || 10} OFFSET ${offset || 0}
  `;

    return await executeQuery(query);
  },

  // GET: Get Order by User ID
  findOrderByUserId: async (userId) => {
    const query = `SELECT * FROM orders WHERE user_id = '${userId}' AND status = 'in cart';`;
    const res = await executeQuery(query);

    return res;
  },

  // GET: Get Order Details by ID
  findOrderDetailsById: async (orderId) => {
    const query = `
                    SELECT o.*, od.*
                    FROM orders o
                    JOIN order_details od ON o.id = od.order_id
                    WHERE o.id = ${orderId};
              `;

    const res = await executeQuery(query);
    return res[0];
  },

  // GET: Get Product To In Cart
  findProductToCart: async (userId) => {
    const query = `
                    SELECT o.id, od.*, p.product_id, p.thumbnail_url, p.shop_name, o.total_price as total_price_all
                    FROM orders o
                    JOIN order_details od ON o.id = od.order_id
                    JOIN products p ON od.product_id = p.product_id
                    WHERE o.status = 'in cart' AND o.user_id ='${userId}';
                  `;

    return await executeQuery(query);
  },

  // DELETE: Delete Product To In Cart
  findRemoveProductInCart: async (orderId, productId) => {
    // Xoá sản phẩm trong bảng order_details
    const deleteOrderDetailsQuery = `
      DELETE FROM order_details
      WHERE order_id = '${orderId}' AND product_id = '${productId}';
    `;

    await executeQuery(deleteOrderDetailsQuery);

    // Cập nhật lại tổng giá trong bảng orders sau khi xoá sản phẩm
    const updateTotalPriceQuery = `
      UPDATE orders
      SET total_price = (
        SELECT SUM(total_price)
        FROM order_details
        WHERE order_id = '${orderId}'
      )
      WHERE id = '${orderId}';
    `;

    await executeQuery(updateTotalPriceQuery);

    // Nếu giỏ hàng không còn sản phẩm, xoá bản ghi trong bảng orders
    const checkEmptyCartQuery = `
      SELECT COUNT(*) AS product_count
      FROM order_details
      WHERE order_id = '${orderId}';
    `;

    const productCountResult = await executeQuery(checkEmptyCartQuery);

    if (productCountResult && productCountResult[0].product_count === 0) {
      const deleteOrderQuery = `
        DELETE FROM orders
        WHERE id = '${orderId}';
      `;

      await executeQuery(deleteOrderQuery);
    }
  },

  // GET: Get Order Details by ID
  findProductOrderByUserId: async (productId, userId) => {
    const query = ` 
                    SELECT od.*
                    FROM order_details od
                    JOIN orders o ON od.order_id = o.id
                    WHERE o.user_id = '${userId}' AND 
                          o.status = 'in cart' AND 
                          od.product_id = '${productId}';
                          `;

    const res = await executeQuery(query);
    return res[0];
  },

  // GET: Get Order by Something
  findOrderByOne: async (attributes, operator = 'AND') => {
    const whereClause = attributes.map((attr) => `${attr.field} = ${attr.value}`).join(` ${operator} `);

    const query = `
                    SELECT * FROM orders
                    WHERE ${whereClause};
                  `;

    const res = await executeQuery(query);
    return res[0];
  },

  // POST: Create New Order
  createOneOrder: async (order) => {
    const orderQuery = `
                        INSERT INTO orders (user_id, total_price, status)
                        VALUES ('${order.userId}', ${order.totalPrice}, '${order.status}');
                      `;

    await executeQuery(orderQuery);

    // Retrieve the last inserted order_id
    const orderIdQuery = 'SELECT LAST_INSERT_ID() AS last_id;';
    const result = await executeQuery(orderIdQuery);
    const lastOrderId = result[0].last_id;

    // Construct the INSERT query for order_details
    const orderDetailsQuery = `
            INSERT INTO order_details (order_id, product_id, product_name, quantity, unit_price, total_price)
            VALUES
              (${lastOrderId}, '${order.productId}', '${order.productName}', ${order.quantity}, ${order.unitPrice}, ${order.totalPrice});
          `;

    await executeQuery(orderDetailsQuery);

    const recalculateTotalPriceQuery = `
        UPDATE orders
        SET total_price = (
          SELECT SUM(total_price) 
          FROM order_details 
          WHERE order_id = ${lastOrderId}
        )
        WHERE id = ${lastOrderId};
      `;

    return order;
  },

  // PUT: Update Order By ID
  findUpdateOrderDetailsById: async (orderDetails, orderId) => {
    console.log(orderDetails);

    const updateOrderDetailsQuery = `
        UPDATE order_details
        SET 
          quantity = ${orderDetails.quantity},
          unit_price = ${orderDetails.unitPrice},
          total_price = '${orderDetails.totalPrice}'
        WHERE order_id = ${orderDetails.orderId} AND product_id = '${orderDetails.productId}';
      `;

    await executeQuery(updateOrderDetailsQuery);

    const recalculateTotalPriceQuery = `
                  UPDATE orders
                  SET total_price = (
                    SELECT SUM(total_price) 
                    FROM order_details 
                    WHERE order_id = ${orderDetails.orderId}
                  )
                  WHERE id = ${orderDetails.orderId};
                `;

    await executeQuery(recalculateTotalPriceQuery);

    return orderDetails;
  },

  findUpdateStatus: async (orderId) => {
    const query = `
                  UPDATE orders
                  SET status = 'new orders' 
                    WHERE order_id = ${orderId}
                  )
                  WHERE id = ${orderId};
                `;

    await executeQuery(query);
  },

  // DELETE: Remove Order by ID
  findRemoveOrderById: async (orderId) => {
    const deleteOrderDetailsQuery = `DELETE FROM order_details WHERE order_id = ${orderId};`;
    await executeQuery(deleteOrderDetailsQuery);

    const deleteOrderQuery = `DELETE FROM orders WHERE order_id = ${orderId};`;
    await executeQuery(deleteOrderQuery);

    return true;
  },

  // Additional methods for handling product quantity reduction
  handleProductQuantity: async (productId, quantity, status) => {
    if (status === 'verified') {
      // Check if there's enough stock
      const checkStockQuery = `SELECT limit_product FROM products WHERE product_id = ${productId} FOR UPDATE;`;
      const stockResult = await executeQuery(checkStockQuery);

      if (stockResult[0].limit_product >= quantity && stockResult[0].limit_product >= stockResult[0].sold_product) {
        // Update product limit_product only if there is enough stock
        const updateProductQuery = `UPDATE products SET sold_product = sold_product + ${quantity} WHERE product_id = ${productId};`;
        await executeQuery(updateProductQuery);
        return true; // Indicate successful update
      } else {
        throw new Error('Not enough stock available');
      }
    } else {
      return;
    }
  },

  // POST: Create New Order with Product Quantity Handling
  createOneOrderWithProductHandling: async (order) => {
    await executeQuery('START TRANSACTION;');
    await OrderRepository.handleProductQuantity(order.productId, order.quantity, order.status);

    const createdOrder = await OrderRepository.createOneOrder(order);

    await executeQuery('COMMIT;');

    return createdOrder;
  },
  // PUT: Update Order Details with Product Quantity Handling
  findUpdateOrderDetailsByIdWithProductHandling: async (orderDetails, orderId) => {
    await executeQuery('START TRANSACTION;');

    const createdOrder = await OrderRepository.findUpdateOrderDetailsById(orderDetails, orderId);

    await OrderRepository.handleProductQuantity(orderDetails.productId, orderDetails.quantity, orderDetails.status);

    await executeQuery('COMMIT;');

    return createdOrder;
  },
};
