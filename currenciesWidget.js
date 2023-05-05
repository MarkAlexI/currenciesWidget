'use strict';

const enterToDialog = document.body.appendChild(document.createElement('div'));

enterToDialog.innerHTML = `
<style>
  #currency_widget_dialog {
    background-color: lime;
  }
</style>
<dialog id="currency_widget_dialog">
  <form>
    <input type="text" placeholder="@#$" />
    <button formmethod="dialog" type="submit">Cancel</button>
    <button type="submit">Submit</button>
  </form>
</dialog>
`;

const dialog = document.getElementById("currency_widget_dialog");

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