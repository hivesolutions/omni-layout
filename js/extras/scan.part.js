(function($) {
    jQuery.fn.uscan = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // retrieves the reference to the top level
        // document and body elements
        var _document = jQuery(document);
        var _body = jQuery("body");

        // registers for the scan event in the document
        // to be able to react to it
        _document.bind("scan", function(event, value) {
                    // retrieves the mvc path and the class id url
                    // map for the current page
                    var mvcPath = _body.data("mvc_path");
                    var classIdUrl = _body.data("class_id_url");

                    // retrieves the version of the barcode then
                    // retrieves the class of the object that is
                    // represented by the barcode and then retrieves
                    // the identifier of the object
                    var version = value.slice(0, 2);
                    var classId = value.slice(2, 6);
                    var objectId = value.slice(6);

                    // converts the class identifier into an integer
                    // to be used in the resolution
                    var classIdInt = parseInt(classId);

                    // constructs the url using the base mvc path and
                    // appending the url to the requested class
                    var baseUrl = mvcPath + classIdUrl[classIdInt];

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
