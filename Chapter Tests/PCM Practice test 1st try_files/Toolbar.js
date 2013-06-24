/**
* @class Toolbar
* @author mpol
* @constructor
* @param {Core} core The core object.
**/

function Toolbar(core) {
  this.name = 'Toolbar';
  this.core = core;
  this.tools = new Array();

  /**
   * Initializes the object
   * @this {Toolbar}
   */
  this.init = function() {
    this.debug('Init');
  };

  this.initTools = function(url) {
    $('#locationButtons').buttonset({
      position: 'absolute'
    });
    if (url) {
      $('#home').button({
        text: false,
        position: 'absolute',
        icons: {
          primary: 'ui-icon-home'
        }
      });
      $('#home').click(function() {
        window.location = url;
      });
    } else {
      $('#home').remove();
    }
/*    $('#help').button({
      text: false,
      position: 'absolute',
      icons: {
        primary: 'ui-icon-help'
      }
    });
    // hide help until help document has been written
    $('#help').hide();
    $('#newwin').button({
      text: false,
      position: 'absolute',
      icons: {
        primary: 'ui-icon-circle-close'
      }
    }); */
  };

  this.disableTool = function(id) {
    $('[id=' + id + ']').button({disabled: true});
  };

  this.addTool = function(id, toolName, callback) {
    if (!this.tools[id]) {
      this.tools[id] = toolName;
      this.debug('Add Tool: ' + id + ' ' + this.tools[id]);
      this.uncheckPreviousTools();
      $('#locationButtons').buttonset();
      $('#locationButtons').append(
         '<input type="radio" id="' + id +
         '" name="locationButtons" checked="checked"/>' +
         '<label for="' + id + '">' +
         '<span class="toolbar-button">' + toolName + '</span>' +
         '</label>'
      );
      $('#locationButtons').buttonset('refresh');
      $('[id=' + id + ']').click(function() {
        if (callback) {
          callback();
        }
        vdscore.toolbar.removeFollowingTools(id);
      });
      this.updateRender();
    } else {
      this.debug('TOOL ALREADY EXISTS');
    }
  };

  // necessary for IE to not have multiple checked radio buttons
  this.uncheckPreviousTools = function() {
    for (var id in this.tools) {
      $('#locationButtons input[id=' + id + ']').attr('checked', false);
    }
  };

  this.removeFollowingTools = function(current) {
    this.debug('removeFollowingTools ' + current);
    var c = false;
    for (var id in this.tools) {
      this.debug('id: ' + id + ' c: ' + c);
      if (c) {
        this.removeTool(id);
      }
      if (id == current) {
        c = true;
      }
    }
  };

  this.removeTool = function(id) {
    this.debug('Remove Tool: ' + id);
    $('input[id=' + id + ']').remove();
    $('label[for=' + id + ']').remove();
    //$('#locationButtons').empty();
    $('#locationButtons').buttonset('refresh');
    delete this.tools[id];
    this.updateRender();
  };

  this.updateRender = function() {
    //this.debug('Update Render');
    $('#toolbar').height(27);
    if ($('#home').length > 0) {
      $('#home').position({
        'my': this.core.dir != 'rtl' ? 'left' : 'right',
        'at': this.core.dir != 'rtl' ? 'left' : 'right',
        'of': $('#toolbar'),
        'offset': this.core.dir != 'rtl' ? '5 0' : '-5 0'
      });
      $('#location').position({
        'my': this.core.dir != 'rtl' ? 'left' : 'right',
        'at': this.core.dir != 'rtl' ? 'right' : 'left',
        'of': $('#home'),
        'offset': this.core.dir != 'rtl' ? '5 0' : '-5 0'
      });
    } else {
      $('#location').position({
        'my': this.core.dir != 'rtl' ? 'left' : 'right',
        'at': this.core.dir != 'rtl' ? 'left' : 'right',
        'of': $('#toolbar'),
        'offset': this.core.dir != 'rtl' ? '8 0' : '-8 0'
      });
    }
    $('#locationButtons').position({
      'my': this.core.dir != 'rtl' ? 'left' : 'right',
      'at': this.core.dir != 'rtl' ? 'right' : 'left',
      'of': $('#location'),
      'offset': this.core.dir != 'rtl' ? '5 0' : '-5 0',
      'collision': 'none'
    });
/*    $('#newwin').position({
      'my': 'right',
      'at': 'right',
      'of': $('#toolbar'),
      'offset': '-5 0'
    });
    $('#help').position({
      'my': 'right',
      'at': 'left',
      'of': $('#newwin'),
      'offset': '-5 0'
    }); */
  };


  /**
   * Uses Core debug method
   * @param {string} string String.
   * @this {Toolbar}
   */
  this.debug = function(string) {
    this.core.debug(this.name, string);
  };

  this.init();

}

