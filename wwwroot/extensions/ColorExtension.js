class ColorExtension extends Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options)
    this._group = null
    this._button = null
    this.viewer = viewer
    this._panel = null
  }

  load() {
    console.log("ColorExtension is loaded!")
    return true
  }

  unload() {
    console.log("ColorExtension is now unloaded!")
    if (this._group && this._button) {
      this._group.removeControl(this._button)
    }
    if (this._panel) {
      this._panel.setVisible(false)
    }
    return true
  }

  findLeafNodes(model) {
    return new Promise(function (resolve, reject) {
      model.getObjectTree(function (tree) {
        let leaves = []
        tree.enumNodeChildren(
          tree.getRootId(),
          function (dbid) {
            if (tree.getChildCount(dbid) === 0) {
              leaves.push(dbid)
            }
          },
          true
        )
        resolve(leaves)
      }, reject)
    })
  }

  async getBuildingTypeFromDatabase() {
    try {
      const response = await fetch('/api/query/buildingtype')
      const data = await response.json()
      return data.buildingtype ? data.buildingtype.toUpperCase() : null
    } catch (error) {
      console.error('Error fetching buildingtype:', error)
      return null
    }
  }

  async onToolbarCreated() {
    this._group = this.viewer.toolbar.getControl("BurgasColoursToolbarGroup")
    if (!this._group) {
      this._group = new Autodesk.Viewing.UI.ControlGroup("BurgasColoursToolbarGroup")
      this.viewer.toolbar.addControl(this._group)
    }

    const buildingtype = await this.getBuildingTypeFromDatabase()
    console.log('Building type from database:', buildingtype)

    const panelMap = {
      "CHILDREN HOSPITAL": "/PanelLeyenda02.html",
      DEFAULT: "/PanelLeyenda.html"
    }

    const panelUrl = panelMap[buildingtype] || panelMap.DEFAULT
    console.log('Selected panel URL:', panelUrl)

    this._panel = new executePanel(
      this.viewer,
      this.viewer.container,
      "ejecutado",
      "Functional Area",
      { url: panelUrl }
    )

    this._button = new Autodesk.Viewing.UI.Button("ColorExtensionButton")
    this._button.icon.style.backgroundImage = "url('wwwrootimagespaleta-de-color.png')"
    this._button.setToolTip("ColorExtension")

    this._button.onClick = async () => {
      const panel = this._panel

      if (panel.isVisible()) {
        panel.setVisible(false)
        this._button.removeClass("active")
        this.viewer.clearThemingColors()
      } else {
        panel.setVisible(true)
        this._button.addClass("active")

        const model = this.viewer.model
        let dbids = this.viewer.getSelection()
        if (!dbids || dbids.length === 0) {
          dbids = await this.findLeafNodes(model)
        }

        model.getBulkProperties(
          dbids,
          { propFilter: ["ARE_FunctionalArea"] },
          (results) => {
            if (dbids.length) this.viewer.fitToView(dbids)

            for (const result of results) {
              if (result.properties.length > 0) {
                const prop = result.properties[0]

                if (prop.displayValue === "INPATIENT") {
                  this.viewer.setThemingColor(result.dbId, new THREE.Vector4(0.8863, 0.9373, 0.8509, 1))
                } else if (prop.displayValue === "OUTPATIENT") {
                  this.viewer.setThemingColor(result.dbId, new THREE.Vector4(0.7725, 0.8784, 0.7019, 1))
                } else if (prop.displayValue === "MEDICAL SUPPORT") {
                  this.viewer.setThemingColor(result.dbId, new THREE.Vector4(0.8706, 0.9176, 0.9647, 1))
                } else if (prop.displayValue === "GENERAL ADMINISTRATIVE SUPPORT") {
                  this.viewer.setThemingColor(result.dbId, new THREE.Vector4(1, 0.949, 0.8, 1))
                } else if (prop.displayValue === "GENERAL SERVICES") {
                  this.viewer.setThemingColor(result.dbId, new THREE.Vector4(0.9686, 0.7922, 0.6745, 1))
                } else if (prop.displayValue === "PATIENT MANAGEMENT") {
                  this.viewer.setThemingColor(result.dbId, new THREE.Vector4(0.9569, 0.6902, 0.5137, 1))
                } else if (prop.displayValue === "STAFF AREAS") {
                  this.viewer.setThemingColor(result.dbId, new THREE.Vector4(0.9765, 0.5412, 0.5294, 1))
                } else if (prop.displayValue === "TECHNICAL SUPPORT") {
                  this.viewer.setThemingColor(result.dbId, new THREE.Vector4(0.5569, 0.6667, 0.8588, 1))
                }
              }
            }
          }
        )
      }
    }

    this._button.addClass("ColorExtensionIcon")
    this._group.addControl(this._button)
  }
}

class executePanel extends Autodesk.Viewing.UI.DockingPanel {
  constructor(viewer, container, id, title, options) {
    super(container, id, title, options)
    this.viewer = viewer
    this.div = document.createElement("div")
    this.div.className = "LeyendaTematica"

    this.iframe = document.createElement("iframe")
    this.iframe.src = options.url
    this.iframe.style.width = "100%"
    this.iframe.style.height = "200px"
    this.iframe.frameBorder = 0

    this.div.appendChild(this.iframe)
    this.container.appendChild(this.div)
  }

  initialize() {
    this.container.style.top = "5px"
    this.container.style.left = "5px"
    this.container.style.height = "210px"
    this.container.style.width = "268px"
    this.container.style.right = "10px"

    this.initializeMoveHandlers(this.container)

    this.closeButton = this.createCloseButton()
    this.closeButton.addEventListener("click", () => {
      this.viewer.clearThemingColors()
      this.setVisible(false)
    })

    this.container.appendChild(this.closeButton)
    this.container.appendChild(this.createFooter())
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension("ColorExtension", ColorExtension)
