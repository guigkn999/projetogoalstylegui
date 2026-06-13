// ===================
// TEMA DARK / LIGHT
// ===================


const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

themeToggle.addEventListener('click', () => {

    const isDark = body.getAttribute('data-bs-theme') === 'dark';

    body.setAttribute(
        'data-bs-theme',
        isDark ? 'light' : 'dark'
    );

    themeToggle.innerHTML = isDark
        ? '<i class="fas fa-moon fa-lg"></i>'
        : '<i class="fas fa-sun fa-lg"></i>';

});



// ===================
// FILTROS
// ===================

const filters = document.querySelectorAll('.filter-check');

const products = document.querySelectorAll('.product-item');

const clearBtn = document.getElementById('clear-filters');

const countDisplay = document.getElementById('product-count');

function applyFilters() {

    const activeFilters = Array.from(filters)

        .filter(i => i.checked)

        .map(i => i.value);

    let count = 0;

    products.forEach(p => {

        const brand = p.getAttribute('data-marca');

        if (

            activeFilters.length === 0 ||

            activeFilters.includes(brand)

        ) {

            p.style.display = 'block';

            count++;

        }

        else {

            p.style.display = 'none';

        }

    });

    countDisplay.innerText = `${count} Produtos encontrados`;

}

filters.forEach(f =>

    f.addEventListener('change', applyFilters)

);

clearBtn.addEventListener('click', () => {

    filters.forEach(f => f.checked = false);

    applyFilters();

});



// ===================
// CONTADOR DO CARRINHO
// ===================

async function atualizarContador() {

    const response = await fetch(

        'http://localhost:3000/api/carrinho'

    );

    const cart = await response.json();

    document.getElementById('cart-count').innerText = cart.length;

}



// ===================
// ADICIONAR AO CARRINHO
// ===================

const botoesAdicionar = document.querySelectorAll('.btn-dark');

botoesAdicionar.forEach(botao => {

    botao.addEventListener('click', async () => {

        const card = botao.closest('.card');

        const nome = card.querySelector('h6').innerText;

        const preco = card.querySelector('h5').innerText;

        const img = card
            .querySelector('img')
            .getAttribute('src');

        try {

            await fetch(

                'http://localhost:3000/api/carrinho',

                {

                    method: 'POST',

                    headers: {

                        'Content-Type': 'application/json'

                    },

                    body: JSON.stringify({

                        nome,

                        preco,

                        img

                    })

                }

            );

            atualizarContador();

            alert(`${nome} adicionado ao carrinho!`);

        }

        catch (error) {

            console.error(error);

            alert('Erro ao enviar produto.');

        }

    });

});



// ===================
// MAPA
// ===================

const map = L.map('map').setView(

    [-22.9068, -43.1729],

    12

);

L.tileLayer(

    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',

    {

        attribution: '&copy; OpenStreetMap'

    }

).addTo(map);


// Loja Centro

L.marker([-22.9068, -43.1729])

.addTo(map)

.bindPopup('Loja Centro');


// Loja Tijuca

L.marker([-22.9354, -43.1848])

.addTo(map)

.bindPopup('Loja Tijuca');


// Loja Copacabana

L.marker([-22.9711, -43.1822])

.addTo(map)

.bindPopup('Loja Copacabana');



// ===================
// CONTATO
// ===================

document.addEventListener(

    'DOMContentLoaded',

    function(){

        const openContact =

            document.getElementById('openContact');

        const contactBox =

            document.getElementById('contactBox');


        openContact.addEventListener(

            'click',

            function(){

                if(

                    contactBox.style.display

                    === 'block'

                ){

                    contactBox.style.display = 'none';

                }

                else{

                    contactBox.style.display = 'block';

                }

            }

        );

        atualizarContador();

    }

);