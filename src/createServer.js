const express = require('express');
const { authRouter } = require('./routes/auth.route.js');
const cors = require('cors');
const { userRouter } = require('./routes/user.route.js');
const { errorMiddleware } = require('./middlewares/errorMiddleware.js');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const createServer = () => {
  const app = express();

  app.use(express.json());

  app.use(cors({ origin: process.env.CLIENT_HOST, credentials: true }));
  app.use(cookieParser());

  app.use(authRouter);
  app.use('/', userRouter);

  app.get('/', (req, res) => {
    res.send('Hello from server');
  });

  app.use(errorMiddleware);

  app.use((req, res) => {
    res.status(404).send('Page not found');
  });

  return app;
};

module.exports = { createServer };
