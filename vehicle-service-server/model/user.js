'use strict';

const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("user", "mechanic", "admin"),
      defaultValue: "user",
    },
  }, {
    timestamps: true,
    tableName: 'Users', // Explicitly set table name to match migration
  });

  User.associate = (models) => {
    User.hasMany(models.Vehicle, { foreignKey: "userId", as: "vehicles" });
    User.hasMany(models.Service, { foreignKey: "mechanicId", as: "servicesHandled" });
    User.hasMany(models.Otp, { foreignKey: "userId", as: "otps" });
    User.hasMany(models.SparePartRequest, { foreignKey: "mechanicId", as: "sparePartRequests" });
    User.hasMany(models.Invoice, { foreignKey: "userId", as: "invoices" });
  };

  return User;
};



// const { Sequelize, DataTypes } = require('sequelize');

// module.exports = (sequelize, DataTypes) => {
//   const User = sequelize.define("User", {
//     id: {
//       type: DataTypes.UUID,
//       defaultValue: DataTypes.UUIDV4,
//       primaryKey: true,
//     },
//     username: {
//      type: DataTypes.STRING,
//       allowNull: false,
//       unique: true,
//     },
//     email: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       unique: true,
//       validate: { isEmail: true },
//     },
//     phone: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     password: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     role: {
//       type: DataTypes.ENUM("user", "mechanic", "admin"),
//       defaultValue: "user",
//     },
//   }, {
//     timestamps: true,
//   });

//   User.associate = (models) => {
//     User.hasMany(models.Vehicle, { foreignKey: "userId", as: "vehicles" });
//     User.hasMany(models.Service, { foreignKey: "mechanicId", as: "servicesHandled" });
//     User.hasMany(models.Otp, { foreignKey: "userId", as: "otps" });

//   };

//   return User;
// };