var { attach } = require('sdk/content/mod');
var PrefSvc = require('sdk/preferences/service');
var { PrefsTarget } = require('sdk/preferences/event-target');
var self = require('sdk/self');
var { setTimeout } = require('sdk/timers');
var { Style } = require('sdk/stylesheet/style');
var tabs = require('sdk/tabs');

var { Cu } = require('chrome');
Cu.import('resource://gre/modules/UITelemetry.jsm');

var telemetry = {};
var style = Style({
  uri: self.data.url('newtab-content.css')
});

var addTelemetryFunction = function () {
  setTimeout( () => {
    if (UITelemetry.enabled) {
      telemetryEnabled = true;
      UITelemetry.removeSimpleMeasureFunction('newtabsnippets');
      UITelemetry.addSimpleMeasureFunction('newtabsnippets', function () {
        return telemetry;
      });
    } else {
      UITelemetry.removeSimpleMeasureFunction('newtabsnippets');
    }
  }, 0);
};

// listen to the same branch which reqire("sdk/simple-prefs") does
var target = PrefsTarget({ branchName: "toolkit.telemetry."});
target.on('enabled', addTelemetryFunction);

var tabReady = function (tab) {
  if (!tab) {
    tab = tabs.activeTab;
  }

  if (tab.url !== 'about:newtab') {
    return;
  }

  worker = tab.attach({
    contentScriptFile: self.data.url('newtab-content.js'),
    contentScriptOptions: { 'bucket': telemetry.bucket, 'icon': self.data.url('chatheads.svg') }
  });
  worker.port.on('click', message => {
    telemetry[message] = (telemetry[message] || 0) + 1;
  })
  attach(style, tab);
};

exports.main = function () {
  let previous = PrefSvc.get('browser.newtab.preload');
  PrefSvc.set('browser.newtab.preload', false);
  PrefSvc.set('browser.newtab.preload.previous', previous);

  addTelemetryFunction();

  // If this is a first run, log the bucket.
  if (PrefSvc.isSet('browser.newtab.preload.bucket')) {
    telemetry.bucket = PrefSvc.get('browser.newtab.preload.bucket');
  } else {
    let bucket = Math.round(Math.random());
    PrefSvc.set('browser.newtab.preload.bucket', bucket);
    telemetry.bucket = bucket;
  }

  tabs.on('ready', tabReady);
  tabReady();
};

exports.onUnload = function (reason) {
  tabs.removeListener('ready', tabReady);
  let previous = PrefSvc.get('browser.newtab.preload.previous');
  PrefSvc.set('browser.newtab.preload', previous);
  PrefSvc.reset('browser.newtab.preload.previous');
  PrefSvc.reset('browser.newtab.preload.bucket');
  delete telemetry.bucket;

  if (UITelemetry.enabled && reason !== 'shutdown') {
    UITelemetry.removeSimpleMeasureFunction('newtabsnippets');
  }

};
