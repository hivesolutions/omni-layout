(function(jQuery) {
    jQuery.fn.unotifications = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        matchedObject.each(function(index, element) {
                    // retrieves the reference to the current element in
                    // iteration
                    var _element = jQuery(this);

                    var link = jQuery(".menu-link", _element);
                    var list = jQuery(".notifications-list", _element);

                    var key = _element.attr("data-key");
                    var pushi = new Pushi(key, {
                                authEndpoint : absolueUrl
                            });

                    var url = _element.attr("data-url");
                    var absolueUrl = jQuery.uxresolve(url + "/pushi");

                    // retrieves the app key value to be used for the establishement
                    // of the pushi connection, then uses it as the first argument
                    // in the construction of the proxy object
                    var key = _element.attr("data-key");
                    var pushi = new Pushi(key, {
                                authEndpoint : absolueUrl
                            });

                    pushi.bind("connect", function(event) {
                                this.subscribe("global");
                            });

                    pushi.bind("notification", function(event, data, channel) {
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

                                link.addClass("pending");
                            });
                });
    };
})(jQuery);
