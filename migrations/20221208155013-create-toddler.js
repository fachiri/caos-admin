"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Toddlers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      uuid: {
        type: Sequelize.STRING,
      },
      nik: {
        type: Sequelize.STRING,
      },
      no_bpjs: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
      },
      jk: {
        type: Sequelize.STRING,
      },
      birth: {
        type: Sequelize.DATEONLY,
      },
      anak_ke: {
        type: Sequelize.STRING,
      },
      address: {
        type: Sequelize.TEXT,
      },
      prov: {
        type: Sequelize.STRING,
      },
      kab: {
        type: Sequelize.STRING,
      },
      kec: {
        type: Sequelize.STRING,
      },
      parentId: {
        type: Sequelize.INTEGER
      },
      posyanduId: {
        type: Sequelize.INTEGER
      },
      puskesmaId: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Toddlers");
  },
};
