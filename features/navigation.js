/**
 * Initializes submenus and configures listeners for all navigators.
*/
function loadNavigation() {
    // Menus
    /**
     * Creates a submenu button element.
     *
     * @param {string} id - The ID for the submenu button.
     * @param {function} listener - The event listener function for the submenu button.
     * @returns {HTMLButtonElement} The submenu button element.
     */
    function createSubmenu(id, listener) {
        let submenu = document.createElement("button");
        submenu.type = "button";
        submenu.classList.add("string");
        submenu.id = id;
        submenu.addEventListener("click", listener);
        return submenu;
    }
    const menus = document.getElementsByClassName("menu");
    for (let menu = 0; menu < menus.length; menu++) {
        if (menus[menu].id == "language") {
            menus[menu].submenus = [
                createSubmenu("en", clickLanguage),
                createSubmenu("es", clickLanguage)
            ];
        } else if (menus[menu].id == "user") {
            if (localStorage.getItem("user")) { // TODO: implement user session
                menus[menu].submenus = [
                    createSubmenu("orders", navigate),
                    createSubmenu("profile", navigate),
                    createSubmenu("logout", navigate)
                ];
            } else {
                menus[menu].submenus = [
                    createSubmenu("login", navigate)
                ];
            }
        }
        menus[menu].addEventListener("click", showMenu);
    }
    document.addEventListener("click", hideMenu);
    // Navigators
    const navigators = document.getElementsByClassName("navigator");
    for (let navigator = 0; navigator < navigators.length; navigator++) {
        navigators[navigator].addEventListener("click", navigate);
    }
}

/**
 * Handles navigation by fetching and displaying the requested view.
 *
 * @param {Event} event - The event object from the navigator.
 * @returns {Promise<void>} A promise that resolves when the view has been successfully fetched and displayed.
 * @throws {Error} Throws an error if the fetch request fails.
 */
async function navigate(event) {
    const view = event.currentTarget.id;
    try {
        const response = await fetch("../views/" + view + ".html"); // TODO: change to navigating to specific URLs instead.
        if (!response.ok) {
            throw new Error("HTTP error " + response.status + " while fetching view " + view + ".");
        }
        const content = await response.text();
        document.getElementById("content").innerHTML = content;
        if (view == "cart") {
            loadCartTable();
        }
        loadNavigation();
        loadStrings();
    } catch (error) {
        console.error("Failed to fetch view " + view + ":", error);
    }
}

/**
 * Displays the corresponding menu when a nav button is clicked.
 *
 * @param {Event} event - The event triggered by clicking the nav button.
 */
function showMenu(event) {
    const button = event.currentTarget;
    const submenus = button.submenus;
    event.stopPropagation();
    var menu = document.getElementById("menu");
    if (menu) {
        menu.remove();
    }
    menu = document.createElement("div");
    document.getElementsByTagName("nav")[0].appendChild(menu);
    menu.id = "menu";
    menu.style.position = "absolute";
    menu.style.top = button.offsetHeight + button.offsetTop + "px";
    menu.style.right = document.body.getBoundingClientRect().right - button.getBoundingClientRect().right + "px";
    for (let submenu = 0; submenu < submenus.length; submenu++) {
        menu.appendChild(submenus[submenu]);
    }
}

/**
 * Hides the menu by removing the element with the ID "menu" from the DOM.
 *
 * @param {Event} event - The event object that triggered the function.
 */
function hideMenu(event) {
    var menu = document.getElementById("menu");
    if (menu) {
        menu.remove();
    }
}

/**
 * Handles the click event for changing the language.
 *
 * @param {Event} event - The event object from the click event.
 */
function clickLanguage(event) {
    setLanguage(event.currentTarget.id);
};