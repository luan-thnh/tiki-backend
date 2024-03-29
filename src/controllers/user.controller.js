const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const executeQuery = require('../utils/executeQuery.util');
const validateField = require('../utils/validateField.util');
const UserRepository = require('../repositories/user.repository');
const UserRequest = require('../data/request/user.request');
const UserResponse = require('../data/response/user.response');
const { HttpError } = require('../middleware/errorHandler.middleware');
const { MESSAGES } = require('../constants/validate.constant');

const userController = {
  // GET: Get All User
  getAllUser: async (req, res, next) => {
    try {
      const PAGE = req.query.page || 1;
      const LIMIT = req.query.limit || 5;
      const TOTAL_ELEMENTS = await executeQuery('SELECT COUNT(id) as count FROM users');
      const TOTAL_PAGES = Math.ceil(TOTAL_ELEMENTS[0].count / LIMIT);

      const params = {
        ...req.query,
        limit: LIMIT,
        offset: (PAGE - 1) * LIMIT,
      };

      const users = await UserRepository.findAllUser(params);
      const usersReq = users?.map((user) => new UserRequest(user));
      const usersRes = usersReq?.map((user) => new UserResponse(user));

      res.status(200).json({
        message: 'Success',
        data: {
          pagination: {
            page: PAGE,
            limit: LIMIT,
            totalPages: TOTAL_PAGES,
            totalElements: TOTAL_ELEMENTS[0].count,
          },
          users: usersRes,
        },
      });
    } catch (error) {
      next(error);
    }
  },
  // GET: Get User By Id
  getUserById: async (req, res, next) => {
    try {
      const { userId } = req.params;

      if (!userId) return next(new HttpError(MESSAGES.WRONG_ID, 404));

      const user = await UserRepository.findUserById(userId);

      if (!user) return next(new HttpError(MESSAGES.ACCOUNT_DOES_NOT_EXIST, 404));

      const userReq = new UserRequest(user);
      const userRes = new UserResponse(userReq);

      res.status(200).json({
        message: 'Success',
        data: userRes,
      });
    } catch (error) {
      next(error);
    }
  },
  // GET: Get User By Id
  getUserByOne: async (req, res, next) => {
    try {
      const { email } = req.body;
      const user = await UserRepository.findUserByOne({ email });

      if (!user) return next(new HttpError(MESSAGES.ACCOUNT_DOES_NOT_EXIST, 404));

      res.status(200).json({
        message: 'Success',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST: Create New User
  createNewUser: async (req, res, next) => {
    try {
      const userReq = new UserRequest(req.body);

      const userExisted = await UserRepository.findUserByOne(
        { username: userReq.username, email: userReq.email },
        'or'
      );

      if (userExisted) return next(new HttpError(MESSAGES.ACCOUNT_ALREADY_EXISTS));

      const errors = {
        ...validateField(userReq.username, 'username'),
        ...validateField(userReq.email, 'email'),
        ...validateField(userReq.password, 'password'),
      };

      if (Object.keys(errors).length > 0) {
        const error = new HttpError('Validation failed', 400);
        error.message = errors;
        return next(error);
      }

      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(userReq.password, salt);

      const newUser = await UserRepository.createOneUser({ ...userReq, password: hash });

      const secret = process.env.SECRET_KEY || 'DEFAULT_SECRET';
      const token = jwt.sign({ userId: newUser.uuid, role: newUser.role }, secret, { expiresIn: '1h' });

      const userRes = new UserResponse(newUser, token);

      res.status(200).json({
        message: 'success',
        data: userRes,
      });
    } catch (error) {
      next(error);
    }
  },
  // PUT: Update User By Id
  updateUserById: async (req, res, next) => {
    console.log('fhjshfjshfjshfhfkdgkjhu');
    try {
      const { userId } = req.params;

      console.log({ userId });

      if (!userId) return next(new HttpError(MESSAGES.WRONG_ID, 404));

      const userById = await UserRepository.findUserById(userId);

      console.log(userById);

      const userReq = new UserRequest(userById);

      console.log({ ...userReq, ...req.body });

      const updatedUser = await UserRepository.findUpdateUserById({ ...userReq, ...req.body }, userId);

      if (!updatedUser) return next(new HttpError(MESSAGES.ACCOUNT_DOES_NOT_EXIST, 404));

      res.status(200).json({
        message: 'success',
        data: updatedUser,
      });
    } catch (error) {
      console.log({ error });
      next(error);
    }
  },
  // DELETE: Remove User By Id
  removeUserById: async (req, res, next) => {
    try {
      const { userId } = req.params;

      if (!userId) return next(new HttpError(MESSAGES.WRONG_ID, 404));

      const user = await UserRepository.findUserById(userId);

      if (!user) return next(new HttpError(MESSAGES.ACCOUNT_DOES_NOT_EXIST, 404));

      await UserRepository.findRemoveUserById(userId);

      res.status(200).json({
        message: `Account (${user.username.toLocaleUpperCase()}) has been deleted`,
      });
    } catch (error) {
      next(error);
    }
  },
  // POST: Login Account
  login: async (req, res, next) => {
    try {
      const { username, email, password } = req.body;

      const user = await UserRepository.findUserByOne({ username, email }, 'or');

      if (!user) {
        const error = new HttpError(MESSAGES.ACCOUNT_DOES_NOT_EXIST, 400);
        return next(error);
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password);

      if (!isPasswordValid) {
        const error = new HttpError(MESSAGES.INCORRECT_PASSWORD, 400);
        return next(error);
      }

      const secret = process.env.SECRET_KEY || 'DEFAULT_SECRET';
      const token = jwt.sign({ userId: user.uuid, role: user.role }, secret, { expiresIn: '1h' });

      const userRes = new UserResponse(user, token);

      res.status(200).json({
        message: 'Đăng nhập thành công!',
        data: userRes,
      });
    } catch (error) {
      next(error);
    }
  },
  logout: async (req, res, next) => {
    try {
      res.clearCookie('token');
      res.status(200).json({
        message: 'Đăng xuất thành công',
      });
    } catch (error) {
      next(error);
    }
  },
  // POST: Register Account
  register: async (req, res, next) => {
    const { username, email, password } = req.body;

    const existingUser = await UserRepository.findUserByOne({ username, email }, 'or');

    if (existingUser) {
      const error = new HttpError(MESSAGES.ACCOUNT_ALREADY_EXISTS, 400);
      return next(error);
    }

    const errors = {
      ...validateField(username, 'username'),
      ...validateField(email, 'email'),
      ...validateField(password, 'password'),
    };

    if (Object.keys(errors).length > 0) {
      const error = new HttpError('Validation failed', 400);
      error.message = errors;
      return next(error);
    }

    const userReq = new UserRequest(req.body);
    const user = await UserRepository.createOneUser(userReq);

    const secret = process.env.SECRET_KEY || 'DEFAULT_SECRET';
    const token = jwt.sign({ userId: user.uuid, role: user.role }, secret, { expiresIn: '1h' });

    const userRes = new UserResponse(user, token);

    res.status(200).json({
      message: 'Đăng ký thành công',
      data: userRes,
    });
  },
  // POST: Forgot Password
  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;

      const message = validateField(email, 'email');

      if (Object.keys(message).length > 0) {
        const error = new HttpError('Validation failed', 400);
        error.message = message;
        return next(error);
      }

      const oldUser = await UserRepository.findUserByOne({ email });

      if (!oldUser) return next(new HttpError(MESSAGES.ACCOUNT_DOES_NOT_EXIST), 400);

      const secret = process.env.SECRET_KEY + oldUser.password;
      const token = jwt.sign({ userId: oldUser.uuid, email: oldUser.email }, secret, { expiresIn: '5m' });

      const { baseUrl, protocol } = req;
      const rootUrl = `${protocol}://${req.get('host')}`;

      let link = '';
      if (oldUser?.role === 1) {
        link = `http://localhost:3000/admin/reset-password/${oldUser.uuid}/${token}`;
      } else {
        link = `http://localhost:3000/reset-password/${oldUser.uuid}/${token}`;
      }

      const transporter = nodemailer.createTransport({
        service: process.env.MAIL_FROM_NAME,
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: false,
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
      });

      var mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: 'Reset Mật khẩu - Tiki',
        html: `
          <p>Chào bạn,</p>
          <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình. Vui lòng nhấp vào liên kết dưới đây để tiếp tục quá trình đặt lại mật khẩu:</p>
          <p><a href="${link}">Click here</a></p>
          <p>Nếu bạn không thực hiện yêu cầu này, xin vui lòng bỏ qua email này. Xin cảm ơn!</p>
          <p>Trân trọng,<br/>[Tiki]</p>
        `,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          return next(error);
        }

        return res.status(200).json({
          message: 'Email sent: ' + info.response,
        });
      });
    } catch (error) {
      next(error);
    }
  },
  // GET: Reset Password
  redirectResetPassword: async (req, res, next) => {
    try {
      const { userId, token } = req.params;

      const oldUser = await UserRepository.findUserByOne({ uuid: userId });

      if (!oldUser) return next(new HttpError(MESSAGES.ACCOUNT_DOES_NOT_EXIST), 400);

      const secret = process.env.SECRET_KEY + oldUser.password;
      jwt.verify(token, secret);

      res.status(200).json({
        message: 'Thành công',
        data: {
          userId,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  },
  // POST: Reset Password
  updatedResetPassword: async (req, res, next) => {
    try {
      const { userId, token } = req.params;
      const { password } = req.body;

      const message = validateField(password, 'password');

      if (Object.keys(message).length > 0) {
        const error = new HttpError('Validation failed', 400);
        error.message = message;
        return next(error);
      }

      const oldUser = await UserRepository.findUserByOne({ uuid: userId });

      if (!oldUser) return next(new HttpError(MESSAGES.ACCOUNT_DOES_NOT_EXIST), 400);

      const secret = process.env.SECRET_KEY + oldUser.password;
      const verify = jwt.verify(token, secret);

      const userReq = new UserRequest({ ...oldUser, password });
      await UserRepository.findUpdateUserById(userReq, userId);

      res.status(200).json({
        message: 'Password Updated',
      });
    } catch (error) {
      next(error);
    }
  },
  // POST: Upload Avatar
  uploadAvatar: async (req, res, next) => {
    try {
      const { userId } = req.params;

      const user = await UserRepository.findUserByOne({ uuid: userId });

      if (!user) return next(new HttpError(MESSAGES.ACCOUNT_DOES_NOT_EXIST), 400);

      const userReq = new UserRequest({ ...user, avatar: req.url });
      await UserRepository.findUpdateUserById(userReq, userId);

      res.status(200).json({
        message: 'Cập nhật avatar thành công',
        data: {
          username: userReq.username,
          avatar: req.url,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;
