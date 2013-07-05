(function(jQuery) {
    jQuery.fn.ueureka = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // retrieves the reference to the top level
        // body element
        var _body = jQuery("body");

        // retrieves the text field associated with the drop field
        // element of the eureka element and registers for the key
        // down event to avoid its propagation, could cause global
        // key events to have unexpected behaviour
        var textField = jQuery(".text-field", matchedObject);
        textField.keydown(function(event) {
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                });

        // registers for the (new) item event to change
        // the item inserting new attributes in it
        matchedObject.bind("item", function(event, item) {
                    // retrieves the mvc path and the class id url
                    // map for the current page
                    var mvcPath = _body.data("mvc_path");
                    var classIdUrl = _body.data("class_id_url");

                    // retrieves the various attribute values from the
                    // item to be used in the link construction
                    var objectId = item["object_id"];
                    var cid = item["cid"];

                    // constructs the url using the base mvc path and
                    // appending the url to the requested class
                    var baseUrl = mvcPath + classIdUrl[cid];

                    // creates the final link value and updates the
                    // item with it
                    var link = baseUrl + objectId;
                    item["link"] = link;
                });

        // registers for the value selection event so that it's possible
        // to hide the panel and invalidate the current value
        matchedObject.bind("value_select",
                function(event, value, valueLogic, item) {
                    // retrieves the current element and uses it to retrieve
                    // the associated overlay panel element
                    var element = jQuery(this);
                    var overlayPanel = element.parents(".overlay-panel");

                    // triggers the hide event on the overlay panel to initate
                    // the process of hidding the panel
                    overlayPanel.triggerHandler("hide");
                    element.uxreset();
                });
    };
})(jQuery);
