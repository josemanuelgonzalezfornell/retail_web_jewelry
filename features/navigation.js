const navs = {
    "home": "Inicio"
    , "products": "Productos"
    , "about": "Acerca de nosotros"
}; // Array of navigators in navigation bar

function main() {
    const menu = document.getElementById('menu');
    for (let nav in navs) {
        let button = document.createElement('button');
        menu.appendChild(button);
        button.type = 'button';
        button.id = nav;
        button.addEventListener('click', navigate);
        let span = document.createElement('span');
        button.appendChild(span);
        span.textContent = navs[nav];
    }
}

function navigate(event) {
    console.log(event.currentTarget.id);
}

function click_cart() {
}