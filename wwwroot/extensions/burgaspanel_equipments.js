class BurgasPanelExtension_Equipments extends Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options);
    this._group = null;
    this._button = null;
  }
  crearFormulario(elements) {
    elements.forEach(function (element) {
      var num_hab = element.properties[0].displayValue;
      var conexion = "/api/query/pg_get_equipment/?room_code=" + num_hab;
  
      fetch(conexion)
        .then((response) => response.json())
        .then(function (data) {
          var formulario = document.createElement("form");
          formulario.id = "burgasFormEquipments";
          formulario.appendChild(document.createElement("br"));
  
          var div = document.getElementById("panelContentEquipments");
          div.appendChild(formulario);
  
          const labels = ["Код на помещението","скрива се","Код на оборудването","Вид оборудването","скрива се","Категория","Под категория","Общо бройки","Забележка оборудването","скрива се","скрива се","Доставна цена с ДДС","скрива се","Марка","Модел","Дата на въвеждане в експлотация","Общи забележки","Линк към оборудването","Поддръжка","скрива се","Линк за","Доставчик","Гаранционен срок"];
  
          data.forEach((equipo) => {
            var details = document.createElement("details");
            var summary = document.createElement("summary");
            var fieldset = document.createElement("fieldset");
            const fields = Object.entries(equipo);
  
            fields.forEach(([prop, val], index) => {
              if (labels[index] && labels[index].toLowerCase() === "скрива се") return;
              let displayLabel = labels[index] || prop;
              displayLabel = displayLabel.charAt(0).toUpperCase() + displayLabel.slice(1);
  
              var etiquetaNombre = document.createElement("label");
              etiquetaNombre.id = "atributo";
              etiquetaNombre.textContent = displayLabel;
  
              var inputNombre = (prop === "REFERENCE_SPECIFICATIONS") ? document.createElement("textarea") : document.createElement("input");
              if (prop !== "REFERENCE_SPECIFICATIONS") inputNombre.type = "text";
              inputNombre.id = (prop === "REFERENCE_SPECIFICATIONS") ? "textarea" : "valor";
              inputNombre.name = prop;
  
              if (prop === "ID_EQUIP") { summary.innerHTML = val; var id_equip = val; }
              if (prop === "URL") {
                inputNombre.className = "link-input";
                inputNombre.addEventListener("click", function () { window.open(val, "_blank"); });
              }
              if( prop === "docs_link")
              {
                inputNombre.className = "link-input";
                inputNombre.addEventListener("click", function () { window.open(val, "_blank"); });
              }
              inputNombre.value = val;
              inputNombre.required = true;
              if (prop === "ID_EQUIP" || prop === "NUMERO_HABITACION") inputNombre.readOnly = true;
  
              inputNombre.addEventListener("focusout", function (event) {
                let element = event.target, columna = element.name, valor = element.value;
                var datos = { id_equip: id_equip, num_hab: num_hab, columna: columna, valor: valor };
                fetch("/api/query/pg_post_equipment", {
                  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos)
                })
                  .then((response) => response.json())
                  .then((data) => console.log(data))
                  .catch((error) => console.error("Error al enviar los datos:", error));
              });
  
              fieldset.appendChild(etiquetaNombre);
              fieldset.appendChild(inputNombre);
              details.appendChild(summary);
              details.appendChild(fieldset);
              formulario.appendChild(details);
            });
          });
        });
    });
  }
  
  
  

  loadObjectCode(elements) {
    var form = document.getElementById("burgasFormEquipments");
    if (form) {
      //Obtener el div generado al crearse el panel
      var div = document.getElementById("panelContentEquipments");
      div.removeChild(form);
      setTimeout(() => {
        this.crearFormulario(elements);
      }, 200);
    } else {
      this.crearFormulario(elements);
    }
  }
  load() {
    console.log("BurgasPanelExtension_Equipments has been loaded");
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
      _this.panel = new BurgasPanel_Equipment(
        _this.viewer,
        _this.viewer.container,
        "BurgasPanelExtension_Equipments",
        "Burgas Panel Equipment"
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
    this._button = new Autodesk.Viewing.UI.Button("burgasButtonEquipment");
    this._button.onClick = function (e) {
      // show/hide docking panel
      _this.panel.setVisible(!_this.panel.isVisible());
    };
    this._button.addClass("BurgasPanelIcon");
    this._button.setToolTip("Burgas Panel Equipments");
    this.subToolbar.addControl(this._button);
    this.subToolbar.setVisible(true);
  }
}

class BurgasPanel_Equipment extends Autodesk.Viewing.UI.PropertyPanel {
  constructor(viewer, container, id, title, options) {
    super(container, id, title, options);
    this.viewer = viewer;
    this.container.style.left = "10px"; // Just initing, docking will overwrite this
    this.container.style.top = "10px"; // Just initing, docking will overwrite this
    this.container.style.resize = "auto";
    this.container.style.width = 450 + "px";
    this.container.style.minHeight = 600 + "px";
    this.container.style.minWidth = 300 + "px";
    // UI
    this.div = document.createElement("div");
    this.div.id = "panelContentEquipments";
    this.scrollContainer.appendChild(this.div);
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  "BurgasPanelExtension_Equipments",
  BurgasPanelExtension_Equipments
);
