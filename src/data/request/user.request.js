const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const bcrypt = require('bcryptjs');

class UserRequest {
  constructor(user, next) {
    this.uuid = user.uuid || uuidv4();
    this.username = user.username;
    this.email = user.email;
    this.password = this.hashPassword(user.password);
    this.fullName = user.fullName || user.full_name || '';
    this.ward = user.ward || '';
    this.district = user.district || '';
    this.province = user.province || '';
    this.address = user.address || '';
    this.typeAddress = user.typeAddress || '';
    this.phoneNumber = user.phoneNumber || user.phone_number || '';
    this.dayOfBirth = user.dayOfBirth || '2023-01-01';
    this.gender = Number(user.gender) || 1;
    this.avatar = user.avatar || process.env.IMAGE_AVATAR_DEFAULT;
    this.role = user.role || 2;
    this.isPublic = user.isPublic || 1;
    this.isActivated = user.isActivated || 1;
    this.createdAt = user.createdAt || moment().format('YYYY-MM-DD');
    this.updatedAt = user.updatedAt || moment().format('YYYY-MM-DD');
  }

  hashPassword(password) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    return hash;
  }
}

module.exports = UserRequest;
