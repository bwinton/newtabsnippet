/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* eslint-env browser */

'use strict';

function getInsertionPoint (bucket) {
  var container = null;
  switch (bucket) {
    case 1:
      container = window.document.getElementById('newtab-margin-top');
      break;
    default:
      container = {appendChild: function () {}};
      break;
  }
  return container;
}

function getContent (bucket) {
  var snippet = null;
  switch (bucket) {
    case 1:
      snippet = document.createElement('div');
      snippet.setAttribute('class', 'newtab-snippet');
      snippet.addEventListener('click', () => {
        var url = document.getElementById('newtab-snippet-link').getAttribute('href');
        self.port.emit('click', {type: 'snippet', data: url});
      }, false);

      let icon = document.createElement('img');
      icon.setAttribute('class', 'icon');
      icon.style.backgroundImage = `url(${self.options.icon})`;
      snippet.appendChild(icon);

      let content = document.createElement('a');
      content.id = 'newtab-snippet-link';
      content.setAttribute('href', 'https://www.mozilla.org/en-US/firefox/hello/');
      content.textContent = 'Firefox Hello now features screen sharing. Connect and collaborate with anyone, anywhere for free. Try it now.';
      snippet.appendChild(content);
      break;

    default:
      break;
  }
  return snippet;
}

function addSnippet() {
  let container = getInsertionPoint(self.options.bucket);

  if (container === null) {
    setTimeout(addSnippet, 1000);
    return;
  }

  let previousSnippet = window.document.getElementById('newtab-snippet');
  if (previousSnippet) {
    previousSnippet.remove();
  }

  let cells = document.querySelectorAll('.newtab-cell');
  for (let i = 0; i < cells.length; ++i) {
    let cell = cells[i];
    let j = i;
    cell.addEventListener('click', () => { // eslint-disable-line no-loop-func
      self.port.emit('click', {type: 'cell', data: (j + 1)});
    }, false);
  }

  let search = document.getElementById('newtab-search-submit');
  search.addEventListener('click', () => {
    self.port.emit('click', {type: 'search'});
  }, false);

  container.appendChild(getContent(self.options.bucket));
}

addSnippet();
