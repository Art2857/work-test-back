import { MappingTasks } from '../mapping-tasks.class';
import { Task } from '../task.class';
import { userStressTaskFunction } from './user-stress.function';

// Создаём набор задач на выполение, по логика каждая должна быть уникальной, но для примера:
export class UserStressTask1 extends Task {
    constructor(duration?: number, count?: number, amount?: number) {
        super(userStressTaskFunction, [duration, count, amount]); // [...arguments]
    }
}
MappingTasks.add(UserStressTask1);

export class UserStressTask2 extends Task {
    constructor(duration?: number, count?: number, amount?: number) {
        super(userStressTaskFunction, [duration, count, amount]);
    }
}
MappingTasks.add(UserStressTask2);

export class UserStressTask3 extends Task {
    constructor(duration?: number, count?: number, amount?: number) {
        super(userStressTaskFunction, [duration, count, amount]);
    }
}
MappingTasks.add(UserStressTask3);

export class UserStressTask4 extends Task {
    constructor(duration?: number, count?: number, amount?: number) {
        super(userStressTaskFunction, [duration, count, amount]);
    }
}
MappingTasks.add(UserStressTask4);

export class UserStressTask5 extends Task {
    constructor(duration?: number, count?: number, amount?: number) {
        super(userStressTaskFunction, [duration, count, amount]);
    }
}
MappingTasks.add(UserStressTask5);

export class UserStressTask6 extends Task {
    constructor(duration?: number, count?: number, amount?: number) {
        super(userStressTaskFunction, [duration, count, amount]);
    }
}
MappingTasks.add(UserStressTask6);

export class UserStressTask7 extends Task {
    constructor(duration?: number, count?: number, amount?: number) {
        super(userStressTaskFunction, [duration, count, amount]);
    }
}
MappingTasks.add(UserStressTask7);

export class UserStressTask8 extends Task {
    constructor(duration?: number, count?: number, amount?: number) {
        super(userStressTaskFunction, [duration, count, amount]);
    }
}
MappingTasks.add(UserStressTask8);

export class UserStressTask9 extends Task {
    constructor(duration?: number, count?: number, amount?: number) {
        super(userStressTaskFunction, [duration, count, amount]);
    }
}
MappingTasks.add(UserStressTask9);

export class UserStressTask10 extends Task {
    constructor(duration?: number, count?: number, amount?: number) {
        super(userStressTaskFunction, [duration, count, amount]);
    }
}
MappingTasks.add(UserStressTask10);

export class UserStressTask11 extends Task {
    constructor(duration?: number, count?: number, amount?: number) {
        super(userStressTaskFunction, [duration, count, amount]);
    }
}
MappingTasks.add(UserStressTask11);
