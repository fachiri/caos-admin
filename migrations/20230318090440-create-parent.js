'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Parents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      uuid: {
        allowNull: false,
        type: Sequelize.UUID
      },
      no_kk: {
        type: Sequelize.STRING
      },
      nik_ayah: {
        type: Sequelize.STRING,
      },
      nama_ayah: {
        type: Sequelize.STRING,
      },
      no_bpjs_ayah: {
        type: Sequelize.STRING,
      },
      nik_ibu: {
        type: Sequelize.STRING,
      },
      nama_ibu: {
        type: Sequelize.STRING,
      },
      no_bpjs_ibu: {
        type: Sequelize.STRING,
      },
      userId: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Parents');
  }
};