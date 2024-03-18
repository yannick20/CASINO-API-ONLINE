// models/user.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      this.hasOne(models.Cashback, { foreignKey: 'userId', as: 'cashback', onDelete: 'CASCADE' });
      this.hasOne(models.UserCashback, { foreignKey: 'userId', as: 'usercashback', onDelete: 'CASCADE' });
      this.hasMany(models.Transaction, { foreignKey: 'userId', as: 'transactions', onDelete: 'CASCADE'  });
      this.hasMany(models.UserSponsoring, { foreignKey: 'userId', as: 'usersponsoring', onDelete: 'CASCADE'  });
      this.hasMany(models.UserReferral, { foreignKey: 'referrerId', as: 'referrerreferrals', onDelete: 'CASCADE' });
      this.hasMany(models.UserReferral, { foreignKey: 'referredId', as: 'referredreferrals', onDelete: 'CASCADE' });
    }
  }
  User.init(
    {
      barcode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      sponsoringCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      birthday: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      isWhatsapp: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
    }
  );
  return User;
};
