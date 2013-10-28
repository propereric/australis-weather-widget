var WindowManager = require('./window-manager').WindowManager;

function Widget(CONFIG) {
    let windowManager = new WindowManager(CONFIG);
    let document = windowManager.getXULDocument();

    function onCreated(node) {
        console.log('oncreated called');

        let doc = node.ownerDocument;
        // Curren't doesn't take image size into account.
        let img = doc.createElement('image');
        img.setAttribute('class', 'toolbarbutton-icon');
        img.setAttribute('src', CONFIG.ICON_URL);

        let lbl = doc.createElement('label');
        lbl.setAttribute('class', 'toolbarbutton-text toolbarbutton-label');
        lbl.setAttribute('flex', '1');
        lbl.setAttribute('value', 'Weather Widget');

        node.appendChild(img);
        node.appendChild(lbl);
    }

    function onViewShowing(event) {
        console.log('onViewShowing called for widget');
    }

    function onViewHiding(event) {
        console.log('onViewHiding called for widget');
    }

    function addonUnload(eventArgs) {
        console.log('Unloading: ' + eventArgs);
        windowManager.removeInjections();
        windowManager = null;
    }

    return {
        UXWidget: {
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
        },

        addonUnload: addonUnload,

        document: document
    };
}

exports.Widget = Widget;
