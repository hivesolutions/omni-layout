(function(jQuery) {
    jQuery.fn.unotifications = function(options) {
        /**
         * The maximum number of notifications that are allowed to stay at a
         * given notification panel. This value should be overriden by the
         * underlying function to allow some control.
         */
        var MAXIMUM_NOTIFICATIONS = 5;

        // sets the jquery matched object and verifies if
        // at least one object as been matched, in case not
        // a single object has been matched returns immediately
        // as there's nothing remaining to be done
        var matchedObject = this;
        if (!matchedObject || matchedObject.length === 0) {
            return;
        }

        // retrieves the reference to the global elements
        // that are going to be used latter for the various
        // operations and event registration
        var _window = jQuery(window);
        var _body = jQuery("body");

        // retrieves the values for the is registered to the
        // notifications global registration and then updates
        // the value to a valid value
        var isRegistered = _window.data("notifications_global");
        _window.data("notifications_global", true);

        // adds the various inner elements of the notifications
        // container to the notification activator icon
        var link = jQuery("<div class=\"button menu-button menu-link notifications\"></div>")
        var container = jQuery("<div class=\"menu-contents notifications-container\">" +
            "<ul class=\"notifications-list\"></ul>" + "</div>");
        matchedObject.append(link)
        matchedObject.append(container);

        // starts the menu link with the proper structures to be
        // able to open the associated panel
        link.uxmenulink();

        // iterates over each of the notifications containers
        // to initialize their structures and start the remote
        // connections for notification interaction
        matchedObject.each(function(index, element) {
            // retrieves the reference to the current element in
            // iteration
            var _element = jQuery(this);

            // retrieves the references to both the menu link associated
            // with the notifications container and to the list that
            // contains the notifications
            var link = jQuery(".menu-link", _element);
            var contents = jQuery(".menu-contents", _element);
            var list = jQuery(".notifications-list", _element);

            // retrieves the url value to be used for the chat
            // communication, and then creates the full absolute ur
            // from the base url and the communication suffix
            var url = _element.attr("data-url");
            var absolueUrl = jQuery.uxresolve(url + "/pushi.json");

            // retrieves the name of the currently signed in user
            // from the body element, to be used for the current panel
            var username = _body.data("username");
            _element.data("username", username);

            // retrieves the (base) url and the app key values to be used
            // for the establishement of the pushi connection, then uses them
            // as the various arguments for the construction of the proxy object
            var url = _element.attr("data-url");
            var key = _element.attr("data-key");
            var pushi = new Pushi(key, {
                baseUrl: url,
                authEndpoint: absolueUrl
            });

            // updates the current element with the reference to the pushi
            // element so that it may be re-used for retrieval latter
            _element.data("pushi", pushi);

            // registers for the notification event in the element so
            // that a new notification element is created
            _element.bind("notification", function(event, data, isNew) {
                // retrieves the current element
                var _element = jQuery(this);

                // retrieves the mvc and base paths and the class id url
                // map for the current page
                var mvcPath = _body.data("mvc_path");
                var basePath = _body.data("base_path");
                var classIdUrl = _body.data("class_id_url");

                // creates a new date object and uses it to retrieve
                // the current timestamp as defined in utf for unix
                var date = new Date();
                var current = date.getTime();

                // unpacks both the object id and the cid (class id)
                // from the current data structure
                var uniqueId = data.unique_id;
                var objectId = data.entity.object_id;
                var uobjectId = data.create_user.object_id;
                var cid = data.cid;
                var ucid = data.u_cid;

                // constructs the url using the base mvc path and
                // appending the url to the requested class
                var baseUrl = mvcPath + classIdUrl[cid];
                var baseUrlU = mvcPath + classIdUrl[ucid];

                // creates the final url value to be used in the
                // contruction of the various relative urls
                var url = baseUrl + objectId;
                var urlU = baseUrlU + uobjectId;

                // resolves the current url value so that it may
                // be used independently from the current state
                var urlR = jQuery.uxresolve(url);

                // calculates the diff by calculating the difference between
                // the current timestamp and the create date of the notification
                // and then converts it into the appropriate date string
                var diff = (current / 1000.0) - data.create_date;
                var diffS = jQuery.udates(diff);

                // extracts the message value from the base notification structure
                // and then retrieves the arguments from it also, then runs the
                // localization system on the message and formats the arguments
                // on the provided message (according to the c standard)
                var message = data.notification.message;
                var arguments = data.notification.arguments;
                message = jQuery.uxlocale(message);
                message = String.prototype.formatC.apply(message, arguments);

                // creates the plain text representation of the message to be
                // used for notification that use plain text
                var messageT = jQuery.utext(message);

                // runs the template (replacer) infra-structure in the message
                // so the message is correctly displayed with the right style
                message = jQuery.utemplate(message, true);

                // creates the various items that are going to be used
                // in the notification, this is important to maintain
                // the notification as useful as possible
                var imageUrl = urlU + "/image?size=64";
                var imageUrlSet = urlU + "/image?size=128 2x";
                var userName = data.create_user.representation;
                var time = diffS;

                // "calulates" the path to the logo url using the retrieved
                // base path as the reference for it
                var logoUrl = basePath + "common/images/logos/front-door-not-large.png";

                // adds a new notification item to the list of
                // notifications, this notification should have
                // the pre-defined username and time as defined
                // in the received data
                var notification = jQuery("<li class=\"button\" data-link=\"" + url + "\">" +
                    "<img class=\"entity-picture\" src=\"" + imageUrl + "\" srcset=\"" +
                    imageUrlSet + "\">" + "<div class=\"contents\">" +
                    "<p class=\"title\">" + userName + "</p>" + "<p class=\"subject\"></p>" +
                    "</div>" + "<div class=\"time\">" + time + "</div>" +
                    "<div class=\"break\"></div>" + "</li>");
                list.prepend(notification);
                notification.uxbutton();

                // retrieves the current set of items in the list of notification
                // and then counts them so that the overflow elements may be removed
                var items = jQuery("> li", list);
                var size = items.length;

                // iterates while the number is above the maximum allowed by the current
                // rules to remove the items that "overflow" that number
                while (size > MAXIMUM_NOTIFICATIONS) {
                    var index = size;
                    var element = jQuery("> li:nth-child(" + index + ")", list);
                    element.remove();
                    size--;
                }

                // sets the data in the notification so that it's
                // possible to update the notification latter on
                notification.data("data", data)

                // adds the pending class to the link so that it
                // notifies that there are notifications pending
                // to be read in the current environment
                isNew && notification.addClass("pending");
                isNew && link.addClass("pending");

                // in case the current notification is new creates
                // a new notification box for the current notification
                // so that the user gets an immediate visual effect
                isNew && _body.uxnotification({
                    "title": userName,
                    "message": message,
                    "link": jQuery.uxresolve(url),
                    "timeout": 15000
                });

                // in case this is a new notification creates a desktop
                // notification and registers the appropriate handlers to
                // it so that the target page opens on click and the notification
                // hides after a certain amount of time, note that if there's
                // not enough permissions the show is disabled
                var hasNotifications = typeof(Notification) !== "undefined";
                if (hasNotifications && isNew) {
                    var _notification = new Notification(userName, {
                        dir: "auto",
                        icon: jQuery.uxresolve(logoUrl),
                        lang: "en",
                        body: messageT,
                        tag: uniqueId
                    });
                    _notification.onclick = function() {
                        window.open(urlR, "_blank");
                    };
                    _notification.show && _notification.show();
                    _notification.close && setTimeout(function() {
                        _notification.close();
                    }, 15000);
                    _body.data("_notification", _notification);
                }

                // runs a refresh operation in the current element
                // so that it's status becomes updated
                _element.triggerHandler("refresh");
            });

            // registers for the referesh operation in the current element
            // so that it's possible to refresh the links of the
            // notifications according to the current location
            _element.bind("refresh", function() {
                // retrieves the complete set of items currently defined
                // in the items (notifications) list
                var items = jQuery("li", list);

                // retrieves the mvc path and the class id url
                // map for the current page
                var mvcPath = _body.data("mvc_path");
                var classIdUrl = _body.data("class_id_url");

                // retrieves the current number of notifications (items
                // size) and in case the number is zero disables the current
                // link, reverting it to a non action state, otherwise enables
                // it so that it becomes actionable (reverse operation)
                var itemsSize = items.length;
                if (itemsSize === 0) {
                    link.uxdisable();
                } else {
                    link.uxenable();
                }

                // retrieves the current date and uses it to retrieve the current
                // timestamp value (according to the utf format)
                var date = new Date();
                var current = date.getTime();

                // iterates over each of the items to be able to update
                // their like associations to the apropriate values
                items.each(function(index, element) {
                    // retrieves the current notification in iteration (element)
                    // and uses it to retrieve its data (notification data) in case
                    // there's no data skips the current iteration
                    var _element = jQuery(this);
                    var data = _element.data("data");
                    if (!data) {
                        return;
                    }

                    // retrieves the reference to the subject element from the
                    // element so that it gets updated with the new locale string
                    var subject = jQuery(".subject", _element);

                    // retrieves the reference to the time element of the
                    // current element in iteration, this is the value that
                    // is going to be update with the new string value
                    var time = jQuery(".time", _element);

                    // extracts the message value from the base notification structure
                    // and then retrieves the arguments from it also, then runs the
                    // localization system on the message and formats the arguments
                    // on the provided message (according to the c standard)
                    var message = data.notification.message;
                    var arguments = data.notification.arguments;
                    message = jQuery.uxlocale(message);
                    message = String.prototype.formatC.apply(message, arguments);

                    // runs the template (replacer) infra-structure in the message
                    // so the message is correctly displayed with the right style
                    message = jQuery.utemplate(message, true);

                    // updates the subject of the notification with the new localized
                    // message value according to the new locale
                    subject.html(message);

                    // calculates the diff by calculating the difference between
                    // the current timestamp and the create date of the notification
                    // and then converts it into the appropriate date string
                    var diff = (current / 1000.0) - data.create_date;
                    var diffS = jQuery.udates(diff);

                    // updates the time element with the newly created diff
                    // string that is not going to represent the element
                    time.html(diffS);

                    // unpacks the various information from the notification
                    // data and constructs the base url that is going to be
                    // used on the click in the notification
                    var objectId = data.entity.object_id;
                    var cid = data.cid;
                    var baseUrl = mvcPath + classIdUrl[cid];
                    var url = baseUrl + objectId;

                    // updates the link information in the notification list item
                    // so that a new click is properly changed
                    _element.attr("data-link", url);
                    _element.data("link", url);
                });

                // retrieves the username of the currently signed in user and the
                // username associated with the current element in case they
                // remain the same nothing else remains to be done and so the
                // function returns immediately (to the caller method)
                var username = _body.data("username");
                var _username = _element.data("username");
                if (username === _username) {
                    return;
                }

                // retrieves the reference to the current pushi instance/object
                // and then verifies if it's still considered valid by checking
                // the current base url and app key value assigned to the element
                var pushi = _element.data("pushi");
                var url = _element.attr("data-base_url");
                var key = _element.attr("data-key");
                var isValid = pushi.isValid(key, url);

                // in case the current configuration is valid there's just a restart
                // of the subscription process for the personal channel, this is done
                // mostly for security reasons (requires re-authentication)
                if (isValid) {
                    pushi.unsubscribe("personal-" + _username);
                    pushi.subscribe("personal-" + username);
                }
                // otherwise the configuration must be changed in the pushi object and
                // then a (re-)open process must be triggered in it so that the connection
                // is set under a valid state for the new key and (base) url values
                else {
                    pushi.reconfig(key, {
                        baseUrl: url,
                        authEndpoint: pushi.options.authEndpoint
                    });
                }

                // clears the current list of notification because the list will
                // be filled with new notifications once they "come" from the new
                // subscriptions that have been created
                list.empty();

                // disables the link by default, this value will be re-enabled in case
                // the new channel contain any notification values
                link.uxdisable();

                // changes the username associated wit the current element to the new
                // on, as all the changes have taken place
                _element.data("username", username);
            });

            // registers for the before unload event in the window
            // element so that any pending native notification is
            // closed and not left over as garbage
            !isRegistered && _window.bind("beforeunload", function() {
                var _notification = _body.data("_notification");
                _notification && _notification.close();
            });

            // registers for the unload event in the window
            // element so that any pending native notification is
            // closed and not left over as garbage
            !isRegistered && _window.bind("unload", function() {
                var _notification = _body.data("_notification");
                _notification && _notification.close();
            });

            // registers for the show event so that the reading
            // class may be added to the link indicating that the
            // notifications panel is being "read"
            contents.bind("shown", function() {
                // adds the reading class to the link, marking it as
                // reading for latter usage
                link.addClass("reading");
            });

            // registers for the hide event so that the pending
            // class may be removed from the notification container
            // and for the various pending notifications
            contents.bind("hidden", function() {
                // retrieves the complete set of list items for the
                // current list so that they may be marked as read
                var items = jQuery("li", list);

                // verifies if the user is currently reading the
                // contents of the menu link in case it's not returns
                // immediately as it's not possible to unmark it
                var isReading = link.hasClass("reading");
                if (!isReading) {
                    return;
                }

                // removes the reading class from the link because
                // with the hide event there's no more reading
                link.removeClass("reading");

                // removes the pending class from all of the
                // currently available items
                items.removeClass("pending");
                link.removeClass("pending");
            });

            // registers for the click event in the list, so that
            // any click in an item hides the menu immediately while
            // it also redirect the user to the target page
            list.click(function() {
                _element.triggerHandler("hide");
            });

            // registers for the connect event so that at the end of
            // the connection the base channels are subscribed
            pushi.bind("connect", function(event) {
                // retrieves the complete set of list items for the
                // current list so that they may be marked as read
                var items = jQuery("li", list);

                // empties the current list so that all the elements contained
                // in it are removed and none is present
                list.empty();

                // removes the pending class from all of the
                // currently available items so that the state
                // is restored to the original state
                items.removeClass("pending");
                link.removeClass("pending");

                // retrieves the current username set in the global body
                // object to be able to create the name of the personal
                // channel that is going to be subscribed for notifications
                var username = _body.data("username");

                // subscribes to the personal channel for the user, this channel
                // should contain notification related information
                this.subscribe("personal-" + username);
            });

            // registers for the subscribe event to be able to create the previously
            // existing events from the stored (logged) ones
            pushi.bind("subscribe", function(event, channel, data) {
                // verifies if the current channel type is personal and in
                // case it's not returns immediately (nothing to be done)
                var isPersonal = channel.startsWith("personal-");
                if (!isPersonal) {
                    return;
                }

                // extracts the list of events from the provided data and
                // the iterates over them to create the various notifications
                // in the opposite order of arrival (correct order)
                var events = data.events || [];
                var length = events.length > MAXIMUM_NOTIFICATIONS ? MAXIMUM_NOTIFICATIONS :
                    events.length;
                for (var index = length - 1; index >= 0; index--) {
                    var event = events[index];
                    var data = event.data.data;
                    var _data = data ? jQuery.parseJSON(data) : data;
                    _element.triggerHandler("notification", [_data,
                        false
                    ]);
                }
            });

            // registers for the notification event to be able to
            // present the notification to the end user using the
            // notifications list container
            pushi.bind("notification", function(event, data, channel) {
                // verifies if the data type of the provided data is string
                // in case it's parses it as a json string "saving" it in
                // place of the current data element
                var isString = typeof data === "string";
                data = isString ? jQuery.parseJSON(data) : data;

                // triggers the notification event in the element to display
                // the element visual structure in the notifications list
                _element.triggerHandler("notification", [data, true]);
            });

            // schedules an interval to update the current set of items so that
            // their time range values are correctly displayed
            setInterval(function() {
                // retrieves the current date and uses it to retrieve the current
                // timestamp value (according to the utf format)
                var date = new Date();
                var current = date.getTime();

                // retrieves the complete set of items and iterates over them
                // to update the time value for each of them
                var items = jQuery("li", list);
                items.each(function(index, element) {
                    // retrieves the current element in iteration and tries to
                    // retrieve the data table structure from it
                    var _element = jQuery(this);
                    var data = _element.data("data");
                    if (!data) {
                        return;
                    }

                    // retrieves the reference to the time element of the
                    // current element in iteration, this is the value that
                    // is going to be update with the new string value
                    var time = jQuery(".time", _element);

                    // calculates the diff by calculating the difference between
                    // the current timestamp and the create date of the notification
                    // and then converts it into the appropriate date string
                    var diff = (current / 1000.0) - data.create_date;
                    var diffS = jQuery.udates(diff);

                    // updates the time element with the newly created diff
                    // string that is not going to represent the element
                    time.html(diffS);
                });
            }, 60000);
        });

        var buildNotification = function() {};

        // triggers the initial refresh in the notification elements
        // this will run the initial update and initialize the
        // various components (startup process)
        matchedObject.triggerHandler("refresh");
    };
})(jQuery);
