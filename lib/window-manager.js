var sdkWindows = require('sdk/windows').browserWindows;
var sdkWindowUtils = require('sdk/window/utils');
var sdkUnload = require('sdk/system/unload');
var sdkData = require('sdk/self').data;

const MULTIVIEW_ID = 'PanelUI-multiView';

function WindowManager(_widget, _domHelper) {
    let widget = _widget;
    let domHelper = _domHelper;

    const CONFIG = {
        // WIDGET_ID: widget.CONFIG.ID,
        PANELVIEW_ID: widget.CONFIG.VIEW_ID,
        XUL_FILE: widget.CONFIG.XUL_FILE
    };

    let injectedWindows = [];
    let cachedPanel = null;

    function cachePanel() {
        cachedPanel = domHelper.getUXPanelCopy(CONFIG.PANELVIEW_ID);
    }

    function copyUXPanel(window) {
        domHelper.copyUXPanel(window, CONFIG.PANELVIEW_ID, cachedPanel);
    }

    if(sdkWindowUtils.windows().length >= 1) {
        let windows = sdkWindowUtils.windows();
        let firstWindow = windows[0];

        let panelView = domHelper.initUXPanel(firstWindow, CONFIG.PANELVIEW_ID, CONFIG.XUL_FILE);
        cachePanel();
        injectedWindows.push(firstWindow);

        for(let i = 1; i < windows.length; i++) {
            copyUXPanel(windows[i]);
            
            injectedWindows.push(windows[i]);
        }
    }

    function alreadyInjectedWindow(win) {
        for each(var window in injectedWindows) {
            if(win === window) { return true; }
        }
        return false;
    }

    function windowsModified() {
        let windows = sdkWindowUtils.windows();
        console.log("Num Windows: " + windows.length);
        if(windows.length > 0) {
            cachePanel();
        }
        for each(var window in windows) {
            if(!alreadyInjectedWindow(window)) {
                copyUXPanel(window);
                domHelper.wireEvents(window);
                injectedWindows.push(window);
            }
        }
    }

    function addonUnload(args) {
        widget.unload();

        console.log('Unloading from WM: ' + args);

        for each(var window in injectedWindows) {
            let injectedPanel = window.document.getElementById(CONFIG.PANELVIEW_ID);

            injectedPanel.parentNode.removeChild(injectedPanel);
        }

    }
    sdkWindows.on('open', windowsModified);
    sdkWindows.on('close', windowsModified);
    sdkUnload.when(addonUnload);
}

exports.WindowManager = WindowManager;