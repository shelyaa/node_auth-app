
const { client } = require('./src/utils/db');

require('./src/models/user.js');

client.sync({ force: true });
