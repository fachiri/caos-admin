"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Toddler extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Toddler.hasMany(models.Measurement, {
        foreignKey: "ToddlerId",
      });
      Toddler.belongsTo(models.Parent, {
        foreignKey: "parentId"
      });
      Toddler.belongsTo(models.Posyandus, {
        foreignKey: "posyanduId"
      });
      Toddler.belongsTo(models.Puskesmas, {
        foreignKey: "puskesmaId"
      });
    }
  }
  Toddler.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
      nik: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "NIK tidak boleh kosong" },
          len: { args: [16, 16], msg: "NIK harus 16 huruf" },
        },
      },
      no_bpjs: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "Nomor BPJS tidak boleh kosong" },
        },
      },
      name: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "Name is required" },
          len: { args: [3, 50], msg: "Nama minimal 3 huruf" },
        },
      },
      jk: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "Jenis Kelamin is required" },
        },
      },
      birth: {
        type: DataTypes.DATEONLY,
        validate: {
          notEmpty: { msg: "Tanggal Lahir tidak boleh kosong" },
        },
      },
      anak_ke: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "Data tidak boleh kosong" },
        },
      },
      address: {
        type: DataTypes.TEXT,
        validate: {
          notEmpty: { msg: "Alamat tidak boleh kosong" },
        },
      },
      prov: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "Provinsi tidak boleh kosong" },
        },
      },
      kab: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "Kabupaten tidak boleh kosong" },
        },
      },
      kec: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "Kecamatan tidak boleh kosong" },
        },
      },
      parentId: DataTypes.INTEGER
  },
    {
      sequelize,
      modelName: "Toddler",
    }
  );
  return Toddler;
};
