const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Vehicle = sequelize.define("Vehicle", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    make: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    year: {
      type: DataTypes.STRING, // Using STRING to match UI format (e.g., "2017")
      allowNull: false,
    },
    plate: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    timestamps: true,
  });

  Vehicle.associate = (models) => {
    Vehicle.belongsTo(models.User, { foreignKey: "userId", as: "owner" });
    Vehicle.hasMany(models.Service, { foreignKey: "vehicleId", as: "services" });
  };

  return Vehicle;
};