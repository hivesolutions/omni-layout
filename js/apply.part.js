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

        // filters the menu elements from the current structure
        // structure and applies the menu logic on it
        var menu = matchedObject.filter(".system-menu");
        menu.umenu();

        // retrieves the menu elements for the the current
        // structure and applies the menu logic on it
        var menu = jQuery(".system-menu", matchedObject);
        menu.umenu();

        // retrieves the chat elements for the the current
        // structure and applies the chat logic on it
        var chat = jQuery(".chat", matchedObject)
        chat.uchat();

        // retrieves the notifications (menu) as the notifications
        // (panel) and then starts the notifications logic on it
        var notifications = jQuery(".notifications-menu", matchedObject);
        notifications.unotifications();

        // retrieves the eureka as the eureka and
        // then starts the eureka logic on it
        var eureka = jQuery(".eureka", matchedObject);
        eureka.ueureka();

        // retrieves the summary as the summary and
        // then starts the summary logic on it
        var summary = jQuery(".summary", matchedObject);
        summary.usummary();

        // retrieves the report as the report and
        // then starts the report logic on it
        var report = jQuery(".report", matchedObject);
        report.ureport();

        // retrieves the activity (list) element and starts
        // it with the activity logic (post processing)
        var activty = jQuery(".activity-list", matchedObject);
        activty.uactivity();

        // retrieves the sidebar sections as the set of side
        // elements to be processed with the proper extension
        var side = jQuery(".sidebar-section", matchedObject);
        side.uside();

        // retrieves the reference to the various images that are
        // going to be used as lightbox triggers
        var image = jQuery(".lightbox-trigger, .entity-big-picture > img",
            matchedObject);
        image.ulightbox();
    };
})(jQuery);
