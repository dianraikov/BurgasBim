/// import * as Autodesk from "@types/forge-viewer";
import "./extensions/aislarRooms.js";
import "./extensions/VerticalToolbarExtensions.js";
import "./extensions/ColorExtension.js";
import "./extensions/ColorExtension1.js";
import "./extensions/burgaspanel_equipments.js";
import "./extensions/burgaspanel_rooms.js";
import "./extensions/burgas_editFieldsRooms.js";
import "./extensions/burgas_editFieldsEquipment.js";

async function getAccessToken(callback) {
  try {
    const resp = await fetch("/api/auth/token");
    if (!resp.ok) {
      throw new Error(await resp.text());
    }
    const { access_token, expires_in } = await resp.json();
    callback(access_token, expires_in);
  } catch (err) {
    alert("Could not obtain access token. See the console for more details.");
    console.error(err);
  }
}

export function initViewer(container) {
  return new Promise(function (resolve, reject) {
    Autodesk.Viewing.Initializer({ getAccessToken }, async function () {
      const config = {
        extensions: [
          // "Autodesk.VisualClusters",
          "Autodesk.DocumentBrowser",
          "Autodesk.Hyperlink",
          "verticalToolbar",
          "ColorExtension",
          "ColorExtension1",
          "BurgasPanelExtension_Rooms",
          "BurgasPanelExtension_Equipments",
          "aislarRooms",
          "editFieldsRooms_Extension",
          "editFieldsEquipment_Extension",
          "Autodesk.AEC.LevelsExtension",
        ],
      };
      const viewer = new Autodesk.Viewing.GuiViewer3D(container, config);
      viewer.start();
      viewer.setTheme("light-theme");
      loadModel(viewer);
      resolve(viewer);
    });
  });
}

export function loadModel(viewer, urn) {
  return new Promise(function (resolve, reject) {
    function onDocumentLoadSuccess(doc) {
      var viewables = doc
        .getRoot()
        .search({ name: "New Construction", type: "geometry" });
      resolve(viewer.loadDocumentNode(doc, viewables[0]));
    }
    function onDocumentLoadFailure(code, message) {
      reject({ code, message, errors });
    }
    viewer.setLightPreset(0);
    Autodesk.Viewing.Document.load(
      "urn:" + urn,
      onDocumentLoadSuccess,
      onDocumentLoadFailure
    );
  });
}
