'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        username: 'john_doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        password: 'hashed_password_1',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        username: 'jane_mechanic',
        email: 'jane.mechanic@example.com',
        phone: '0987654321',
        password: 'hashed_password_2',
        role: 'mechanic',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        username: 'admin_user',
        email: 'admin@example.com',
        phone: '5555555555',
        password: 'hashed_password_3',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  },
};