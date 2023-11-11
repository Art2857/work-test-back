import { MessageDTO } from './message.dto';
import { TaskStatusEnum } from '../task.class';
import { Json } from '../../utils/types';

export class TaskSuccessedMessageDTO extends MessageDTO {
    readonly event = TaskStatusEnum.Successed;

    constructor(readonly id: number, readonly result: Json) {
        super();
    }
}
