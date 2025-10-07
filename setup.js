const { sequelize } = require('./src/utils/db');

require('./src/models/user.js');

sequelize.sync({ force: true });
