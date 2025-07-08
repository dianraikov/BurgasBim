class ColorExtension extends Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options);
    this._group = null;
    this._button = null;
    this.viewer = viewer;
  }

  load() {
    console.log("ColorExtension is loaded!");
    return true;
  }

  unload() {
    console.log("ColorExtension is now unloaded!");
    return true;
  }

  findLeafNodes(model) {
    // metodo para encontrar los nodos hoja
    return new Promise(function (resolve, reject) {
      // retorna una promesa
      model.getObjectTree(function (tree) {
        // obtiene el arbol de objetos
        let leaves = []; // crea un array para almacenar los nodos hoja
        tree.enumNodeChildren(
          tree.getRootId(),
          function (dbid) {
            // enumera los hijos del nodo raiz
            if (tree.getChildCount(dbid) === 0) {
              // si el nodo no tiene hijos
              leaves.push(dbid); // lo agrega al array de nodos hoja
            } // fin si
          },
          true /* recursively enumerate children's children as well */
        );
        resolve(leaves); //     resuelve la promesa con el array de nodos hoja
      }, reject); // fin get object tree
    });
  }

  onToolbarCreated() {
    // Create a new toolbar group if it doesn't exist
    this._group = this.viewer.toolbar.getControl("BurgasColoursToolbarGroup");
    if (!this._group) {
      this._group = new Autodesk.Viewing.UI.ControlGroup("BurgasColoursToolbarGroup");
      this.viewer.toolbar.addControl(this._group);
    }
    var panel = new executePanel(
      this.viewer,
      this.viewer.container,
      "ejecutado",
      "Functional Area",
      { url: "/PanelLeyenda.html" }
    );
    this._button = new Autodesk.Viewing.UI.Button(
      "ColorExtensionBotton",
      "wwwrootimagespaleta-de-color.png",
      "Show Colors"
    );
    this._button.onClick = () => {
      if (panel.isVisible()) {
        panel.setVisible(false);
        this._button.removeClass("active");
      } else {
        panel.setVisible(true);
        this._button.addClass("active");
      }

      const model = this.viewer.model;
      const dbids = this.findLeafNodes(model);
      model.getBulkProperties(
        this.viewer.getSelection(),
        { propFilter: ["ARE_FunctionalArea"], categoryFilter: ["Rooms"] },
        (results) => {
          var selection = this.viewer.getSelection();
          this.viewer.fitToView( selection );
          //console.log(results);
          for (const result of results) {
            if (result.properties.length > 0) {
              const prop = result.properties[0];
              //console.log(prop);

              if (prop.displayValue === "INPATIENT") {
                //console.log(prop.displayValue);
                //console.log(result.dbId);
                //const red = new THREE.Vector4(1, 0, 0, 0.5);
                this.viewer.setThemingColor(
                  result.dbId,
                  new THREE.Vector4(0.8863, 0.9373, 0.8509, 1)
                );
              } else if (prop.displayValue === "OUTPATIENT") {
                this.viewer.setThemingColor(
                  result.dbId,
                  new THREE.Vector4(0.7725, 0.8784, 0.7019, 1)
                );
              } else if (prop.displayValue === "MEDICAL SUPPORT") {
                this.viewer.setThemingColor(
                  result.dbId,
                  new THREE.Vector4(0.8706, 0.9176, 0.9647, 1)
                );
              } else if (
                prop.displayValue === "GENERAL ADMINISTRATIVE SUPPORT"
              ) {
                this.viewer.setThemingColor(
                  result.dbId,
                  new THREE.Vector4(1, 0.949, 0.8, 1)
                );
              } else if (prop.displayValue === "GENERAL SERVICES") {
                this.viewer.setThemingColor(
                  result.dbId,
                  new THREE.Vector4(0.9686, 0.7922, 0.6745, 1)
                );
              } else if (prop.displayValue === "PATIENT MANAGEMENT") {
                this.viewer.setThemingColor(
                  result.dbId,
                  new THREE.Vector4(0.9569, 0.6902, 0.5137, 1)
                );
              } else if (prop.displayValue === "STAFF AREAS") {
                this.viewer.setThemingColor(
                  result.dbId,
                  new THREE.Vector4(0.9765, 0.5412, 0.5294, 1)
                );
              } else if (prop.displayValue === "TECHNICAL SUPPORT") {
                this.viewer.setThemingColor(
                  result.dbId,
                  new THREE.Vector4(0.5569, 0.6667, 0.8588, 1)
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
    this._button.setToolTip("ColorExtension");
    this._button.addClass("ColorExtensionIcon");
    this._group.addControl(this._button);
  }
}
class executePanel extends Autodesk.Viewing.UI.DockingPanel {
  constructor(viewer, container, id, title, options) {
    super(container, id, title, options);
    this.div = document.createElement("div");
    this.div.className = "LeyendaTematica";
    this.iframe = document.createElement("iframe");
    this.iframe.src = options.url;
    this.iframe.style.width = "100%";
    this.iframe.style.height = "200px";
    this.iframe.frameborder = 0;
    this.div.appendChild(this.iframe);
    this.container.appendChild(this.div);
  }

  initialize() {
    this.container.style.top = "5px";
    this.container.style.left = "5px";
    this.container.style.height = "210px";
    this.container.style.resize = "auto";
    this.container.style.width = "268px";

    this.container.style.right = "10px";

    // allow move
    this.initializeMoveHandlers(this.container);
    // close button
    this.closeButton = this.createCloseButton();
    this.closeButton.addEventListener("click", () => {
      viewer.clearThemingColors();
    });
    this.container.appendChild(this.closeButton);
    this.container.appendChild(this.createFooter());
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  "ColorExtension",
  ColorExtension
);
