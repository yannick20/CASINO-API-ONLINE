'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AdminAutorization extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Admin, { foreignKey: 'adminId', as: 'adminautorization' });
    }
  }
  AdminAutorization.init({
    adminId:{
      type: DataTypes.INTEGER,
      allowNull: false
    },
    gestion: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    utilisateur: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    rapport: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    factures: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    promotion: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    bonAchat: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    parametre: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'AdminAutorization',
  });
  return AdminAutorization;
};