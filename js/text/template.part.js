(function(jQuery) {
    jQuery.utemplate = function(value) {
        value = value.replace("{{", "<b>");
        value = value.replace("}}", "</b>");
        return value;
    };
})(jQuery);
