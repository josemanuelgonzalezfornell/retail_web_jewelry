function loadMenu(strings) {
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
        if (buttons[button].getElementsByTagName("img").length == 0) {
            removeChildren(buttons[button]);
            let span = document.createElement("span");
            buttons[button].appendChild(span);
            span.textContent = strings[buttons[button].id];
        }
    }
    document.addEventListener("click", hideMenu);
}

function navigate(event) {
    console.log(event.currentTarget.id); // TODO: implement navigation
}

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

function hideMenu(event) {
    var submenu = document.getElementById("submenu");
    if (submenu) {
        submenu.remove();
    }
}

function clickLanguage(event) {
    setLanguage(event.currentTarget.id);
}