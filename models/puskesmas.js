"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Puskesmas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Puskesmas.hasMany(models.Posyandus);
      Puskesmas.hasMany(models.User);
      Puskesmas.hasMany(models.Toddler);
    }
  }
  Puskesmas.init(
    {
      uuid: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
      nama: DataTypes.STRING,
      alamat: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Puskesmas",
      freezeTableName: false,
    }
  );
  return Puskesmas;
};
