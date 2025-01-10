/**
 * Handles the submit event for the login form.
 *
 * @param {Event} event - The event object from the submit event.
 */
function submitLogin(event) {
    event.preventDefault();
    const form = event.currentTarget.email.value;
    const email = form.email.value;
    const password = form.password.value;
    // TODO: implement login method
}