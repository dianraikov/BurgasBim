class ColorExtension1 extends Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options);
    this._group = null;
    this._button = null;
    this._panel = null;
    this.viewer = viewer;
  }

  load() {
    console.log("ColorExtension1 is loaded!");
    return true;
  }

  unload() {
    console.log("ColorExtension1 is now unloaded!");
    if (this._group && this._button) {
      this._group.removeControl(this._button);
    }
    if (this._panel) {
      this._panel.setVisible(false);
    }
    return true;
  }

  // Find all leaf nodes
  findLeafNodes(model) {
    return new Promise(function (resolve, reject) {
      model.getObjectTree(function (tree) {
        let leaves = [];
        tree.enumNodeChildren(
          tree.getRootId(),
          function (dbid) {
            if (tree.getChildCount(dbid) === 0) {
              leaves.push(dbid);
            }
          },
          true
        );
        resolve(leaves);
      }, reject);
    });
  }

  // Fetch buildingtype from backend API
  async getBuildingType() {
    try {
      const resp = await fetch("/api/query/buildingtype");
      if (!resp.ok) return null;
      const data = await resp.json();
      return (data.buildingtype || "").toUpperCase();
    } catch (e) {
      console.error("Error fetching buildingtype:", e);
      return null;
    }
  }

  async onToolbarCreated() {
    // Create group if doesn't exist
    this._group = this.viewer.toolbar.getControl("BurgasColoursToolbarGroup");
    if (!this._group) {
      this._group = new Autodesk.Viewing.UI.ControlGroup(
        "BurgasColoursToolbarGroup"
      );
      this.viewer.toolbar.addControl(this._group);
    }

    // Get buildingtype from backend
    const buildingtype = await this.getBuildingType();
    console.log('Building type from database:', buildingtype);

    // Choose which URL to load based on buildingtype
    const panelMap = {
      "CHILDREN HOSPITAL": "/PanelLeyenda02.html",
      DEFAULT: "/PanelLeyenda1.html"
    };

    const panelUrl = panelMap[buildingtype] || panelMap.DEFAULT;
    console.log('Selected panel URL:', panelUrl);

    // Create panel
    this._panel = new executePanel1(
      this.viewer,
      this.viewer.container,
      "ejecutado",
      "Area",
      { url: panelUrl }
    );

    // Create button
    this._button = new Autodesk.Viewing.UI.Button("ColorExtension1Button");
    this._button.onClick = async () => {
      const panel = this._panel;

      if (panel.isVisible()) {
        panel.setVisible(false);
        this._button.removeClass("active");
        this.viewer.clearThemingColors();
      } else {
        panel.setVisible(true);
        this._button.addClass("active");
      }

      const model = this.viewer.model;
      let dbids = this.viewer.getSelection();
      if (!dbids || dbids.length === 0) {
        dbids = await this.findLeafNodes(model);
      }

      // Color by ARE_GeneralArea
      model.getBulkProperties(
        dbids,
        { propFilter: ["ARE_GeneralArea"], categoryFilter: ["Rooms"] },
        (results) => {
          if (dbids.length) this.viewer.fitToView(dbids);

          for (const result of results) {
            if (result.properties.length > 0) {
              const prop = result.properties[0];
              if (prop.displayValue === "CARE AREA") {
                this.viewer.setThemingColor(
                  result.dbId,
                  new THREE.Vector4(0.8863, 0.9373, 0.8509, 1)
                );
              } else if (prop.displayValue === "CARE SUPPORT AREA") {
                this.viewer.setThemingColor(
                  result.dbId,
                  new THREE.Vector4(0.8706, 0.9176, 0.9647, 1)
                );
              } else if (prop.displayValue === "GENERAL SUPPORT AREA") {
                this.viewer.setThemingColor(
                  result.dbId,
                  new THREE.Vector4(1, 0.949, 0.8, 1)
                );
              }
            }
          }

          if (!panel.isVisible()) {
            this.viewer.clearThemingColors();
          }
        }
      );
    };

    this._button.setToolTip("ColorExtension1");
    this._button.addClass("ColorExtension1Icon");
    this._group.addControl(this._button);
  }
}

class executePanel1 extends Autodesk.Viewing.UI.DockingPanel {
  constructor(viewer, container, id, title, options) {
    super(container, id, title, options);
    this.viewer = viewer;
    this.div = document.createElement("div");
    this.div.className = "LeyendaTematica";
    this.iframe = document.createElement("iframe");
    this.iframe.src = options.url;
    this.iframe.style.width = "100%";
    this.iframe.style.height = "200px";
    this.iframe.frameBorder = 0;
    this.div.appendChild(this.iframe);
    this.container.appendChild(this.div);
  }

  initialize() {
    this.container.style.top = "5px";
    this.container.style.left = "5px";
    this.container.style.height = "200px";
    this.container.style.width = "220px";
    this.container.style.resize = "auto";
    this.container.style.right = "10px";

    this.initializeMoveHandlers(this.container);

    this.closeButton = this.createCloseButton();
    this.closeButton.addEventListener("click", () => {
      this.viewer.clearThemingColors();
      this.setVisible(false);
    });
    this.container.appendChild(this.closeButton);
    this.container.appendChild(this.createFooter());
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  "ColorExtension1",
  ColorExtension1
);
