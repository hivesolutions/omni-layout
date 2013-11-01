(function(jQuery) {
    jQuery.utemplate = function(value, noformat) {
        value = value.replace(/{{/g, noformat ? "" : "<b>");
        value = value.replace(/}}/g, noformat ? "" : "</b>");
        value = value.capitalize(true);
        return value;
    };
})(jQuery);
