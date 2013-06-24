/**
* @class Core
* @author mpol
* @constructor
* @param {object} parent The view in which Core is instantiated.
*/
function Core(parent) {
  this.name = 'Core';
  this.parent = parent;
  this.dir = null;
  this.toolbar = null;
  this.assessmentactivation = null;
  this.manageactivation = null;
  this.takeexam = null;
  this.copyright = null;
  this.pageItems = new Array();

  /**
   * Initializes the object
   * @this {Core}
   */
  this.init = function() {
    this.debug(this.name, 'Init');
    this.dir = document.documentElement.getAttribute('dir');
    this.toolbar = new Toolbar(this);
    this.pageItems.push(this.toolbar);
  };

  this.createManageActivation = function() {
    this.manageactivation = new ManageActivation(this);
    this.pageItems.push(this.manageactivation);
  };

  this.createAssessmentActivation = function() {
    this.assessmentactivation = new AssessmentActivation(this);
    this.pageItems.push(this.assessmentactivation);
  };

  this.createAssessmentViewer = function() {
    this.assessmentviewer = new AssessmentViewer(this);
    this.pageItems.push(this.assessmentviewer);
  };

  this.createTakeExam = function() {
    this.takeexam = new TakeExam(this);
    this.pageItems.push(this.takeexam);
  };

  this.updateRender = function() {
    for (var i = 0; i < this.pageItems.length; i++) {
      this.pageItems[i].updateRender();
    }
  };

  /**
   * Prints debug information with timestamp to log
   * @param {string} ref String.
   * @param {string} str String.
   */
  this.debug = function(ref, str) {
    try {
      console.log(
        '[' + (new Date()).toISOString() + ']:[' + ref + ']:' + str
      );
    } catch (err) {
      // do nothing with error
    }
  };

}

// Shim for Date.prototype.toISOString
if (!Date.prototype.toISOString) {
  /**
   * Converts the date object to a string in ISO 8601 Extended Format.
   * @return {string} The date as a string in ISO 8601 Extended Format.
   */
  Date.prototype.toISOString = function() {
    function pad2(n) { return ('00' + n).slice(-2); }
    function pad3(n) { return ('000' + n).slice(-3); }
    return this.getUTCFullYear() + '-' +
      pad2(this.getUTCMonth() + 1) + '-' +
      pad2(this.getUTCDate()) + 'T' +
      pad2(this.getUTCHours()) + ':' +
      pad2(this.getUTCMinutes()) + ':' +
      pad2(this.getUTCSeconds()) + '.' +
      pad3(this.getUTCMilliseconds()) + 'Z';
  };
}

// Shim for Date.now
if (!Date.now) {
  Date.now = function() {
    return new Date().getTime();
  };
}

/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = function() {
  var token =
    /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g;
  var timezone = new RegExp(
    '\\b(?:[PMCEA][SDP]T|' +
    '(?:Pacific|Mountain|Central|Eastern|Atlantic) ' +
    '(?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)' +
    '(?:[-+]\\d{4})?)\\b',
    'g'
  );
  var timezoneClip = /[^-+\dA-Z]/g;
  var pad = function(val, len) {
    val = String(val);
    len = len || 2;
    while (val.length < len) val = '0' + val;
    return val;
  };

  // Regexes and supporting functions are cached through closure
  return function(date, mask, utc) {
    var dF = dateFormat;

    // You can't provide utc if you skip other args (use the "UTC:" mask
    // prefix)
    if (
      arguments.length == 1 &&
      Object.prototype.toString.call(date) == '[object String]' &&
      !/\d/.test(date)
    ) {
      mask = date;
      date = undefined;
    }

    // Passing date through Date applies Date.parse, if necessary
    date = date ? new Date(date) : new Date;
    if (isNaN(date)) throw SyntaxError('invalid date');

    mask = String(dF.masks[mask] || mask || dF.masks['default']);

    // Allow setting the utc argument via the mask
    if (mask.slice(0, 4) == 'UTC:') {
      mask = mask.slice(4);
      utc = true;
    }

    var _ = utc ? 'getUTC' : 'get';
    var d = date[_ + 'Date']();
    var D = date[_ + 'Day']();
    var m = date[_ + 'Month']();
    var y = date[_ + 'FullYear']();
    var H = date[_ + 'Hours']();
    var M = date[_ + 'Minutes']();
    var s = date[_ + 'Seconds']();
    var L = date[_ + 'Milliseconds']();
    var o = utc ? 0 : date.getTimezoneOffset();
    var flags = {
      d: d,
      dd: pad(d),
      ddd: dF.i18n.dayNames[D],
      dddd: dF.i18n.dayNames[D + 7],
      m: m + 1,
      mm: pad(m + 1),
      mmm: dF.i18n.monthNames[m],
      mmmm: dF.i18n.monthNames[m + 12],
      yy: String(y).slice(2),
      yyyy: y,
      h: H % 12 || 12,
      hh: pad(H % 12 || 12),
      H: H,
      HH: pad(H),
      M: M,
      MM: pad(M),
      s: s,
      ss: pad(s),
      l: pad(L, 3),
      L: pad(L > 99 ? Math.round(L / 10) : L),
      t: H < 12 ? 'a' : 'p',
      tt: H < 12 ? 'am' : 'pm',
      T: H < 12 ? 'A' : 'P',
      TT: H < 12 ? 'AM' : 'PM',
      Z: utc ? 'UTC' :
        (String(date).match(timezone) || ['']).pop().replace(
          timezoneClip, ''
        ),
      o: (o > 0 ? '-' : '+') + pad(
        Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4
      ),
      S: [
       'th',
       'st',
       'nd',
       'rd'
      ][
        d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10
      ]
    };

    return mask.replace(token, function($0) {
      return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
    });
  };
}();

/** Some common format strings */
dateFormat.masks = {
  'default': 'ddd mmm dd yyyy HH:MM:ss',
  shortDate: 'm/d/yy',
  mediumDate: 'mmm d, yyyy',
  longDate: 'mmmm d, yyyy',
  fullDate: 'dddd, mmmm d, yyyy',
  shortTime: 'h:MM TT',
  mediumTime: 'h:MM:ss TT',
  longTime: 'h:MM:ss TT Z',
  isoDate: 'yyyy-mm-dd',
  isoTime: 'HH:MM:ss',
  isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
  isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

/** Internationalization strings */
dateFormat.i18n = {
  dayNames: [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ],
  monthNames: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]
};

/**
 * For convenience...
 * @param {string} mask The format mask.
 * @param {boolean} utc Use UTC.
 * @return {string} The formatted string.
 */
Date.prototype.format = function(mask, utc) {
  return dateFormat(this, mask, utc);
};

//add console api support (except for prod)
(function(view) {
  var api = [
    'assert',
    'count',
    'debug',
    'dir',
    'dirxml',
    'error',
    'exception',
    'group',
    'groupCollapsed',
    'groupEnd',
    'info',
    'log',
    'profile',
    'profileEnd',
    'table',
    'time',
    'timeEnd',
    'trace',
    'warn'
  ];
  var prod = view.location.hostname.match(/netacad\.net$/i) !== null;
  if (!view.console) {
    try { view.console = {}; } catch (err) {}
  }
  var log;
  if (!prod && !view.console.log) {
    log = view.console.log;
  } else {
    log = function() {};
  }
  for (var i = 0, len = api.length; i < len; i++) {
    if (prod || !view.console[api[i]]) {
      try { view.console[api[i]] = log; } catch (err) {}
    }
  }
}(window));
