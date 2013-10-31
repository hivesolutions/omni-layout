(function(jQuery) {
    jQuery.fn.uactivity = function(options) {
        var matchedObject = jQuery(this);

        matchedObject.each(function(index, element) {
                    var _element = jQuery(this);

                    var items = jQuery("> li", _element);

                    items.each(function(index, element) {
                                var _element = jQuery(this);
                                var data = jQuery(".data", _element);
                                var message = jQuery(".message", _element);

                                var dataS = data.text();
                                var dataJ = jQuery.parseJSON(dataS);

                                console.info(dataJ);

                                var message = dataJ["message"];
                                message = jQuery.uxlocale(message);
                            });
                })
    };
})(jQuery);
