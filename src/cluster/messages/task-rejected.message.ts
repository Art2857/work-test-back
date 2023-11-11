import { MessageDTO } from './message.dto';
import { TaskStatusEnum } from '../task.class';
import { Json } from '../../utils/types';

export class TaskRejectedMessageDTO extends MessageDTO {
    readonly event = TaskStatusEnum.Rejected;

    constructor(readonly id: number, readonly error: Json) {
        super();
    }
}
