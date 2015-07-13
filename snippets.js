/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

var self = require('sdk/self');

var snippets = [
  {
    text: `Unicorns are rare creatures few have seen and lived to tell about.
      Enchant your browser with a mythical unicorn theme.
      Caution: may lead to daydreaming.`,
    url: 'https://addons.mozilla.org/firefox/collections/mozmj/unicorns/?utm_source=desktop-tabs&utm_medium=snippet&utm_content=test&utm_campaign=unicorntheme',
    icon: self.data.url('unicorn.png')
  }, {
    text: `When you find something worth sharing, use the Firefox Share
      button to send it through your networks straight from Firefox.
      Here's how to add it.`,
    url: 'https://activations.cdn.mozilla.net/?utm_source=desktop-tabs&utm_medium=snippet&utm_content=test&utm_campaign=shareplane',
    icon: self.data.url('airplane.png')
  }, {
    text: `Make global communication easier with the Language Support add-ons.
      Add them to your Firefox.`,
    url: 'https://addons.mozilla.org/firefox/extensions/language-support/?utm_source=desktop-tabs&utm_medium=snippet&utm_content=test&utm_campaign=languageaddons',
    icon: self.data.url('translation.png')
  }, {
    text: `Welcome to Firefox Friends, where you get to be an ambassador,
      formal wear not required. Join the team.`,
    url: 'https://friends.mozilla.org/welcome?utm_source=desktop-tabs&utm_medium=snippet&utm_content=test&utm_campaign=firefoxfriends',
    icon: self.data.url('friends.png')
  }
];

exports.getSnippet = function (index) {
  if (index === undefined) {
    index = Math.floor(Math.random() * snippets.length);
  }
  return snippets[index];
};
