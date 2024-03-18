'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderPicker extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      OrderPicker.belongsTo(models.Shop, { foreignKey: 'shopId', onDelete: 'CASCADE' });
    }
  }
  OrderPicker.init({
    shopId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Le magasin est obligatoire.',
        },
        notEmpty: {
          msg: 'Le magasin est obligatoire.',
        }
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [3],
          msg: 'Le nom du livreur doit avoir au moins 3 caractères.',
        },
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: {
          args: [9],
          msg: 'Le numéro de téléphone doit avoir au moins 9 caractères.',
        },
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'OrderPicker',
  });
  return OrderPicker;
};