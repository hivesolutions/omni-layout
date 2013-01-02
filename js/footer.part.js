jQuery(document).ready(function() {
            // retrieves the reference to the top level
            // body element to apply the components in it
            var _body = jQuery("body");

            // applies the ui component to the body element (main
            // element) and then applies the extra component logic
            // from the composite extensions
            _body.uxapply();
            _body.uapply();
        });
