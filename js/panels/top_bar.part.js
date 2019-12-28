(function(jQuery) {
    jQuery.fn.utopbar = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // retrieves the reference to the body element
        var _body = jQuery("body");

        // retrieves the reference associated with the various content
        // related elements to be used in the toggle operation
        var contentBar = jQuery(".content-bar", matchedObject);
        var contentMargin = jQuery(".content-margin", matchedObject);

        // registers for the click on the top bar so that the side panels
        // are hiden on each of the clicks
        contentBar.click(function(event) {
            _body.removeClass("side-left-visible");
            _body.removeClass("side-right-visible");
        });

        // retrieves the reference to the handle associated with the
        // top bar and registers it for the click event to toggle the
        // visibility of the top bar
        var handle = jQuery(".top-bar-handle", matchedObject);
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

        // registers for the click in the header logo so that it's possible
        // to toggle side left visibility in the mobile layout
        var headerLogo = jQuery(".top-bar-logo .header-logo", matchedObject);
        headerLogo.click(function(event) {
            var isMobile = _body.hasClass("mobile-s");
            if (!isMobile) {
                return;
            }

            _body.toggleClass("side-left-visible");
            _body.removeClass("side-right-visible");
            event.preventDefault();
            event.stopPropagation();
        });

        return this;
    };
})(jQuery);
