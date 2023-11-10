import { BehaviorSubject, skip, Subscription } from 'rxjs';

export const EmitterSymbol = Symbol();

export class Emitter<T> {
    static readonly Symbol = Symbol();

    private readonly _subject: BehaviorSubject<T>;

    private readonly _subscriptions: Set<Subscription> = new Set();

    get subscriptions() {
        return [...this._subscriptions];
    }

    constructor(value?: T) {
        this._subject = new BehaviorSubject<T>(value ?? (undefined as unknown as T));
    }

    emit(value: T) {
        this._subject.next(value);
    }

    subscribe(observerOrNext?: (value: T) => void) {
        const subscription = this._subject.pipe(skip(1)).subscribe(observerOrNext);

        this._subscriptions.add(subscription);

        return subscription;
    }

    unsubscribe(subscription: Subscription) {
        subscription.unsubscribe();

        return this._subscriptions.delete(subscription);
    }

    subscribesClear() {
        this._subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });

        this._subscriptions.clear();
    }
}
