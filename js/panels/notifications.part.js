(function(jQuery) {
    jQuery.fn.unotifications = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

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

                                /// @TODO: TENHO DE UPDATAR A MESSAGE STRING DE TEMPOS
                                // A TEMPOS

                                var imageUrl = "";
                                var userName = data.create_user.representation;
                                var message = data.notification_string;
                                var time = "moments ago";

                                // @TODO MUST BE ABSTRACTED

                                message = message.replace("{{", "<b>");
                                message = message.replace("}}", "</b>");

                                // adds a new notification item to the list of
                                // notifications, this notification should have
                                // the pre-defined username, message and time as
                                // defined in the received data
                                list.prepend("<li>"
                                        + "<img class=\"entity-picture\" src=\""
                                        + imageUrl + "\">"
                                        + "<div class=\"contents\">"
                                        + "<p class=\"title\">" + userName
                                        + "</p>" + "<p class=\"subject\">"
                                        + message + "</p>" + "</div>"
                                        + "<div class=\"time\">" + time
                                        + "</div>"
                                        + "<div class=\"break\"></div>"
                                        + "</li>");

                                // adds the pending class to the link so that it
                                // notifies that there are notifications pending
                                // to be read in the current environment
                                link.addClass("pending");
                            });
                });
    };
})(jQuery);
