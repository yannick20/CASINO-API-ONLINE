'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Shelve extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Shelve.belongsTo(models.Shop, { foreignKey: 'shopId', onDelete: 'CASCADE' });
      Shelve.hasMany(models.SubShelve, { foreignKey: 'shelveId', onDelete: 'CASCADE' });
    }
  }
  Shelve.init({
    shopId:{
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      minLength: 3,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Shelve',
  });
  return Shelve;
};