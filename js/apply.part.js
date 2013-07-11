(function(jQuery) {
    jQuery.fn.uapply = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // applies the async logic plugin to the current
        // matched object this should provide the structures
        // for the initial async execution
        matchedObject.uasync();

        // applies the configurations to the matched object
        // (global configurations)
        matchedObject.uconfigurations();

        // applies the top bar related configuations to the
        // current top level object
        matchedObject.utopbar();

        // starts the scan plugin system in the matched object
        // (this is going to be a global scan)
        matchedObject.uscan();

        // retrieves the menu elements for the the current
        // structure and applies the menu logic on it
        var menu = jQuery(".system-menu")
        menu.umenu();

        // retrieves the chat elements for the the current
        // structure and applies the chat logic on it
        var chat = jQuery(".chat", matchedObject)
        chat.uchat();

        // retrieves the eureka as the eureka and
        // then starts the eureka logic on it
        var eureka = jQuery(".eureka", matchedObject);
        eureka.ueureka();

        // retrieves the report as the report and
        // then starts the report logic on it
        var report = jQuery(".report", matchedObject);
        report.ureport();
    };
})(jQuery);
