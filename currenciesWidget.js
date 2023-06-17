'use strict';

const DEFAULT_BOTTOM = 5;
const DEFAULT_RIGHT = 2;
const MAX_RIGHT = Math.floor((window.innerWidth - 150)/16);
const MAX_BOTTOM = Math.floor((window.innerHeight - 410)/16);

const DEFAULT_BASE = 'USD';
const DEFAULT_TSYMS = 'USD,JPY,EUR';
const CURRENCIES_LIST = 'UAH, EUR, USD, GBP, JPY, AUD, CAD, CHF, OMR, NZD, PLN, BTC, ETH, DOGE, USDT, USDC, BNB, XRP, ADA';
let BASE = localStorage.getItem('BASE') || DEFAULT_BASE;
let TSYMS = localStorage.getItem('TSYMS') || DEFAULT_TSYMS;

let BOTTOM = localStorage.getItem('BOTTOM') || DEFAULT_BOTTOM;
let RIGHT = localStorage.getItem('RIGHT') || DEFAULT_RIGHT;

const createSelect = (id, isMultiple = false) => {
  return `<select
      id="${id}"
      class="hidden"
      ${isMultiple ? 'multiple=""' : ''}
    />
      <option value="">--Choose currency</option>
      ${CURRENCIES_LIST
        .split(', ')
        .map(el => `<option value="${el}">${el}</option>`)
        .join('')
      }
    </select>
  `;
};

const enterToDialog = document.body.appendChild(document.createElement('div'));

enterToDialog.innerHTML = `
<style>
  #currency_widget_dialog {
    display: grid;
    gap: 1.2rem;
    background-color: lime;
    z-index: 10;
    margin-top: 10 px;
    border-radius: 1rem;
  }
  #currency_widget_dialog:not([open]) {
    pointer-events: none;
    opacity: 0;
  }
  #currency_widget_dialog::backdrop {
    background-color: hsl(250, 100%, 50%, 0.25);
  }
  @media (prefers-color-scheme: dark) {
    #currency_widget_dialog {
      background: pink;
    }
  }
  .hidden {
    display: none;
  }
  button[id*="btn"] {
    height: 1.8rem;
    border: 1px black solid;
    border-radius: 5%;
    background-color: lightgrey;
    color: blue;
    cursor: pointer;
  }
  #currency_widget_field {
    position: fixed;
    bottom: ${BOTTOM}rem;
    right: ${RIGHT}rem;
    z-index: 10;
    border: 1px solid black;
  }
  #currency_widget_settings {
    margin: 0;
    padding: .1rem .4rem 0 .4rem;
    height: 1.3rem;
    display: flex;
    flex-direction: column;
    row-gap: .3rem;
    justify-content: start;
    align-items: start;
    background-color: lightcyan;
    overflow: hidden;
  }
  #currency_widget_settings.open {
    height: 16rem;
  }
  #currency_widget_settings_triangle {
    width: 0;
    height: 0;
    border-left: .5rem solid transparent;
    border-right: .5rem solid transparent;
    border-top: 1rem solid black;
  }
  :is(#currency_widget_settings.open) #currency_widget_settings_triangle {
    border-bottom: 1rem solid black;
    border-top: 0;
  }
  #currency_widget_settings_move {
    display: flex;
    gap: .6rem;
  }
  button[id*="arrow"] {
    height: 1.8rem;
    border: 2px black solid;
    border-radius: 10%;
    background-color: smokewhite;
    color: black;
    font-weight: bold;
    cursor: pointer;
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
    ${createSelect('currency_widget_select')}
    ${createSelect('currency_widget_multi_select', true)}
    <button
      autofocus
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
    <div id="currency_widget_settings_triangle"></div>
    <p>Move:</p>
      <div id="currency_widget_settings_move">
        <button
          id="currency_widget_settings_move_left_arrow"
        >&larr;</button>
        <button
          id="currency_widget_settings_move_up_arrow"
        >&uarr;</button>
        <button
          id="currency_widget_settings_move_right_arrow"
        >&rarr;</button>
        <button
          id="currency_widget_settings_move_bottom_arrow"
        >&darr;</button>
      </div>
    <p>Change:</p>
    <button id="currency_widget_api_btn">
      API-key
    </button>
    <button id="currency_widget_base_btn">
      BASE currency
    </button>
    <button id="currency_widget_courses_btn">
     List of currencies
    </button>
  </div>
  <table>
    <tbody id="currency_widget_data">
      
    </tbody>
  </table>
</div>
`;

const getById = (id) => document.getElementById(id);

const dialog = getById("currency_widget_dialog");
const input = getById("currency_widget_input");
const leftBtn = getById("currency_widget_left_btn");
const rightBtn = getById("currency_widget_right_btn");

const field = getById("currency_widget_field");
const data = getById("currency_widget_data");
const select = getById("currency_widget_select");
const multiSelect = getById("currency_widget_multi_select");

const settings = getById("currency_widget_settings");
const triangle = getById("currency_widget_settings_triangle");

const leftArrow = getById("currency_widget_settings_move_left_arrow");
const upArrow = getById("currency_widget_settings_move_up_arrow");
const rightArrow = getById("currency_widget_settings_move_right_arrow");
const downArrow = getById("currency_widget_settings_move_bottom_arrow");

const changeApiKeyBtn = getById("currency_widget_api_btn");
const changeBaseBtn = getById("currency_widget_base_btn");
const changeCoursesBtn = getById("currency_widget_courses_btn");

triangle.addEventListener('click', () => {
  settings.classList.toggle('open');
});

const openDialog = () => !dialog.open && dialog.showModal();

const closeDialog = () => dialog.close();

let savedKey = localStorage.getItem('key');

const saveLocal = (key, value) => localStorage.setItem(key, value);

const newStyleValue = (route) => {
  if (route === 'left') return Math.min(MAX_RIGHT, RIGHT + 1);
  if (route === 'right') return Math.max(0, RIGHT - 1);
  if (route === 'up') return Math.min(MAX_BOTTOM, BOTTOM + 1);
  if (route === 'down') return Math.max(0, BOTTOM - 1);
};

const render = (route) => {
  if (route === 'left' || route === 'right') {
    RIGHT = newStyleValue(route);
    saveLocal('RIGHT', RIGHT);
    field.style["right"] = `${RIGHT}rem`;
  } else {
    BOTTOM = newStyleValue(route);
    saveLocal('BOTTOM', BOTTOM);
    field.style["bottom"] = `${BOTTOM}rem`;
  }
};

const moveLeft = () => render('left');
const moveRight = () => render('right');
const moveUp = () => render('up');
const moveDown = () => render('down');

leftArrow.addEventListener('click', moveLeft);
rightArrow.addEventListener('click', moveRight);
upArrow.addEventListener('click', moveUp);
downArrow.addEventListener('click', moveDown);

const changeTextOnBaseBtn = () => changeBaseBtn.innerHTML = `BASE currency: ${BASE}`;
changeTextOnBaseBtn();

const takeFromInput = () => {
  if (input.value) {
    savedKey = input.value;
    input.value = '';
    saveLocal('key', savedKey);
  }
  if (select.value) {
    BASE = select.value;
    saveLocal('BASE', select.value);
    changeTextOnBaseBtn();
  }
  if (multiSelect.value) {
    const options = document.getElementById('currency_widget_multi_select').selectedOptions;
    const values = Array.from(options)
      .map(({ value }) => value)
      .filter(value => value !== '--Choose currency');
    TSYMS = values.join(',');
    saveLocal('TSYMS', TSYMS);
  }
  closeDialog();
  getCources();
};

const changeApiKey = () => {
  openDialog();
  input.classList.remove('hidden');
  select.classList.add('hidden');
  multiSelect.classList.add('hidden');
};

const changeBase = () => {
  openDialog();
  input.classList.add('hidden');
  multiSelect.classList.add('hidden');
  select.classList.remove('hidden');
};

const changeCourses = () => {
 openDialog();
 input.classList.add('hidden');
 multiSelect.classList.remove('hidden');
 select.classList.add('hidden');
};

leftBtn.addEventListener('click', closeDialog);
rightBtn.addEventListener('click', takeFromInput);

changeApiKeyBtn.addEventListener('click', changeApiKey);
changeBaseBtn.addEventListener('click', changeBase);
changeCoursesBtn.addEventListener('click', changeCourses);

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
  fetch(`https://min-api.cryptocompare.com/data/price?fsym=${BASE}&tsyms=${TSYMS}&api_key={${savedKey}}`, {
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
  (!!input.value || !!select.value || !!multiSelect.value) && getCources();
  return false;
}