'use strict';

const savedKey = localStorage.getItem('key') ||
  prompt('Print your API-key', '');

!!savedKey && localStorage.setItem('key', savedKey);

const BASE = 'UAH';

const getResponse = (response) => {
  const frag = document.createDocumentFragment();
  
  for (let i in response) {
    frag.appendChild(document.createTextNode(i + '#' + response[i]));
    frag.appendChild(document.createElement('br'));
  }
  const div = document.createElement('div');
  div.setAttribute('color', 'yellow');
  div.appendChild(frag);
  document.querySelector('body').appendChild(div);
};

const createDialog = (placeholder = "Please, enter your API-key") => {
  const fragment = document.createDocumentFragment();
  const textarea = fragment
    .appendChild(document.createElement("dialog"))
    .appendChild(document.createElement("section"))
    .appendChild(document.createElement("textarea"));
  textarea.placeholder = placeholder;
  
  document.body.appendChild(fragment);
  
  let dialog = document.querySelector("dialog");
  dialog.setAttribute("open", "true");
};

fetch(`https://min-api.cryptocompare.com/data/price?fsym=${BASE}&tsyms=USD,JPY,EUR&api_key={${savedKey}}`, {
    credentials: 'omit'
  })
  .then((response) => {
    return response.json();
  })
  .then(getResponse)
  .catch((error) => {
    console.log(error);
  });