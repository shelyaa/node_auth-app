const { DataTypes } = require('sequelize');
const { client } = require('../utils/db');
const { User } = require('./user');

const Token = client.define(
  'token',
  {
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: false,
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
