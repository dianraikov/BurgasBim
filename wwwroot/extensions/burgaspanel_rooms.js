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
          // Crear un elemento de entrada de tipo submit
          // var botonEnviar = document.createElement("input");
          // botonEnviar.type = "submit";
          // botonEnviar.value = "Enviar";
          // botonEnviar.value = "Enviar";
          // formulario.appendChild(botonEnviar);
          //Obtener el div generado al crearse el paneld
          var div = document.getElementById("panelContentRooms");
          //Se incluye el formulario en el div
          div.appendChild(formulario);
          //Bucle para generar los campos
          //Crear datos de habitación:
          for (var field_rooms in data[0]) {
            // Crear un elemento de etiqueta para el campo de entrada de texto
            var etiquetaNombreHab = document.createElement("label");
            etiquetaNombreHab.id = "atributo_room  ";
            etiquetaNombreHab.textContent = field_rooms;
            // Crear un elemento de entrada de texto
            var inputNombreHab = document.createElement("input");
            inputNombreHab.type = "text";
            inputNombreHab.id = "valor_room";
            inputNombreHab.name = field_rooms;
            inputNombreHab.value = data[0][field_rooms];
            inputNombreHab.required = true;
            if (field_rooms == "Numero habitacion") {
              inputNombreHab.readOnly = true;
              etiquetaNombreHab.textContent = "Revit room code (not editable)";
            } else {
              inputNombreHab.addEventListener("focusout", function (event) {
                // event.preventDefault(); // Evitar el envío predeterminado del formulario
                let element = event.target;
                var columna = element.name;
                var valor = element.value;
                // Crear un objeto con los datos que deseas enviar al servidor
                var datos = {
                  num_hab: num_hab,
                  columna: columna,
                  valor: valor,
                };
                // Realizar una solicitud HTTP POST al servidor
                fetch("/api/query/pg_post_room", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(datos),
                })
                  .then((response) => response.json())
                  .then((data) => {
                    // Manejar la respuesta del servidor aquí
                    console.log(data);
                  })
                  .catch((error) => {
                    console.error("Error al enviar los datos:", error);
                  });
              });
            }

            formulario.appendChild(etiquetaNombreHab);
            formulario.appendChild(inputNombreHab);
          }
        });
    });
  }
  loadObjectCode(elements) {
    var form = document.getElementById("burgasFormRooms");
    if (form) {
      //Obtener el div generado al crearse el panel
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
    // Clean our UI elements if we added any
    if (this.subToolbar) {
      this.subToolbar.removeControl(this._button);
      if (this.subToolbar.getNumberOfControls() === 0) {
          this.viewer.toolbar.removeControl(this._group);
      }
  }
  console.log('BurgasPanelExtension_Rooms has been unloaded');
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
    // need to create the panel for later use
    if (_this.panel == null) {
      _this.panel = new BurgasPanel_Rooms(
        _this.viewer,
        _this.viewer.container,
        "BurgasPanelRoom",
        "Burgas Panel Rooms"
      );
    }

    // button to show the docking panel
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
      // show/hide docking panel
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
    this.container.style.right = "10px"; // Just initing, docking will overwrite this
    this.container.style.top = "10px"; // Just initing, docking will overwrite this
    this.container.style.resize = "auto";
    this.container.style.width = 450 + "px";
    this.container.style.minHeight = 500 + "px";
    this.container.style.minWidth = 300 + "px";
    // UI
    this.div = document.createElement("div");
    this.div.id = "panelContentRooms";
    this.scrollContainer.appendChild(this.div);
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  "BurgasPanelExtension_Rooms",
  BurgasPanelExtension_Rooms
);
