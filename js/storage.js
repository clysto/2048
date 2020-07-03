window.ls = {
    get: get,
    set: set,
    remove: remove
}

function get(key) {
    return JSON.parse(localStorage.getItem(key));
}

function set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
}

function remove(key) {
    localStorage.removeItem(key);
}