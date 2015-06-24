var PrefSvc = require('sdk/preferences/service');
// var tabs = require('sdk/tabs');

exports.main = function () {
  let previous = PrefSvc.get('browser.newtab.preload');
  console.log("1", previous, typeof previous);
  PrefSvc.set('browser.newtab.preload', false);
  PrefSvc.set('browser.newtab.preload.previous', previous);
};

exports.onUnload = function () {
  // tabs.removeListener('ready', tabReady);
  let previous = PrefSvc.get('browser.newtab.preload.previous');
  console.log("2", previous, typeof previous)
  PrefSvc.set('browser.newtab.preload', previous);
  PrefSvc.reset('browser.newtab.preload.previous');
};
