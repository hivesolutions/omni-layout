(function(jQuery) {
    jQuery.fn.usidebaropen = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // registers for the click in the sidebar open so that it's possible
        // to ensure side right visibility
        matchedObject.click(function(event) {
            var _body = jQuery("body");
            _body.addClass("side-right-visible");
            event.preventDefault();
            event.stopPropagation();
        });
    };
})(jQuery);
