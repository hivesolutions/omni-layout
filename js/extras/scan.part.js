(function(jQuery) {
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

        /**
         * The regular expression that matches the QR codes printed in the
         * documents according to the AT rules, starting with the tax number
         * of the issuer and including the ATCUD of the document.
         */
        var QR_CODE_REGEX = /^A:.*\*H:/;

        // sets the jquery matched object
        var matchedObject = this;

        // in case the current object ot be matched is not of type
        // body there's no need to continue (nothing to be done)
        var isBody = matchedObject.is("body");
        if (!isBody) {
            return;
        }

        // retrieves the reference to the top level
        // document and body elements
        var _document = jQuery(document);
        var _body = jQuery("body");

        // registers for the scan event in the document
        // to be able to react to it
        _document.bind("scan", function(event, value) {
            // logs the detection of the scan so that the resolution
            // process of it may be followed in the console
            console.info("Scan detected:", value);

            // retrieves the current timestamp as the identifier of the scan
            // (assumes uniqueness) and sets it as the current one in the body
            // so that a pending lookup of a previous scan is not scanned
            var identifier = new Date().getTime();
            _body.data("current", identifier);

            // retrieves the current element that is the
            // target of the scan operation
            var element = jQuery(this);

            // retrieves the mvc path and the class id url
            // map for the current page
            var mvcPath = _body.data("mvc_path");
            var classIdUrl = _body.data("class_id_url");

            // verifies if the scanned value is the QR code of a document, in
            // which case the barcode of the document is retrieved and scanned
            // instead, so that the QR code behaves as the barcode
            if (QR_CODE_REGEX.test(value)) {
                // sets the uscan attribute in the event so that any
                // other handler ignores the QR code (handled as uscan)
                event.uscan = true;

                // runs the remote query that retrieves the barcode of the
                // document of the QR code and scans it, logging the miss
                // in case no document is represented by the QR code
                jQuery.uquery({
                    url: "omni_util/qr_code.json",
                    data: {
                        value: value
                    },
                    success: function(data) {
                        // retrieves the current identifier from the body and
                        // checks it against the closure based identifier in
                        // case it's not the same (a scan has come in between)
                        // the response is outdated and must be ignored
                        var current = _body.data("current");
                        if (current !== identifier) {
                            console.info("Scan with outdated QR code:", value);
                            return;
                        }

                        var barcode = data["barcode"];
                        if (!barcode) {
                            console.info("Scan with unknown QR code:", value);
                            return;
                        }
                        console.info("Scan resolved into barcode:", barcode);
                        _document.trigger("scan", [barcode]);
                    },
                    error: function(xhr, status, error) {
                        console.error("Scan with failed QR code lookup:", error);
                    }
                });

                // returns immediately as the barcode is going to be
                // scanned once it's retrieved (asynchronous operation)
                return;
            }

            // verifies that the size of the code legnth
            // is of the expected size, otherwise returns
            // immediately not an expected code
            if (value.length !== SCAN_CODE_LENGTH) {
                console.info("Scan with unexpected length:", value.length);
                return;
            }

            // retrieves the checksum for the barcode value
            // in order to verify it against the base buffer
            // converts the value into an integer value and
            // then converts it back to a string (removal of
            // left based zeros)
            var checksumS = value.slice(0, 4);
            checksumS = parseInt(checksumS);
            checksumS = String(checksumS);

            // retrieves the checksum buffer from the complete
            // value and then computes the checksum string for
            // the value and compares it with the received
            // checksum value in case they do not match returns
            // immediately in error (invalid checksum)
            var buffer = value.slice(4);
            var _checksumS = checksum(buffer);
            if (_checksumS !== checksumS) {
                console.warn("Scan with invalid checksum:", checksumS);
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
                console.warn("Scan with invalid version:", version);
                return;
            }
            // converts the class identifier into an integer
            // to be used in the resolution and verifies that
            // the "generated" integer is valid
            var classIdInt = parseInt(classId);
            if (isNaN(classIdInt)) {
                console.warn("Scan with invalid class id:", classId);
                return;
            }

            // converts the object identifier into an integer
            // to be used in the resolution and verifies that
            // the "generated" integer is valid
            var objectIdInt = parseInt(objectId);
            if (isNaN(objectId)) {
                console.warn("Scan with invalid object id:", objectId);
                return;
            }

            // verifies if the current integer version of the
            // provided scan value is compatible with the current
            // scan version (version is included in compatible
            // version set) in case it's not returns immediately
            var isCompatible = COMPATIBLE_VERSIONS.indexOf(versionInt) !== -1;
            if (!isCompatible) {
                console.warn("Scan with incompatible version:", versionInt);
                return;
            }

            // tries to retrieve the "partial" class url for
            // the class with the provided identifier in case
            // it's not found returns immediately in error
            var classUrl = classIdUrl[classIdInt];
            if (!classUrl) {
                console.warn("Scan with no class url:", classIdInt);
                return;
            }

            // logs the resolution of the scan into its version, class
            // and object identifiers (before the uscan handling)
            console.info("Scan resolved:", versionInt, classIdInt, objectIdInt);

            // sets the uscan attribute in the event so that
            // any other handler is able to "understand" that
            // the event has been handled as uscan
            event.uscan = true;

            try {
                // triggers the uscan handler so that any listening handler
                // should be able to handle the scan
                element.triggerHandler("uscan", [versionInt,
                    classIdInt, objectIdInt
                ]);
            } catch (exception) {
                // in case an exception was throw must return
                // immediately as the redirections are meant to
                // be avoided (exception semantics)
                console.info("Scan redirection avoided:", classIdInt);
                return;
            }

            // constructs the url using the base mvc path and
            // appending the url to the requested class
            var baseUrl = mvcPath + classUrl;

            // replaces the left padded zeros in the object
            // id to construct the final object id, then uses
            // it to redirect the user agent to the show page
            objectId = objectId.replace(/^0+|\s+$/g, "");
            console.info("Scan redirecting to:", baseUrl + objectId);
            jQuery.uxlocation(baseUrl + objectId);
        });

        // registers for the scan error event in the document
        // to be able to react to it
        _document.bind("scan_error", function(event, value) {
            // logs the scan error with only the length of the value
            // as it may contain keys typed by the user
            console.debug("Scan error with length:", value.length);
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
