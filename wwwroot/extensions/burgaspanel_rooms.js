class BurgasPanelExtension_Rooms extends Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options);
    this._group = null;
    this._button = null;
  }

  crearFormulario(elements) {
    elements.forEach(function (element) {
      var num_hab = element.properties[0].displayValue;
      var conexion = "/api/query/pg_get_room/?room_code=" + num_hab;
      fetch(conexion)
        .then((response) => response.json())
        .then(function (data) {
          var formulario = document.createElement("form");
          formulario.id = "burgasFormRooms";

          var div = document.getElementById("panelContentRooms");
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

          keys.forEach((key, index) => {
            if (index === 4) return;
            if (index === 6) return;
            if (index === 7) return;
            if (index === 9) return;
            if (index === 10) return;
            if (index === 13) return;
           if (index === 15) return;

            const originalKey = Object.keys(data[0])[index];
            const value = data[0][originalKey];

            var etiquetaNombreHab = document.createElement("label");
            etiquetaNombreHab.id = "atributo_room";
            etiquetaNombreHab.textContent = key;

            var inputNombreHab = document.createElement("input");
            inputNombreHab.type = "text";
            inputNombreHab.id = "valor_room";
            inputNombreHab.name = originalKey;
            inputNombreHab.value = value;
            inputNombreHab.required = true;

            if (originalKey === "Numero habitacion") {
              inputNombreHab.readOnly = true;
              etiquetaNombreHab.textContent = "Revit room code (not editable)";
            } else {
              inputNombreHab.addEventListener("focusout", function (event) {
                let element = event.target;
                var columna = element.name;
                var valor = element.value;
                var datos = {
                  num_hab: num_hab,
                  columna: columna,
                  valor: valor,
                };
                fetch("/api/query/pg_post_room", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(datos),
                })
                  .then((response) => response.json())
                  .then((data) => {
                    console.log(data);
                  })
                  .catch((error) => {
                    console.error("Error al enviar los datos:", error);
                  });
              });
            }

            formulario.appendChild(etiquetaNombreHab);
            formulario.appendChild(inputNombreHab);
          });
        });
    });
  }

  loadObjectCode(elements) {
    var form = document.getElementById("burgasFormRooms");
    if (form) {
      var div = document.getElementById("panelContentRooms");
      div.removeChild(form);
      setTimeout(() => {
        this.crearFormulario(elements);
      }, 100);
    } else {
      this.crearFormulario(elements);
    }
  }

  load() {
    console.log("BurgasPanelExtension_Rooms has been loaded");
    var _this = this;
    this.viewer.addEventListener(
      Autodesk.Viewing.SELECTION_CHANGED_EVENT,
      function (e) {
        if (e.dbIdArray.length == 0) {
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
            if (_this.panel && elements.length > 0)
              var selection = _this.viewer.getSelection();
            _this.viewer.fitToView(selection);
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

    this.subToolbar = this.viewer.toolbar.getControl(
      "BurgasDataPanelToolbarGroup"
    );
    if (!this.subToolbar) {
      this.subToolbar = new Autodesk.Viewing.UI.ControlGroup(
        "BurgasDataPanelToolbarGroup"
      );
      this.viewer.toolbar.addControl(this.subToolbar);
    }
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
