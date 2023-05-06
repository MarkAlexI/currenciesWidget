'use strict';

const BASE = 'UAH';

const enterToDialog = document.body.appendChild(document.createElement('div'));

enterToDialog.innerHTML = `
<style>
  #currency_widget_dialog {
    background-color: lime;
    z-index: 10;
    margin-top: 10 px;
    border-radius: 1rem;
  }
  #currency_widget_dialog::backdrop {
    background-color: hsl(250, 100%, 50%, 0.25);
  }
</style>
<dialog
  id="currency_widget_dialog"
>
  <form onsubmit="submitForm(event)">
    <input
      id="currency_widget_input"
      type="text"
      placeholder="Print your API-key"
    />
    <button
      id="currency_widget_left_btn"
      formmethod="dialog"
      type="submit"
    >Cancel</button>
    <button
      id="currency_widget_right_btn"
      type="submit"
    >Submit</button>
  </form>
</dialog>
`;

const dialog = document.getElementById("currency_widget_dialog");
const input = document.getElementById("currency_widget_input");
const leftBtn = document.getElementById("currency_widget_left_btn");
const rightBtn = document.getElementById("currency_widget_right_btn");

const openDialog = () => !dialog.open && dialog.showModal();

const closeDialog = () => dialog.close(); openDialog();

let savedKey = localStorage.getItem('key');

const saveLocal = () => localStorage.setItem('key', savedKey);

const takeFromInput = () => {
  if (input.value) {
    savedKey = input.value;
    input.value = '';
    saveLocal();
    closeDialog();
  }
};

leftBtn.addEventListener('click', closeDialog);
rightBtn.addEventListener('click', takeFromInput);

const getResponse = (response) => {
  const frag = document.createDocumentFragment();

  for (let i in response) {
    frag.appendChild(document.createTextNode(i + '#' + response[i]));
    frag.appendChild(document.createElement('br'));
  }
  const div = document.createElement('div');
  div.appendChild(frag);
  document.querySelector('body').appendChild(div);
};

const getCources = () => {
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
};

if (savedKey?.length > 0) {
  getCources();
} else {
  openDialog();
}

function submitForm(event) {
  event.preventDefault();
  window.history.back();
  !!input.value && getCources();
  return false;
}