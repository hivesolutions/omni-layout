(function(jQuery) {
    jQuery.unotify = function(title, message, type) {
        // retrieves the notifications of the page (in the stack of the
        // top center of the window) and removes the one with the same
        // message (if any), so that a refusal repeated by consecutive
        // scans (eg: the scans of a product once its stock is used)
        // shows a single notification, instead of piling them up
        var _body = jQuery("body");
        var notifications = jQuery("> .notifications-stack.top-center > .notification", _body);
        notifications.each(function(index, element) {
            var _element = jQuery(this);
            var text = jQuery(".notification-text", _element);
            if (text.text() !== message) {
                return;
            }
            _element.remove();
        });

        // notifies the user with the message, as a small notification of
        // the type at the top center of the window, where the user looks
        // while scanning
        _body.uxnotification({
            title: title,
            message: message,
            type: type,
            small: true,
            position: "top-center",
            timeout: 5000
        });
    };
})(jQuery);
