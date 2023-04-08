'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Parent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Parent.belongsTo(models.User, {
        foreignKey: "userId"
      }),
      Parent.belongsTo(models.Toddler, {
        foreignKey: "toddlerId"
      })
    }
  }
  Parent.init({
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
    },
    no_kk: DataTypes.STRING,
    nik: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    toddlerId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Parent',
  });
  return Parent;
};