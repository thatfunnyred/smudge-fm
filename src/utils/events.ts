// @events to store all callback
const events: Record<string, Set<Function>> = {};

// func to subscribe to a specified event, returns callback to delete the event
function subscribe(event: string, callback: Function) {
    
    // create new event id if not stored
    if (!events[event]) {
        events[event] = new Set();
    }
    
    // add callback to the stored event id
    events[event].add(callback);

    // return callback to delete the event
    return () => {
        events[event].delete(callback);
    };
}

// func to notify all subscribed to an event
function publish(event: string, data: any) {

    // create new event id if not stored
    if (!events[event]) {
        events[event] = new Set();
    }

    // call all callbacks
    events[event]?.forEach(callback => callback(data));
}

// export all funcs
export { subscribe, publish };