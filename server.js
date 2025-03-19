require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const appRouter = require('./src/routes');
const { errorHandler } = require('./src/middleware/errorHandler.middleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: 'somesecret',
    cookie: { maxAge: 60000 },
  })
);

appRouter(app);
app.use(errorHandler);

app.listen(3003, () => console.log('⚡Server running on: http://localhost:3003/api/v1'));
