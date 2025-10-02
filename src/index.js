'use strict';
require('dotenv').config({ path: '../.env' });

const { createServer } = require('./createServer');
const { client } = require('./utils/db');

require('./models/user');

(async () => {
  try {
    await client.authenticate();

    await client.sync({ alter: true });

    createServer().listen(5700, () => {});
  } catch (error) {}
})();
