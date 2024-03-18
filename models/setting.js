'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Setting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Setting.init({
    cashbackAmount: {
      type: DataTypes.DOUBLE(20, 2),
      defaultValue: 0
    },
    voucherDurate: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    voucherAmountMin: {
      type: DataTypes.DOUBLE(20, 2),
      defaultValue: 0
    },
    voucherDay: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 30
    }
  }, {
    sequelize,
    modelName: 'Setting',
  });
  return Setting;
};