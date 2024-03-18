'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      this.belongsTo(models.Caisse, { foreignKey: 'caisseId', as: 'caisse' });
      this.belongsTo(models.Shop, { foreignKey: 'shopId', as: 'shop' });
    }
  }
  Transaction.init({
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      caisseId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Caisses',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      shopId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Shops',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      transactionType: {
        type: DataTypes.ENUM('purchase', 'voucher'),
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: true
      },
      paymentType: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
      },
      ticketDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      expirationDate: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      ticketNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ticketAmount: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
      },
      voucherAmount: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
      },
      ticketCashback: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
      },
      ticketCashbackType: {
        type: DataTypes.STRING(1),
        allowNull: false,
      },
      cagnotte: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
      },
      state: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
  }, {
    sequelize,
    modelName: 'Transaction',
  });
  return Transaction;
};