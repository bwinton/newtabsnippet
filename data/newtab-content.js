/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* eslint-env browser */

'use strict';

function addSnippet() {
  let container = window.document.getElementById('newtab-margin-top');

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
    cell.addEventListener('click', event => {
      self.port.emit('click', 'cell ' + (j + 1));
    }, false);
  };
  let search = document.getElementById('newtab-search-submit');
  search.addEventListener('click', event => {
    self.port.emit('click', 'search');
  }, false);


  if (self.options.bucket === 1) {
    let snippet = document.createElement('div');
    snippet.setAttribute('class', 'newtab-snippet');
    snippet.addEventListener('click', event => {
      self.port.emit('click', 'snippet');
    }, false);

    let icon = document.createElement('img');
    icon.setAttribute('class', 'icon');
    icon.style.backgroundImage = `url(${self.options.icon})`;
    snippet.appendChild(icon);

    let content = document.createElement('a');
    content.setAttribute('href', '?sample_rate=0.1&snippet_name=5210#');
    content.textContent = 'Firefox Hello now features screen sharing. Connect and collaborate with anyone, anywhere for free. Try it now.';
    snippet.appendChild(content);

    container.appendChild(snippet);
  } else {
    let error = document.createElement('div');
    error.textContent = "Sorry, try again."
    container.appendChild(error);
  }
}

addSnippet();
