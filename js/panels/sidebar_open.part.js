(function(jQuery) {
    jQuery.fn.usidebaropen = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // retrieves the reference to the body element
        var _body = jQuery("body");

        // registers for the click in the sidebar open so that it's possible
        // to ensure side right visibility
        matchedObject.click(function(event) {
            _body.addClass("side-right-visible");
        });
    };
})(jQuery);
