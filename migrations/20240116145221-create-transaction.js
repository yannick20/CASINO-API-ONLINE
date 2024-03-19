'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      caisseId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Caisses',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      shopId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Shops',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      transactionType: {
        type: Sequelize.ENUM('purchase', 'voucher'),
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING(),
        allowNull: true,
      },
      paymentType: {
        type: Sequelize.INTEGER(2),
        allowNull: true,
        defaultValue: 1
      },
      ticketDate: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      expirationDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      ticketNumber: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      ticketAmount: {
        type: Sequelize.DOUBLE(20, 2),
        allowNull: true,
        defaultValue: 0
      },
      voucherAmount: {
        type: Sequelize.DOUBLE(20, 2),
        allowNull: true,
        defaultValue: 0,
      },
      ticketCashbackType: {
        type: Sequelize.ENUM('+', '-'),
        allowNull: false
      },
      ticketCashback: {
        type: Sequelize.DOUBLE(20, 2),
        allowNull: true,
        defaultValue: 0
      },
      cagnotte: {
        type: Sequelize.DOUBLE(20, 2),
        allowNull: true,
        defaultValue: 0
      },
      state: {
        type: Sequelize.INTEGER(1),
        allowNull: false,
        defaultValue: 1
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Transactions');
  }
};