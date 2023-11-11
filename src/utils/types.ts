export type Optional<T> = T | undefined;

export type Nullable<T> = T | null;

export type Emptyble<T> = T | undefined | null | void;

export type Newable<T> = new (...args: any[]) => T;

export type Function<T = any> = (...args: any[]) => T;

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
