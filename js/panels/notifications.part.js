(function(jQuery) {
    jQuery.fn.unotifications = function(options) {
        /**
         * The maximum number of notifications that are allowed to stay at a
         * given notification panel. This value should be overriden by the
         * underlying function to allow some control.
         */
        var MAXIMUM_NOTIFICATIONS = 5;

        // sets the jquery matched object
        var matchedObject = this;

        // retrieves the reference to the body element
        // so that it may be used latter for reference
        var _body = jQuery("body");

        // adds the various inner elements of the notifications
        // container to the notification activator icon
        var link = jQuery("<div class=\"button menu-button menu-link notifications\"></div>")
        var container = jQuery("<div class=\"menu-contents notifications-container\">"
                + "<ul class=\"notifications-list\"></ul>" + "</div>");
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

            // retrieves the references to both the menu link asscoiated
            // with the notifications contqainer and to the list that
            // contains the notifications
            var link = jQuery(".menu-link", _element);
            var contents = jQuery(".menu-contents", _element);
            var list = jQuery(".notifications-list", _element);

            // retrieves the url value to be used for the chat
            // communication, and then creates the full absolute ur
            // from the base url and the communication suffix
            var url = _element.attr("data-url");
            var absolueUrl = jQuery.uxresolve(url + "/pushi");

            // retrieves the app key value to be used for the establishement
            // of the pushi connection, then uses it as the first argument
            // in the construction of the proxy object
            var key = _element.attr("data-key");
            var pushi = new Pushi(key, {
                        authEndpoint : absolueUrl
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
                        if (itemsSize == 0) {
                            link.uxdisable();
                        } else {
                            link.uxenable();
                        }

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

                                    // unpacks the various information from the notification
                                    // data and constructs the base url that is going to be
                                    // used on the click in the notification
                                    var objectId = data.entity.object_id;
                                    var cid = data.cid;
                                    var baseUrl = mvcPath + classIdUrl[cid];
                                    var url = baseUrl + objectId;

                                    // updates the link informtion in the notification list item
                                    // so that a new click is properly changed
                                    _element.attr("data-link", url);
                                    _element.data("link", url);
                                });
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
                        this.subscribe("global");
                    });

            // registers for the notification event to be able to
            // present the notification to the end user using the
            // notifications list container
            pushi.bind("notification", function(event, data, channel) {
                // verifies if the data type of the provided data is string
                // in case it's parses it as a json string "saving" it in
                // place of the current data element
                var isString = typeof data == "string";
                data = isString ? jQuery.parseJSON(data) : data;

                // @TODO para enviar notifições utilizar !!!
                // jQuery("body").uxnotification({"title" : "asdad", "message" : "Adasd" });

                /// @TODO: TENHO DE UPDATAR A TIME STRING DE TEMPOS
                // A TEMPOS (para que ela va envelechendo)

                // retrieves the mvc path and the class id url
                // map for the current page
                var mvcPath = _body.data("mvc_path");
                var classIdUrl = _body.data("class_id_url");

                // unpacks both the object id and the cid (class id)
                // from the current data strcucture
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

                // creates the various items that are going to be used
                // in the notification, this is important to maintain
                // the notification as useful as possible
                var imageUrl = urlU + "/image?size=50";
                var userName = data.create_user.representation;
                var message = data.notification_string;
                var time = "moments ago";

                // runs the template (replacer) infra-structure in the message
                // so the message is correctly displayed with the right style
                message = jQuery.utemplate(message);

                // adds a new notification item to the list of
                // notifications, this notification should have
                // the pre-defined username, message and time as
                // defined in the received data
                var notification = jQuery("<li class=\"button\" data-link=\""
                        + url + "\">" + "<img class=\"entity-picture\" src=\""
                        + imageUrl + "\">" + "<div class=\"contents\">"
                        + "<p class=\"title\">" + userName + "</p>"
                        + "<p class=\"subject\">" + message + "</p>" + "</div>"
                        + "<div class=\"time\">" + time + "</div>"
                        + "<div class=\"break\"></div>" + "</li>");
                list.prepend(notification);
                notification.uxbutton();

                // retrieves the current set of items in the list of notification
                // and then counts them so that the overflow elements may be removed
                var items = jQuery("> li", list);
                var size = items.length;

                // iterates while the number is above the maximum allowed by the current
                // rules to remove the items that "overflow" that number
                while (size > 5) {
                    var index = size - 1;
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
                notification.addClass("pending");
                link.addClass("pending");

                // runs a refresh operation in the current element
                // so that it's status becomes updated
                _element.triggerHandler("refresh");
            });

            // triggers the initial refresh in the notification elements
            // this will run the initial update and initialize the
            // various components (startup process)
            matchedObject.triggerHandler("refresh");
        });
    };
})(jQuery);