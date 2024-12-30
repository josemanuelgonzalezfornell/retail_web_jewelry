
strings = {
    "en": {
        "home": "home",
        "products": "products",
        "about": "about",
        "en": "english",
        "es": "español",
        "orders": "my orders",
        "profile": "mi profile",
        "login": "log in",
        "logout": "log out"
    },
    "es": {
        "home": "inicio",
        "products": "productos",
        "about": "conócenos",
        "en": "english",
        "es": "español",
        "orders": "mis pedidos",
        "profile": "mi perfil",
        "login": "iniciar sesión",
        "logout": "cerrar sesión"
    }
}; // TODO: remove when fetchStrings is implemented

function setLanguage(language = "en") {
    // fetchStrings(language).then(strings => {
    //     loadMenu(strings);
    // }); TODO: implement;
    loadMenu(strings[language]); // TODO: remove when fetchStrings is implemented
}

async function fetchStrings(language = "en") {
    try {
        const response = await fetch("../data/strings.json");
        if (!response.ok) {
            throw new Error("HTTP error ${response.status} while fetching strings JSON.");
        }
        const strings = await response.json();
        return strings[language];
    } catch (error) {
        console.error('Failed to fetch strings JSON:', error);
    }
}