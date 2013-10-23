function Event(obj, funcName) {
    var that = obj;
    return function(arg) {
        that[funcName].call(that, arg);
    };
}

exports.Event = Event;