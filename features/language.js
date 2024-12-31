/**
 * Sets the language for the web content.
 * @param {string} [language="en"] - The language code to set (e.g., "en" for English, "es" for Spanish).
 */
function setLanguage(language = "en") {
    localStorage.setItem('language', language);
    loadStrings();
}

/**
 * Sets the strings for the web content.
 */
function loadStrings() {
    const language = localStorage.getItem('language');
    fetchStrings(language).then(strings => {
        loadNav(strings);
        const elements = document.getElementsByClassName("string");
        for (let element = 0; element < elements.length; element++) {
            if (elements[element].tagName == "INPUT") {
                document.querySelector("label[for=\"" + elements[element].id + "\"]").textContent = strings[elements[element].id];
            } else {
                elements[element].textContent = strings[elements[element].id];
            }
        }
    });
}

/**
 * Fetches the language strings from a JSON file.
 * @param {string} The language code to fetch (e.g., "en" for English, "es" for Spanish).
 * @returns {Promise<Object.<string, string>>} A promise that resolves to an object containing the language strings.
 * @throws Will throw an error if the fetch request fails.
 */
async function fetchStrings(language) {
    try {
        const response = await fetch("../data/strings.json");
        if (!response.ok) {
            throw new Error("HTTP error " + response.status + " while fetching strings JSON.");
        }
        const strings = await response.json();
        return strings[language];
    } catch (error) {
        console.error("Failed to fetch strings JSON:", error);
    }
}