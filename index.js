/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*global UITelemetry:false*/

'use strict';

var { attach } = require('sdk/content/mod');
var PrefSvc = require('sdk/preferences/service');
var { PrefsTarget } = require('sdk/preferences/event-target');
var self = require('sdk/self');
var { getSnippet } = require('snippets');
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
var target = PrefsTarget({ branchName: 'toolkit.telemetry.'});
target.on('enabled', addTelemetryFunction);

var tabReady = function (tab) {
  if (!tab) {
    tab = tabs.activeTab;
  }

  if (tab.url !== 'about:newtab') {
    return;
  }

  var worker = tab.attach({
    contentScriptFile: self.data.url('newtab-content.js'),
    contentScriptOptions: { 'bucket': telemetry.bucket, 'snippet': getSnippet() }
  });
  worker.port.on('click', message => {
    var key = message.type;
    if (key === 'cell') {
      key += ' ' + message.data + ' ' + message.subtype;
    }
    telemetry[key] = (telemetry[key] || 0) + 1;

    if (key === 'snippet') {
      tab.url = message.data;
    }
  });
  attach(style, tab);
};

function setPref(name, value) {
  let previous = PrefSvc.get(name);
  PrefSvc.set(name, value);
  PrefSvc.set(name + '.previous', previous);
}

function restorePref(name) {
  if (PrefSvc.isSet(name + '.previous')) {
    let previous = PrefSvc.get(name + '.previous');
    PrefSvc.set(name, previous);
    PrefSvc.reset(name + '.previous');
  }
}

exports.main = function () {
  setPref('browser.newtab.preload', false);

  if (!PrefSvc.isSet('browser.startup.homepage')) {
    setPref('browser.startup.homepage', 'about:newtab');
  }

  addTelemetryFunction();

  // If this is a first run, log the bucket.
  if (PrefSvc.isSet('browser.newtab.preload.bucket')) {
    telemetry.bucket = PrefSvc.get('browser.newtab.preload.bucket');
  } else {
    let bucket = Math.floor(Math.random() * 3);
    PrefSvc.set('browser.newtab.preload.bucket', bucket);
    telemetry.bucket = bucket;
  }

  tabs.on('ready', tabReady);
  tabReady();
};

exports.onUnload = function (reason) {
  tabs.removeListener('ready', tabReady);

  if (reason !== 'shutdown') {
    restorePref('browser.newtab.preload');
    restorePref('browser.startup.homepage');
    PrefSvc.reset('browser.newtab.preload.bucket');
  }

  delete telemetry.bucket;

  if (UITelemetry.enabled && reason !== 'shutdown') {
    UITelemetry.removeSimpleMeasureFunction('newtabsnippets');
  }

};
