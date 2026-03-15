class verticalToolbar extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this._toolbar = null;
    }

    load() {
        console.log('verticalToolbar loaded');
        return true;
    }

    unload() {
        if (this._toolbar) {
            this.viewer.container.removeChild(this._toolbar.container);
            this._toolbar = null;
            this.viewer.burgasToolbar = null;
        }
        console.log('verticalToolbar unloaded');
        return true;
    }

    onToolbarCreated() {
        if (this._toolbar) {
            return;
        }
        this._toolbar = new Autodesk.Viewing.UI.ToolBar('verticalToolbar', { alignVertically: true });

        this._toolbar.addControl(new Autodesk.Viewing.UI.ControlGroup('BurgasDataPanelToolbarGroup'));
        this._toolbar.addControl(new Autodesk.Viewing.UI.ControlGroup('BurgasColumnToolbarGroup'));
        this._toolbar.addControl(new Autodesk.Viewing.UI.ControlGroup('BurgasColoursToolbarGroup'));

        this.viewer.container.appendChild(this._toolbar.container);
        this.viewer.burgasToolbar = this._toolbar;
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('verticalToolbar', verticalToolbar);
