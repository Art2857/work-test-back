import cluster from 'cluster';

export class Workers {
    private _count = 0;

    get count() {
        return this._count;
    }

    private readonly _workers = new Set();

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

        this._workers.add(worker);

        this._count++;

        worker.on('disconnect', () => {
            this._workers.delete(worker);

            this._count--;
        });

        worker.on('exit', () => {
            this._workers.delete(worker);

            this._count--;
        });

        return worker;
    }
}
