/**
 * Loads the strings on the web content.
 */
function loadStrings() {
    function setString(element, string) {
        if (element.tagName == "INPUT") {
            let label = document.querySelector("label[for=\"" + element.id + "\"]");
            if (label) {
                label.textContent = string;
            } else {
                element.placeholder = string;
            }
        } else {
            element.textContent = string;
        }
    }
    const language = localStorage.getItem("language");
    if (language) {
        getStrings(language).then(strings => {
            var menus = document.getElementsByClassName("string");
            for (let element = 0; element < menus.length; element++) {
                setString(menus[element], strings[menus[element].id]);
            }
            // Submenus
            menus = document.getElementsByClassName("menu");
            for (let menu = 0; menu < menus.length; menu++) {
                const submenus = menus[menu].submenus;
                for (let submenu = 0; submenu < submenus.length; submenu++) {
                    setString(submenus[submenu], strings[submenus[submenu].id]);
                }
            }
        });
    } else {
        setLanguage();
    }
}

/**
 * Fetches the language strings from a JSON file.
 * 
 * @async
 * @param {string} The language code to fetch (e.g., "en" for English, "es" for Spanish).
 * @returns {Promise<Object.<string, string>>} A promise that resolves to an object containing the language strings.
 * @throws Will throw an error if the fetch request fails.
 */
async function getStrings(language) {
    // const url = "/strings"; // TODO: uncomment when getStrings is implemented.
    const url = "../data/strings.json"; // TODO: remove when getStrings is implemented.
    try {
        var response = await fetch(url);
        if (!response.ok) {
            throw new Error("HTTP error " + response.status + " while fetching strings JSON.");
        }
        var strings = await response.json();
        Object.keys(strings).forEach(key => strings[language][key] = strings[key]["language"]);
        delete strings[language]["language"];
        return strings[language];
    } catch (error) {
        console.error("Failed to fetch strings JSON:", error);
    }
}

/**
 * Sets the language for the web content.
 * 
 * @param {string} [language="en"] - The language code to set (e.g., "en" for English, "es" for Spanish).
 */
function setLanguage(language = "en") {
    localStorage.setItem("language", language);
    loadStrings();
}