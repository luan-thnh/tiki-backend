class ProductResponse {
  constructor(product) {
    this.productId = product.product_id;
    this.productName = product.product_name;
    this.urlPath = product.url_path;
    this.priceNew = product.price_new;
    this.priceOdd = product.price_odd;
    this.discountProduct = product.discount_product;
    this.deliveryDay = product.delivery_day;
    this.deliveryPrice = product.delivery_price;
    this.rating = product.rating;
    this.reviewCount = product.review_count;
    this.favoriteCount = product.favorite_count;
    this.thumbnailUrl = product.thumbnail_url;
    this.limitProduct = product.limit_product;
    this.imageList = product.image_list;
    this.soldProduct = product.sold_product;
    this.description = product.description;
    this.categoryId = product.category_id;
    this.categoryName = product.category_name;
    this.breadcrumbs = product.breadcrumbs;
    this.specifications = product.specifications;
    this.shopName = product.shop_name;
    this.isActivated = product.is_activated;
    this.createdAt = product.created_at;
    this.updatedAt = product.updated_at;
  }
}

module.exports = ProductResponse;
