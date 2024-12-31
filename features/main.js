/**
 * Main function to initialize the application.
 */
function main() {
    setLanguage();
}

/**
 * Removes all child nodes from a given DOM element.
 *
 * @param {HTMLElement} element - The DOM element from which to remove all child nodes.
 */
function removeChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}