class BurgasPanelExtension_Rooms extends Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options);
    this._group = null;
    this._button = null;
    this._formCounter = 0; // fixes duplicate IDs
  }

  clearPanel() {
    var div = document.getElementById("panelContentRooms");
    if (div) div.innerHTML = "";
  }

  crearFormulario(elements) {
    var _this = this;
    var instanceId = ++this._formCounter; // unique per call, fixes duplicate IDs

    elements.forEach(function (element) {
      var num_hab = element.properties[0].displayValue;
      var conexion = "/api/query/pg_get_room/?room_code=" + num_hab;
      fetch(conexion)
        .then((response) => response.json())
        .then(function (data) {
          // If a newer call came in while we were fetching, discard this result
          if (instanceId !== _this._formCounter) return;
          if (!data || data.length === 0) {
            console.warn("burgaspanel_rooms: no data for room code", num_hab);
            return;
          }

          var div = document.getElementById("panelContentRooms");
          if (!div) return;

          var formulario = document.createElement("form");
          formulario.id = "burgasFormRooms";

          div.appendChild(formulario);

          const keys = Object.keys(data[0]);
          keys[0] = "Код на помещение";
          keys[1] = "Функционална зона";
          keys[2] = "Структури (клиника)";
          keys[3] = "Звена";
          keys[4] = "Номер на стаята";
          keys[5] = "Име на стаята по табелка";
          keys[8] = "Квадратура";
          keys[11] = "Забележки";
          keys[12] = "Специфични изисквания";
          keys[14] = "Дигитален архив";

          const skipIndexes = new Set([4, 6, 7, 9, 10, 13, 15]);

          keys.forEach((key, index) => {
            if (skipIndexes.has(index)) return;

            const originalKey = Object.keys(data[0])[index];
            const value = data[0][originalKey];

            var label = document.createElement("label");
            // Use instanceId to guarantee unique IDs across calls
            label.id = "atributo_room_" + instanceId + "_" + index;
            label.textContent = key;

            var input = document.createElement("input");
            input.type = "text";
            input.id = "valor_room_" + instanceId + "_" + index;
            input.name = originalKey;
            input.value = value;
            input.required = true;

            if (originalKey === "Numero habitacion") {
              input.readOnly = true;
              label.textContent = "Revit room code (not editable)";
            } else {
              input.addEventListener("focusout", function (event) {
                var el = event.target;
                fetch("/api/query/pg_post_room", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    num_hab: num_hab,
                    columna: el.name,
                    valor: el.value,
                  }),
                })
                  .then((r) => r.json())
                  .then((d) => console.log(d))
                  .catch((err) => console.error("Error saving room:", err));
              });
            }

            formulario.appendChild(label);
            formulario.appendChild(input);
          });
        });
    });
  }

  loadObjectCode(elements) {
    // Clear panel immediately (no setTimeout race)
    this.clearPanel();
    this.crearFormulario(elements);
  }

  load() {
    console.log("BurgasPanelExtension_Rooms has been loaded");
    var _this = this;

    // Clear the panel whenever a new model finishes loading
    this.viewer.addEventListener(
      Autodesk.Viewing.MODEL_ROOT_LOADED_EVENT,
      function () {
        _this.clearPanel();
      }
    );

    this.viewer.addEventListener(
      Autodesk.Viewing.SELECTION_CHANGED_EVENT,
      function (e) {
        if (e.dbIdArray.length === 0) {
          _this.subToolbar.setVisible(true);
          if (_this.panel) _this.panel.setVisible(false);
          return;
        }
        _this.viewer.model.getBulkProperties(
          e.dbIdArray,
          { propFilter: ["Number"], categoryFilter: ["Rooms"] },
          function (elements) {
            _this.subToolbar.setVisible(elements.length > 0);
            if (_this.panel) _this.panel.removeAllProperties();
            if (_this.panel && elements.length > 0) {
              var selection = _this.viewer.getSelection();
              _this.viewer.fitToView(selection);
            }
            _this.loadObjectCode(elements);
          }
        );
      }
    );
    return true;
  }

  unload() {
    if (this.subToolbar) {
      this.subToolbar.removeControl(this._button);
      if (this.subToolbar.getNumberOfControls() === 0) {
        this.viewer.toolbar.removeControl(this._group);
      }
    }
    console.log("BurgasPanelExtension_Rooms has been unloaded");
  }

  onToolbarCreated() {
    this.viewer.removeEventListener(
      Autodesk.Viewing.TOOLBAR_CREATED_EVENT,
      this.onToolbarCreatedBinded
    );
    this.onToolbarCreatedBinded = null;
    this.createUI();
  }

  createUI() {
    var _this = this;
    if (_this.panel == null) {
      _this.panel = new BurgasPanel_Rooms(
        _this.viewer,
        _this.viewer.container,
        "BurgasPanelRoom",
        "Burgas Panel Rooms"
      );
    }

    const toolbar = this.viewer.burgasToolbar || this.viewer.toolbar;
    this.subToolbar = toolbar.getControl("BurgasDataPanelToolbarGroup");
    if (!this.subToolbar) {
      this.subToolbar = new Autodesk.Viewing.UI.ControlGroup(
        "BurgasDataPanelToolbarGroup"
      );
      toolbar.addControl(this.subToolbar);
    }
    if (this._button) return;
    this._button = new Autodesk.Viewing.UI.Button("burgasButtonRooms");
    this._button.onClick = function (e) {
      _this.panel.setVisible(!_this.panel.isVisible());
    };
    this._button.addClass("BurgasPanelIcon");
    this._button.setToolTip("Burgas Panel Rooms");
    this.subToolbar.addControl(this._button);
    this.subToolbar.setVisible(true);
  }
}

class BurgasPanel_Rooms extends Autodesk.Viewing.UI.PropertyPanel {
  constructor(viewer, container, id, title, options) {
    super(container, id, title, options);
    this.viewer = viewer;
    this.container.style.right = "10px";
    this.container.style.top = "10px";
    this.container.style.resize = "auto";
    this.container.style.width = "450px";
    this.container.style.minHeight = "500px";
    this.container.style.minWidth = "300px";

    this.div = document.createElement("div");
    this.div.id = "panelContentRooms";
    this.scrollContainer.appendChild(this.div);
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  "BurgasPanelExtension_Rooms",
  BurgasPanelExtension_Rooms
);