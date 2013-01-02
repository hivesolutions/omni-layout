(function($) {
    jQuery.fn.uapply = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // applies the configurations to the matched object
        // (global configurations)
        matchedObject.uconfigurations();

        // starts the scan plugin system in the matched object
        // (this is going to be a global scan)
        matchedObject.uscan();

        // retrieves the menu elements for the the current
        // structure and applies the menu logic on it
        var menu = jQuery(".menu")
        menu.umenu();

        // retrieves the chat elements for the the current
        // structure and applies the chat logic on it
        var chat = jQuery(".chat")
        chat.uchat();

        // retrieves the eureka as the eureka and
        // then starts the eurka logic on it
        var eureka = jQuery(".eureka", matchedObject);
        eureka.ueureka();
    };
})(jQuery);
