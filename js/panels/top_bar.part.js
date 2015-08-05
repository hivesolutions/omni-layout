(function(jQuery) {
    jQuery.fn.utopbar = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // retrieves the reference associated with the various content
        // related elements to be used in the toggle operation
        var contentBar = jQuery(".content-bar", matchedObject);
        var contentMargin = jQuery(".content-margin", matchedObject);

        // retrieves the reference to the handle associated with the
        // top bar and registers it for the click event to toggle the
        // visibility of the top bar
        var handle = jQuery(".top-bar-handle", matchedObject)
        handle.click(function() {
                    var element = jQuery(this);
                    var slider = element.parents(".top-bar-slider");

                    var isUp = element.hasClass("up");
                    if (isUp) {
                        contentBar.removeClass("visible");
                        contentMargin.removeClass("visible");
                        slider.removeClass("visible");
                        element.removeClass("up");
                    } else {
                        contentBar.addClass("visible");
                        contentMargin.addClass("visible");
                        slider.addClass("visible");
                        element.addClass("up");
                    }
                });

        return this;
    };
})(jQuery);
