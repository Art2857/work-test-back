import { Mapping } from './mapping.class';

export class MappingById<TypeValue = any> extends Mapping<number, TypeValue> {
    private _nextId = 0;

    increment(value: TypeValue) {
        return super.add(this._nextId++, value);
    }
}
