const executeQuery = require('../utils/executeQuery.util');
const validateField = require('../utils/validateField.util');
const ProductResponse = require('../data/response/product.response');
const ProductRepository = require('../repositories/product.repository');
const ProductRequest = require('../data/request/product.request');
const { HttpError } = require('../middleware/errorHandler.middleware');
const { MESSAGES } = require('../constants/validate.constant');

const productController = {
  getAllProduct: async (req, res, next) => {
    try {
      const PAGE = req.query.page || 1;
      const LIMIT = req.query.limit || 20;
      const TOTAL_ELEMENTS = await executeQuery('SELECT COUNT(id) as count FROM products');
      const TOTAL_PAGES = Math.ceil(TOTAL_ELEMENTS[0].count / LIMIT);

      const params = {
        ...req.query,
        limit: LIMIT,
        offset: (PAGE - 1) * LIMIT,
      };

      const products = await ProductRepository.findAllProduct(params);
      const newProducts = products.map((product) => new ProductResponse(product));

      res.status(200).json({
        message: 'Success',
        data: {
          pagination: {
            page: Number(PAGE),
            limit: Number(LIMIT),
            totalPages: TOTAL_PAGES,
            totalElements: TOTAL_ELEMENTS[0].count,
          },
          products: newProducts,
        },
      });
    } catch (error) {
      next(error);
    }
  },
  getProductById: async (req, res, next) => {
    try {
      const { productId } = req.params;

      if (!productId) return next(new HttpError(MESSAGES.WRONG_ID, 404));

      const product = await ProductRepository.findProductById(productId);

      if (!product) return next(new HttpError(MESSAGES.PRODUCT_DOES_NOT_EXIST, 404));

      const productRes = new ProductResponse(product);

      res.status(200).json({
        message: 'Success',
        data: productRes,
      });
    } catch (error) {
      next(error);
    }
  },
  createNewProduct: async (req, res, next) => {
    try {
      const productReq = new ProductRequest(req.body);
      const productExisted = await ProductRepository.findProductByOne({ product_name: productReq.productName });

      if (productExisted) return next(new HttpError(MESSAGES.PRODUCT_ALREADY_EXISTS));

      const errors = {
        ...validateField(productReq.priceOdd, 'priceOdd'),
        ...validateField(productReq.priceNew, 'priceNew'),
        ...validateField(productReq.limitProduct, 'limitProduct'),
        ...validateField(productReq.categoryId, 'categoryId'),
      };

      if (Object.keys(errors).length > 0) {
        const error = new HttpError('Validation failed', 400);
        error.message = errors;
        return next(error);
      }

      const newProduct = await ProductRepository.createOneProduct(productReq);
      // const productRes = new ProductResponse(newProduct);

      res.status(200).json({
        message: 'success',
        data: newProduct,
      });
    } catch (error) {
      next(error);
    }
  },
  createAllProduct: async (req, res, next) => {
    try {
      const products = req.body.products;

      const productsReq = products.map((product) => new ProductRequest(product));

      // console.log(newProducts);
      // products.forEach(async (product) => {
      //   const productReq = new ProductRequest(product);

      // });
      const newProducts = await ProductRepository.createAllProduct(productsReq);

      res.status(200).json({
        message: 'success',
        data: newProducts,
      });
    } catch (error) {
      next(error);
    }
  },
  updateProductById: async (req, res, next) => {
    try {
      const { productId } = req.params;

      if (!productId) return next(new HttpError(MESSAGES.WRONG_ID, 404));

      const productById = await ProductRepository.findProductById(productId);
      const updatedUser = await ProductRepository.findUpdateProductById({ ...productById, ...req.body });

      if (!updatedUser) return next(new HttpError(MESSAGES.ACCOUNT_DOES_NOT_EXIST, 404));

      const productRes = new ProductResponse(updatedUser);

      res.status(200).json({
        message: 'success',
        data: productRes,
      });
    } catch (error) {
      next(error);
    }
  },
  deleteProductById: async (req, res, next) => {
    try {
      const { productId } = req.params;

      if (!productId) return next(new HttpError(MESSAGES.WRONG_ID, 404));

      const product = await ProductRepository.findProductById(productId);

      if (!product) return next(new HttpError(MESSAGES.PRODUCT_DOES_NOT_EXIST, 404));

      await ProductRepository.findRemoveProductById(productId);

      res.status(200).json({
        message: `Product (${product.product_name.toLocaleUpperCase()}) has been deleted`,
        data: product.product_id,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = productController;
