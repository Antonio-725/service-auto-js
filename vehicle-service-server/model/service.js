const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define("Service", {
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
      allowNull: false,
    },
    vehicleId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("In Progress", "Completed", "Cancelled"),
      defaultValue: "In Progress",
    },
    date: {
      type: DataTypes.DATEONLY, // Stores date without time (e.g., "2025-05-20")
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
  }, {
    timestamps: true,
  });

  Service.associate = (models) => {
    Service.belongsTo(models.User, { foreignKey: "mechanicId", as: "mechanic" });
    Service.belongsTo(models.Vehicle, { foreignKey: "vehicleId", as: "vehicle" });
  };

  return Service;
};