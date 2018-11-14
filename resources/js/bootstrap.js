import "bootstrap-vue/dist/bootstrap-vue.css";
import BootstrapVue from "bootstrap-vue";
import Echo from "laravel-echo";
import VueRouter from "vue-router";

window._ = require("lodash");
window.Popper = require("popper.js").default;

/**
 * We'll load jQuery and the Bootstrap jQuery plugin which provides support
 * for JavaScript based Bootstrap features such as modals and tabs. This
 * code may be modified to fit the specific needs of your application.
 */

window.$ = window.jQuery = require("jquery");

require("bootstrap");

/**
 * Vue is a modern JavaScript library for building interactive web interfaces
 * using reactive data binding and reusable components. Vue's API is clean
 * and simple, leaving you to focus on building your next great project.
 */

window.Vue = require("vue");

window.Vue.use(BootstrapVue);
window.Vue.use(VueRouter);

window.ProcessMaker = {
    /**
     * A general use global event bus that can be used
     */
    EventBus: new Vue(),
    /**
     * ProcessMaker Notifications
     */
    notifications: JSON.parse(document.head.querySelector("meta[name=\"notifications\"]").content),
    /**
     * Push a notification.
     *
     * @param {object} notification
     *
     * @returns {void}
     */
    pushNotification (notification) {
        if (this.notifications.filter(x => x.id === notification).length > 0) {
            this.notifications.push(notification);
        }
    },

    removeNotification (notification) {
        window.ProcessMaker.apiClient.put('/notifications/' + notification);
        this.notifications.splice(this.notifications.findIndex(x => x.id === notification), 1);
    },

    removeNotificationByUrl (url) {
        let messageIndex = this.notifications.findIndex(x => x.url === url);

        if (messageIndex >= 0) {
           ProcessMaker.removeNotification(this.notifications[messageIndex].id);
        }
    }
};

/**
 * Create a axios instance which any vue component can bring in to call
 * REST api endpoints through oauth authentication
 *
 */
window.ProcessMaker.apiClient = require("axios");

window.ProcessMaker.apiClient.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

/**
 * Next we will register the CSRF Token as a common header with Axios so that
 * all outgoing HTTP requests automatically have it attached. This is just
 * a simple convenience so we don't have to attach every token manually.
 */

let token = document.head.querySelector("meta[name=\"csrf-token\"]");

if (token) {
    window.ProcessMaker.apiClient.defaults.headers.common["X-CSRF-TOKEN"] = token.content;
} else {
    console.error("CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token");
}

window.ProcessMaker.apiClient.defaults.baseURL = "/api/1.0/";
// Default to a 5 second timeout, which is an eternity in web app terms
window.ProcessMaker.apiClient.defaults.timeout = 5000;

// Default alert functionality
window.ProcessMaker.alert = function (text, variant) {
    window.alert(`${variant}: ${text}`);
};

let userID = document.head.querySelector("meta[name=\"user-id\"]");

if (userID) {
    window.ProcessMaker.user = {
        id: userID.content
    };
}

let broadcaster = document.head.querySelector("meta[name=\"broadcaster\"]");
let key = document.head.querySelector("meta[name=\"broadcasting-key\"]");
let host = document.head.querySelector("meta[name=\"broadcasting-host\"]");

window.Echo = new Echo({
    broadcaster: broadcaster.content,
    key: key.content,
    host: host.content
});

if (userID) {
    window.Echo.private(`ProcessMaker.Models.User.${userID.content}`)
        .notification((token) => {
            ProcessMaker.pushNotification(token);
        });
}
