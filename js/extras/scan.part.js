(function($) {
    jQuery.fn.uscan = function(options) {
        /**
         * The length of the code to be scanned this value should be defined in
         * accordance with the defined specification.
         */
        var SCAN_CODE_LENGTH = 18;

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

                    // retrieves the version of the barcode then
                    // retrieves the class of the object that is
                    // represented by the barcode and then retrieves
                    // the identifier of the object
                    var version = value.slice(0, 2);
                    var classId = value.slice(2, 6);
                    var objectId = value.slice(6);

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

                    // tries to retrieve the "partial" class url for
                    // the class with the provided identifier in case
                    // it's not found returns immediately in error
                    var classUrl = classIdUrl[classIdInt];
                    if (!classUrl) {
                        return;
                    }

                    // triggers the uscan handler so that any listening handler
                    // should be able to handle the scan
                    element.triggerHandler("uscan", [versionInt, classIdInt,
                                    objectIdInt]);

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
    };
})(jQuery);
