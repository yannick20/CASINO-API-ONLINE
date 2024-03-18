'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Shop extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Shelve, { foreignKey: 'shopId' });
      this.hasMany(models.Product, { foreignKey: 'shopId' });
      this.hasMany(models.Deliveryman, { foreignKey: 'shopId' });
      this.hasMany(models.OrderPicker, { foreignKey: 'shopId' });
      this.hasMany(models.Caisse, { foreignKey: 'shopId' });
      this.hasMany(models.Promotion, { foreignKey: 'shopId' });
      this.hasMany(models.Transaction, { foreignKey: 'shopId', as: 'transaction' });
    }
  }
  Shop.init({
    name: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Shop',
  });
  return Shop;
};