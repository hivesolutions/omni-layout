(function(jQuery) {
    jQuery.utext = function(value) {
        value = value.replace(/{{/g, "");
        value = value.replace(/}}/g, "");
        value = value.capitalize(true);
        return value;
    };
})(jQuery);
