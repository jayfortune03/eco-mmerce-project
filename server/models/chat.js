'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    static associate(models) {}
  }
  Chat.init(
    {
      BuyerId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      SellerId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      isBuyer: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      message: {
        allowNull: false,
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: 'Chat',
    }
  );
  return Chat;
};
