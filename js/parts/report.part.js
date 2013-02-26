(function(jQuery) {
    jQuery.fn.ureport = function(options) {
        // sets the jquery matched object and the reference
        // to the parent document element
        var matchedObject = this;
        var _document = jQuery(document);

        // retrieves the various element that componse the
        // current report contents
        var location = jQuery(".report-location", matchedObject);
        var more = jQuery(".report-more", matchedObject);
        var previous = jQuery(".previous", more);
        var next = jQuery(".next", more);

        // updates the report location contents with the unset
        // value set, indicating that no page information is available
        location.html("-");

        // disables both the previous and the next buttons
        // to while no actions are available, on the next
        // update operation their status will be updated
        previous.uxdisable();
        next.uxdisable();

        // retrieves the number of rows to be used in the table
        // associated with the report
        var count = matchedObject.attr("data-rows") || "30";
        count = parseInt(count);
        matchedObject.data("count", count);
        matchedObject.data("page", 0);

        // registers for the key down event on the document in order
        // to provide easy of use shortcut for navigation
        _document.keydown(function(event) {
                    // sets the report as the matched object, provides
                    // a compatability layer
                    var report = matchedObject;

                    // retrieves the key value
                    var keyValue = event.keyCode
                            ? event.keyCode
                            : event.charCode ? event.charCode : event.which;

                    // switches over the key value
                    switch (keyValue) {
                        // in case it's one of the next keys
                        // (the right arrow or the 'j')
                        case 39 :
                        case 74 :
                            increment(report, options);

                            // breaks the switch
                            break;

                        // in case it's one of the previous keys
                        // (the left arrow or the 'k')
                        case 37 :
                        case 75 :
                            decrement(report, options);

                            // breaks the switch
                            break;

                        // in case it's default
                        default :
                            // breaks the switch
                            break;
                    }
                });

        // registers for the click even on the previous
        // button to decrement one page
        previous.click(function() {
                    var element = jQuery(this);
                    var report = element.parents(".report");
                    decrement(report, options);
                });

        // registers for the click even on the next
        // button to increment one page
        next.click(function() {
                    var element = jQuery(this);
                    var report = element.parents(".report");
                    increment(report, options);
                });

        var update = function(matchedObject, options) {
            // retrieves the various element that componse the
            // current report contents
            var table = jQuery(".report-table > table", matchedObject);
            var tableBody = jQuery("tbody", table);
            var template = jQuery("tr.template", table);
            var location = jQuery(".report-location", matchedObject);
            var more = jQuery(".report-more", matchedObject);
            var previous = jQuery(".previous", more);
            var next = jQuery(".next", more);

            // retrieves the current configuration values for
            // the report to be used
            var count = matchedObject.data("count");
            var page = matchedObject.data("page");
            var limit = matchedObject.data("limit");
            var items = matchedObject.data("items");

            // calculates the offset position from the current
            // page and sets the end value using it then calculated
            // the maximum index value from the minimum of the end
            // and items length values
            var offset = page * count;
            var end = offset + count;
            var max = items.length < end ? items.length : end;

            // retrieves the current set of valid rows from the
            // table and removes them from the current view
            var rows = jQuery("tr:not(.template)", tableBody);
            rows.remove();

            // starts the list that will hold the various rendered
            // items to be added to the table body at the end
            var _items = [];

            // iterates over all the item in the set to be presented
            // for the current report page
            for (var index = offset; index < max; index++) {
                var current = items[index];
                var item = template.uxtemplate(current);
                _items.push(item[0]);
            }

            // adds the various table items to the table body at one
            // single operation (performance is improved)
            tableBody.append(_items);

            // in cae the current page is the first one the previous
            // button must be disabled otherwise it's enabled
            if (page == 0) {
                previous.uxdisable();
            } else {
                previous.uxenable();
            }

            // in cae the current page is the last one the next
            // button must be disabled otherwise it's enabled
            if (page == limit) {
                next.uxdisable();
            } else {
                next.uxenable();
            }

            location.html(String(page + 1) + " / " + String(limit + 1))
        };

        var limits = function(matchedObject, options) {
            var items = matchedObject.data("items");
            var count = matchedObject.data("count");
            var limit = items.length / count;
            limit = parseInt(limit);

            matchedObject.data("limit", limit);
        };

        var decrement = function(matchedObject, options) {
            var page = matchedObject.data("page");
            if (page == 0) {
                return;
            }
            page--;
            matchedObject.data("page", page);
            update(matchedObject, options)
        };

        var increment = function(matchedObject, options) {
            var page = matchedObject.data("page");
            var limit = matchedObject.data("limit");
            if (page == limit) {
                return;
            }
            page++;
            matchedObject.data("page", page);
            update(matchedObject, options)
        };

        var load = function(matchedObject, options) {
            var dataSource = jQuery(".report-table > .data-source",
                    matchedObject);
            dataSource.uxdataquery({}, function(validItems, moreItems) {
                        matchedObject.data("items", validItems);
                        limits(matchedObject, options);
                        update(matchedObject, options);
                    });
        };

        load(matchedObject, options);
    };
})(jQuery);
