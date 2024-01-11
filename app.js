'use strict'

class Films {
    #api = {
        apikey: 'ec9749b8'
    }

    constructor() {
        this.wrapper = document.querySelector('.films');
        this.form = this.wrapper.children[0].children[1];
        this.message = this.wrapper.children[1].children[0];
        this.films_items = this.wrapper.children[1].children[1];
        this.pagination = this.wrapper.children[1].children[2];
        this.films_info = this.wrapper.children[1].children[3];
        this.page = 1;
    }

    create_message(str) {
        let html = `<p>${str}</p>`
        this.message.textContent = '';
        this.message.innerHTML = html;
    }
    create_card_film(obj) {
        if (obj.Poster === 'N/A') {
            obj.Poster = 'https://user-images.githubusercontent.com/24848110/33519396-7e56363c-d79d-11e7-969b-09782f5ccbab.png'
        }
        let html = `
        <div class="films_item">
        <div class="films_poster">
            <img src="${obj.Poster}" alt="">
        </div>
        <div class="films_description">
            <p>${obj.Type}</p>
            <h3>${obj.Title}</h3>
            <p>${obj.Year}</p>
            <button class="details" data-id="${obj.imdbID}">Details</button>
        </div>
        </div>
        `
        this.films_items.insertAdjacentHTML("afterbegin", html);
    }
    create_card_details() {
        const btns = document.querySelectorAll('.details');
        console.log(btns);
        btns.forEach(elem => {
            elem.addEventListener('click', (e) => {
                fetch(`http://www.omdbapi.com/?apikey=${this.#api.apikey}&i=${e.target.dataset.id}&`)
                    .then(response => { return response.json() })
                    .then(response => {
                        this.films_info.innerHTML = '';
                        this.create_details(response);
                    })
                    .catch(() => {
                        this.films_info.innerHTML = '<p>Failed, try again</p>';
                    })
            });
        });
    }
    create_details(obj) {
        if (obj.Poster === 'N/A') {
            obj.Poster = 'https://user-images.githubusercontent.com/24848110/33519396-7e56363c-d79d-11e7-969b-09782f5ccbab.png'
        }
        let str = `
    <div class="films_poster">
    <img src="${obj.Poster}"
        alt="">
    </div>
    <div class="films_information">
        <div class="tag">
            <p>Title:</p>
            <p>${obj.Title}</p>
        </div>
        <div class="tag">
            <p>Released:</p>
            <p>${obj.Released}</p>
        </div>
        <div class="tag">
            <p>Genre:</p>
            <p>${obj.Genre}</p>
        </div>
        <div class="tag">
            <p>Country:</p>
            <p>${obj.Country}</p>
        </div>
        <div class="tag">
            <p>Director:</p>
            <p>${obj.Director}</p>
        </div>
        <div class="tag">
            <p>Writer:</p>
            <p>${obj.Writer}</p>
        </div>
        <div class="tag">
            <p>Actors:</p>
            <p>${obj.Actors}</p>
        </div>
        <div class="tag">
            <p>Awards:</p>
            <p>${obj.Awards}</p>
        </div>
    </div>
            `
        this.films_info.insertAdjacentHTML('beforeend', str);
    }

    get_data_form() {
        if (this.form.children[0].value !== '') {
            this.#api.s = this.form.children[0].value;
        }
        if (this.form.children[1].value !== '') {
            this.#api.type = this.form.children[1].value;
        }
    }

    get_url_for_query() {
        let str = 'http://www.omdbapi.com/?';

        for (let key in this.#api) {
            str = str + key + '=' + this.#api[key] + '&'
        };
        return str + `page=${this.page}`;
    }

    get_request(url) {
        fetch(url)
            .then(response => { return response.json() })
            .then(response => {
                this.message.innerHTML = '';
                this.films_items.innerHTML = '';
                response.Search.forEach(elem => this.create_card_film(elem));
                this.create_message(`All results on request: ${this.#api.s}`);
                if (response.totalResults > 10) {
                    new Pagination('.films_pagination', response.totalResults).init();
                } else {
                    this.pagination.innerHTML = '';
                }
                this.create_card_details();
            })
            .catch(() => {
                this.create_message('No Movie Found :(');
                this.films_items.innerHTML = '';
            })
    }

    page_request(url) {
        fetch(url)
            .then(response => { return response.json() })
            .then(response => {
                this.message.innerHTML = '';
                this.films_items.innerHTML = '';
                response.Search.forEach(elem => this.create_card_film(elem));
                this.create_message(`All results on request: ${this.#api.s}`);
                this.create_card_details();
            })
            .catch(() => {
                this.create_message('No Movie Found :(');
                this.films_items.innerHTML = '';
            })
    }

    find_films(e) {
        e.preventDefault();
        this.page = 1;
        this.get_data_form();
        this.get_request(this.get_url_for_query());
        this.films_info.innerHTML = '';
    }

    set_page(page) {
        this.page = page;
        this.get_data_form();
        this.page_request(this.get_url_for_query());
        this.films_info.innerHTML = '';
    }

    init() {
        this.create_message('Enter a movie title ^_^');
        this.form.addEventListener('submit', this.find_films.bind(this));
    }
}

class Pagination {
    #elem_per_page = 10;
    #limit = 2;
    constructor(wrapper, results) {
        this.wrap = document.querySelector(wrapper);
        this.total_rez = results;
        this.count_page = Math.ceil(this.total_rez / this.#elem_per_page);
        this.pages = [];
        this.current_page = 0;
        this.start_page = null;
        this.end_page = null;
    }

    set_pages_arr() {
        this.pages = [];
        if (this.count_page !== 1) {
            for (let i = this.start_page; i <= this.end_page; i++) {
                this.pages.push(i);
            }
        }
    }
    set_start_page() {
        if (this.current_page < this.#limit + 1) {
            this.start_page = 1
        } else {
            this.start_page = this.current_page - this.#limit;
        }
    }
    set_end_page() {
        if (this.current_page + this.#limit < this.count_page) {
            this.end_page = this.current_page + this.#limit;
        } else {
            this.end_page = this.count_page;
        }
    }

    render_pagination_items() {
        let str = `<ul class="pagination_items">
                        ${this.render_prev()}
                        ${this.render_pagination_elements()}
                        ${this.render_next()}
                  </ul>`;
        this.wrap.insertAdjacentHTML('AfterBegin', str);
    }
    render_pagination_elements() {
        let str = ``;
        this.pages.forEach(elem => str = str + this.render_pagination_element(elem));
        return str;
    }
    render_pagination_element(elem) {
        if (elem === this.current_page) {
            return `<li class="pagination_item pagination_item--active">${elem}</li>`;
        }
        return `<li class="pagination_item">${elem}</li>`;
    }
    render_prev() {
        if (this.start_page !== 1) {
            return `<li class="pagination_item pagination_item--prev">&laquo;</li>`;
        } else {
            return '';
        }
    }
    render_next() {
        if (this.end_page !== this.count_page) {
            return `<li class="pagination_item pagination_item--next">&raquo;</li>`;
        } else {
            return '';
        }
    }

    add_event(e) {
        if (e.target.matches('.pagination_item') && !e.target.matches('.pagination_item--prev') && !e.target.matches('.pagination_item--next')) {
            this.render(Number(e.target.innerText));
        }

        if (e.target.matches('.pagination_item--prev')) {
            this.render(--this.current_page);
        }

        if (e.target.matches('.pagination_item--next')) {
            this.render(++this.current_page);
        }
    }
    render(option) {
        new Films().set_page(option);
        this.wrap.innerText = ''
        this.current_page = option;
        this.set_start_page();
        this.set_end_page();
        this.set_pages_arr();
        this.render_pagination_items();
    }


    init() {
        this.render(1);
        this.wrap.addEventListener('click', this.add_event.bind(this));
    }
}