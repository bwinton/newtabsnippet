var PrefSvc = require('sdk/preferences/service');
// var tabs = require('sdk/tabs');

var { Cu } = require('chrome');
Cu.import('resource://gre/modules/UITelemetry.jsm');

var telemetry = {};

exports.main = function () {
  let previous = PrefSvc.get('browser.newtab.preload');
  PrefSvc.set('browser.newtab.preload', false);
  PrefSvc.set('browser.newtab.preload.previous', previous);

  if (UITelemetry.enabled) {
    UITelemetry.removeSimpleMeasureFunction('newtabsnippets');
    UITelemetry.addSimpleMeasureFunction('newtabsnippets', function () {
      return telemetry;
    });
  }
};

exports.onUnload = function (reason) {
  // tabs.removeListener('ready', tabReady);
  let previous = PrefSvc.get('browser.newtab.preload.previous');
  PrefSvc.set('browser.newtab.preload', previous);
  PrefSvc.reset('browser.newtab.preload.previous');

  if (UITelemetry.enabled && reason !== 'shutdown') {
    UITelemetry.removeSimpleMeasureFunction('newtabsnippets');
  }
};
