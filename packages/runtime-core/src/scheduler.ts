const queue: any[] = [];
const activePreFlushCbs: any[] = [];

let isFlushPending = false;
const p = Promise.resolve();

// 核心：微任务
export function nextTick(fn?: any) {
    return fn ? p.then(fn) : p;
}

export function queueJobs(job: any) {
    if (!queue.includes(job)) {
        queue.push(job);
    }

    queueFlush();
}

export function queuePreFlushCbs(job: any) {
    activePreFlushCbs.push(job);

    queueFlush();
}

function queueFlush() {
    // 优化：避免重复创建 nextTick
    if (isFlushPending) return;
    isFlushPending = true;

    nextTick(flushJobs);
}

function flushJobs(): any {
    for (let i = 0; i < activePreFlushCbs.length; i++) {
        activePreFlushCbs[i]();
    }

    // component render
    let job;
    while ((job = queue.shift())) {
        job && job();
    }

    isFlushPending = false;
}
