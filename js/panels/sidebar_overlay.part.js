(function(jQuery) {
    jQuery.fn.usidebaroverlay = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // registers for the click in the sidebar overlay so that it's possible
        // to toggle side left visibility in the mobile layout
        matchedObject.click(function(event) {
            var _body = jQuery("body");
            var isMobile = _body.hasClass("mobile-s");
            if (!isMobile) {
                return;
            }

            _body.toggleClass("side-left-visible");
            event.preventDefault();
            event.stopPropagation();
        });
    };
})(jQuery);
