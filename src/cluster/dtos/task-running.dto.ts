import { DTO } from '../../utils/dto.class';
import { TaskStatusEnum } from '../task.class';

export class TaskRunningDTO extends DTO {
    readonly event = TaskStatusEnum.Running;

    constructor(
        readonly id: number,
        readonly mappingConstructor: string,
        readonly params: any[] = [], // JSON
    ) {
        super();
    }
}
