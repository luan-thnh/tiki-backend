const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

class ProductRequest {
  constructor(product) {
    this.productId = product.productId || uuidv4();
    this.productName = product.productName;
    this.urlPath = product.urlPath || '';
    this.priceNew = product.priceNew || 0;
    this.priceOdd = product.priceOdd || 0;
    this.discountProduct = product.discountProduct || 0;
    this.deliveryDay = product.deliveryDay || `Giao thứ${moment().day() + 1}, ngày ${moment().format('DD/MM')}`;
    this.deliveryPrice = product.deliveryPrice || 10000;
    this.rating = product.rating || 0;
    this.reviewCount = product.reviewCount || 0;
    this.favoriteCount = product.favoriteCount || 0;
    this.thumbnailUrl = product.thumbnailUrl || '';
    this.limitProduct = product.limitProduct || 0;
    this.imageList = product.imageList || [];
    this.soldProduct = product.soldProduct || 0;
    this.description = product.description || '';
    this.categoryId = product.categoryId || '';
    this.categoryName = product.categoryName || '';
    this.breadcrumbs = product.breadcrumbs || [];
    this.specifications = product.specifications || [];
    this.shopName = product.shopName || '';
    this.isActivated = product.isActivated || 1;
    this.createdAt = product.createdAt || moment().format('YYYY-MM-DD');
    this.updatedAt = product.updatedAt || moment().format('YYYY-MM-DD');
  }
}

module.exports = ProductRequest;
