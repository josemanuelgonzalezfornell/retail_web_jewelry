/**
 * Loads the cart table in the HTML document with the products stored in localStorage.
 * 
 * This function retrieves the cart data from localStorage, clears the existing table content,
 * and populates it with the product details including preview, quantity, reference, description, price and cost.
 * It also adds a summary row at the end displaying the total cost of the items in the cart.
 * 
 * The table is expected to be the first table element within the element with the ID "content".
 * 
 * The cart data in localStorage should be a JSON string with the following structure:
 * []
 *    {
 *       "reference": string,
 *       "quantity": number
 *    },
 *    ...
 * ]
 */
function loadCartTable() {
    const table = document.getElementById("content").getElementsByTagName("table")[0];
    var products = JSON.parse(localStorage.getItem("cart"));
    const columns = ["control", "quantity", "preview", "reference", "description", "price", "cost"];
    removeChildren(table);
    let row;
    let cell;
    if (!products) {
        products = [];
    }
    if (products.length > 0) {
        // Header
        row = document.createElement("tr");
        table.appendChild(row);
        for (let column in columns) {
            cell = document.createElement("th");
            row.appendChild(cell);
            cell.classList.add(columns[column]);
        }
        // Data
        function createControl(action, reference) {
            const button = document.createElement("button");
            button.type = "button";
            button.action = action;
            button.reference = reference;
            button.addEventListener("click", clickControl);
            const img = document.createElement("img");
            button.appendChild(img);
            img.src = "../assets/images/" + action + ".png";
            return button;
        }
        var total = 0;
        for (let product = 0; product < products.length; product++) {
            // let data = getProduct(products[product]["reference"]);
            let data = { "info": { "reference": products[product]["reference"], "description": "Product description", "price": Math.round(Math.random() * 100) } }; // TODO: remove when getProduct is implemented.
            row = document.createElement("tr");
            table.appendChild(row);
            for (let column in columns) {
                cell = document.createElement("td");
                row.appendChild(cell);
                cell.classList.add(columns[column]);
                if (columns[column] == "control") {
                    cell.appendChild(createControl("increase", products[product]["reference"]));
                    cell.appendChild(createControl("remove", products[product]["reference"]));
                    cell.appendChild(createControl("decrease", products[product]["reference"]));
                } else if (columns[column] == "preview") {
                    const preview = document.createElement("img");
                    cell.appendChild(preview);
                    // preview.src = data["preview"]; TODO: implement preview retrieval
                } else if (["quantity"].includes(columns[column])) {
                    cell.textContent = products[product][columns[column]].toFixed(0) + "x";
                } else if (columns[column] == "price") {
                    cell.textContent = data["info"][columns[column]].toFixed(2) + "€";
                } else if (columns[column] == "cost") {
                    cell.textContent = (products[product]["quantity"] * data["info"]["price"]).toFixed(2) + "€";
                    total += products[product]["quantity"] * data["info"]["price"];
                } else {
                    cell.textContent = data["info"][columns[column]];
                }
                if (["quantity", "price", "cost"].includes(columns[column])) {
                    cell.classList.add("number");
                }
            }
        }
        // Summary
        row = document.createElement("tr");
        table.appendChild(row);
        row.classList.add("summary");
        cell = document.createElement("td");
        row.appendChild(cell);
        cell.classList.add("number");
        cell.textContent = total.toFixed(2) + "€";
        cell.setAttribute("colspan", columns.length + 1);
    } else {
        const empty = document.createElement("p");
        table.appendChild(empty);
        empty.id = "empty-cart";
        empty.classList.add("string");
    }
    document.getElementById("purchase").disabled = products.length == 0;
}

/**
 * Adds a product to the shopping cart stored in localStorage.
 * If the product already exists in the cart, its quantity is updated.
 * 
 * @param {string} reference - The unique reference identifier for the product.
 * @param {string} description - The description of the product.
 * @param {number} price - The price of the product.
 * @param {number} quantity - The quantity of the product to add to the cart.
 */
function addToCart(reference, description, price, quantity) {
    let products = JSON.parse(localStorage.getItem("cart"));
    if (products == null) {
        products = [];
    }
    let index = products.findIndex(product => product["reference"] === reference);
    if (index == -1) {
        products.push({ "reference": reference, "quantity": quantity });
    } else {
        products[index]["quantity"] += quantity;
    }
    if (products[index]["quantity"] <= 0) {
        removeFromCart(reference);
    } else {
        localStorage.setItem("cart", JSON.stringify(products));
        loadCartTable();
        setCartCounter();
    }
}

/**
 * Removes a product from the shopping cart stored in localStorage.
 *
 * @param {string} reference - The reference identifier of the product to be removed.
 */
function removeFromCart(reference) {
    let products = JSON.parse(localStorage.getItem("cart"));
    if (products != null) {
        let index = products.findIndex(product => product["reference"] === reference);
        if (index != -1) {
            products.splice(index, 1);
            localStorage.setItem("cart", JSON.stringify(products));
            loadCartTable();
            setCartCounter();
        }
    }
}

/**
 * Clears the shopping cart by removing the "cart" item from local storage
 * and updating the cart table display.
 */
function clearCart() {
    localStorage.removeItem("cart");
    loadCartTable();
}

/**
 * Updates the cart counter element with the total quantity of products in the cart.
 * Retrieves the cart data from localStorage, calculates the total quantity of products,
 * and updates the text content of the cart counter element.
 */
function setCartCounter() {
    const products = JSON.parse(localStorage.getItem("cart"));
    const counter = document.getElementById("cart-counter");
    if (products) {
        var total = 0;
        for (let product = 0; product < products.length; product++) {
            total += products[product]["quantity"];
        }
        counter.textContent = total;
    } else {
        counter.textContent = 0;
    }
}

/**
 * Handles click events on cart control buttons.
 *
 * @param {Event} event - The event object from the click event.
 * @param {HTMLElement} event.currentTarget - The element that triggered the event.
 * @param {string} event.currentTarget.action - The action to be performed ("increase", "decrease", or "remove").
 * @param {string} event.currentTarget.reference - The reference identifier for the cart item.
 */
function clickControl(event) {
    const action = event.currentTarget.action;
    const reference = event.currentTarget.reference;
    if (action == "increase") {
        addToCart(reference, 1);
    } else if (action == "decrease") {
        addToCart(reference, -1);
    } else if (action == "remove") {
        removeFromCart(reference);
    }
}

/**
 * Handles click event on purchase button.
 *
 * @param {Event} event - The event object from the click event.
 */
function clickPurchase(event) {
    // TODO: implement purchase method.
}