'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const { DataTypes } = Sequelize;

        await queryInterface.createTable('Users', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            balance: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    min: 0,
                },
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });

        await queryInterface.bulkInsert('Users', [
            {
                balance: 10000,
            },
        ]);

        await queryInterface.createTable('Tasks', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            params: {
                type: DataTypes.JSON,
                allowNull: false,
            },
            result: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            start: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            end: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'pending',
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Users');
        await queryInterface.dropTable('Tasks');
    },
};
