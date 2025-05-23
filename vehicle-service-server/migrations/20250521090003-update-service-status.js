module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Services', 'status', {
      type: Sequelize.ENUM('Pending', 'In Progress', 'Completed', 'Cancelled'),
      defaultValue: 'Pending',
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Services', 'status', {
      type: Sequelize.ENUM('In Progress', 'Completed', 'Cancelled'),
      defaultValue: 'In Progress',
    });
  },
};