var ptapi = new function() {

  var applet = null;
  var initialized = false;
  var loaded = false;

  // Simplified event model

  this.listeners = {};

  this.addEventListener = function(type, listener) {
    if (type == null || type == '' || listener == null) { return; }
    this.removeEventListener(type, listener);
    if (!(type in this.listeners)) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(listener);
  };

  this.removeEventListener = function(type, listener) {
    if (type == null || type == '' || listener == null) { return; }
    if (!(type in this.listeners)) { return; }
    // IE8 doesn't support Array.prototype.indexOf
    // and the polyfill adds "indexOf" as an enumerable property
    // which causes problems with code that uses "for...in" loops on Arrays
    // var index = this.listeners[type].indexOf(listener);
    var index = -1;
    for (var i = 0; i < this.listeners[type].length; i++) {
      if (this.listeners[type][i] == listener) {
        index = i;
        break;
      }
    }
    if (index >= 0) {
      this.listeners[type].splice(index, 1);
    }
    if (this.listeners[type].length == 0) {
      delete this.listeners[type];
    }
  };

  this.dispatchEvent = function() {
    if (arguments.length == 0) { return; }
    var args = Array.prototype.slice.call(arguments);
    var type = args.shift();
    if (!(type in this.listeners)) { return; }
    var listeners = this.listeners[type].slice(0);
    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i];
      if (listener instanceof Function) {
        listener.apply(this, args);
      } else if (listener[type] instanceof Function) {
        listener[type].apply(listener, args);
      }
    }
  };

  // Runs any necessary initialization prior to loading a PT item.
  // This happens once per instance of the Packet Tracer applet.
  this.initialize = function(callback) {
    try {
      // applet ID is predetermined by the injected XPASS HTML
      applet = document.getElementById('ptapplet');
      applet.initialize();
      initialized = true;
      this.debug('initialized');
      if (callback) {
        callback();
      }
    } catch (err) {
      //this.debug(err);
      var that = this;
      setTimeout(function() {
        that.initialize(callback);
      }, 500);
    }
  };

  // Starts system check.
  // This must be done before any PT items are loaded.
  // In the case of assessments, this happens on the exam warning page.
  this.startSystemCheck = function() {
    if (!initialized) { return; }
    this.debug('startSystemCheck');
    applet.startSystemCheck();
  };

  // Loads a specified PT media item or assessment item
  // id - string - provided by VDS to give the correct id for the item
  //               to be loaded
  this.loadPTItem = function(id, callback) {
    if (!initialized) { return; }
    this.debug('loadPTItem: ' + id);
    applet.loadPTItem(id);
    loaded = true;
    if (callback) {
      // wait for "ready" status before calling callback.
      function handler(status) {
         if (status == 'ready') {
           this.removeEventListener('status', handler);
           if (loaded) {
             callback();
           }
         } else if (status == 'error') {
           this.removeEventListener('status', handler);
         }
      }
      this.addEventListener('status', handler);
    }
  };

  // Unloads current PT media item or assessment item
  this.unloadPTItem = function(callback) {
    if (!initialized) { return; }
    this.debug('unloadPTItem');
    applet.unloadPTItem();
    if (callback) {
      // wait for "ready" status before calling callback.
      function handler(status) {
        if (status == 'ready') {
          this.removeEventListener('status', handler);
          loaded = false;
          callback();
        } else if (status == 'error') {
          this.removeEventListener('status', handler);
        }
      }
      this.addEventListener('status', handler);
    } else {
      loaded = false;
    }
  };

  // Starts the currently loaded PT media or assessment item
  this.startItem = function() {
    if (!initialized) { return; }
    this.debug('startItem');
    applet.startItem();
  };

  // Returns the status of current item
  //   empty    - No loaded PT Item
  //   loading  - PT item is loading
  //   loaded   - PT item is fully load but may not be ready to receive
  //              commands
  //   ready    - PT Item is loaded and ready to receive commands, but
  //              has had no interaction.
  //   visited  - PT Item has had interaction, but no work product
  //              generated. Used for PT as assessment item only.
  //   answered - PT Item has had work product generated. Used for PT as
  //              assessment item only.
  //   saving   - PT Item is in the process of saving
  //   saved    - PT Item is saved
  //   error
  this.getStatus = function() {
    if (!initialized) { return; }
    var status = applet.getStatus();
    this.debug('getStatus: ' + status);
    return status;
  };

  // Called by the Packet Tracer applet as well as the ptapi object
  this.debug = function(str) {
    try {
      console.log('[' + (new Date()).toISOString() + ']:[PTAPI]:' + str);
    } catch (err) {
      // do nothing
    }
  };

  // Called by the Packet Tracer applet when the status changes
  //   empty    - No loaded PT Item
  //   loading  - PT item is loading
  //   loaded   - PT item is fully load but may not be ready to receive
  //              commands
  //   ready    - PT Item is loaded and ready to receive commands, but
  //              has had no interaction.
  //   visited  - PT Item has had interaction, but no work product
  //              generated. Used for PT as assessment item only.
  //   answered - PT Item has had work product generated. Used for PT as
  //              assessment item only.
  //   saving   - PT Item is in the process of saving
  //   saved    - PT Item is saved
  //   error
  this._setStatus = function(status) {
    this.debug('setStatus: ' + status);
    this.dispatchEvent('status', status);
  };

  // Called by the Packet Tracer applet when loading status changes
  //   x - int - number of item currently being loaded
  //   y - int - total number of items to load
  //   p - int - percentage (0-100) loaded of current item. If p equals
  //             null no percentage is displayed
  this._loadingStatus = function(x, y, p) {
    this.debug('loadingStatus: ' + x + ', ' + y + ', ' + p);
    this.dispatchEvent('loading', x, y, p);
  };

  // Called by the Packet Tracer applet
  this._updateRender = function() {
    this.debug('updateRender');
  };

  // Called by the Packet Tracer applet to throw an error
  //   error - string - error code string corresponds with localized PT
  //                    error codes from localization.xml file
  this._throwError = function(error) {
    this.debug('throwError: ' + error);
    this.dispatchEvent('error', error);
  };

  // Called by the Packet Tracer applet to clear an error
  this._clearError = function() {
    this.debug('clearError');
    this.dispatchEvent('clear');
  };

  this.isLoaded = function() {
    return loaded;
  };

}();

// These functions are called by the Packet Tracer applet
// and are mapped directly to call ptapi methods
function ptdebug(str) { ptapi.debug(str); }
function ptsetStatus(status) { ptapi._setStatus(status); }
function ptloadingStatus(x, y, p) { ptapi._loadingStatus(x, y, p); }
function ptupdateRender() { ptapi._updateRender(); }
function ptthrowError(error) { ptapi._throwError(error); }
function ptclearError() { ptapi._clearError(); }
