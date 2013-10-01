(function(jQuery) {
    jQuery.fn.usummary = function(options) {
        /**
         * The list containing the various string describing the valus that are
         * going to be part of the summary section.
         */
        var VALUES = ["count", "sum", "average"];

        /**
         * The localized version of the various string values that describe the
         * values that are going to be part of the summary.
         */
        var VALUES_LOCALE = jQuery.uxlocale(VALUES);

        // sets the jquery matched object
        var matchedObject = this;

        // in case the matched object is not defined
        // or in case it's an empty list must return
        // immediatly initialization is not meant to
        // be run (corruption may occur)
        if (!matchedObject || matchedObject.length == 0) {
            return;
        }

        // iterates over each of the summary elements to register
        // each of them for their properties and operations
        matchedObject.each(function(index, element) {
            // retrieves the reference to the current element
            // (summary element) to be used
            var _element = jQuery(this);

            // retrieves the reference string to be used to select
            // the reference element that will be used in operations
            var reference = _element.attr("data-reference");
            var element = jQuery(reference);

            // creates the sidebar list element and then iterates over
            // the complete set of values that are going to be used to
            // populate the various key value relations contained in it
            var sidebarList = jQuery("<ul class=\"sidebar-list\"></ul>");
            for (var index = 0; index < VALUES.length; index++) {
                var value = VALUES[index];
                var valueL = VALUES_LOCALE[index];
                var item = jQuery("<li class=\"" + value + "\">"
                        + "<span class=\"key\">" + valueL + "</span>"
                        + "<span class=\"value\"></span>"
                        + "<div class=\"sidebar-clear\"></div>" + "</li>");
                sidebarList.append(item)
            }

            // adds the complete set of contents in the sidebar list to
            // the summary element (required by definition)
            _element.append(sidebarList);

            // retrieves the reference to the various element that are going
            // to be used latter in the populate operations
            var countElement = jQuery(".count > .value", _element);
            var sumElement = jQuery(".sum > .value", _element);
            var averageElement = jQuery(".average > .value", _element);

            // hides the panel as this is the default behavior
            // to be used for the summary
            _element.hide();

            // registers for the slected event in the target element
            // so that the proper values are updated for the summary
            element.bind("selected", function(event, elements) {
                        // verifies if the summary element is meant to be shown
                        // or hidden (set visible or not)
                        var isVisible = elements.length > 1;

                        // retrieves the number of element that have been
                        // selected and then starts the sum value to zero
                        var count = elements.length;
                        var sum = 0;

                        // iterates over each of the elements in order to
                        // gather the ammount value that is going to be
                        // used for the calculus, this uses a strategy of
                        // finding the last number value in the target
                        elements.each(function(index, element) {
                                    var _element = jQuery(this);
                                    var numbers = jQuery(".number", _element);
                                    var length = numbers.length;
                                    var target = jQuery(numbers[length - 1]).html();
                                    var value = parseFloat(target);
                                    sum += value;
                                });

                        // calculates the average value by deviding the complete
                        // sum over the total count of elements
                        var average = sum / count;

                        // converts the various values into the appropriate string
                        // representation for each of them
                        var countS = count.toString();
                        var sumS = sum.toFixed(2);
                        var averageS = average.toFixed(2);

                        // sets the various valus in the corresponding target elements
                        // so that the update values are set
                        countElement.uxvalue(countS);
                        sumElement.uxvalue(sumS);
                        averageElement.uxvalue(averageS);

                        // shows or hides the element according to the
                        // pre-defined element value
                        if (isVisible) {
                            _element.show();
                        } else {
                            _element.hide();
                        }
                    });
        });
    };
})(jQuery);
