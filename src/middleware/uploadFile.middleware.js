const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { HttpError } = require('./errorHandler.middleware');
const storageFirebase = require('../configs/firebase.config');
const uploadMulter = require('../configs/multer.config');
const sharp = require('sharp');

const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml'];
const maxImageSize = 1024 * 1024 * 1;

const uploadFile = async (req, res, next) => {
  uploadMulter.single('avatar')(req, res, async (err) => {
    if (err) {
      return next(err);
    }

    const { mimetype, originalname, buffer } = req?.file;

    if (!allowedImageTypes.includes(mimetype)) {
      return next(new HttpError('Loại hình ảnh không hợp lệ. Chỉ cho phép JPEG, PNG và GIF'), 400);
    }

    if (buffer.length > maxImageSize) {
      return next(new HttpError('Kích thước hình ảnh vượt quá giới hạn cho phép.'), 400);
    }

    // Giảm kích thước ảnh bằng Sharp
    const resizedBuffer = await sharp(buffer)
      .resize({ width: 64, height: 64, fit: 'cover', position: 'center' })
      .toBuffer();

    const metadata = {
      contentType: mimetype,
      name: originalname,
    };

    const fileName = originalname;
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().getTime();

    const storageRef = ref(storageFirebase, `images//${date}-${time}-${fileName}`);

    try {
      await uploadBytes(storageRef, resizedBuffer, metadata);
      const url = await getDownloadURL(storageRef);

      req.url = url;

      next();
    } catch (error) {
      res.status(400).json({
        error,
      });
    }
  });
};

module.exports = uploadFile;
