'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SubShelve extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SubShelve.belongsTo(models.Shelve, { foreignKey: 'shelveId', onDelete: 'CASCADE' });
      SubShelve.belongsTo(models.Shop, { foreignKey: 'shopId', onDelete: 'CASCADE' });
    }
    static findByShopAndShelve(shopId, shelveId) {
      return this.findAll({
        where: {
          shopId,
          shelveId,
        },
      });
    }
  }
  
  SubShelve.init({
    shelveId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    shopId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [3],
          msg: 'Le nom du sous-rayon doit avoir au moins 3 caractères.',
        },
      },
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'SubShelve',
  });
  return SubShelve;
};