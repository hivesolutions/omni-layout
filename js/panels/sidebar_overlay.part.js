(function(jQuery) {
    jQuery.fn.usidebaroverlay = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // retrieves the reference to the body element
        var _body = jQuery("body");

        // registers for the click in the sidebar overlay so that it's possible
        // to hide side left and right visibility
        matchedObject.click(function(event) {
            _body.removeClass("side-left-visible");
            _body.removeClass("side-right-visible");
            event.preventDefault();
            event.stopPropagation();
        });
    };
})(jQuery);
