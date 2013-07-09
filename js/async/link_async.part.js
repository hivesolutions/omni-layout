(function(jQuery) {
    /**
     * The regular expression that is going to be used for the verification of
     * the same host policy, required for the async based links.
     */
    var HOST_REGEX = new RegExp(location.host);

    jQuery.ulinkasync = function(href, force, verify) {
        // in case the provided link value is invalid, not set
        // or empty there's no panel to be changed and everything
        // shuold remain the same (no update)
        if (!href) {
            return true;
        }

        // in case this is an internal link the panel change must be
        // avoided and the top handler should take this into account
        if (href[0] == "#") {
            return false;
        }

        // resolves the provided link so that were able to find out the
        // absolute url out of it and set it as the location to be retrieved
        // using an asynchronous approach (ajax)
        href = jQuery.uxresolve(href);

        // runs the regular expression that will verify if the current link
        // is local and in case it's not returns immediately with the error
        // flag set indicating that no processing has been done
        var isLocal = HOST_REGEX.test(href)
        if (!isLocal) {
            return false;
        }

        // in case the force flag is not set and the location is the same as
        // the current one no change is taken, page remains the same
        if (!force && href == document.location) {
            return true;
        }

        // retrieves the localized version of the loading message so that it
        // may be used in the notification to be shown
        var loading = jQuery.uxlocale("Loading");

        // retrieves the reference to the notifications container element
        // and removes any message that is contained in it, avoiding any
        // duplicatd message display
        var container = jQuery(".header-notifications-container");
        container.empty();

        // creates the notification message that will indicate the loading
        // of the new panel and adds it to the notifications container
        var notification = jQuery("<div class=\"header-notification warning\"><strong>"
                + loading + "</strong></div>");
        container.append(notification);

        // runs the remove async call that will retrieve the partial contents
        // that will be used to change and re-populate the current dom, note
        // the extra async data parameter sent indicating that this is meant
        // to be handled differently (notably the redirection process)
        jQuery.ajax({
                    url : href,
                    dataType : "html",
                    data : {
                        async : 1
                    },
                    success : function(data, status, request) {
                        // verifies if the current result if of type (async) redirect, this
                        // is a special case and the redirection must be performed using a
                        // special strateg by retrieving the new location and setting it as
                        // new async contents to be loaded
                        var isRedirect = request.status == 280;
                        if (isRedirect) {
                            var hrefR = request.getResponseHeader("Location");
                            hrefR = jQuery.uxresolve(hrefR, href);
                            jQuery.ulinkasync(hrefR, true, false);
                            return;
                        }

                        // removes the loading notification, as the request has been
                        // completed with success (no need to display it anymore)
                        notification.remove();

                        // in case this is a verified operation the assync operations
                        // may pile up and so we must verify if the document location
                        // in the current document is the same as the document we're
                        // trying to retrieve, if it's not return immediately (ignore)
                        if (verify && document.location != href) {
                            return;
                        }

                        // in case this is not a verified operation the current state
                        // must be pushed into the history stack, so that we're able
                        // to rollback to it latter
                        !verify && window.history.pushState(href, href, href);

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

                            updateComplete(base);

                        } catch (exception) {
                            window.history.back();
                            document.location = href;
                        }
                    },
                    error : function() {
                        document.location = href;
                    }
                });

        return true;
    };

    var updateComplete = function(base) {
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
        var contentHtml = content.html();
        contentHtml = contentHtml.replace(/aux-src=/ig, "src=");
        content_.html(contentHtml);
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
