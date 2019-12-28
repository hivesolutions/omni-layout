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

        // registers for the hide modal event so that both side parts are properly
        // removed from the viewport on such ocasion (as expected)
        matchedObject.length > 0 && _body.bind("hide_modal", onHideModal = function() {
            _body.removeClass("side-right-visible");
            _body.removeClass("side-left-visible");
        });
        matchedObject.bind("destroyed", function() {
            _body.unbind("hide_modal", onHideModal);
        });
    };
})(jQuery);
