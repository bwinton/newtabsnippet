var { attach } = require('sdk/content/mod');
var PrefSvc = require('sdk/preferences/service');
var self = require('sdk/self');
var { Style } = require('sdk/stylesheet/style');
var tabs = require('sdk/tabs');

var { Cu } = require('chrome');
Cu.import('resource://gre/modules/UITelemetry.jsm');

var telemetry = {};
var style = Style({
  uri: self.data.url('newtab-content.css')
});

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
  attach(style, tab);
};

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
