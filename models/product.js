'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Product.belongsTo(models.Shop, { foreignKey: 'ShopId', onDelete: 'CASCADE' });
      Product.belongsTo(models.Shelve, { foreignKey: 'ShelveId', onDelete: 'CASCADE' });
      Product.belongsTo(models.SubShelve, { foreignKey: 'SubShelveId', onDelete: 'CASCADE' });
    }
  }
  Product.init({
    shopId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    shelveId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    subShelveId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    brcode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DOUBLE(10, 2),
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};