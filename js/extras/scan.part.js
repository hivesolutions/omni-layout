(function($) {
    jQuery.fn.uscan = function(options) {
        /**
         * The length of the code to be scanned this value should be defined in
         * accordance with the defined specification.
         */
        var SCAN_CODE_LENGTH = 22;

        /**
         * The list of integer based versions that are compatible with the
         * client scan implementation.
         */
        var COMPATIBLE_VERSIONS = [1];

        // sets the jquery matched object
        var matchedObject = this;

        // retrieves the reference to the top level
        // document and body elements
        var _document = jQuery(document);
        var _body = jQuery("body");

        // registers for the scan event in the document
        // to be able to react to it
        _document.bind("scan", function(event, value) {
                    // retrieves the current element that is the
                    // target of the scan operation
                    var element = jQuery(this);

                    // retrieves the mvc path and the class id url
                    // map for the current page
                    var mvcPath = _body.data("mvc_path");
                    var classIdUrl = _body.data("class_id_url");

                    // verifies that the size of the code legnth
                    // is of the expected size, otherwise returns
                    // immediately not an expected code
                    if (value.length != SCAN_CODE_LENGTH) {
                        return;
                    }

                    // retrieves the checksum for the barcode value
                    // in order to verify it against the base buffer
                    // value and in case the verification fails returns
                    // immediately (not a valid barcode)
                    var checksumS = value.slice(0, 4);
                    var buffer = value.slice(4);
                    var _checksumS = checksum(buffer);
                    if (_checksumS != checksumS) {
                        return;
                    }

                    // retrieves the version of the barcode then
                    // retrieves the class of the object that is
                    // represented by the barcode and then retrieves
                    // the identifier of the object
                    var version = value.slice(4, 6);
                    var classId = value.slice(6, 10);
                    var objectId = value.slice(10);

                    // converts the version into an integer
                    // to be used in the resolution and verifies that
                    // the "generated" integer is valid
                    var versionInt = parseInt(version);
                    if (isNaN(versionInt)) {
                        return;
                    }
                    // converts the class identifier into an integer
                    // to be used in the resolution and verifies that
                    // the "generated" integer is valid
                    var classIdInt = parseInt(classId);
                    if (isNaN(classIdInt)) {
                        return;
                    }

                    // converts the object identifier into an integer
                    // to be used in the resolution and verifies that
                    // the "generated" integer is valid
                    var objectIdInt = parseInt(objectId);
                    if (isNaN(objectId)) {
                        return;
                    }

                    // verifies if the current integer version of the
                    // provided scan value is compatible with the current
                    // scan version (version is included in compatible
                    // version set) in case it's not returns immediately
                    var isCompatible = COMPATIBLE_VERSIONS.indexOf(versionInt) != -1;
                    if (!isCompatible) {
                        return;
                    }

                    // tries to retrieve the "partial" class url for
                    // the class with the provided identifier in case
                    // it's not found returns immediately in error
                    var classUrl = classIdUrl[classIdInt];
                    if (!classUrl) {
                        return;
                    }

                    // sets the uscan attribute in the event so that
                    // any other handler is able to "understand" that
                    // the event has been handled as uscan
                    event.uscan = true;

                    try {
                        // triggers the uscan handler so that any listening handler
                        // should be able to handle the scan
                        element.triggerHandler("uscan", [versionInt,
                                        classIdInt, objectIdInt]);
                    } catch (exception) {
                        // in case an exception was throw must return
                        // immediately as the redirectionis meant to
                        // be avoided (exception semantics)
                        return;
                    }

                    // constructs the url using the base mvc path and
                    // appending the url to the requested class
                    var baseUrl = mvcPath + classUrl;

                    // replaces the left padded zeros in the object
                    // id to contruct the final object id, then uses
                    // it to redirect the user agent to the show page
                    objectId = objectId.replace(/^0+|\s+$/g, "");
                    document.location = baseUrl + objectId;
                });

        // registers for the scan erro event in the document
        // to be able to react to it
        _document.bind("scan_error", function(event, value) {
                });

        var checksum = function(buffer, modulus, salt) {
            // retrieves the various value for the provided
            // parameters defaulting to base valus in case
            // the values were not provided
            modulus = modulus || 10000;
            salt = salt || "omni";

            // creates the complete buffer value by adding
            // the salt value to the buffer and starts the
            // checksum counter value to zero
            var _buffer = buffer + salt;
            var counter = 0;

            // iterates over all the bytes in the buffer
            // to append their ordinal values to the counter
            // note that a left shift is done according to
            // the position of the byte
            for (var index = 0; index < _buffer.length; index++) {
                var _byte = _buffer[index];
                var byteI = _byte.charCodeAt(0);
                counter += byteI << index;
            }

            // retrieves the checksum as an integer with the modulus
            // operation on the current counter value, then converts
            // the value into a string and returns it to the caller
            // method as the final checksum value
            var checksum = counter % modulus;
            var checksumS = String(checksum);
            return checksumS;
        };
    };
})(jQuery);
