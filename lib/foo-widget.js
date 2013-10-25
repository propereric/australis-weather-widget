const { Cc, Ci, Cu, Cr, Cm, components } = require('chrome');
const { CustomizableUI } = Cu.import("resource:///modules/CustomizableUI.jsm");

var sdkWindows = require('sdk/windows').browserWindows;
var sdkWindowUtils = require('sdk/window/utils');

var DOMHelper = require('./dom-helper').DOMHelper;
var WindowManager = require('./window-manager').WindowManager;

const CONFIG = {
    ID: 'msu-foo-widget-derp',
    LABEL: 'Foo',
    TOOLTIP: 'Foo Widget v0.1',
    TYPE: 'view',
    VIEW_ID: 'PanelUI-msu-foo',
    REMOVABLE: true,
    DEFAULT_AREA: CustomizableUI.AREA_PANEL,
    XUL_FILE: 'fooPanel.xul',
    ICON_URL: 'http://www.yahoo.com/favicon.ico'
};

function Widget() {
    this.CONFIG = CONFIG;

    let dom = new DOMHelper();
    let wm = new WindowManager(this, dom);

    function onViewShowing(event) {
        console.log('onViewShowing called for widget');
    }

    function onViewHiding(event) {
        console.log('onViewHiding called for widget');
    }

    function onCreated(node) {
        console.log('oncreated called');

        let doc = node.ownerDocument;
        // Current doesn't take image size into account.
        let img = doc.createElement('image');
        img.setAttribute('class', 'toolbarbutton-icon');
        img.setAttribute('src', CONFIG.ICON_URL);

        let lbl = doc.createElement('label');
        lbl.setAttribute('class', 'toolbarbutton-text toolbarbutton-label');
        lbl.setAttribute('flex', '1');
        lbl.setAttribute('value', 'Weather');

        node.appendChild(img);
        node.appendChild(lbl);
    }

    function onViewShowing(event) {
        console.log('onViewShowing called for widget');
    }

    function onViewHiding(event) {
        console.log('onViewHiding called for widget');
    }

    return {
            id: CONFIG.ID,
            label: CONFIG.LABEL,
            tooltiptext: CONFIG.TOOLTIP,
            type: CONFIG.TYPE,
            viewId: CONFIG.VIEW_ID,
            removable: CONFIG.REMOVABLE,
            defaultArea: CONFIG.DEFAULT_AREA,

            onCreated: onCreated,
            onViewShowing: onViewShowing,
            onViewHiding: onViewHiding
    };
}

Widget.prototype.unload = function() {
    console.log('destroying widget');
}

Widget.prototype.echo = function() { console.log("echo!"); }

exports.Widget = Widget;