'use strict';

const DEFAULT_BASE = 'USD';
let BASE = localStorage.getItem('BASE') || ADEFAULT_BASE;

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
  .hidden {
    display: none;
  }
  #currency_widget_base_btn {
    border: 1px black solid;
    border-radius: 5%;
    background-color: grey;
    color: blue;
  }
  #currency_widget_field {
    position: fixed;
    bottom: 5rem;
    right: 2rem;
    z-index: 10;
    border: 1px solid black;
  }
  #currency_widget_settings {
    margin: 0;
    height: 1.8rem;
    display: flex;
    justify-content: space-between;
    background-color: lightcyan;
  }
  #currency_widget_field table {
    width: 9rem;
    border-collapse: collapse;
    border: 1 px solid black;
    text-align: center;
    vertical-align: middle;
  }
  #currency_widget_data tr:nth-child(odd) {
    background-color: linen;
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
    <select
      id="currency_widget_select"
      class="hidden"
    />
      <option value="">--Choose currency</option>
      <option value="UAH">UAH</option>
      <option value="EUR">EUR</option>
      <option value="USD">USD</option>
      <option value="PLZ">PLZ</option>
      <option value="BTC">BTC</option>
      <option value="JPY">JPY</option>
      <option value="ETH">ETH</option>
    </select>
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
<div id="currency_widget_field">
  <div id="currency_widget_settings">
    <button id="currency_widget_base_btn">
      BASE
    </button>
  </div>
  <table>
    <tbody id="currency_widget_data">
      
    </tbody>
  </table>
</div>
`;

const dialog = document.getElementById("currency_widget_dialog");
const input = document.getElementById("currency_widget_input");
const leftBtn = document.getElementById("currency_widget_left_btn");
const rightBtn = document.getElementById("currency_widget_right_btn");
const field = document.getElementById("currency_widget_field");
const data = document.getElementById("currency_widget_data");
const select = document.getElementById("currency_widget_select");
const changeBaseBtn = document.getElementById("currency_widget_base_btn");

const openDialog = () => !dialog.open && dialog.showModal();

const closeDialog = () => dialog.close();

let savedKey = localStorage.getItem('key');

const saveLocal = (key, value) => localStorage.setItem(key, value);

const takeFromInput = () => {
  if (input.value) {
    savedKey = input.value;
    input.value = '';
    saveLocal('key', savedKey);
  }
  if (select.value) {
    BASE = select.value;
    saveLocal('BASE', select.value);
  }
  closeDialog();
};

const changeBase = () => {
  openDialog();
  input.classList.add('hidden');
  select.classList.remove('hidden');
};

leftBtn.addEventListener('click', closeDialog);
rightBtn.addEventListener('click', takeFromInput);

select.addEventListener('change', () => console.log(select.value));

changeBaseBtn.addEventListener('click', changeBase);

const getResponse = (response) => {
  let content = '';

  Object
    .keys(response)
    .map(currencyCode => {
      content += `
        <tr>
          <td>${currencyCode}</td>
          <td>${(1/response[currencyCode]).toFixed(3)}</td>
        </tr>
      `
    });

  data.innerHTML = content;
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
  (!!input.value || !!select.value) && getCources();
  return false;
}