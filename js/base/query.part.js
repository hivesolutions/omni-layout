(function($) {
    jQuery.uquery = function(param) {
        // retrieves the reference to the body element and uses
        // it to retrieve the currently set mvc path in case it's
        // not found raises an exception (not possible to run query)
        var _body = jQuery("body");
        var mvcPath = _body.data("mvc_path");
        if (!mvcPath) {
            throw jQuery.uxexception("No mvc path variable defined");
        }

        // unpacks the various elements of the provided parameters
        // map, these are the elements to be used in the remote query
        var type = param["type"] || "get";
        var url = param["url"];
        var data = param["data"];
        var complete = param["complete"];
        var success = param["success"];
        var error = param["error"];

        // creates the complete url (from the partial one) by
        // prepending the mvc path to it
        url = mvcPath + url;

        // tries to retrieve the complete set of filters in case it+s
        // not found default to an empty list
        var filters = data["filters"] || [];
        var _filters = [];

        // iterates over the complete set of filters (filter structures)
        // in order to create the normalizes string based values for them
        for (var index = 0; index < filters.length; index++) {
            // retrieves the current filter list and unpacks it into
            // its components to be used to create the filter string
            var filter = filters[index];
            var name = filter[0];
            var value = filter.length == 3
                    ? String(filter[2])
                    : String(filter[1]);
            var operation = filter.length == 3 ? filter[1] : "equals";

            // creates the filter string from the various components of it
            // adds it to the list that will contain the various filter strings
            var _filter = name + ":" + operation + ":" + value;
            _filters.push(_filter);
        }

        // updates the filters reference in the data to the
        // normalized strings list and removes the previously
        // set filters reference (avoids naming collision)
        data["filters[]"] = _filters;
        delete data["filters"];

        // runs the remote http request with the specified
        // parameters including the composite url and the
        // transformed data object
        jQuery.ajax({
                    type : type,
                    url : url,
                    data : data,
                    complete : complete,
                    success : success,
                    error : error
                });
    };
})(jQuery);
