export function initSlots(instance: any, children: any) {
    // children Object
    normalizeObjectSlots(children, instance.slots);
}

function normalizeObjectSlots(children: any, slots: any) {
    for (const key in children) {
        const value = children[key];
        // slot
        slots[key] = normalizeSlotValue(value);
    }
}

function normalizeSlotValue(value: any) {
    return Array.isArray(value) ? value : [value];
}
