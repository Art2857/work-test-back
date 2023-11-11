import { WorkerApplicationBootstrap } from '../../worker-application';
import { MessageDTO } from '../messages/message.dto';
import { TaskRejectedMessageDTO } from '../messages/task-rejected.message';
import { TaskRunningMessageDTO } from '../messages/task-running.message';
import { TaskSuccessedMessageDTO } from '../messages/task-success.message';
import { MappingTasks } from '../mapping-tasks.class';
import { EmitterSymbol } from '../../utils/emitter.class';
import { TaskEventReject, TaskEventSuccess } from '../task.class';

export function WorkerBootstrap() {
    const workerApplication = WorkerApplicationBootstrap();

    process.on('message', async (message: MessageDTO) => {
        console.log(`Received message from primary:`, message);

        // Если пришло сообщение о выполнении задачи
        if (message.name === TaskRunningMessageDTO.name) {
            const { id, mappingConstructor, params } = <TaskRunningMessageDTO>message;

            const task = MappingTasks.get(mappingConstructor);

            if (!task) {
                return console.log(`Task not found: ${mappingConstructor}`);
            }

            console.log(`Task ${task.name} started with id ${id} and params ${JSON.stringify(params)}`);

            // @ts-ignore
            const taskInstance = new task(...params);

            const subscription = taskInstance[EmitterSymbol].subscribe((event) => {
                if (event instanceof TaskEventSuccess) {
                    const { result, params } = event;

                    console.log(`Task ${task.name} finished with id ${id} and result ${JSON.stringify(result)}`);

                    process.send!(new TaskSuccessedMessageDTO(id, result));

                    subscription.unsubscribe();
                }
                if (event instanceof TaskEventReject) {
                    const { error } = event;

                    console.log(`Task ${task.name} failed with id ${id} and error ${JSON.stringify(error)}`);

                    process.send!(new TaskRejectedMessageDTO(id, error!.message));

                    subscription.unsubscribe();
                }
            });

            await taskInstance.execute();
        }
    });

    return { application: workerApplication };
}
