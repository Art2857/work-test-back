'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', {
            id: {
                type: Sequelize.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            balance: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    min: 0,
                },
            },
        });

        await queryInterface.bulkInsert('users', [
            {
                balance: 10000,
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('users');
    },
};
