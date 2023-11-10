import { DTO } from '../../utils/dto.class';
import { TaskStatusEnum } from '../task.class';

export class TaskRejectedDTO extends DTO {
    readonly event = TaskStatusEnum.Rejected;

    constructor(readonly id: number, readonly error: any) {
        super();
    }
}
