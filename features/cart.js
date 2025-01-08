/**
 * Loads the cart table in the HTML document with the products stored in localStorage.
 * 
 * This function retrieves the cart data from localStorage, clears the existing table content,
 * and populates it with the product details including preview, quantity, id, name, price and cost.
 * It also adds a total row at the end displaying the total cost of the items in the cart.
 * 
 * The table is expected to be the first table element within the element with the ID "content".
 * 
 * The cart data in localStorage should be a JSON string with the following structure:
 * []
 *    {
 *       "id": string,
 *       "quantity": number
 *    },
 *    ...
 * ]
 */
function loadCartTable() {
    const table = document.getElementById("content").getElementsByTagName("table")[0];
    var products = JSON.parse(localStorage.getItem("cart"));
    const columns = ["control", "quantity", "preview", "id", "name", "price", "cost"];
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
        function createControl(action, id) {
            const button = document.createElement("button");
            button.type = "button";
            button.action = action;
            button.id = id;
            button.addEventListener("click", clickControl);
            const img = document.createElement("img");
            button.appendChild(img);
            img.src = "../assets/images/" + action + ".png";
            return button;
        }
        var total = 0;
        for (let product = 0; product < products.length; product++) {
            // let data = getProduct(products[product]["id"]);
            let data = { "info": { "id": products[product]["id"], "name": "Product name", "price": Math.round(Math.random() * 100) } }; // TODO: remove when getProduct is implemented.
            row = document.createElement("tr");
            table.appendChild(row);
            for (let column in columns) {
                cell = document.createElement("td");
                row.appendChild(cell);
                cell.classList.add(columns[column]);
                if (columns[column] == "control") {
                    cell.appendChild(createControl("increase", products[product]["id"]));
                    cell.appendChild(createControl("remove", products[product]["id"]));
                    cell.appendChild(createControl("decrease", products[product]["id"]));
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
        // Total
        row = document.createElement("tr");
        table.appendChild(row);
        row.classList.add("total");
        for (let column in columns) {
            cell = document.createElement("td");
            row.appendChild(cell);
            cell.classList.add(columns[column]);
            if (columns[column] == "control") {
                cell.appendChild(createControl("remove", ""));
            } else if (columns[column] == "name") {
                cell.textContent = "Total";
            } else if (columns[column] == "cost") {
                cell.classList.add("number");
                cell.textContent = total.toFixed(2) + "€";
            }
        }
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
 * @param {string} id - The unique identifier for the product.
 * @param {number} quantity - The quantity of the product to add to the cart.
 */
function addToCart(id, quantity) {
    let products = JSON.parse(localStorage.getItem("cart"));
    if (products == null) {
        products = [];
    }
    let index = products.findIndex(product => product["id"] === id);
    if (index == -1) {
        products.push({ "id": id, "quantity": quantity });
    } else {
        products[index]["quantity"] += quantity;
    }
    if (products[index]["quantity"] <= 0) {
        removeFromCart(id);
    } else {
        localStorage.setItem("cart", JSON.stringify(products));
        loadCartTable();
        setCartCounter();
    }
}

/**
 * Removes a product from the shopping cart stored in localStorage.
 *
 * @param {string} id - The identifier of the product to be removed.
 */
function removeFromCart(id) {
    let products = JSON.parse(localStorage.getItem("cart"));
    if (products != null) {
        let index = products.findIndex(product => product["id"] === id);
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
 * Handles click events on cart product control buttons.
 *
 * @param {Event} event - The event object from the click event.
 * @param {HTMLElement} event.currentTarget - The element that triggered the event.
 * @param {string} event.currentTarget.action - The action to be performed ("increase", "decrease", or "remove").
 * @param {string} event.currentTarget.id - The identifier for the product.
 */
function clickControl(event) {
    const action = event.currentTarget.action;
    const id = event.currentTarget.id;
    if (action == "increase") {
        addToCart(id, 1);
    } else if (action == "decrease") {
        addToCart(id, -1);
    } else if (action == "remove") {
        if (id) {
            removeFromCart(id);
        } else {
            clearCart();
        }
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