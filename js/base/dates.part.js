(function(jQuery) {
    jQuery.udates = function(timestamp) {
        var dateS = "n/a";

        if (timestamp < 60) {
            dateS = "moments ago"
        } else if (timestamp < 3600) {
            var minutes = Math.round(timestamp / 60);
            dateS = String(minutes) + " minutes ago"
        } else if (timestamp < 86400) {
            var hours = Math.round(timestamp / 3600);
            dateS = String(hours) + " hours ago"
        } else {
            var days = Math.round(timestamp / 86400);
            dateS = String(days) + " hours ago"
        }

        return dateS;
    };
})(jQuery);
