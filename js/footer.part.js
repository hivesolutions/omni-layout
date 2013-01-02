jQuery(document).ready(function() {
            // retrieves the body
            var _body = jQuery("body");

            // retrieves the filters
            var filter = jQuery(".filter");

            // applies the ui component to the body
            _body.uxapply();

            // FAZER UM PLUGIN PARA SUBSTITUI ESTE CHAMADO TOGGLE VISIBLE
            jQuery(".filter-button").click(function() {
                        // retrieves the element
                        var element = jQuery(this);

                        // retrieves the filter and the filter options
                        var filter = element.parents(".filter");
                        var filterOptions = jQuery(".filter-options", filter);

                        // checks if the filter options is visible
                        var filterOptionsVisible = filterOptions.is(":visible");

                        if (filterOptionsVisible) {
                            filterOptions.hide();
                            element.removeClass("selected");
                        } else {
                            filterOptions.show();
                            element.addClass("selected");
                        }
                    });

            // @TODO: had to add this to manipulate windows (better with ux?)
            jQuery(".window-paypal-api-service .button-cancel").click(
                    function() {
                        jQuery(".window-paypal-api-service").uxwindow("hide");
                    });

            jQuery(".window-paypal-api-service .button-confirm").click(
                    function() {
                        jQuery(".window-paypal-api-service .form").submit();
                        jQuery(".window-paypal-api-service").uxwindow("hide");
                    });

            jQuery(".paypal-api-service-authorize-button").click(function() {
                        jQuery(".window-paypal-api-service").uxwindow("show");
                    });

            jQuery(".window-easypay-api-service .button-cancel").click(
                    function() {
                        jQuery(".window-easypay-api-service").uxwindow("hide");
                    });

            jQuery(".window-easypay-api-service .button-confirm").click(
                    function() {
                        jQuery(".window-easypay-api-service .form").submit();
                        jQuery(".window-easypay-api-service").uxwindow("hide");
                    });

            jQuery(".easypay-api-service-authorize-button").click(function() {
                        jQuery(".window-easypay-api-service").uxwindow("show");
                    });

            // retrieves the urrent body element and then applies
            // the uscope plugins to it
            var _body = jQuery("body");
            _body.uapply();
        });
