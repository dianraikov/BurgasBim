class editFieldsEquipment_Extension extends Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options);
    this._group = null;
    this._button = null;
  }

  load() {
    console.log("editFields_Extension has been loaded");
    return true;
  }

  unload() {
    // Clean our UI elements if we added any
    this.viewer.toolbar.removeControl(this.subToolbar);
    return true;
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
      _this.panel = new editFieldEquipment_Panel(
        _this.viewer,
        _this.viewer.container,
        "editFieldsEquipment_Extension",
        "Burgas Editing Panel Equipment"
      );
    }

    // button to show the docking panel
    this.subToolbar = this.viewer.toolbar.getControl(
      "BurgasColumnToolbarGroup"
    );
    if (!this.subToolbar) {
      this.subToolbar = new Autodesk.Viewing.UI.ControlGroup(
        "BurgasColumnToolbarGroup"
      );
      this.viewer.toolbar.addControl(this.subToolbar);
    }
    this._button = new Autodesk.Viewing.UI.Button(
      "editFieldsEquipment_ExtensionButton"
    );
    this._button.onClick = function (e) {
      // show/hide docking panel
      _this.panel.setVisible(!_this.panel.isVisible());
      // ADD LOGIG!
      var div = document.getElementById("editPanelEquipment");
      var form = document.createElement("formE");
      form.id = "formColumnE";
      columnCreate(div, form);
      function columnCreate(div, form) {
        //Crear columna
        var nuevoCampo = document.createElement("input");
        nuevoCampo.type = "text";
        nuevoCampo.placeholder = "New Column Name";
        // Crear un botón de envío
        var botonEnvio = document.createElement("button");
        botonEnvio.type = "submit"; // Tipo "submit" para envío de formulario
        botonEnvio.textContent = "Create Column";
        // ----------------------------------------------------------------
        botonEnvio.onclick = (event) => {
          event.preventDefault();
          var valor = nuevoCampo.value;
          var datos = {
            valor: valor,
          };
          fetch("/api/query/pg_post_addColumnEquipment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(datos),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log(data);
              var listColumns = document.getElementById("columnListE");
              var form = document.getElementById("formColumnE");
              form.removeChild(listColumns);
              columnList();
            })
            .catch((error) => {
              console.error("Error al enviar los datos:", error);
            });
        };
        // Nested -----------------------------------------
        form.appendChild(nuevoCampo);
        form.appendChild(botonEnvio);
        form.appendChild(document.createElement("br"));
        form.appendChild(document.createElement("br"));
        // Nested -----------------------------------------
        div.appendChild(form);
        columnList();
      }
      function columnList() {
        var conexion = "/api/query/pg_get_columnsEquipment";
        var list = document.createElement("div");
        list.id = "columnListE";
        var form = document.getElementById("formColumnE");
        form.appendChild(list);
        fetch(conexion)
          .then((response) => response.json())
          .then(function (columns) {
            columnList.innerHTML = "";
            columns.forEach((column) => {
              // Crear un elemento de etiqueta para el campo de entrada de texto
              var etiquetaNombre = document.createElement("label");
              etiquetaNombre.id = "columnaE";
              etiquetaNombre.className = "columns";
              etiquetaNombre.textContent = column["column_name"];
              if (
                column["column_name"] == "NUMERO_HABITACION" ||
                column["column_name"] == "SOA_KEY" ||
                column["column_name"] == "ID_EQUIP"
              ) {
                console.log(column["column_name"] + "is not a field removable");
                list.appendChild(etiquetaNombre);
              } else {
                //Botton borrar
                var botonBorrar = document.createElement("button");
                botonBorrar.textContent = "Borrar";
                botonBorrar.className = "borrar-boton";
                // Agregar evento para borrar campo al hacer clic en el botón
                botonBorrar.addEventListener("click", function (event) {
                  event.preventDefault();
                  var datos = {
                    columna: column["column_name"],
                  };
                  fetch("/api/query/pg_post_deleteColumnEquipment", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(datos),
                  })
                    .then((response) => response.json())
                    .then((data) => {
                      // Manejar la respuesta del servidor aquí
                      console.log("Column delete properly!");
                      var listColumns = document.getElementById("columnListE");
                      var form = document.getElementById("formColumnE");
                      form.removeChild(listColumns);
                      columnList();
                    })
                    .catch((error) => {
                      console.error("Error al enviar los datos:", error);
                    });
                });
                etiquetaNombre.appendChild(botonBorrar);
                list.appendChild(etiquetaNombre);
              }
            });
            // List column form--------------------------------
          });
      }
    };
    this._button.addClass("editFieldEquipmentIcon");
    this._button.setToolTip("Edit Field Equipment Panel");
    this.subToolbar.addControl(this._button);
    this.subToolbar.setVisible(true);
  }
}

class editFieldEquipment_Panel extends Autodesk.Viewing.UI.PropertyPanel {
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
    this.div.id = "editPanelEquipment";
    this.scrollContainer.appendChild(this.div);
    // close button
    this.closeButton = this.createCloseButton();
    this.closeButton.addEventListener("click", () => {
      var form = document.getElementById("formColumnE");
      var div = document.getElementById("editPanelEquipment");
      div.removeChild(form);
    });
    this.container.appendChild(this.closeButton);
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  "editFieldsEquipment_Extension",
  editFieldsEquipment_Extension
);
