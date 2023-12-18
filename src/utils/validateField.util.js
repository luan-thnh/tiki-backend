const { MESSAGES, VALIDATE } = require('../constants/validate.constant');

const validateField = (value, field) => {
  const errors = {};

  if (!value && value !== 0) {
    errors[field] = MESSAGES.FIELD_REQUIRED;
  } else {
    switch (field) {
      case 'username':
      case 'fullName':
        if (value.length < 3) {
          errors[field] = MESSAGES.INVALID_FULL_NAME;
        }
        break;

      case 'email':
        if (!VALIDATE.EMAIL_VALIDATION_REGEX.test(value)) {
          errors[field] = MESSAGES.INVALID_EMAIL;
        }
        break;

      case 'password':
        if (value.length < VALIDATE.MINIMUM_PASSWORD_LENGTH) {
          errors[field] = MESSAGES.INVALID_PASSWORD;
        }
        break;

      case 'address':
        if (value.length < VALIDATE.MINIMUM_ADDRESS_LENGTH) {
          errors[field] = MESSAGES.INVALID_ADDRESS;
        }
        break;

      case 'phone':
        if (!VALIDATE.PHONE_VALIDATION_REGEX.test(value)) {
          errors[field] = MESSAGES.INVALID_PHONE;
        }
        break;

      case 'priceOdd':
      case 'priceNew':
      case 'limitProduct':
        if (value < 0 || isNaN(value)) {
          errors[field] = MESSAGES.INVALID_PRICE_PRODUCT;
        }
        break;

      case 'categoryId':
        if (!value) {
          errors[field] = MESSAGES.PRODUCT_CATEGORY_REQUIRED;
        }
        break;

      default:
        break;
    }
  }

  return errors;
};

module.exports = validateField;
