/**
 * Asks a question to the chatbot and displays the user's question and the chatbot's response.
 * 
 * @async
 * @param {string} question - The question asked by the user.
 * @throws {Error} Throws an error if there is an issue fetching or parsing the chatbot response.
 */
async function chat(question) {
    showConversation();
    await addChatBubble("user", "p", question);
    // TODO: implement chatbot.
    // const url = "/chatbot";
    // try {
    //     var response = await fetch(url, {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/xml' },
    //         body: JSON.stringify({
    //             "text": question
    //         })
    //     });
    //     if (!response.ok) {
    //         throw new Error("HTTP error " + response.status + " while fetching chatbot response.");
    //     }
    //     var answer = await response.text();
    // } catch (error) {
    //     console.error("Failed to fetch chatbot response:", error);
    // }
    const answer = "<root><p>Hi, I'm glad to hear from you.\nThese following products might interest you:</p><product>1234</product><p>And also, you can check the entire collection here:</p><collection>3214</collection></root>"; // TODO: remove when chatbot is implemented.
    try {
        var objects = (new DOMParser()).parseFromString(answer, "application/xml").childNodes[0].childNodes;
        for (let object in objects) {
            let objectclass = objects[object].nodeName;
            let content = objects[object].textContent;
            await addChatBubble("bot", objectclass, content);
        }
    } catch (error) {
        console.error("Failed to read chatbot response:", error);
    }
}

/**
 * Adds a chat bubble to the chatbot conversation.
 *
 * @async
 * @param {string} side - The conversation side of the chat bubble ('user' or 'bot').
 * @param {string} objectclass - The class of content ('product', 'collection', or 'p').
 * @param {string} content - The content to be displayed in the chat bubble.
 */
async function addChatBubble(side, objectclass, content) {
    if (objectclass == "p") {
        var object = content;
    } else if (objectclass == "product") {
        var object = await getProduct(content);
        var rows = ["price", "name", "id", "description"];
    } else if (objectclass == "collection") {
        var object = await getCollection(content);
        var rows = ["name", "id", "description"];
    }
    const conversation = document.getElementById("conversation");
    // Bubble
    const bubble = document.createElement("div");
    if (object) {
        conversation.appendChild(bubble);
        bubble.classList.add(side, objectclass);
        if (objectclass == "p") {
            bubble.innerHTML = object.replace(/\n/g, '<br>');
        } else {
            // Preview
            let preview = document.createElement("img");
            bubble.appendChild(preview);
            preview.classList.add("preview");
            preview.src = object.preview;
            // Info
            let info = document.createElement("div");
            bubble.appendChild(info);
            info.classList.add("info");
            // Actions
            function createAction(objectclass, id, action) {
                const button = document.createElement("button");
                button.type = "button";
                button.objectclass = objectclass;
                button.id = id;
                button.action = action;
                button.addEventListener("click", clickChatAction);
                const img = document.createElement("img");
                button.appendChild(img);
                img.src = "../assets/images/" + action + ".png";
                return button;
            }
            let actions = document.createElement("div");
            info.appendChild(actions);
            actions.classList.add("actions");
            actions.appendChild(createAction(objectclass, object.id, "navigate"));
            actions.appendChild(createAction(objectclass, object.id, "share"));
            if (objectclass == "product") {
                actions.appendChild(createAction(objectclass, object.id, "cart-add"));
            }
            // Values
            let values = document.createElement("div");
            info.appendChild(values);
            values.classList.add("values");
            for (let row in rows) {
                let value = document.createElement("p");
                values.appendChild(value);
                value.classList.add(rows[row]);
                if (rows[row] == "price") {
                    value.textContent = object[rows[row]].toFixed(2) + CURRENCY;
                } else {
                    value.textContent = object[rows[row]];
                }
            }
        }
    } else {
        let empty = document.createElement("p");
        bubble.appendChild(empty);
        empty.classList.add("string");
        empty.id = objectclass + "-unknown";
        loadStrings();
    }
    conversation.scrollTop = conversation.scrollHeight;
}

/**
 * Shows the chatbot conversation by adding the "active" class to it.
 */
function showConversation() {
    const conversation = document.getElementById("conversation");
    conversation.classList.add("active");
}

/**
 * Hides the chatbot conversation by removing the "active" class.
 */
function hideConversation() {
    const conversation = document.getElementById("conversation");
    conversation.classList.remove("active");
}

/**
 * Clears the chat input field and resets its value to an empty string.
 * Also calls the loadChatCounter function to update the chat counter.
 */
function clearChatInput() {
    const input = document.getElementById("chat-input");
    input.value = "";
    loadChatCounter();
}

/**
 * Updates the chat counter element with the current length of the input value.
 * The counter displays the current length of the input value, padded with leading zeros,
 * followed by the maximum length of the input value.
 *
 * Example display: "005 / 100"
 */
function loadChatCounter() {
    const counter = document.getElementById("chat-counter");
    const input = document.getElementById("chat-input");
    counter.textContent = String(input.value.length).padStart(String(input.maxLength).length, '0') + " / " + input.maxLength;
}

/**
 * Handles the change event for the chat input.
 *
 * @param {Event} event - The event object from the change event.
 */
function changeChatInput(event) {
    loadChatCounter();
}

/**
 * Handles the submit event for the chat form.
 *
 * @param {Event} event - The event object from the form submit event.
 */
function submitChatInput(event) {
    event.preventDefault();
    chat(document.getElementById("chat-input").value);
    clearChatInput();
}

/**
 * Handles the click event for the chat clear button.
 *
 * @param {Event} event - The event object from the click event.
 */
function clickChatClear(event) {
    hideConversation();
    clearChatInput();
}

/**
 * Handles the click action for an object action button.
 *
 * @param {Event} event - The event object from the click action.
 */
function clickChatAction(event) {
    const objectclass = event.currentTarget.objectclass;
    const id = event.currentTarget.id;
    const action = event.currentTarget.action;
    if (action == "navigate") {
        navigateObject(objectclass, id);
    } else if (action == "share") {
        shareObject(objectclass, id);
    } else if (action == "cart-add") {
        addToCart(id, 1); // FIXME
    }
}