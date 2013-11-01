(function(jQuery) {
    jQuery.fn.uactivity = function(options) {
        // retrieve the current element as the matched object
        var matchedObject = jQuery(this);

        // retrieves the reference to the body element and uses
        // it to retrieve the mvc path and the class id url map
        var _body = jQuery("body");
        var mvcPath = _body.data("mvc_path");
        var classIdUrl = _body.data("class_id_url");

        // retrieves the current date and uses it to retrieve the current
        // timestamp value (according to the utf format)
        var date = new Date();
        var current = date.getTime();

        // iterates over all the element "inside" the currently matched
        // object to transfor them according to the specification
        matchedObject.each(function(index, element) {
            // retrieves the reference to the current element in iteration
            // and then "gathers" the complete set of items from it and the
            // complete set of links contained in them
            var _element = jQuery(this);
            var items = jQuery("> li", _element);
            var links = jQuery(".link", items);

            // iterates over all the items present in the activity list
            // to populate them with the appropriate description values
            items.each(function(index, element) {
                // retrieves the current element in iteration and then uses it
                // to retrieve the various elements that compose it
                var _element = jQuery(this);
                var data = jQuery(".data", _element);
                var time = jQuery(".time", _element);
                var description = jQuery(".activity-list-description", _element);

                // retrieves the current string value from the time field and
                // tries to parse it as a float value (as defined by specification)
                var timeS = time.text();
                var timeF = parseFloat(timeS);

                // calculates the diff by calculating the difference between
                // the current timestamp and the create date of the notification
                // and then converts it into the appropriate date string
                var diff = (current / 1000.0) - timeF;
                var diffS = jQuery.udates(diff);

                // updates the time element with the newly created diff
                // string that is not going to represent the element
                time.html(diffS);

                // retrieves the text value of the data element and then parses
                // it as json data so that a structure is created
                var dataS = data.text();
                var dataJ = jQuery.parseJSON(dataS);

                // unpacks the various values from the json parsed data and
                // then localizes the message to the target value
                var message = dataJ["message"];
                var arguments = dataJ["arguments"];
                var meta = dataJ["meta"];
                message = jQuery.uxlocale(message);

                // retrieves the target as the first element of the meta attributes
                // and then unpacks it as the cid (class id) and the object id of
                // the target entity associated with the notification
                var target = meta[0];
                var cid = target[0];
                var objectId = target[1];

                // creates the base url from the mvc path and the class id url
                // resolved using the proper map and then creates the full link value
                // by adding the target entity object id
                var baseUrl = mvcPath + classIdUrl[cid];
                var link = baseUrl + objectId;

                // formats the current message using the provided arguments
                // (uses dynamic function calling)
                message = String.prototype.formatC.apply(message, arguments);

                // performs the various transformation operations on the message
                // so that the rendered value is html compliant
                message = jQuery.utemplate(message, true);

                // updates the current description message with the appropriate
                // message after all the transformation operations are performed
                description.html(message);

                // sets the data link attribute in the element and then starts it
                // as a button so that the proper click handler are created
                _element.attr("data-link", link);
                _element.uxbutton();
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

            // registers for the click event in the link items
            // so that no propagation is done in the event
            links.click(function(event) {
                        event.stopPropagation();
                    });
        });
    };
})(jQuery);
