(function(jQuery) {
    jQuery.fn.usidebaropen = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // retrieves the reference to the body element
        var _body = jQuery("body");

        // checks if the side bar open value is already
        // registered in the body and sets the variable as
        // true to avoid further registrations
        var isRegistered = _body.data("sidebar_open");
        _body.data("sidebar_open", true);

        // registers for the click in the sidebar open so that it's possible
        // to ensure side right visibility
        matchedObject.click(function(event) {
            _body.triggerHandler("hide_modal");
            _body.addClass("side-right-visible");
        });

        // registers for the global hide modal event
        // so that the side panels are properly hidden
        !isRegistered && _body.bind("hide_modal", function() {
            console.info("hide_modal");
            _body.removeClass("side-right-visible");
            _body.removeClass("side-left-visible");
        });
    };
})(jQuery);
