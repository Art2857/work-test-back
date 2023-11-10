import { WorkerApplicationBootstrap } from '../../worker-application';
import { DTO } from '../../utils/dto.class';
import { TaskRejectedDTO } from '../dtos/task-rejected.dto';
import { TaskRunningDTO } from '../dtos/task-running.dto';
import { TaskSuccessedDTO } from '../dtos/task-success.dto';
import { MappingTasks } from '../mapping-tasks.class';
import { EmitterSymbol } from '../../utils/emitter.class';
import { TaskEventReject, TaskEventSuccess } from '../task.class';

export function WorkerBootstrap() {
    const workerApplication = WorkerApplicationBootstrap();

    process.on('message', async (message: DTO) => {
        console.log(`Received message from primary:`, message);

        // Если пришло сообщение о выполнении задачи
        if (message.name === TaskRunningDTO.name) {
            const { id, mappingConstructor, params } = <TaskRunningDTO>message;

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

                    process.send!(new TaskSuccessedDTO(id, result));

                    subscription.unsubscribe();
                }
                if (event instanceof TaskEventReject) {
                    const { error } = event;

                    console.log(`Task ${task.name} failed with id ${id} and error ${JSON.stringify(error)}`);

                    process.send!(new TaskRejectedDTO(id, error!.message));

                    subscription.unsubscribe();
                }
            });

            await taskInstance.execute();
        }
    });

    return { application: workerApplication };
}
