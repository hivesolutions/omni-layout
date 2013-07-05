(function(jQuery) {
    jQuery.fn.uasync = function() {
        // sets the jquery matched object
        var matchedObject = this;

        var _registerHandlers = function() {
            // retrieves the various elements that are going to be
            // used in the registration for the handlers
            var _body = jQuery("body");
            var links = jQuery("a[href], .link[href]", matchedObject);

            // registers for the click event on the current set of links
            // that exist in the object, so that they can be handled in
            // an async fashion if thats the case
            links.click(function(event) {
                        // in case the click used the right or center button the
                        // event should be ignored not bean to be overriden
                        if (event.which == 2 || event.which == 3) {
                            return;
                        }

                        // retrieves the current element and the current link
                        // associated so that it can be validated and tested in
                        // the current async environment
                        var element = jQuery(this);
                        var href = element.attr("href");

                        // runs the async link execution with no force flag set
                        // and in case it run through avoids the default link
                        // behavior (avoid duplicated execution)
                        var result = jQuery.ulinkasync(href, false, true, true);
                        result && event.preventDefault();
                    });

            // retrieves the current async registration flag from the body
            // elemennt in case it's currently set returns immediately to
            // avoid duplicated registration
            var async = _body.data("async") || false;
            if (async) {
                return;
            }

            // registers for the location changed event in order to validated the
            // location changes for async execution then sets the async flag in the
            // current body in order duplicated registration
            _body.bind("location", function(event, location) {
                        // tries to runthe async link logic and in case it goes through
                        // cancels the current event returning an invalid value, so that
                        // the default location setting logic does not run
                        var result = jQuery.ulinkasync(location, false, true,
                                true);
                        return !result;
                    });
            _body.data("async", true);
        };

        var _setPopHandler = function() {
            // in case the pop state (changed) handler is already set there's
            // no need to set it again and so returns immediately
            if (window.onpopstate != null) {
                return;
            }

            // sets the initial and loded variables so that they will
            // be used by the pop state function handler as a clojure
            var initial = null;
            var loaded = false;

            // registers the pop state changed handler function so that
            // it's possible to restore the state using an async approach
            window.onpopstate = function(event) {
                // in case the event raised contains no state (not pushed)
                // and the location or the location is the initial one the
                // async login must be run
                if (event.state != null || document.location == initial) {
                    var href = document.location;
                    jQuery.ulinkasync(href, true, true, true);
                }

                // in case the initial location value is not set this is the
                // the right time to set it
                if (initial == null) {
                    initial = document.location;
                }
            };
        }

        // runs the initial registration logic enabling the current matched
        // object with the async logic and execution
        _registerHandlers();
        _setPopHandler();
    };
})(jQuery);
