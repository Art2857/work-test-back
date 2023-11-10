export class DualMap<L, R> {
    private readonly _left: Map<L, R> = new Map();
    private readonly _right: Map<R, L> = new Map();

    constructor(map?: Map<L, R>);
    constructor(dualMap?: DualMap<L, R>);
    constructor(map?: Map<L, R> | DualMap<L, R>) {
        if (map) {
            if (map instanceof DualMap) {
                const dual = map;

                this._left = dual.mapLeft;
                this._right = dual.mapRight;
            } else {
                map.forEach((right, left) => {
                    this.set(left, right);
                });
            }
        }
    }

    get mapLeft() {
        return new Map(this._left);
    }
    get mapRight() {
        return new Map(this._right);
    }

    get valuesLeft(): L[] {
        return Array.from(this._right.values());
    }

    get valuesRight(): R[] {
        return Array.from(this._left.values());
    }

    get size() {
        return this._left.size;
    }

    clear() {
        this._left.clear();
        this._right.clear();
    }

    set(left: L, right: R) {
        this._left.delete(left);
        this._right.delete(right);

        this._left.set(left, right);
        this._right.set(right, left);
    }

    getRight(left: L) {
        return this._left.get(left);
    }
    hasRight(left: L) {
        return this._left.has(left);
    }
    removeRight(left: L) {
        const right = this._left.get(left);
        if (right) {
            this._left.delete(left);
            this._right.delete(right);
            return true;
        }
        return false;
    }

    getLeft(right: R) {
        return this._right.get(right);
    }
    hasLeft(right: R) {
        return this._right.has(right);
    }
    removeLeft(right: R) {
        const left = this._right.get(right);
        if (left) {
            this._left.delete(left);
            this._right.delete(right);
            return true;
        }
        return false;
    }

    forEach(callback: (left: L, right: R) => void) {
        this._right.forEach(callback);
    }
}
