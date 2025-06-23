// //model/service.js
// const { Sequelize, DataTypes } = require('sequelize');

// module.exports = (sequelize, DataTypes) => {
//   const Service = sequelize.define("Service", {
//     id: {
//       type: DataTypes.UUID,
//       defaultValue: DataTypes.UUIDV4,
//       primaryKey: true,
//     },
//     description: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     mechanicId: {
//       type: DataTypes.UUID,
//       allowNull: true, // Allow null initially, as mechanic is assigned later
//     },
//     vehicleId: {
//       type: DataTypes.UUID,
//       allowNull: false,
//     },
//     status: {
//       type: DataTypes.ENUM("Pending", "In Progress", "Completed", "Cancelled"),
//       defaultValue: "Pending", // Default to Pending for new services
//     },
//     date: {
//       type: DataTypes.DATEONLY,
//       allowNull: false,
//     },
//     rating: {
//       type: DataTypes.INTEGER,
//       allowNull: true,
//       validate: {
//         min: 1,
//         max: 5,
//       },
//     },
//   }, {
//     timestamps: true,
//   });

//   Service.associate = (models) => {
//     Service.belongsTo(models.User, { foreignKey: "mechanicId", as: "mechanic" });
//     Service.belongsTo(models.Vehicle, { foreignKey: "vehicleId", as: "vehicle" });
//   };

//   return Service;
// };

// models/Service.js
const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define(
    'Service',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mechanicId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      vehicleId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('Pending', 'In Progress', 'Completed', 'Cancelled'),
        defaultValue: 'Pending',
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
          max: 5,
        },
      },
      invoiceId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Invoices',
          key: 'id',
        },
      },
    },
    {
      timestamps: true,
      tableName: 'Services',
    }
  );

  Service.associate = (models) => {
    Service.belongsTo(models.User, { foreignKey: 'mechanicId', as: 'mechanic' });
    Service.belongsTo(models.Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });
    Service.belongsTo(models.Invoice, { foreignKey: 'invoiceId', as: 'invoice' });
  };

  return Service;
};