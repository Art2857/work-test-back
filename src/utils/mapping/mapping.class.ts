import { DualMap } from '../dual-map.class';

export class Mapping<TypeId = any, TypeValue = any> {
    private _mapping = new DualMap<TypeId, TypeValue>();

    get mapping() {
        return new DualMap(this._mapping);
    }

    get ids() {
        return this._mapping.valuesLeft;
    }

    get values() {
        return this._mapping.valuesRight;
    }

    add(id: TypeId, value: TypeValue) {
        return this._mapping.set(id, value);
    }

    removeById(id: TypeId) {
        const value = this._mapping.getRight(id);

        if (!value) {
            return false;
        }

        return this._mapping.removeLeft(value);
    }

    removeByValue(value: TypeValue) {
        const id = this._mapping.getLeft(value);

        if (!id) {
            return false;
        }

        return this._mapping.removeRight(id);
    }

    getIdByValue(task: TypeValue) {
        return this._mapping.getLeft(task);
    }

    getValueById(id: TypeId) {
        return this._mapping.getRight(id);
    }
}
