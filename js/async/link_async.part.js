(function(jQuery) {
    /**
     * The regular expression that is going to be used for the verification of
     * the same host policy, required for the async based links.
     */
    var HOST_REGEX = new RegExp(location.host);

    jQuery.ulinkasync = function(href, force, navigation, bar) {
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

        if (!force && href == document.location) {
            return true;
        }

        jQuery.ajax({
            url : href,
            dataType : "html",
            success : function(data, status, request) {
                // in case this is a forced operation the assync operations
                // may pile up and so we must verify if the document location
                // in the current document is the same as the document we're
                // trying to retrieve, if it's not return immediately (ignore)
                if (force && document.location != href) {
                    return;
                }

                // in case this is not a forced operation the current state
                // must be pushed into the history stack, so that we're able
                // to rollback to it latter
                !force && window.history.pushState(href, "dsfasd", href);

                try {
                    data = data.replace(/src=/ig, "aux-src=");
                    var base = jQuery(data);

                    var isLayout = jQuery(".top-bar").length > 0
                            && base.filter(".top-bar").length > 0;
                    if (!isLayout) {
                        throw "Invalid layout";
                    }

                    if (bar) {
                        var topBar = base.filter(".top-bar");
                        var headerImage = jQuery(".header-logo-area", topBar);

                        var headerImageLink = headerImage.attr("href");
                        jQuery(".top-bar .header-logo-area").attr("href",
                                headerImageLink);

                        var scondLeft = jQuery(".left:nth-child(2)", topBar);
                        var scondLeftHtml = scondLeft.html();
                        scondLeftHtml = scondLeftHtml.replace(/aux-src=/ig,
                                "src=");
                        jQuery(".top-bar .left:nth-child(2)").html(scondLeftHtml);
                        jQuery(".top-bar .left:nth-child(2)").uxapply();

                        var menu = jQuery(".menu", topBar);
                        var menuHtml = menu.html();
                        menuHtml = menuHtml.replace(/aux-src=/ig, "src=");
                        jQuery(".top-bar .menu").replaceWith("<div class=\"menu system-menu\">"
                                + menuHtml + "</div>");
                        jQuery(".top-bar .menu").uxapply();
                    }

                    if (navigation) {
                        var navigationList = jQuery(
                                ".sidebar-left > .navigation-list", base);
                        var navigationListHtml = navigationList.html();
                        navigationListHtml = navigationListHtml.replace(
                                /aux-src=/ig, "src=");
                        jQuery(".sidebar-left > .navigation-list").html(navigationListHtml);
                        jQuery(".sidebar-left > .navigation-list").uxapply();
                        jQuery(".sidebar-left > .navigation-list").uxlist();

                        var chat = jQuery(".sidebar-left > .chat", base);
                        var url = chat.attr("data-url")
                        jQuery(".sidebar-left > .chat").attr("data-url", url);
                    }

                    var content = jQuery(".content", base);
                    var contentHtml = content.html();
                    contentHtml = contentHtml.replace(/aux-src=/ig, "src=");
                    jQuery(".content").html(contentHtml);
                    jQuery(".content").uxapply();

                    var sidebarRight = jQuery(".sidebar-right", base);
                    var sidebarRightHtml = sidebarRight.html();
                    sidebarRightHtml = sidebarRightHtml.replace(/aux-src=/ig,
                            "src=");
                    jQuery(".sidebar-right").html(sidebarRightHtml);
                    jQuery(".sidebar-right").uxapply();

                    var overlaySearch = base.filter(".overlay-search");
                    var overlaySearchHtml = overlaySearch.html();
                    overlaySearchHtml = overlaySearchHtml.replace(/aux-src=/ig,
                            "src=");
                    jQuery(".overlay-search").html(overlaySearchHtml);
                    jQuery(".overlay-search").uxapply();

                    var meta = base.filter(".meta")
                    var metaHtml = meta.html();
                    metaHtml = metaHtml.replace(/aux-src=/ig, "src=");
                    jQuery(".meta").html(metaHtml);
                    jQuery(".meta").uxapply();
                    jQuery("body").uconfigurations();
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
})(jQuery);
