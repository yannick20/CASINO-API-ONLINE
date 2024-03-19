'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Promotion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Shop, { foreignKey: 'shopId', onDelete: 'CASCADE' });
    }
  }
  Promotion.init({
    shopId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    mediaUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mediaType: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    startAt: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    endAt: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Promotion',
  });
  return Promotion;
};