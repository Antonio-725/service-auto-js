// migrations/YYYYMMDDHHMMSS-add-invoiceId-to-services.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Services', 'invoiceId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Invoices',
        key: 'id',
      },
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Services', 'invoiceId');
  },
};