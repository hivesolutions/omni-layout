(function(jQuery) {
    jQuery.fn.unotifications = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // retrieves the reference to the body element
        // so that it may be used latter for reference
        var _body = jQuery("body");

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
                                + url
                                + "\">"
                                + "<img class=\"entity-picture\" src=\""
                                + imageUrl
                                + "\">"
                                + "<div class=\"contents\">"
                                + "<p class=\"title\">"
                                + userName
                                + "</p>"
                                + "<p class=\"subject\">"
                                + message
                                + "</p>"
                                + "</div>"
                                + "<div class=\"time\">"
                                + time
                                + "</div>"
                                + "<div class=\"break\"></div>"
                                + "</li>");
                        list.prepend(notification);
                        notification.uxbutton();

                        // sets the data in the notification so that it's
                        // possible to update the notification latter on
                        notification.data("data", data)

                        // adds the pending class to the link so that it
                        // notifies that there are notifications pending
                        // to be read in the current environment
                        link.addClass("pending");
                    });
        });
    };
})(jQuery);
