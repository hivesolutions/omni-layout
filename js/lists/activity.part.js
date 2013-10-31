(function(jQuery) {
    jQuery.fn.uactivity = function(options) {
        // retrieve the current element as the matched object
        var matchedObject = jQuery(this);

        // iterates over all the element "inside" the currently matched
        // object to transfor them according to the specification
        matchedObject.each(function(index, element) {
            // retrieves the reference to the current element in iteration
            // and then "gathers" the complete set of items from it
            var _element = jQuery(this);
            var items = jQuery("> li", _element);

            // iterates over all the items present in the activity list
            // to populate them with the appropriate description values
            items.each(function(index, element) {
                // retrieves the current element in iteration and then uses it
                // to retrieve the various elements that compose it
                var _element = jQuery(this);
                var data = jQuery(".data", _element);
                var message = jQuery(".message", _element);
                var description = jQuery(".activity-list-description", _element);

                // retrieves the text value of the data element and then parses
                // it as json data so that a structure is created
                var dataS = data.text();
                var dataJ = jQuery.parseJSON(dataS);

                // unpacks the various values from the json parsed data and
                // then localizes the message to the target value
                var message = dataJ["message"];
                var arguments = dataJ["arguments"];
                message = jQuery.uxlocale(message);

                // formats the current message using the provided arguments
                // (uses dynamic function calling)
                message = String.prototype.formatC.apply(message, arguments);

                // performs the various transformation operations on the message
                // so that the rendered value is html compliant
                message = jQuery.utemplate(message);

                // updates the current description message with the appropriate
                // message after all the transformation operations are performed
                description.html(message);
            });

            // registers for the mouse leave event so that
            // the next elements have the next class added
            items.mouseenter(function() {
                        var _element = jQuery(this);
                        var next = _element.next();
                        next.addClass("next");
                    });

            // registers for the mouse leave event so that
            // the next elements have the next class removed
            items.mouseleave(function() {
                        var _element = jQuery(this);
                        var next = _element.next();
                        next.removeClass("next");
                    });
        })
    };
})(jQuery);
