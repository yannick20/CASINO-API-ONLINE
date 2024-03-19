'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserReferral extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, { foreignKey: 'referrerId', as: 'referreruser' });
      this.belongsTo(models.User, { foreignKey: 'referredId', as: 'referreduser' });
    }
  }
  UserReferral.init({
    referrerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    referredId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    amount: {
      type: DataTypes.DOUBLE,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'UserReferral',
  });
  return UserReferral;
};