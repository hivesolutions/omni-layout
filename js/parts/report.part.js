(function(jQuery) {
    jQuery.fn.ureport = function(options) {
        // the default value to be used when no number of
        // values to be printed in case the print mode is
        // currently active
        var MAX_RECORDS = 100000000;

        // sets the jquery matched object and the reference
        // to the parent document element
        var matchedObject = this;
        var _document = jQuery(document);

        // in case there's no matched object there's not need
        // to run the report initialization, global handlers
        // exist and may cause conflicts
        if (matchedObject.length == 0) {
            return;
        }

        // retieves the currently set search parameters present
        // in the url string (from the window object)
        var pathname = window.location.pathname;
        var pathname_l = pathname.length;

        // retrieves the extension from the path name and in case
        // the current extension refers a print document the print
        // report attribute is set
        var extension = pathname.slice(pathname_l - 4, pathname_l);
        if (extension == ".prt") {
            matchedObject.attr("data-print", 1);
        }

        // retrieves the various elements that componse the
        // current report contents, they are going to be used
        // for the various processing parts of the extension
        var buttons = jQuery(".report-header > .buttons", matchedObject);
        var links = jQuery("> a", buttons);
        var linkOptions = jQuery("> .link-options", buttons);
        var table = jQuery(".report-table > table", matchedObject);
        var headers = jQuery("thead > tr > th", table);
        var loading = jQuery(".report-loading", matchedObject);
        var location = jQuery(".report-location", matchedObject);
        var more = jQuery(".report-more", matchedObject);
        var options = jQuery(".options", matchedObject);
        var previous = jQuery(".previous", more);
        var next = jQuery(".next", more);
        var iconOptions = linkOptions.prev("img");

        // prepends the loader (indicator) to the loading section of the
        // report so that the proper animation is displayed in the screen
        loading.prepend("<div class=\"loader\"></div>");

        // updates the report location contents with the unset
        // value set, indicating that no page information is available
        location.html("-");

        // adds the hidden optins field to the options form so that the
        // options section is allways shown on submissions
        options.prepend("<input type=\"hidden\" name=\"options\" value=\"show\" />");

        // disables both the previous and the next buttons
        // to while no actions are available, on the next
        // update operation their status will be updated
        previous.uxdisable();
        next.uxdisable();

        // in case the there're no options panel defined for the current
        // report the options link and icons must be hidden and not displayed
        // as no interaction would be possible/visible
        options.length == 0 && linkOptions.hide() && iconOptions.hide();

        // schedules a timeout operation that is going to be
        // executed after this tick operation so that the
        // proper search (url) string is available for the
        // update of url values in a series of elements
        setTimeout(function() {
            // retrieves the path name for the current location
            // and uses it to update the options form submit information
            // so that it reflects the most up-to-date values
            var pathname = window.location.pathname;
            options.attr("method", "get");
            options.attr("action", pathname);

            // iterates over all the present links to update their
            // link values to match the arguments of the current request
            links.each(function(index, element) {
                var _element = jQuery(this);
                var href = _element.attr("href");
                var search = window.location.search;
                _element.attr("href", href + search);
            });
        });

        // retrieves the number of rows to be used in the table
        // associated with the report
        var print = matchedObject.attr("data-print");
        var count = matchedObject.attr("data-rows") || "30";
        count = print ? MAX_RECORDS : parseInt(count);
        matchedObject.data("count", count);
        matchedObject.data("page", 0);

        // in case the current mode is print the proper changes
        // for the layout are actioned and the print dialog is
        // shown in the screen
        if (print) {
            // retrieves the reference to the various elements
            // that are going to be changed for the print mode
            var header = jQuery(".header");
            var footer = jQuery(".footer");
            var topBar = jQuery(".top-bar");

            // adds the print class to the current report element
            matchedObject.addClass("print");

            // removes the various elements that are considered
            // not required from the print mode
            header.remove();
            footer.remove();
            topBar.remove();
        }

        // registers for the click event in the table headers so that a new
        // order direction may be provided to the or the reverse applied to
        // the contents of the current report, note that this registration
        // is not applied for a print environment
        !print && headers.click(function() {
            var element = jQuery(this);
            var currentOrder = matchedObject.data("order");
            var reverse = matchedObject.data("reverse") || false;
            var newOrder = element.attr("data-order");
            reverse = newOrder != currentOrder ? true : !reverse;
            matchedObject.data("reverse", reverse);
            matchedObject.data("order", newOrder);
            matchedObject.data("dirty", true);
            headers.removeClass("sorter");
            element.addClass("sorter");
            newOrder && update(matchedObject, options);
        });

        // registers for the key down event on the document in order
        // to provide easy of use shortcut for navigation
        matchedObject.length > 0 && _document.keydown(onKeyDown = function(event) {
            // sets the report as the matched object, provides
            // a compatability layer
            var report = matchedObject;

            // retrieves the key value
            var keyValue = event.keyCode ? event.keyCode : event.charCode ? event.charCode : event.which;

            // switches over the key value
            switch (keyValue) {
                // in case it's one of the next keys
                // (the right arrow or the 'j')
                case 39:
                case 74:
                    increment(report, options);

                    // breaks the switch
                    break;

                    // in case it's one of the previous keys
                    // (the left arrow or the 'k')
                case 37:
                case 75:
                    decrement(report, options);

                    // breaks the switch
                    break;

                    // in case it's default
                default:
                    // breaks the switch
                    break;
            }
        });
        matchedObject.bind("destroyed", function() {
            _document.unbind("keydown", onKeyDown);
        });

        // registers for the click operation in the options
        // link so that the options panel visibility is toggled
        linkOptions.click(function() {
            var element = jQuery(this);
            var report = element.parents(".report");
            var options = jQuery(".options", report);
            options.toggle();
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
            // the report to be used, will condition the update
            var count = matchedObject.data("count");
            var page = matchedObject.data("page");
            var order = matchedObject.data("order");
            var reverse = matchedObject.data("reverse");
            var dirty = matchedObject.data("dirty");
            var limit = matchedObject.data("limit");
            var items = matchedObject.data("items");

            // creates the sorter function for the update operation
            // taking into account the clojure around the order name
            var sorter = function(first, second) {
                var isNumber = typeof first == "number";
                if (isNumber) {
                    return first[order] - second[order];
                } else {
                    if (first[order] < second[order]) {
                        return -1;
                    }
                    if (first[order] > second[order]) {
                        return 1;
                    }
                    return 0;
                }
            };

            // runs the sorting operation for the current set of items
            // in cae the order value is defined (avoid extra delay)
            // and then reverses the order of the values (if requested)
            items = dirty && order ? items.sort(sorter) : items;
            items = dirty && reverse ? items.reverse() : items;

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

            // iterates over all the items in the set to be presented
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

            // updates the location string/label value with the new page
            // that has been selected (provide visual information)
            location.html(String(page + 1) + " / " + String(limit + 1));

            // unsets the dirty flag as the ordering (expensive) part of
            // the update has been correctly performed, no need to do it
            // again until the sorting order changes (performance issue)
            // then saves the new items reference in the structure
            matchedObject.data("dirty", false);
            matchedObject.data("items", items);
        };

        var print = function() {
            // shows the print dialog window to start the print
            // procedure, only uppon the complete loading
            var print = matchedObject.attr("data-print");
            print && window.print();
        };

        var limits = function(matchedObject, options) {
            var items = matchedObject.data("items");
            var count = matchedObject.data("count");
            var limit = Math.ceil(items.length / count) - 1;
            limit = limit > 0 ? limit : 0;

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
            matchedObject.addClass("loading");
            dataSource.uxdataquery({}, function(validItems, moreItems) {
                matchedObject.removeClass("loading");
                matchedObject.data("items", validItems);
                limits(matchedObject, options);
                update(matchedObject, options);
                print(matchedObject, options);
            });
        };

        load(matchedObject, options);
    };
})(jQuery);
