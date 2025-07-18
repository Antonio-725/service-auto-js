//model/SparePartRequest.js
'use strict';
 const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SparePartRequest extends Model {
    static associate(models) {
      SparePartRequest.belongsTo(models.SparePart, { foreignKey: 'sparePartId', as: 'sparePart' });
      SparePartRequest.belongsTo(models.Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });
      SparePartRequest.belongsTo(models.User, { foreignKey: 'mechanicId', as: 'mechanic' });
      SparePartRequest.belongsTo(models.Service, { foreignKey: 'serviceId', as: 'service' });
    }
  }

  SparePartRequest.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      sparePartId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      vehicleId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      mechanicId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      serviceId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Services',
          key: 'id',
        },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
      totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        allowNull: false,
        defaultValue: 'Pending',
      },
    },
    {
      sequelize,
      modelName: 'SparePartRequest',
      tableName: 'SparePartRequests',
      timestamps: true,
    }
  );

  return SparePartRequest;
};