export type Optional<T> = T | undefined;

export type Nullable<T> = T | null;

export type Emptyble<T> = T | undefined | null;

export type Newable<T> = new (...args: any[]) => T;

export type Function<T = any> = (...args: any[]) => T;
