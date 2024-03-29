class UserResponse {
  constructor(user, token) {
    this.uuid = user.uuid;
    this.username = user.username;
    this.fullName = user.fullName;
    this.email = user.email;
    this.address = user.address;
    this.phoneNumber = user.phoneNumber;
    this.typeAddress = user.typeAddress || '';
    this.ward = user.ward || '';
    this.province = user.province || '';
    this.district = user.district || '';
    this.address = user.address || '';
    this.phoneNumber = user.phoneNumber || '';
    this.dayOfBirth = user.dayOfBirth || '2023-01-01';
    this.isPublic = user.isPublic || 1;
    this.gender = Number(user.gender) || 1;
    this.role = user.role;
    this.avatar = user.avatar;
    this.createdAt = user.createdAt;
    this.token = token || null;
  }
}

module.exports = UserResponse;
