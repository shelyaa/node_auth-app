'use strict';
require('dotenv').config({ path: '../.env' });
require('./models/user');

const { createServer } = require('./createServer');
const { sequelize } = require('./utils/db');

(async () => {
  try {
    await sequelize.authenticate();

    await sequelize.sync({ alter: true });

    createServer().listen(5700, () => {});
  } catch (error) {}
})();
