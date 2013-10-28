(function(jQuery) {
    jQuery.udates = function(timestamp) {
        var dateS = "n/a";

        if (timestamp < 60) {
            dateS = jQuery.uxlocale("moments ago");
        } else if (timestamp < 3600) {
            var minutes = Math.round(timestamp / 60);
            dateS = String(minutes) + " " + jQuery.uxlocale("minutes ago");
        } else if (timestamp < 86400) {
            var hours = Math.round(timestamp / 3600);
            dateS = String(hours) + " " + jQuery.uxlocale("hours ago");
        } else {
            var days = Math.round(timestamp / 86400);
            dateS = String(days) + " " + jQuery.uxlocale("hours ago");
        }

        return dateS;
    };
})(jQuery);
