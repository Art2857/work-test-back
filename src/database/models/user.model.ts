import { DataTypes, Model, Sequelize } from 'sequelize';

export interface IUserAttributes {
    id?: number;
    balance: number;
}

export class UserModel extends Model<IUserAttributes> implements IUserAttributes {
    public id?: number;
    public balance!: number;
}

export const UserAttributes = {
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
}; 

export const UserInit = async (sequelize: Sequelize) => {
    UserModel.init(UserAttributes, {
        sequelize,
        modelName: 'User',
    });
};
