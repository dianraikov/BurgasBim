class verticalToolbar extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this._toolbar = null;
        this._group = null;
        this._button = null;
    }

    load() {
        console.log('verticalToolbar loaded');
        return true;
    }

    unload() {
        console.log('verticalToolbar unloaded');
        return true;
    }

    onToolbarCreated() {
        this._toolbar = new Autodesk.Viewing.UI.ToolBar('verticalToolbar', { alignVertically: true });
        if (false /* align to the left */) {
            const { style } = this._toolbar.container;
            style.left = '15px';
            style.right = 'unset';
        }
        
        this._group_1 = this.viewer.toolbar.getControl('BurgasDataPanelToolbarGroup');
        if (!this._group_1) {
            this._group_1 = new Autodesk.Viewing.UI.ControlGroup('BurgasDataPanelToolbarGroup');
            this.viewer.toolbar.addControl(this._group_1);
        }
        this._group_2 = this.viewer.toolbar.getControl('BurgasColumnToolbarGroup');
        if (!this._group_2) {
            this._group_2 = new Autodesk.Viewing.UI.ControlGroup('BurgasColumnToolbarGroup');
            this.viewer.toolbar.addControl(this._group_2);
        }
        this._group_3 = this.viewer.toolbar.getControl('BurgasColoursToolbarGroup');
        if (!this._group_3) {
            this._group_3 = new Autodesk.Viewing.UI.ControlGroup('BurgasColoursToolbarGroup');
            this.viewer.toolbar.addControl(this._group_3);
        }
        // this._button = new Autodesk.Viewing.UI.Button('verticalToolbar');
        // this._button.addClass('adsk-icon-bug');
        // this._button.onClick = function (ev) {
        //     alert('Click!');
        // };
        // this._group.addControl(this._button);
        this._toolbar.addControl(this._group_1);
        this._toolbar.addControl(this._group_2);
        this._toolbar.addControl(this._group_3);
        this.viewer.container.appendChild(this._toolbar.container);
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('verticalToolbar', verticalToolbar);