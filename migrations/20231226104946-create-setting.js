'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Settings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      cashbackAmount: {
        type: Sequelize.DOUBLE,
        defaultValue: 0,
        allowNull: false,
      },
      voucherDurate: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      voucherAmountMin: {
        type: Sequelize.DOUBLE,
        defaultValue: 0,
        allowNull: true,
      },
      voucherDay: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 10,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Settings');
  }
};