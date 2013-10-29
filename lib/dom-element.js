var DOMEvent = require('./dom-event').DOMEvent;

function DOMElement(elementId, docList, eventList, changeFunc) {
    this.ID = elementId;
    this.docList = docList;
    this.eventList = eventList;
    this.XULChanged = changeFunc;

    this.__defineGetter__('outerHTML', function() {
        return this.docList[0].getElementById(this.ID).outerHTML;
    });

    this.__defineGetter__('innerHTML', function() {
        return this.docList[0].getElementById(this.ID).innerHTML;
    });

    this.__defineGetter__('display', function() {
        return this.docList[0].getElementById(this.ID).style.display;
    });

    this.__defineGetter__('value', function() {
        return this.docList[0].getElementById(this.ID).value;
    });

    this.__defineGetter__('label', function() {
        return this.docList[0].getElementById(this.ID).label;
    });

    this.__defineSetter__('innerHTML', function(val) {
        for each(var doc in this.docList) {
            doc.getElementById(this.ID).innerHTML = val;
        }
    });

    this.__defineSetter__('value', function(val) {
        for each(var doc in this.docList) {
            doc.getElementById(this.ID).value = val;
        }
    });

    this.__defineSetter__('outerHTML', function(val) {
        for each(var doc in this.docList) {
            doc.getElementById(this.ID).outerHTML = val;
        }
    });

    this.__defineSetter__('display', function(val) {
        for each(var doc in this.docList) {
            doc.getElementById(this.ID).style.display = val;
        }
    });

    this.__defineSetter__('className', function(val) {
        for each(var doc in this.docList) {
            doc.getElementById(this.ID).className = val;
        }
    });

    this.__defineSetter__('src', function(val) {
        for each(var doc in this.docList) {
            doc.getElementById(this.ID).src = val;
        }
    });

    this.__defineSetter__('href', function(val) {
        for each(var doc in this.docList) {
            doc.getElementById(this.ID).href = val;
        }
    });

    this.__defineSetter__('width', function(val) {
        for each(var doc in this.docList) {
            doc.getElementById(this.ID).width = val;
        }
    });

    this.__defineSetter__('backgroundImage', function(val) {
        for each(var doc in this.docList) {
            doc.getElementById(this.ID).style.backgroundImage = val;
        }
    });

    this.__defineSetter__('label', function(val) {
        for each(var doc in this.docList) {
            doc.getElementById(this.ID).style.label = val;
        }
    }); 

    this.__defineSetter__('style', function(val) {
        for each(var doc in this.docList) {
            doc.getElementById(this.ID).style = val;
        }
    }); 
}

DOMElement.prototype.addEventListener = function(eventName, func) {
    this.eventList.push(new DOMEvent(this.ID, eventName, func));

    for each(var doc in this.docList) {
        doc.getElementById(this.ID).addEventListener(eventName, func);
    }
    this.XULChanged(doc);
};

DOMElement.prototype.setAttribute = function(attr, val) {
    for each(var doc in this.docList) {
        doc.getElementById(this.ID).setAttribute(attr, val);
    }
    this.XULChanged(doc);
};

DOMElement.prototype.appendChild = function(node) {
    for each(var doc in this.docList) {
        doc.getElementById(this.ID).appendChild(node);
    }
    this.XULChanged(doc);
};

exports.DOMElement = DOMElement;
