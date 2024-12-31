/**
 * Handles navigation by fetching and displaying the requested view.
 *
 * @param {Event} event - The event object from the navigation trigger.
 * @returns {Promise<void>} A promise that resolves when the view has been successfully fetched and displayed.
 * @throws {Error} Throws an error if the fetch request fails.
 */
async function navigate(event) {
    const view = event.currentTarget.id;
    try {
        const response = await fetch("../views/" + view + ".html");
        if (!response.ok) {
            throw new Error("HTTP error " + response.status + " while fetching view " + view + ".");
        }
        const content = await response.text();
        document.getElementById("content").innerHTML = content;
        loadStrings();
    } catch (error) {
        console.error("Failed to fetch view " + view + ":", error);
    }
    // TODO: change to navigating to specific URLs instead.
}

/**
 * Initializes the navigation menu with the provided strings for button labels and submenus.
 * 
 * @param {Object} strings - An object containing the text for various navigation elements.
 */
function loadNav(strings) {
    const buttons = document.getElementsByTagName('nav')[0].getElementsByTagName('button');
    for (let button = 0; button < buttons.length; button++) {
        if (buttons[button].id == "language") {
            buttons[button].submenu = [
                { id: "en", text: strings["en"], listener: clickLanguage },
                { id: "es", text: strings["es"], listener: clickLanguage }
            ];
        } else if (buttons[button].id == "user") {
            if (localStorage.getItem("user")) { // TODO: implement user session
                buttons[button].submenu = [
                    { id: "orders", text: strings["orders"], listener: navigate },
                    { id: "profile", text: strings["profile"], listener: navigate },
                    { id: "logout", text: strings["logout"], listener: navigate }
                ];
            } else {
                buttons[button].submenu = [
                    { id: "login", text: strings["login"], listener: navigate }
                ];
            }
        }
        if (buttons[button].submenu) {
            buttons[button].addEventListener("click", showMenu);
        } else {
            buttons[button].addEventListener("click", navigate);
        }
    }
    document.addEventListener("click", hideMenu);
}

/**
 * Displays the corresponding submenu when a menu item is clicked.
 *
 * @param {Event} event - The event triggered by clicking the menu item.
 */
function showMenu(event) {
    const menu = event.currentTarget;
    event.stopPropagation();
    var submenu = document.getElementById("submenu");
    if (submenu) {
        submenu.remove();
    }
    submenu = document.createElement("div");
    document.getElementsByTagName("nav")[0].appendChild(submenu);
    submenu.id = "submenu";
    submenu.style.position = "absolute";
    submenu.style.top = menu.offsetHeight + menu.offsetTop + "px";
    submenu.style.right = document.body.getBoundingClientRect().right - menu.getBoundingClientRect().right + "px";
    for (let item = 0; item < menu.submenu.length; item++) {
        let button = document.createElement("button");
        submenu.appendChild(button);
        button.type = "button";
        button.id = menu.submenu[item].id;
        button.textContent = menu.submenu[item].text;
        button.addEventListener("click", menu.submenu[item].listener);
        button.style.height = menu.offsetHeight + "px";
    }
}

/**
 * Hides the submenu by removing the element with the ID "submenu" from the DOM.
 *
 * @param {Event} event - The event object that triggered the function.
 */
function hideMenu(event) {
    var submenu = document.getElementById("submenu");
    if (submenu) {
        submenu.remove();
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