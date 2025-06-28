'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Step 1: Check if serviceId column exists
    const tableInfo = await queryInterface.describeTable('SparePartRequests');
    if (!tableInfo.serviceId) {
      await queryInterface.addColumn('SparePartRequests', 'serviceId', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Services',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }

    // Step 2: Populate serviceId for existing SparePartRequests with NULL serviceId
    try {
      await queryInterface.sequelize.query(`
        UPDATE \`SparePartRequests\` spr
        SET \`serviceId\` = (
          SELECT s.id
          FROM \`Services\` s
          WHERE s.\`vehicleId\` = spr.\`vehicleId\`
          AND s.\`createdAt\` <= spr.\`createdAt\`
          AND s.\`status\` IN ('Pending', 'In Progress', 'Completed')
          ORDER BY s.\`createdAt\` DESC
          LIMIT 1
        )
        WHERE spr.\`serviceId\` IS NULL;
      `);
    } catch (error) {
      console.error('Error updating serviceId for existing SparePartRequests:', error);
      throw new Error('Failed to populate serviceId for existing records');
    }

    // Step 3: Delete orphaned SparePartRequests (no matching Service)
    try {
      await queryInterface.sequelize.query(`
        DELETE FROM \`SparePartRequests\`
        WHERE \`serviceId\` IS NULL;
      `);
    } catch (error) {
      console.error('Error deleting orphaned SparePartRequests:', error);
      throw new Error('Failed to delete orphaned SparePartRequests');
    }

    // Step 4: Make serviceId non-nullable
    await queryInterface.changeColumn('SparePartRequests', 'serviceId', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'Services',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('SparePartRequests', 'serviceId');
  },
};