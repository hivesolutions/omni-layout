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

        // retrieves the eureka as the eureka and
        // then starts the eurke logic on it
        var eureka = jQuery(".eureka", matchedObject);
        eureka.ueureka();
    };
})(jQuery);
