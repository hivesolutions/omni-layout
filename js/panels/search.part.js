(function(jQuery) {
    jQuery.fn.usearch = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // in case the matched object is not defined
        // or in case it's an empty list must return
        // immediately initialization is not meant to
        // be run (corruption may occur)
        if (!matchedObject || matchedObject.length === 0) {
            return;
        }

        // retrieves the reference to the top level body element
        // and the overlay panel of the eureka, that is page-wide
        // and so retrieved from the body, as the windows are
        var _body = jQuery("body");
        var overlayPanel = jQuery(".overlay-search", _body);

        // retrieves the button of the search menu and registers
        // for the click on it to show the overlay panel of the
        // eureka, as its (ctrl) key shows it
        var button = jQuery(".menu-button", matchedObject);
        button.click(function() {
            overlayPanel.triggerHandler("show");
        });

        // starts the variables that are going to store the handlers of
        // the shown and hidden events of the overlay panel, so that they
        // are unregistered once the search menu is destroyed
        var onShown = null;
        var onHidden = null;

        // registers for the shown and hidden events of the overlay panel
        // so that the search menu is marked as active while the eureka is
        // visible, whether it was shown by the button or by the key
        overlayPanel.bind("shown", onShown = function() {
            matchedObject.addClass("active");
        });
        overlayPanel.bind("hidden", onHidden = function() {
            matchedObject.removeClass("active");
        });
        matchedObject.bind("destroyed", function() {
            overlayPanel.unbind("shown", onShown);
            overlayPanel.unbind("hidden", onHidden);
        });
    };
})(jQuery);
