// models/Invoice.js
const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define(
    'Invoice',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      serviceId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Services',
          key: 'id',
        },
      },
      vehicleId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Vehicles',
          key: 'id',
        },
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      items: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: '[]', // Default to empty JSON array
        validate: {
          isValidItems(value) {
            if (!Array.isArray(value)) throw new Error('Items must be an array');
            value.forEach((item) => {
              if (!item.description || typeof item.quantity !== 'number' || typeof item.unitPrice !== 'number')
                throw new Error('Invalid item format');
            });
          },
        },
      },
      laborCost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          min: 0,
        },
      },
      partsCost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          min: 0,
        },
      },
      tax: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          min: 0,
        },
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      status: {
        type: DataTypes.ENUM('Draft', 'Sent', 'Paid', 'Overdue'),
        allowNull: false,
        defaultValue: 'Draft',
      },
      sentAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      tableName: 'Invoices',
    }
  );

  Invoice.associate = (models) => {
    Invoice.belongsTo(models.Service, { foreignKey: 'serviceId', as: 'service' });
    Invoice.belongsTo(models.Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });
    Invoice.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Invoice.hasOne(models.Service, { foreignKey: 'invoiceId', as: 'linkedService' });
  };

  return Invoice;
};