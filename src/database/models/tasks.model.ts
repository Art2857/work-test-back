import { DataTypes, Model, Sequelize } from 'sequelize';
import { TaskStatusEnum } from '../../cluster/task.class';
import { Nullable } from '../../utils/types';

// В случае если приложение было запущено и найдены незавершённые задачи, то им устанавливается статус rejected
export interface ITaskAttributes {
    id?: number;
    name: string;
    params: any[],
    result: any,
    start: Nullable<Date>;
    end: Nullable<Date>;
    status: TaskStatusEnum;
}

export class TaskModel extends Model<ITaskAttributes> implements ITaskAttributes {
    public id?: number;
    public params!: any[];
    public result!: any;
    public name!: string;
    public start!: Date;
    public end!: Date;
    public status!: TaskStatusEnum;
}

export const TaskAttributes = {
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
        defaultValue: TaskStatusEnum.Pending,
    },
};

export const TaskInit = async (sequelize: Sequelize) => {
    TaskModel.init(TaskAttributes, {
        sequelize,
        modelName: 'Task',
    });
};
