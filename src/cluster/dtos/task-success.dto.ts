import { DTO } from '../../utils/dto.class';
import { TaskStatusEnum } from '../task.class';

export class TaskSuccessedDTO extends DTO {
    readonly event = TaskStatusEnum.Successed;

    constructor(readonly id: number, readonly result: any) {
        super();
    }
}
