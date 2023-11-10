import cluster, { Worker } from 'cluster';
import { Emitter, EmitterSymbol } from '../utils/emitter.class';

export class WorkersEventAdd {
    constructor(public worker: Worker) {}
}

export class WorkersEventRemove {
    constructor(public worker: Worker, public killed: boolean) {}
}

export type WorkersEvents = WorkersEventAdd | WorkersEventRemove;

export class Workers {
    public readonly [EmitterSymbol] = new Emitter<WorkersEvents>();

    private _count = 0;

    get count() {
        return this._count;
    }

    private readonly _workers = new Set<Worker>();

    get workers() {
        return [...this._workers];
    }

    constructor(count: number) {
        for (let i = 0; i < count; i++) {
            this.create();
        }
    }

    create() {
        const worker = cluster.fork();

        this._count++;

        worker.on('error', (error) => {});

        worker.on('listening', () => {});

        worker.on('online', () => {
            console.log(`Worker ${worker.process.pid} is online`);

            this._workers.add(worker);

            this[EmitterSymbol].emit(new WorkersEventAdd(worker));
        });

        worker.on('disconnect', () => {
            this.remove(worker);
        });

        // Если воркер вышел из строя - перезапускаем
        worker.on('exit', (code, signal) => {
            console.log(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);

            this.remove(worker);

            this.create();
        });

        return worker;
    }

    remove(worker: Worker, kill = true) {
        this._workers.delete(worker);

        if (kill) {
            worker.kill();
        }

        this._count--;

        this[EmitterSymbol].emit(new WorkersEventRemove(worker, kill));

        return this;
    }

    clear(kill = true) {
        for (const worker of this._workers) {
            this.remove(worker, kill);
        }

        return this;
    }
}
