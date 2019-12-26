(function(jQuery) {
    jQuery.udates = function(timestamp) {
        var dateS = "n/a";

        if (timestamp < 60) {
            dateS = jQuery.uxlocale("time:just_now");
        } else if (timestamp < 3600) {
            var minutes = Math.round(timestamp / 60);
            var label = minutes === 1 ? "min ago" : "mins ago";
            dateS = String(minutes) + " " + jQuery.uxlocale(label);
        } else if (timestamp < 86400) {
            var hours = Math.round(timestamp / 3600);
            var label = hours === 1 ? "hour ago" : "hours ago";
            dateS = String(hours) + " " + jQuery.uxlocale(label);
        } else {
            var days = Math.round(timestamp / 86400);
            var label = days === 1 ? "day ago" : "days ago";
            dateS = String(days) + " " + jQuery.uxlocale(label);
        }

        return dateS;
    };
})(jQuery);
