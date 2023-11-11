import { MessageDTO } from './message.dto';
import { TaskStatusEnum } from '../task.class';
import { Json } from '../../utils/types';

export class TaskRunningMessageDTO extends MessageDTO {
    readonly event = TaskStatusEnum.Running;

    constructor(
        readonly id: number,
        readonly mappingConstructor: string,
        readonly params: Json[] = [],
    ) {
        super();
    }
}
