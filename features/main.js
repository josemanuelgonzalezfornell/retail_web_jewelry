/**
 * Main function to initialize the application.
 */
function main() {
    localStorage.setItem("cart", JSON.stringify([
        { "reference": "1234", "quantity": 2 },
        { "reference": "5678", "quantity": 1 }
    ])); // TODO: remove when getProduct is implemented.
    loadNavigation();
    setLanguage();
    setCartCounter();
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

/**
 * Fetches product based on the provided reference.
 *
 * @async
 * @function getProduct
 * @param {string} reference - The reference identifier for the product.
 * @returns {Promise<Object>} A promise that resolves to an object containing product data.
 * @throws {Error} Throws an error if the HTTP request fails.
 */
async function getProduct(reference) {
    const url = ""; // TODO: implement URL
    var requests = ["info", "preview"];
    var response = {};
    var product = {};
    for (let request in requests) {
        response[requests[request]] = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "reference": reference,
                "request": requests[request]
            })
        });
        if (!response[requests[request]].ok) {
            throw new Error("HTTP error " + response.status + " while fetching " + requests[request] + " from product " + reference + ".");
        }
        if (requests[request] == "preview") {
            const blob = await response.blob();
            product[requests[request]] = URL.createObjectURL(blob);
        } else {
            product[requests[request]] = await response[requests[request]].json();
        }
    }
    return product;
}