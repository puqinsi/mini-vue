import { hasChanged, isObject } from "../shared";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
    private _value: any;
    dep: Set<unknown>;
    private _rawValue: any;
    constructor(value: any) {
        this._rawValue = value;
        this._value = convert(value);
        this.dep = new Set();
    }

    get value() {
        trackRefValue(this);
        return this._value;
    }

    set value(newValue) {
        if (hasChanged(this._rawValue, newValue)) {
            this._rawValue = newValue;
            this._value = convert(newValue);
            triggerEffects(this.dep);
        }
    }
}

function convert(value: any) {
    return isObject(value) ? reactive(value) : value;
}

function trackRefValue(ref: any) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}

export function ref(value: any) {
    return new RefImpl(value);
}
