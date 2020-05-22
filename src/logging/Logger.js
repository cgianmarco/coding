
var OPTS = {level: null, whitelist: [], blacklist: []}

const LEVELS = ['debug', 'info', 'warn', 'error']

const NO_OP = () => {};

function isIn(list, name) {
    return !list
        || list.find(n => name.indexOf(n) == 0)
}
function isNameAllowed(name) {
    return isIn(OPTS.whitelist, name) || !isIn(OPTS.blacklist, name)
}
function isLevelAllowed(level) {
    return LEVELS.indexOf(level) >= OPTS.level;
}

function loggerOf(level, name) {
    if (isLevelAllowed(level) && isNameAllowed(name)) {
        if (level == 'error') {
            return (...args) => console.err(level, '|', name, '|', ...args)
        }
        else {
            return (...args) => console.log(level, '|', name, '|', ...args)
        }
    }
    else {
        return NO_OP;
    }
}

function Logger(name) {
    this.name = name;
    LEVELS.forEach(l => {
        this[l] = loggerOf(l, name)
    })
}
Logger.setOptions = function(level, whitelist = [], blacklist = []) {
    OPTS = {
        level: LEVELS.indexOf(level), 
        whitelist: whitelist, 
        blacklist: blacklist
    }
}

module.exports = Logger;