'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    const hashedPassword = await bcrypt.hash('123456789', 10);
  
    await queryInterface.bulkInsert('Admins', [{
      firstName: 'Rubens',
      lastName: 'Alban',
      phone: '+242044913233',
      email: 'rubensalban@gmail.com',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
    await queryInterface.bulkInsert('AdminAutorizations', [{
      adminId: 1,
      utilisateur: true,
      gestion: true,
      rapport: true,
      factures: true,
      promotion: true,
      parametre: true,
      bonAchat: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Admins', null, {});
  }
};
