(function(jQuery) {
    jQuery.fn.umenu = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // iterates over each of the menu elements
        // to build them accordingly
        matchedObject.each(function(index, element) {
                    // retrieves the current element and the associated
                    // switch and back buttons
                    var _element = jQuery(this);
                    var _switch = jQuery(".switch", _element);
                    var back = jQuery(".back", _element);

                    // registers for the show event so that whenever the
                    // menu is displayed the account panel is shown
                    _element.bind("show", function() {
                                // tenho de apagar o que est actualmente e mostrar o outro
                                // ou fazer push para a stack para depois fazer pop
                                var element = jQuery(this);

                                // sets the current reference to the menu as the element
                                // currently in iteration
                                var menu = _element;

                                // retrieves the references for both the account and
                                // the switch panels to be toggled
                                var accountPanel = jQuery(".account-panel",
                                        menu);
                                var switchPanel = jQuery(".switch-panel", menu);

                                // hides the switch panel and shows the account
                                // panel (toggle of visibility)
                                switchPanel.hide();
                                accountPanel.show();

                                // repositions the menu (link)
                                element.uxmenulink("reposition");
                            });

                    // registers for the click event on the switch button in
                    // order to be able hide the account panel and show the
                    // correct switch panel
                    _switch.click(function() {
                                // tenho de apagar o que est actualmente e mostrar o outro
                                // ou fazer push para a stack para depois fazer pop
                                var element = jQuery(this);
                                var menu = element.parents(".menu");

                                // retrieves the references for both the account and
                                // the switch panels to be toggled
                                var accountPanel = jQuery(".account-panel",
                                        menu);
                                var switchPanel = jQuery(".switch-panel", menu);

                                // hides the account panel and shows the switch
                                // panel (toggle of visibility)
                                accountPanel.hide();
                                switchPanel.show();

                                // repositions the menu (link)
                                menu.uxmenulink("reposition");
                            });

                    // registers for the click event on the back button in
                    // order to be able show the account panel and hide the
                    // correct switch panel
                    back.click(function() {
                                // tenho de apagar o que est actualmente e mostrar o outro
                                // ou fazer push para a stack para depois fazer pop
                                var element = jQuery(this);
                                var menu = element.parents(".menu");

                                // retrieves the references for both the account and
                                // the switch panels to be toggled
                                var accountPanel = jQuery(".account-panel",
                                        menu);
                                var switchPanel = jQuery(".switch-panel", menu);

                                // hides the account panel and shows the switch
                                // panel (toggle of visibility)
                                accountPanel.show();
                                switchPanel.hide();

                                // repositions the menu (link)
                                menu.uxmenulink("reposition");
                            });
                });

        return matchedObject;
    };
})(jQuery);
