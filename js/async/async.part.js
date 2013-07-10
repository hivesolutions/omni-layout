(function(jQuery) {
    jQuery.fn.uasync = function() {
        // sets the jquery matched object
        var matchedObject = this;

        var _validate = function() {
            return window.FormData ? true : false;
        };

        var _registerHandlers = function() {
            // retrieves the various elements that are going to be
            // used in the registration for the handlers
            var _body = jQuery("body");
            var links = jQuery("a[href], .link[href]", matchedObject);

            // registers for the click event on the current set of links
            // that exist in the object, so that they can be handled in
            // an async fashion if thats the case
            links.click(function(event) {
                        // in case the click used the right or center button the
                        // event should be ignored not bean to be overriden
                        if (event.which == 2 || event.which == 3) {
                            return;
                        }

                        // retrieves the current element and the current link
                        // associated so that it can be validated and tested in
                        // the current async environment
                        var element = jQuery(this);
                        var href = element.attr("href");

                        // runs the async link execution with no force flag set
                        // and in case it run through avoids the default link
                        // behavior (avoid duplicated execution)
                        var result = jQuery.ulinkasync(href, false);
                        result && event.preventDefault();
                    });

            // retrieves the current async registration flag from the body
            // elemennt in case it's currently set returns immediately to
            // avoid duplicated registration
            var async = _body.data("async") || false;
            if (async) {
                return;
            }

            // registers for the data changed event so that if there's new panel
            // data available the layour is update in acordance, so that the async
            // requests are reflected in a layout change
            _body.bind("data", function(event, data, href, push) {
                        // in case this is not a verified operation the current state
                        // must be pushed into the history stack, so that we're able
                        // to rollback to it latter
                        push && window.history.pushState(href, href, href);

                        try {
                            // replaces the image source references in the requested
                            // data so that no extra images are loaded then loads the
                            // data as the base object structure
                            data = data.replace(/src=/ig, "aux-src=");
                            var base = jQuery(data);

                            // tries to verify if the current page is a layout page
                            // by checking the top bar existence, in case it's not
                            // a layout page raises an invalid layout exception
                            var hasTopBar = jQuery(".top-bar").length > 0
                                    && base.filter(".top-bar").length > 0;
                            var hasSideLeft = jQuery(".sidebar-left").length > 0
                                    && jQuery(".sidebar-left", base).length > 0;
                            var isLayout = hasTopBar && hasSideLeft;
                            if (!isLayout) {
                                throw "Invalid layout or layout not found";
                            }

                            updateFull(base);
                        } catch (exception) {
                            window.history.back();
                            document.location = href;
                        }
                    });

            // registers for the location changed event in order to validated the
            // location changes for async execution then sets the async flag in the
            // current body in order duplicated registration
            _body.bind("location", function(event, location) {
                        // tries to runthe async link logic and in case it goes through
                        // cancels the current event returning an invalid value, so that
                        // the default location setting logic does not run
                        var result = jQuery.ulinkasync(location, false);
                        return !result;
                    });
            _body.data("async", true);
        };

        var _setPopHandler = function() {
            // in case the pop state (changed) handler is already set there's
            // no need to set it again and so returns immediately
            if (window.onpopstate != null) {
                return;
            }

            // sets the initial and loded variables so that they will
            // be used by the pop state function handler as a clojure
            var initial = null;
            var loaded = false;

            // registers the pop state changed handler function so that
            // it's possible to restore the state using an async approach
            window.onpopstate = function(event) {
                // in case the event raised contains no state (not pushed)
                // and the location or the location is the initial one the
                // async login must be run
                if (event.state != null || document.location == initial) {
                    var href = document.location;
                    jQuery.ulinkasync(href, true);
                }

                // in case the initial location value is not set this is the
                // the right time to set it
                if (initial == null) {
                    initial = document.location;
                }
            };
        };

        // validates if the current system has support for the asyn
        // behavior in case it does not returns immediately avoiding
        // any async behavior to be applied
        var result = _validate();
        if (!result) {
            return;
        }

        // runs the initial registration logic enabling the current matched
        // object with the async logic and execution
        _registerHandlers();
        _setPopHandler();
    };

    var isFull = function() {
        var hasTopBar = jQuery(".top-bar").length > 0;
        if (!hasTopBar) {
            return false;
        }

        var hasSideLeft = jQuery(".sidebar-left").length > 0
        if (!hasSideLeft) {
            return false;
        }

        var hasSideRight = jQuery(".sidebar-right").length > 0
        if (!hasSideRight) {
            return false;
        }

        return true;
    };

    var isSimple = function() {
        var contentWrapper = jQuery("body > .content-wrapper");
        var childCount = contentWrapper.children().length;

        if (childCount != 1) {
            return false;
        }

        return true;
    };

    var updateFull = function(base) {
        updateIcon(base);
        updateResources(base);
        updateContent(base);
        updateFooter(base);
        updateWindow(base);
        updateHeaderImage(base);
        updateSecondLeft(base);
        updateMenu(base);
        updateNavigationList(base);
        updateChat(base);
        updateSidebarRight(base);
        updateOverlaySearch(base);
        updateMeta(base);
    };

    var updateSimple = function(base) {
        updateIcon(base);
        updateResources(base);
        updateContent(base);
        updateFooter(base);
        updateWindow(base);
        updateHeaderImage(base);
        updateSecondLeft(base);
        updateMenu(base);
        updateOverlaySearch(base);
        updateMeta(base);
    };

    var updateIcon = function(base) {
        // updates the currently defined favicon with the new relative
        // path so that it does not become unreadable
        var icon = base.filter("[rel=\"shortcut icon\"]");
        var icon_ = jQuery("[rel=\"shortcut icon\"]");
        icon_.replaceWith(icon);
    };

    var updateResources = function(base) {
        var _head = jQuery("head");
        var _body = jQuery("body");

        var section = jQuery("#section", base);
        var section_ = jQuery(".meta > #section");
        var basePath = jQuery(".meta > #base-path");

        var sectionValue = section.html();
        var sectionValue_ = section_.html();
        var basePathValue = basePath.html();

        // verifies if the current section is different from the target
        // section in case it's not returns immediately, as there's nothing
        // to be done in the current context
        var isDifferent = sectionValue != sectionValue_;
        if (!isDifferent) {
            return;
        }

        // retrieves the map containing the list of sections that
        // already have their resources loaded, this structure avoids
        // the constant loading of the section resources
        var sectionsL = _body.data("sections_l") || {};
        _body.data("sections_l", sectionsL);

        // sets the current selected section as loaded and verifies
        // if the target section is already loaded if it's returns
        // immediately avoiding the resource loading
        sectionsL[sectionValue_] = true;
        var exists = sectionsL[sectionValue] || false;
        if (exists) {
            return;
        }

        // appends both the css file and the javascript logic for the
        // target section so that it's correctly loaded
        _head.append("<link rel=\"stylesheet\" href=\"" + basePathValue
                + "resources/css/layout.css\" type=\"text/css\" />");
        _head.append("<script type=\"text/javascript\" src=\"" + basePathValue
                + "resources/js/main.js\"></script>");
    };

    var updateContent = function(base) {
        // retrieves the currently set locale from the base
        // structure and uses it to update the data locale
        // attribute of the current content (locale change)
        var locale = jQuery("#locale", base);
        var locale_ = jQuery("[data-locale]");
        var language = locale.html().replace("_", "-");
        locale_.attr("data-locale", language);

        var content = jQuery(".content", base);
        var content_ = jQuery(".content");
        var contentClass = content.attr("class")
        var contentHtml = content.html();
        contentHtml = contentHtml.replace(/aux-src=/ig, "src=");
        content_.html(contentHtml);
        content_.attr("class", contentClass);
        content_.uxapply();
        content_.uxshortcuts();
    };

    var updateFooter = function(base) {
        var footer = base.filter(".footer");
        var footer_ = jQuery(".footer");
        var footerHtml = footer.html();
        footerHtml = footerHtml.replace(/aux-src=/ig, "src=");
        footer_.html(footerHtml);
        footer_.uxapply();
    };

    var updateWindow = function(base) {
        // retrieves the complete set of windows available in the
        // base element to be processed and then retrieves the
        // widows currently set in the content wrapper's body
        var window = jQuery(".window", base);
        var window_ = jQuery("body > .content-wrapper .window");

        // tries to find the window placeholder section in the current
        // element in case it's not fond creates a new placeholder and
        // sets it in the content wrapper section of the body
        var placeholder = jQuery(".window-placeholder");
        if (placeholder.length == 0) {
            var contentWrapper = jQuery("body > .content-wrapper");
            placeholder = jQuery("<div class=\"window-placeholder\"></div>");
            contentWrapper.append(placeholder);
        }

        // removes the complete set of windows that exist in the
        // the current content area and then empties the placeholder
        // from any previous elements
        window_.remove();
        placeholder.empty();

        // adds the windows found in the current base element and
        // applies the current logic to the placeholder section
        placeholder.append(window);
        placeholder.uxapply();
    };

    var updateHeaderImage = function(base) {
        var topBar = base.filter(".top-bar");
        var headerImage = jQuery(".header-logo-area", topBar);
        var headerImage_ = jQuery(".top-bar .header-logo-area");
        var headerImageLink = headerImage.attr("href");
        headerImage_.attr("href", headerImageLink);
    };

    var updateSecondLeft = function(base) {
        var topBar = base.filter(".top-bar");
        var secondLeft = jQuery(".left:nth-child(2)", topBar);
        var secondLeft_ = jQuery(".top-bar .left:nth-child(2)");
        var secondLeftHtml = secondLeft.html();
        secondLeftHtml = secondLeftHtml.replace(/aux-src=/ig, "src=");
        secondLeft_.html(secondLeftHtml);
        secondLeft_.uxapply();
    };

    var updateMenu = function(base) {
        var topBar = base.filter(".top-bar");
        var menu = jQuery(".menu", topBar);
        var menu_ = jQuery(".top-bar .menu");
        var menuHtml = menu.html();
        menuHtml = menuHtml.replace(/aux-src=/ig, "src=");
        menu_.replaceWith("<div class=\"menu system-menu\">" + menuHtml
                + "</div>");
        menu_ = jQuery(".top-bar .menu");
        menu_.uxapply();
    };

    var updateNavigationList = function(base) {
        var navigationList = jQuery(".sidebar-left > .navigation-list", base);
        var navigationList_ = jQuery(".sidebar-left > .navigation-list");
        var navigationListHtml = navigationList.html();
        navigationListHtml = navigationListHtml.replace(/aux-src=/ig, "src=");
        navigationList_.html(navigationListHtml);
        navigationList_.uxapply();
        navigationList_.uxlist();
    };

    var updateChat = function(base) {
        var chat = jQuery(".sidebar-left > .chat", base);
        var chat_ = jQuery(".sidebar-left > .chat");
        var url = chat.attr("data-url");
        chat_.attr("data-url", url);
    };

    var updateSidebarRight = function(base) {
        var sidebarRight = jQuery(".sidebar-right", base);
        var sidebarRight_ = jQuery(".sidebar-right");
        var sidebarRightHtml = sidebarRight.html();
        sidebarRightHtml = sidebarRightHtml.replace(/aux-src=/ig, "src=");
        sidebarRight_.html(sidebarRightHtml);
        sidebarRight_.uxapply();
    };

    var updateOverlaySearch = function(base) {
        var overlaySearch = base.filter(".overlay-search");
        var overlaySearch_ = jQuery(".overlay-search");
        var overlaySearchHtml = overlaySearch.html();
        overlaySearchHtml = overlaySearchHtml.replace(/aux-src=/ig, "src=");
        overlaySearch_.html(overlaySearchHtml);
        overlaySearch_.uxapply();
        overlaySearch_.uxoverlaysearch();
    };

    var updateMeta = function(base) {
        var _body = jQuery("body");
        var meta = base.filter(".meta")
        var meta_ = jQuery(".meta");
        var metaHtml = meta.html();
        metaHtml = metaHtml.replace(/aux-src=/ig, "src=");
        meta_.html(metaHtml);
        meta_.uxapply();
        _body.uconfigurations();
    };
})(jQuery);
