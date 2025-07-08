// Content for 'my-awesome-extension.js'

function aislarRooms(viewer, options) {
  Autodesk.Viewing.Extension.call(this, viewer, options);
}

aislarRooms.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
aislarRooms.prototype.constructor = aislarRooms;

aislarRooms.prototype.load = function () {
  console.log("aislarRooms is loaded!");
  if (this.viewer.toolbar) {
    // Toolbar is already available, create the UI
    this.createUI();
  } else {
    // Toolbar hasn't been created yet, wait until we get notification of its creation
    this.onToolbarCreatedBinded = this.onToolbarCreated.bind(this);
    this.viewer.addEventListener(
        Autodesk.Viewing.TOOLBAR_CREATED_EVENT,
      this.onToolbarCreatedBinded
    );
  }

  return true;
};
aislarRooms.prototype.onToolbarCreated = function () {
  this.viewer.removeEventListener(
    Autodesk.Viewing.TOOLBAR_CREATED_EVENT,
    this.onToolbarCreatedBinded
  );
  this.onToolbarCreatedBinded = null;
  this.createUI();
};
aislarRooms.prototype.createUI = function() {
    console.log('TODO: Create Toolbar!');
  
    var viewer = this.viewer;
  
    // Button 1
    var button1 = new Autodesk.Viewing.UI.Button('my-view-front-button');
    button1.onClick = function(e) {
        viewer.isolate(3703)
    };
    button1.addClass('my-view-front-button');
    button1.setToolTip('View front');
  
    // // Button 2
    // var button2 = new Autodesk.Viewing.UI.Button('my-view-back-button');
    // button2.onClick = function(e) {
    //     viewer.setViewCube('back');
    // };
    // button2.addClass('my-view-back-button');
    // button2.setToolTip('View Back');
  
    // SubToolbar
    this.subToolbar = new Autodesk.Viewing.UI.ControlGroup('my-custom-view-toolbar');
    this.subToolbar.addControl(button1);
    // this.subToolbar.addControl(button2);
  
    viewer.toolbar.addControl(this.subToolbar);
  };

aislarRooms.prototype.unload = function () {
  this.viewer.toolbar.removeControl(this.subToolbar);
  return true;
};

Autodesk.Viewing.theExtensionManager.registerExtension(
  "aislarRooms",
  aislarRooms
);
