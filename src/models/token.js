const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');
const { User } = require('./user');

const Token = sequelize.define(
  'token',
  {
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetTokenExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    emailChangeToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'Tokens',
  },
);

Token.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Token, { foreignKey: 'userId' });

module.exports = { Token };
