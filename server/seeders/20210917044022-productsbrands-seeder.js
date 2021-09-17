'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'ProductsBrands',
      [
        {
          ProductId: 1,
          BrandId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ProductId: 2,
          BrandId: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('ProductsBrands', null, {});
  },
};
