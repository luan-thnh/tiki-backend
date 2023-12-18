const express = require('express');
const userController = require('../controllers/user.controller');
const { checkUserLogin, checkAdminLogin } = require('../middleware/checkLogin.middleware');
const uploadFile = require('../middleware/uploadFile.middleware');
const uploadMulter = require('../configs/multer.config');
const userRouter = express.Router();

userRouter.get('/', checkUserLogin, userController.getAllUser);
userRouter.get('/user', userController.getUserByOne);
userRouter.get('/:userId', checkAdminLogin, userController.getUserById);
userRouter.post('/', userController.createNewUser);
userRouter.put('/:userId', checkUserLogin, userController.updateUserById);
userRouter.delete('/:userId', checkUserLogin, userController.removeUserById);
userRouter.post('/upload-avatar/:userId', checkUserLogin, uploadFile, userController.uploadAvatar);

// Authentication
userRouter.post('/login', userController.login);
userRouter.post('/logout', checkUserLogin, userController.logout);
userRouter.post('/register', userController.register);
userRouter.post('/forgot-password', userController.forgotPassword);
userRouter.get('/reset-password/:userId/:token', userController.redirectResetPassword);
userRouter.post('/reset-password/:userId/:token', userController.updatedResetPassword);

module.exports = userRouter;
