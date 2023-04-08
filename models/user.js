"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Article);
      User.belongsTo(models.Puskesmas, {
        foreignKey: "puskesmaId",
      });
      User.belongsTo(models.Posyandus, {
        foreignKey: "posyanduId",
      });
      User.hasOne(models.Parent);
    }
  }
  User.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "Name is required" },
          min: { args: 3, msg: "Nama minimal 3 huruf" },
        },
      },
      email: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "Email is required" },
          isEmail: { msg: "Must be a valid email" },
        },
        unique: true,
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: "masyarakat",
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "active",
      },
      password: DataTypes.STRING,
      puskesmaId: DataTypes.INTEGER,
      posyanduId:  DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
