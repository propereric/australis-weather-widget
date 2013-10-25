var sdkWindowUtils = require('sdk/window/utils');
var sdkData = require('sdk/self').data;

const MULTIVIEW_ID = 'PanelUI-multiView';

function DOMEvent(elementId, eventName, func) {
    return {
        ElementId: elementId,
        EventName: eventName,
        Callback: func
    };
}

function Element(elementId, _dom) {
    this.ID = elementId;
    this.dom = _dom;

    this.__defineGetter__("outerHTML", function() {
        let windows = sdkWindowUtils.windows();
        for(let i = 0; i < windows.length; i++) {
            let element = windows[i].document.getElementById(this.ID);
            return element.outerHTML;
        }
    });

    this.__defineGetter__("innerHTML", function() {
        let windows = sdkWindowUtils.windows();
        for(let i = 0; i < windows.length; i++) {
            let element = windows[i].document.getElementById(this.ID);
            return element.innerHTML;
        }
    });

    this.__defineGetter__("display", function() {
        let windows = sdkWindowUtils.windows();
        for(let i = 0; i < windows.length; i++) {
            let element = windows[i].document.getElementById(this.ID);
            return element.style.display;
        }
    });

	this.__defineGetter__("value", function() {
        let windows = sdkWindowUtils.windows();
        for(let i = 0; i < windows.length; i++) {
            let element = windows[i].document.getElementById(this.ID);
            return element.value;
        }
    });



    this.__defineSetter__("innerHTML", function(val) {
        let windows = sdkWindowUtils.windows();
        for(let i = 0; i < windows.length; i++) {
            let element = windows[i].document.getElementById(this.ID);
            if(element){ element.innerHTML = val; }
        }
    });

    this.__defineSetter__("display", function(val) {
        let windows = sdkWindowUtils.windows();
        for(let i = 0; i < windows.length; i++) {
            let element = windows[i].document.getElementById(this.ID);
            if(element){ element.style.display = val;}
        }
    });

    this.__defineSetter__("className", function(val) {
        let windows = sdkWindowUtils.windows();
        for(let i = 0; i < windows.length; i++) {
            let element = windows[i].document.getElementById(this.ID);
            if(element){ element.className = val; }
		}
    });

	this.__defineSetter__("src", function(val) {
        let windows = sdkWindowUtils.windows();
        for(let i = 0; i < windows.length; i++) {
            let element = windows[i].document.getElementById(this.ID);
            if(element){ element.src = val; }
        }
    });

    this.__defineSetter__("width", function(val) {
        let windows = sdkWindowUtils.windows();
        for(let i = 0; i < windows.length; i++) {
            let element = windows[i].document.getElementById(this.ID);
            if(element){ element.width = val; }
        }
    });
}

Element.prototype.addEventListener = function(eventName, func) {
    this.dom.pushEvent(new DOMEvent(this.ID, eventName, func));

    let windows = sdkWindowUtils.windows();
    for each(var window in windows) {
        let element = window.document.getElementById(this.ID);
        if(element){ element.addEventListener(eventName, func, true); }
    }
};


Element.prototype.setAttribute = function(attr, val) {
    let windows = sdkWindowUtils.windows();
    for each(var window in windows) {
        let element = window.document.getElementById(this.ID);
        if(element){ element.setAttribute(attr, val); }
    }
};

Element.prototype.appendChild = function(node) {
    let windows = sdkWindowUtils.windows();
    for each(var window in windows) {
        let element = window.document.getElementById(this.ID);
        if(element){ element.appendChild(node); }
    }
};

const multiView = 'PanelUI-multiView';

function DOMHelper() {
    this.domEvents = [];
    this.document = null;
    this.__defineGetter__("document", function() {
        let windows = sdkWindowUtils.windows();
        for(let i = 0; i < windows.length; i++) {
            return windows[i].document;
        }
    });
}

DOMHelper.prototype.getUXPanelCopy = function(panelId) {
    let uxPanel = this.document.getElementById(panelId);

    console.log('Grabbing UX Panel inside DOMHelper');
    if(uxPanel) {
      console.log(uxPanel.outerHTML);
      return uxPanel.cloneNode(true);
    }
    return;
};

DOMHelper.prototype.createUXPanel = function(window, panelId) {
    let panelView = window.document.createElement('panelview');
    panelView.setAttribute('id', panelId);
    panelView.setAttribute('flex', '1');

    return panelView;
};

DOMHelper.prototype.initUXPanel = function(window, panelId, filePath) {
    let panelView = this.createUXPanel(window, panelId);

    let xul = sdkData.load(filePath);

    panelView.innerHTML = xul;

    let multiView = window.document.getElementById(MULTIVIEW_ID);
    multiView.appendChild(panelView);

    return panelView;
};

DOMHelper.prototype.copyUXPanel = function(window, panelId, toCopy) {
    let panelView = this.createUXPanel(window, panelId);
    panelView.innerHTML = toCopy.innerHTML;

    let multiView = window.document.getElementById(MULTIVIEW_ID);
    multiView.appendChild(panelView);
};

DOMHelper.prototype.wireEvents = function(window) {
    for each(var event in this.domEvents) {
        let element = window.document.getElementById(event.ElementId);
        element.addEventListener(event.EventName, event.Callback);
    }
};

DOMHelper.prototype.pushEvent = function(evt) {
    for each(var event in this.domEvents) {
        if(event.ElementId == evt.ElementId && event.EventName == evt.EventName && event.Callback == evt.Callback) {
            break;
        }
    }
    this.domEvents.push(evt);
};

DOMHelper.prototype.createElement = function(tag) {
    return this.document.createElement(tag);
};

DOMHelper.prototype.createElementNS = function(ns, tag) {
    return this.document.createElementNS(ns, tag);
};

DOMHelper.prototype.getElementById = function(elementId) {
    return new Element(elementId, this);
};

DOMHelper.prototype.GetElementByClassName = function(elementId) {
    //need to return elements with class name
};

exports.Element = Element;
exports.DOMHelper = DOMHelper;