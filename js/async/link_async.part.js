(function(jQuery) {
    /**
     * The regular expression that is going to be used for the verification of
     * the same host policy, required for the async based links.
     */
    var HOST_REGEX = new RegExp(location.host);

    jQuery.ulinkasync = function(href, verify) {
        // retrievs the reference to the body element to be used
        // for async verification
        var _body = jQuery("body");

        // retrieves the value of the async flag for the current body
        // element in case the value is not set returns immediately
        // with a not processed value (not meant to be handled async)
        var async = _body.data("async");
        if (!async) {
            return false;
        }

        // in case the provided link value is invalid, not set
        // or empty there's no panel to be changed and everything
        // shuold remain the same (no update)
        if (!href) {
            return true;
        }

        // in case this is an internal link the panel change must be
        // avoided and the top handler should take this into account
        if (href[0] == "#") {
            return false;
        }

        // resolves the provided link so that were able to find out the
        // absolute url out of it and set it as the location to be retrieved
        // using an asynchronous approach (ajax)
        href = jQuery.uxresolve(href);

        // runs the regular expression that will verify if the current link
        // is local and in case it's not returns immediately with the error
        // flag set indicating that no processing has been done
        var isLocal = HOST_REGEX.test(href)
        if (!isLocal) {
            return false;
        }

        // retrieves the localized version of the loading message so that it
        // may be used in the notification to be shown
        var loading = jQuery.uxlocale("Loading");

        // retrieves the reference to the notifications container element
        // and removes any message that is contained in it, avoiding any
        // duplicatd message display
        var container = jQuery(".header-notifications-container");
        container.empty();

        // creates the notification message that will indicate the loading
        // of the new panel and adds it to the notifications container
        var notification = jQuery("<div class=\"header-notification warning\"><strong>"
                + loading + "</strong></div>");
        container.append(notification);

        // runs the remove async call that will retrieve the partial contents
        // that will be used to change and re-populate the current dom, note
        // the extra async data parameter sent indicating that this is meant
        // to be handled differently (notably the redirection process)
        jQuery.ajax({
                    url : href,
                    dataType : "html",
                    data : {
                        async : 1
                    },
                    success : function(data, status, request) {
                        // verifies if the current result if of type (async) redirect, this
                        // is a special case and the redirection must be performed using a
                        // special strateg by retrieving the new location and setting it as
                        // new async contents to be loaded
                        var isRedirect = request.status == 280;
                        if (isRedirect) {
                            var hrefR = request.getResponseHeader("Location");
                            hrefR = jQuery.uxresolve(hrefR, href);
                            jQuery.ulinkasync(hrefR, false);
                            return;
                        }

                        // removes the loading notification, as the request has been
                        // completed with success (no need to display it anymore)
                        notification.remove();

                        // in case this is a verified operation the assync operations
                        // may pile up and so we must verify if the document location
                        // in the current document is the same as the document we're
                        // trying to retrieve, if it's not return immediately (ignore)
                        if (verify && document.location != href) {
                            return;
                        }

                        // retrieves the body element and uses it to trigger the data
                        // event indicating that new panel data is available and that
                        // the current layout must be updated (async fashion)
                        var _body = jQuery("body");
                        _body.triggerHandler("data", [data, href, !verify]);
                    },
                    error : function() {
                        document.location = href;
                    }
                });

        // returns valid as the link execution has been started
        // with success (async request sent)
        return true;
    };
})(jQuery);
