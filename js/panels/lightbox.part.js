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
                    var base = url.split("?")[0];

                    // creates the new url from the base one asking for
                    // a large image to be displayed instead of the small
                    var largeUrl = base + "?size=512&fallback=1";

                    // shows the lightbox on the body element using the
                    // lightbox path retrieved from the image
                    _body.uxlightbox(largeUrl);
                });

        // returns the object
        return this;
    };
})(jQuery);
