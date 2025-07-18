
'use strict';

const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Otp = sequelize.define("Otp", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    timestamps: true,
    tableName: 'Otps', // Explicitly set table name
  });

  Otp.associate = (models) => {
    Otp.belongsTo(models.User, { foreignKey: "userId", as: "user" });
  };

  return Otp;
};