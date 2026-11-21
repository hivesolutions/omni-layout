(function(jQuery) {
    jQuery.fn.uscanlines = function(method, options) {
        /**
         * The set of CIDs that represent product based entities (or compatible
         * ones), the ones that may be added to the lines.
         */
        var PRODUCT_CIDS = [14, 24, 25, 26, 27];

        // the default values for the scan lines
        var defaults = {};

        // sets the default method value
        var method = method ? method : "default";

        // sets the default options value
        var options = options ? options : {};

        // constructs the options
        options = jQuery.extend(defaults, options);

        // sets the jquery matched object
        var matchedObject = this;

        // retrieves the logger of the plugin, to be used
        // to log the handling of the scans by the lines
        var logger = jQuery.uxlogger("uscanlines");

        /**
         * Initializer of the plugin, runs the necessary functions to initialize
         * the structures.
         */
        var initialize = function() {
            _appendHtml();
            _registerHandlers();
        };

        /**
         * Creates the necessary html for the component.
         */
        var _appendHtml = function() {};

        /**
         * Registers the event handlers for the created objects.
         */
        var _registerHandlers = function() {
            // in case there's no matched object there's not need to
            // register the handlers, global handlers exist and may
            // cause conflicts (eg: the scans handled with no lines)
            if (!matchedObject || matchedObject.length === 0) {
                return;
            }

            // retrieves the reference to the document element
            // to be used for the scan registration
            var _document = jQuery(document);

            // the handlers bound on the document, kept so that
            // they are unbound once the lines are destroyed
            var onUScan = null;
            var onScan = null;

            // registers for the scan operation in the document
            // so that structured scans are gathered as products
            _document.bind("uscan",
                onUScan = function(event, version, classId, objectId) {
                    // in case the scanned entity is a product (or compatible)
                    // adds one more unit of it to the lines, otherwise logs that
                    // the scan is not handled (not a product)
                    var isProduct = PRODUCT_CIDS.indexOf(classId) !== -1;
                    if (isProduct) {
                        logger.info("Scan handling as:", "Product");
                        _queueProduct(matchedObject, options, objectId);
                    } else {
                        logger.info("Scan not handled by lines:", classId);
                    }

                    // raises an empty exception to avoid the scanning
                    // process from completing the redirection, which
                    // would leave the page (and the lines not saved)
                    throw jQuery.uxexception();
                });
            matchedObject.bind("destroyed", function() {
                _document.unbind("uscan", onUScan);
            });

            // registers for the scan operation in the document
            // so that unstructured scans are gathered as products
            _document.bind("scan", onScan = function(event, value) {
                // in case the scan event has already been handled
                // by the uscan infra-structure must ignore it, other
                // handling structures will be used
                if (event.uscan) {
                    return;
                }

                // sets the uscan attribute in the event so that the uscan
                // infra-structure does not resolve the barcode value as the
                // code of a merchandise, as it's handled by the lines
                event.uscan = true;

                // adds one more unit of the merchandise represented
                // by the scanned code to the lines
                _queueProduct(matchedObject, options, null, value);
            });
            matchedObject.bind("destroyed", function() {
                _document.unbind("scan", onScan);
            });
        };

        var _queueProduct = function(matchedObject, options, objectId, code) {
            // retrieves the names of the fields that must be set before
            // scanning (eg: the origin of a transfer, that limits the
            // quantities) and verifies that each of them has a value in
            // the data of the form, in case one doesn't the user is notified
            // and the function returns immediately (the scan is refused)
            var data = _getData(matchedObject, options);
            var sources = matchedObject.attr("data-sources");
            sources = sources ? sources.split(",") : [];
            for (var index = 0; index < sources.length; index++) {
                var isSet = false;
                for (var _index = 0; _index < data.length; _index++) {
                    var isSource = data[_index]["name"] === sources[index];
                    isSet = isSet || (isSource && Boolean(data[_index]["value"]));
                }
                if (!isSet) {
                    logger.info("Product without source:", sources[index]);
                    jQuery.unotify(matchedObject.data("title"), matchedObject.data("no_source"),
                        "warning");
                    return;
                }
            }

            // adds the scan to the queue of the scans of the lines, so that they
            // are handled in the order they were made (each one adding one unit),
            // and in case it's the only one (no lookup is pending) handles it
            var scans = matchedObject.data("scans") || [];
            scans.push({
                object_id: objectId,
                code: code
            });
            matchedObject.data("scans", scans);
            scans.length === 1 && _handleProduct(matchedObject, options);
        };

        var _handleProduct = function(matchedObject, options) {
            // retrieves the first scan of the queue, the one to be handled
            var scans = matchedObject.data("scans");
            var scan = scans[0];

            // builds the data to be sent in the lookup from the data of the
            // form, so that the operation is built as when it's saved, adding
            // to it the code of the merchandise (eg: the EAN as scanned) in
            // case it's defined, otherwise its object identifier
            var data = _getData(matchedObject, options);
            if (scan["code"]) {
                data.push({
                    name: "code",
                    value: scan["code"]
                });
            } else {
                data.push({
                    name: "merchandise_id",
                    value: scan["object_id"]
                });
            }

            // runs the remote query to retrieve the merchandise for the
            // code or object identifier, with the information of the
            // operation about it (if it may be added and its limit)
            jQuery.uquery({
                url: matchedObject.attr("data-lookup_url"),
                data: data,
                success: function(data) {
                    // adds one more unit of the merchandise to the lines
                    // and handles the next scan of the queue (if any)
                    _addProduct(matchedObject, options, data, scan["code"] || scan["object_id"]);
                    _nextProduct(matchedObject, options);
                },
                error: function(xhr, status, error) {
                    // logs the failure, notifies the user of it and handles
                    // the next scan of the queue (if any), as the failure
                    // only applies to the scan of this merchandise
                    logger.error("Product with failed lookup:", scan["code"] || scan["object_id"],
                        status, error);
                    jQuery.unotify(matchedObject.data("title"),
                        jQuery.uxlocale("Product lookup failed, scan it again"), "error");
                    _nextProduct(matchedObject, options);
                }
            });
        };

        var _nextProduct = function(matchedObject, options) {
            // removes the handled scan from the queue and handles
            // the next one in case there's any left
            var scans = matchedObject.data("scans");
            scans.shift();
            scans.length > 0 && _handleProduct(matchedObject, options);
        };

        var _addProduct = function(matchedObject, options, data, value) {
            // in case no merchandise is retrieved notifies the user
            // that the product was not found and returns immediately
            var merchandise = data["merchandise"];
            if (!merchandise) {
                logger.info("Product not found:", value);
                jQuery.unotify(matchedObject.data("title"), jQuery.uxlocale("Product not found"),
                    "error");
                return;
            }

            // in case the merchandise may not be added to the lines of the
            // operation (eg: a service in a transfer) notifies the user and
            // returns immediately
            if (!data["available"]) {
                logger.info("Product not available:", value);
                jQuery.unotify(matchedObject.data("title"), matchedObject.data("not_available"),
                    "warning");
                return;
            }

            // retrieves the line of the merchandise (the first one in case it's
            // repeated) and the first line without a merchandise (eg: the empty
            // line of a new table), gathering the total quantity of the lines of
            // the merchandise with the one more unit of the scan, rounded to the
            // decimal places of the quantities of the merchandise
            var tableBody = jQuery("tbody", matchedObject);
            var rows = jQuery("> tr:not(.template)", tableBody);
            var row = null;
            var emptyRow = null;
            var total = 1;
            rows.each(function(index, element) {
                var _element = jQuery(this);
                var merchandiseE = jQuery(".scan-merchandise > .hidden-field", _element);
                var quantityE = jQuery(".scan-quantity", _element);
                var objectId = merchandiseE.val();
                if (!objectId) {
                    emptyRow = emptyRow || _element;
                    return;
                }
                if (objectId !== String(merchandise["object_id"])) {
                    return;
                }
                row = row || _element;
                total += parseFloat(quantityE.uxvalue()) || 0;
            });
            total = jQuery.uxround(total, merchandise["quantity_places"] || 0);

            // in case the total quantity exceeds the limit of the merchandise
            // in the operation (eg: its stock in the origin of a transfer)
            // notifies the user and returns immediately (the lines are not
            // changed)
            var limit = data["limit"];
            if (limit !== null && limit !== undefined && total > limit) {
                logger.info("Product above the limit:", value, limit);
                jQuery.unotify(matchedObject.data("title"), matchedObject.data("message"),
                    "warning");
                return;
            }

            // in case the merchandise is not in the lines it's set in the empty
            // line (if any) or in a new line, created by the table as when the
            // line is added by the user, removing the marks of the default line
            // (as when it's typed in) so that it's submitted, with one unit
            var quantity = 1;
            if (!row) {
                row = emptyRow || _newLine(matchedObject, options);
                var merchandiseField = jQuery(".scan-merchandise", row);
                merchandiseField.uxdropfield("set", {
                    value: merchandise["company_product_code"],
                    valueLogic: merchandise["object_id"]
                });
                row.removeClass("table-default-field");
                row.removeClass("table-untouched-field");
            }

            // otherwise adds one more unit to the quantity of the line of the
            // merchandise, rounded to the decimal places of its quantities
            else {
                var quantityE = jQuery(".scan-quantity", row);
                quantity = parseFloat(quantityE.uxvalue()) || 0;
                quantity = jQuery.uxround(quantity + 1, merchandise["quantity_places"] || 0);
            }

            // sets the quantity in the line, raising its change so that the
            // values that depend on it (eg: the totals) are evaluated again,
            // and marks it as the focused one (without focusing it, so that
            // the next scan is a scan and not typed into the field)
            var quantityField = jQuery(".scan-quantity", row);
            quantityField.uxvalue(quantity);
            quantityField.change();
            quantityField.umark();
        };

        var _getData = function(matchedObject, options) {
            // retrieves the values of the fields of the form that are sent by
            // its submission (not the ones of the lines, nor the ones of the
            // default lines and the empty fields of the tables and tag fields)
            var form = matchedObject.parents("form");
            var lines = jQuery("input", matchedObject);
            var defaultLines = jQuery(".table-default-field input", form);
            var fields = jQuery("input, textarea", form).not(lines).not(defaultLines).not(
                ".table-empty-field, .tag-empty-field");
            var data = fields.serializeArray();

            // adds the values of the tags of the tag fields (eg: the purchases
            // of a supplier return), as their fields are only created when the
            // form is submitted, as the value of the field named after them
            var tagFields = jQuery(".tag-field[name]", form);
            tagFields.each(function(index, element) {
                var _element = jQuery(this);
                var tags = jQuery(".tag-field-tag", _element);
                tags.each(function(index, element) {
                    var tag = jQuery(this);
                    data.push({
                        name: _element.attr("name"),
                        value: tag.attr("data-value") || tag.attr("data-display")
                    });
                });
            });

            // returns the values of the fields of the form
            return data;
        };

        var _newLine = function(matchedObject, options) {
            // adds a new line to the table through its add line button, as
            // done by the user, and returns it (the last one of the table)
            var newLine = jQuery(".table-new-line", matchedObject);
            newLine.click();
            var rows = jQuery("tbody > tr:not(.template)", matchedObject);
            var row = jQuery(rows.get(rows.length - 1));
            return row;
        };

        // switches over the method
        switch (method) {
            case "default":
                // initializes the plugin
                initialize();

                // breaks the switch
                break;
        }

        // returns the object
        return this;
    };
})(jQuery);
