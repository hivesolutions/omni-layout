(function(jQuery) {
    jQuery.fn.usummary = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // in case the matched object is not defined
        // or in case it's an empty list must return
        // immediatly initialization is not meant to
        // be run (corruption may occur)
        if (!matchedObject || matchedObject.length == 0) {
            return;
        }


    };
})(jQuery);
