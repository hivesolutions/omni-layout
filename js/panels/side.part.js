(function(jQuery) {
    jQuery.fn.uside = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // iterates over all the side elements to correctly
        // process them so that their display is apropriate
        matchedObject.each(function(index, element) {
            // retrieves the current side element in iteration
            // that is going to be processed accordint to its links
            var _element = jQuery(this);

            // retieves the list of links in the element and
            // validations if it exists in case it does not
            // returns immediately so that the next iteration
            // cycle starts and new elements are processed
            var linksList = jQuery(".links-list", _element);
            if (linksList.length == 0) {
                return;
            }

            // retrieves the complete set of children of the
            // current links list in case at least one exists
            // continues the loop nothing to be done
            var links = linksList.children();
            if (links.length != 0) {
                return;
            }

            // hides the current side element as there are no
            // links under its links list
            _element.hide();
        });
    };
})(jQuery);
