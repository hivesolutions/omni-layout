(function(jQuery) {
    jQuery.fn.ueureka = function(options) {
        /**
         * The minimum number of options (results) of the eureka for the
         * phones, where they're listed as wide as the screen, under its
         * search bar, with room for more of them.
         */
        var MOBILE_NUMBER_OPTIONS = 6;

        // sets the jquery matched object
        var matchedObject = this;

        // in case the matched object is not defined
        // or in case it's an empty list must return
        // immediately initialization is not meant to
        // be run (corruption may occur)
        if (!matchedObject || matchedObject.length === 0) {
            return;
        }

        // retrieves the reference to the top level
        // body element that is going to be used in some
        // of the operations associated with eureka
        var _body = jQuery("body");

        // retrieves the complete set of overlay panels associated
        // with the various provided eureka element, they are going
        // to be used for some of the event registration
        var overlayPanel = matchedObject.parents(".overlay-panel");

        // retrieves the text field associated with the drop field
        // element of the eureka element and registers for the key
        // down event to avoid its propagation, could cause global
        // key events to have unexpected behaviour
        var textField = jQuery(".text-field", matchedObject);
        textField.keydown(function(event) {
            // retrievs the current element and uses it to retrieve
            // the associated overlay panel element
            var element = jQuery(this);
            var overlayPanel = element.parents(".overlay-panel");

            // retrieves the current activation key associated with
            // the overlay panel so that it may be "allowed"
            var key = overlayPanel.attr("data-key");
            key = key ? parseInt(key) : key;

            // retrieves the event key code and in case the code refers
            // the escape key returns immediately to avoid behavior
            var eventKeyCode = event.keyCode ? event.keyCode : event.which;
            if (eventKeyCode === 27 || eventKeyCode === key) {
                return;
            }

            // stops the event propagation in order to avoid
            // unwanted global behavior coming  from this key press
            event.stopPropagation();
            event.stopImmediatePropagation();
        });

        // starts the variable that is going to store the handler of the
        // shown event of the overlay panel, so that it's unregistered once
        // the eureka is destroyed (eg: its contents replaced by the async
        // navigation), as the overlay panel is kept between the visits
        var onShown = null;

        // registers for the shown event in the overlay panel associated
        // with the eureka element so that various element of the eureka
        // are restored to the unset original values
        overlayPanel.bind("shown", onShown = function() {
            // retrieves the current element and the associated text field
            // and then runs the reset operation to restore it to the original
            // value as expected by the specification
            var element = jQuery(this);
            var textField = jQuery(".text-field", element);
            textField.uxreset();

            // retrieves the eureka of the overlay panel and resets it, so that
            // the results of an earlier show are not reused (with the number
            // of options of that show) when the same value is typed again
            var eureka = jQuery(".eureka", element);
            eureka.uxreset();

            // retrieves the number of options defined in the template of the
            // eureka, converting it into an integer and verifying that the
            // "generated" integer is valid, otherwise the number of options
            // of the drop field is kept
            var numberOptions = eureka.attr("data-number_options");
            var numberOptionsInt = parseInt(numberOptions);
            if (isNaN(numberOptionsInt)) {
                return;
            }

            // raises the number of options to the mobile number of options
            // in the phones (where the results are listed as wide as the
            // screen) and then updates the number of options of the drop
            // field of the eureka, on every show (eg: a phone turned)
            var isMobile = _body.hasClass("mobile-s");
            if (isMobile) {
                numberOptionsInt = Math.max(numberOptionsInt, MOBILE_NUMBER_OPTIONS);
            }
            eureka.data("number_options", numberOptionsInt);
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
            });

        // registers for the post async event so that the overlay panel associated
        // with the eureka structure is properly hidden and does not remains displayed
        // in the current screen, otherwise garbage would be left (ux problems)
        matchedObject.length > 0 && _body.bind("post_async", onPostAsync = function() {
            var overlayPanel = matchedObject.parents(".overlay-panel");
            overlayPanel.triggerHandler("hide");
        });
        matchedObject.bind("destroyed", function() {
            _body.unbind("post_async", onPostAsync);
            overlayPanel.unbind("shown", onShown);
        });
    };
})(jQuery);
