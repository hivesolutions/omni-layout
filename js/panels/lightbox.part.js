(function(jQuery) {
    jQuery.fn.ulightbox = function(options) {
        // retrieves the currently matched object and the top
        // level body element also for general usage
        var matchedObject = this;
        var _body = jQuery("body");

        // adds the lightbox trigger class to the component
        // so that proper classes may be used
        matchedObject.addClass("lightbox-trigger")

        // register for the click event in the matched objects
        // to be able to extract the image
        matchedObject.click(function() {
                    // retrieves the current element to display the
                    // lightbox image for it
                    var element = jQuery(this);

                    // retrieves the url from the currently selected
                    // element ans then used it to retrieve the base
                    // url value from it (url extraction)
                    var url = element.attr("src");
                    var split = url.split("?");
                    var base = split[0];
                    var query = split.length > 1 ? split[1] : "";

                    // splits the current query string arroud its parts
                    // and creates a new list that will hold the various
                    // partss that are considered valid
                    var parts = query.split("&");
                    var valid = [];

                    // iterates over the current query string parts to
                    // removed the ones considered invalid
                    for (var index = 0; index < parts.length; index++) {
                        var part = parts[index];
                        var invalid = part.startsWith("size=")
                                || part.startsWith("fallback=");
                        if (invalid) {
                            continue;
                        }
                        valid.push(part);
                    }

                    // re-joins back the valid parts of the query string,
                    // this string will be used as extra parameters for
                    // the various images urls to be generated
                    var validQuery = valid.join("&");

                    // creates the new urls from the base one asking for
                    // a base image to be displayed instead of the small
                    // and then a large one for the "expanded mode"
                    var baseUrl = base + "?size=512&fallback=1&" + validQuery;
                    var largeUrl = base + "?size=original&fallback=1&"
                            + validQuery;

                    // shows the lightbox on the body element using the
                    // lightbox path retrieved from the image
                    _body.uxlightbox(baseUrl, null, largeUrl);

                    // retrieves the referece to the "possible" generated/new
                    // lightbox an in case it's not registered/marked starts
                    // the process of registering the proper handlers, this
                    // strategy avoids possible double registration of handlers
                    var lightbox = jQuery(".window-lightbox", _body);
                    var marked = lightbox.data("ulightbox");
                    if (marked) {
                        return;
                    }

                    // retrieves the reference to both buttons of the ligthbox
                    // these elements are going to be changed/prepared for animation
                    var buttons = jQuery(".button-confirm, .button-expand",
                            lightbox);

                    // registers the lightbox for the show event so that the
                    // buttons are properly animated according to their dimensions (required)
                    lightbox.bind("show", function() {
                                buttons.uxanimation();
                            });

                    // registers the lightbox for the loading event so that the
                    // buttons may be triggered for animation (animation start)
                    lightbox.bind("loading", function() {
                                buttons.uxanimation();
                            });

                    // registers the lightbox for the loaded event so that the
                    // buttons may be triggered for de-animation (animation stop)
                    lightbox.bind("loaded", function() {
                                buttons.uxanimation();
                            });

                    // "makrs" the lightbox element so that no more event registration
                    // will be done for the element (avoids duplicated registration)
                    lightbox.data("ulightbox", true);
                });

        // returns the object
        return this;
    };
})(jQuery);
