export class MappingOneToMany<TypeId = any, TypeValue = any> {
    private _mappingById = new Map<TypeId, Set<TypeValue>>();
    private _mappingByValue = new Map<TypeValue, TypeId>();

    get mappingById() {
        return new Map(this._mappingById);
    }

    get mappingByValue() {
        return new Map(this._mappingByValue);
    }

    get ids() {
        return this._mappingById.keys();
    }

    get values() {
        return this._mappingByValue.keys();
    }

    getValuesById(id: TypeId) {
        return this._mappingById.get(id);
    }

    getIdByValue(value: TypeValue) {
        return this._mappingByValue.get(value);
    }

    add(id: TypeId, value: TypeValue) {
        let values = this.getValuesById(id);

        if (!values) {
            values = new Set();

            this._mappingById.set(id, values);
        }

        if (values.has(value)) {
            return false;
        }

        values.add(value);

        this._mappingByValue.set(value, id);

        return true;
    }

    remove(value: TypeValue) {
        const id = this.getIdByValue(value);

        if (!id) {
            return false;
        }

        const values = this.getValuesById(id);

        if (!values) {
            return false;
        }
        const isDeleted = values.delete(value);

        if (values.size === 0) {
            this._mappingById.delete(id);
        }

        this._mappingByValue.delete(value);

        return isDeleted;
    }
}
