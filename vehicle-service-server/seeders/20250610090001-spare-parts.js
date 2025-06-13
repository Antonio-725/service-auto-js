const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('SpareParts', [
      {
        id: uuidv4(),
        name: 'Oil Filter',
        price: 15.99,
        picture: 'https://example.com/images/oil-filter.jpg',
        quantity: 25,
        criticalLevel: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Brake Pads',
        price: 45.50,
        picture: 'https://example.com/images/brake-pads.jpg',
        quantity: 4,
        criticalLevel: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Spark Plug',
        price: 8.75,
        picture: 'https://example.com/images/spark-plug.jpg',
        quantity: 50,
        criticalLevel: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Air Filter',
        price: 12.30,
        picture: 'https://example.com/images/air-filter.jpg',
        quantity: 30,
        criticalLevel: false,       name: 'Timing Belt',
        price: 89.99,
        picture: 'https://example.com/images/timing-belt.jpg',
        quantity: 2,
        criticalLevel: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('SpareParts', null, {});
  },
};