// ⚡️ Import Styles
import './style.scss';
import feather from 'feather-icons';
import axios from 'axios';
import { showNotification } from './modules/showNotification.js';

// ⚡️ Render Skeleton
document.querySelector('#app').innerHTML = `
<div class='app-container'>
  <div class='pagination'>
    <h2>Custom Pagination</h2>
    <ul class='result' data-users></ul>
    <ul class='list' data-pagination></ul>
  </div>

  <a class='app-author' href='https://github.com/nagoev-alim' target='_blank'>${feather.icons.github.toSvg()}</a>
</div>
`;

// ⚡️Create Class
class App {
  constructor() {
    this.DOM = {
      users: document.querySelector('[data-users]'),
      pagination: document.querySelector('[data-pagination]'),
    };

    this.PROPS = {
      axios: axios.create({
        baseURL: 'https://api.github.com/users?since=1&per_page=40',
      }),
      index: 0,
      pages: [],
    };

    this.init();
    this.DOM.pagination.addEventListener('click', this.onClick);
  }

  /**
   * @function init - Initialization app
   * @returns {Promise<void>}
   */
  init = async () => {
    const { data: users } = await this.fetchData();
    this.PROPS.pages = this.paginate(users);
    this.renderUI();
  };

  /**
   * @function fetchData - Fetch data from API
   * @returns {Promise<any>}
   */
  fetchData = async () => {
    try {
      return await this.PROPS.axios.get();
    } catch (e) {
      showNotification('danger', 'Something went wrong, open dev console');
      console.log(e);
    }
  };

  /**
   * @function paginate - Generate pagination
   * @param data
   * @returns {*[]}
   */
  paginate = (data) => {
    const itemsPerPage = 10;

    return Array.from({ length: Math.ceil(data.length / itemsPerPage) }, (_, index) => {
      const start = index * itemsPerPage;
      return data.slice(start, start + itemsPerPage);
    });
  };

  /**
   * @function renderUI - Render users and pagination HTML
   */
  renderUI = () => {
    this.renderUsers(this.PROPS.pages[this.PROPS.index]);
    this.renderButtons(this.DOM.pagination, this.PROPS.pages, this.PROPS.index);
  };

  /**
   * @function renderUsers - Render HTML
   * @param data
   */
  renderUsers = (data) => {
    this.DOM.users.innerHTML = `
    ${data.map(({ avatar_url, login, html_url }) => `
      <li>
        <img src='${avatar_url}' alt='${login}'>
        <h4>${login}</h4>
        <a class='button' href='${html_url}' target='_blank'>View profile</a>
      </li>
    `).join('')}
    `;
  };

  /**
   * @function renderButtons - Render buttons
   * @param container
   * @param pages
   * @param activeIndex
   */
  renderButtons = (container, pages, activeIndex) => {
    let buttons = pages.map((_, pageIndex) => `
      <li>
        <button class='${activeIndex === pageIndex ? 'active' : ''}' data-index='${pageIndex}'>${pageIndex + 1}</button>
      </li>`);

    buttons.push(`
      <li>
        ${this.PROPS.index >= this.PROPS.pages.length - 1
        ? `<button data-type='next' disabled>Next</button>` : `<button data-type='next'>Next</button>`}
      </li>`);

    buttons.unshift(`
      <li>
        ${this.PROPS.index <= 0
        ? `<button data-type='prev' disabled>Prev</button>` : `<button data-type='prev'>Prev</button>`}
      </li>`);

    container.innerHTML = buttons.join('');
  };

  /**
   * @function onClick - Pagination click event handler
   * @param target
   */
  onClick = ({ target }) => {
    if (target.dataset.pagination) return;
    if (target.dataset.index) this.PROPS.index = parseInt(target.dataset.index);
    if (target.dataset.type === 'next') this.PROPS.index++;
    if (target.dataset.type === 'prev') this.PROPS.index--;
    this.renderUI();
  };
}

// ⚡️Class instance
new App();
