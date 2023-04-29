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
  document.querySelector('body').appendChild(frag);
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