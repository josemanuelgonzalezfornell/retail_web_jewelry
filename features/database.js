/**
 * The currency symbol used in the application.
 * @type {string}
 */
const CURRENCY = "€";

/**
 * Fetches an object based on the provided id.
 *
 * @async
 * @param {string} objectclass - The class of object to fetch (e.g., "product", "collection").
 * @param {string} id - The identifier for the object.
 * @returns {Promise<Object>} A promise that resolves to the object.
 * @throws {Error} Throws an error if the HTTP request fails.
 */
async function getObject(objectclass, id) {
    // TODO: implement getProduct and getCollection.
    // const url = "/database/" + objectclass + "?id=" + id;
    // var response = {};
    // try {
    //     response = await fetch(url, {
    //         method: 'GET',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({
    //             "id": id,
    //             "request": requests[request]
    //         })
    //     });
    //     if (!response.ok) {
    //         throw new Error("HTTP error " + response.status + " while fetching " + objectclass + " " + id + ".");
    //     }
    //     var object = await response.json();
    //     if (object["preview"]) {
    //         var blob = await object["preview"].blob();
    //         object["preview"] = URL.createObjectURL(blob);
    //     }
    // } catch (error) {
    //     console.error("Failed to fetch " + objectclass + " " + id + ":", error);
    // }

    // TODO: remove when getProduct and getCollection is implemented.
    if (objectclass == "product") {
        var object = {
            "id": id,
            "name": "Product name",
            "description": "This is the product description. This is the product description. This is the product description. This is the product description. This is the product description. This is the product description. This is the product description.",
            "price": Math.round(Math.random() * 100),
            "preview": "../assets/images/instagram.png"
        };
    } else if (objectclass == "collection") {
        var object = {
            "id": id,
            "name": "Collection name",
            "description": "This is the collection description. This is the collection description. This is the collection description. This is the collection description. This is the collection description. This is the collection description. This is the collection description.",
            "preview": "../assets/images/whatsapp.png"
        };
    }
    return object;
}

/**
 * Fetches product based on the provided id.
 *
 * @async
 * @param {string} id - The identifier for the product.
 * @returns {Promise<Object>} A promise that resolves to the product.
 * @throws {Error} Throws an error if the HTTP request fails.
 */
async function getProduct(id) {
    return await getObject("product", id);
}

/**
 * Fetches a product collection based on the provided id.
 *
 * @async
 * @param {string} id - The identifier for the collection.
 * @returns {Promise<Object>} A promise that resolves to the collection.
 * @throws {Error} Throws an error if the HTTP request fails.
 */
async function getCollection(id) {
    return await getObject("collection", id);
}