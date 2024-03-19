'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AdminAutorizations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      adminId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Admins',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      gestion: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      utilisateur: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      rapport: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      factures: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      promotion: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      bonAchat: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      parametre: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    await queryInterface.dropTable('AdminAutorizations');
  }
};