(function(jQuery) {
    jQuery.fn.uasync = function() {
        /**
         * Flag that controls if a notification should be presented to the user
         * about the loading of the new contents.
         */
        var SHOW_NOTIFICATION = false;

        // sets the jquery matched object
        var matchedObject = this;

        var _validate = function() {
            var _body = jQuery("body");
            var async = !_body.hasClass("noajax");
            return window.FormData ? async : false;
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
                        // in case the control key is pressed the event operation is
                        // not meant to be overriden and should be ignored
                        if (event.metaKey || event.ctrlKey) {
                            return;
                        }

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
                        var result = jQuery.uxlinkasync(href, false);
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
            _body.bind("data", function(event, data, href, uuid, push, hbase) {
                        // in case no unique identifier for the state exists generates a new
                        // on in order to identify the current layout state
                        uuid = uuid || jQuery.uxguid();

                        // retrieves the default hiperlink base value as the target link value
                        // this value may be used to customize the url versus link resolution
                        hbase = hbase || href;

                        // creates the object that describes the current state with both the
                        // unique identifier of the state and the link that generated it
                        var state = {
                            uuid : uuid,
                            href : href
                        }

                        // in case this is not a verified operation the current state
                        // must be pushed into the history stack, so that we're able
                        // to rollback to it latter
                        push && window.history.pushState(state, null, href);

                        try {
                            // replaces the image source references in the requested
                            // data so that no extra images are loaded then loads the
                            // data as the base object structure
                            data = data.replace(/src=/ig, "aux-src=");
                            var base = jQuery(data);

                            // extracts the special body associated data from the data
                            // value escapes it with a special value and then creates
                            // the logical element representation for it
                            var bodyData = data.match(/<body.*>/)[0]
                                    + "</body>";
                            bodyData = bodyData.replace("body", "body_");
                            var body = jQuery(bodyData);

                            // retrieves the information on the current layout state and
                            // on the current base element state, so that options may be
                            // taken on the kind of transforms to apply
                            var _isFull = isFull();
                            var _isSimple = isSimple();
                            var _isBaseFull = isBaseFull(base);
                            var _isBaseSimple = isBaseSimple(base);

                            // verifies if the current layout and the target layout for
                            // loadinf are valid for layout change in case they're not
                            // raises an exception indicating the problem
                            var isValid = (_isFull || _isSimple)
                                    && (_isBaseFull || _isBaseSimple);
                            if (!isValid) {
                                throw "Invalid layout or layout not found";
                            }

                            // triggers the pre async event to notify the listening handlers
                            // that the async modification operations are going to be
                            // started and that the dom is going to be modified
                            _body.triggerHandler("pre_async");

                            // hides the current body reference so that all of the update
                            // operations occur with the ui disabled (faster performance)
                            // and the user experience is not broken
                            _body.hide();

                            // updates the base (resolution) tag in the document header
                            // so that it reflects the proper link resolution, expected
                            // for the current document state
                            updateBase(hbase);

                            // verifies if the kind of layout update to be performed is
                            // full or not and then executes the proper logic depending
                            // on the kind of update operation to be performed
                            var isUpdateFull = _isFull && _isBaseFull;
                            if (isUpdateFull) {
                                updateFull(base, body);
                            } else {
                                updateSimple(base, body);
                            }

                            // updates the globally unique identifier representation for
                            // the current state in the current structures
                            updateGuid(uuid);

                            // restores the display of the body so that the elements of
                            // it are restored to the user, also scroll the body element
                            // to the top so that the feel is of a new page
                            _body.show();
                            _body.scrollTop(0);

                            // triggers the post async event to notify the listening
                            // handlers about the end of the dom modification operations
                            // so that many operations may be resumed
                            _body.triggerHandler("post_async");
                        } catch (exception) {
                            window.history.back();
                            document.location = href;
                        }
                    });

            // registers for the async envent that should be triggered
            // as a validator for the asyncronous execution of calls, plugins
            // like the form should use this event to validate their
            // own behavior, and react to the result of this event
            _body.bind("async", function() {
                        var _isFull = isFull();
                        var _isSimple = isSimple();
                        return _isFull || _isSimple;
                    });

            // registers for the async start event that marks the
            // the start of a remote asycn call with the intension
            // of chaming the current layout
            _body.bind("async_start", function() {
                // in case the show notification flag is set the notification must
                // be created and show in the correct place
                if (SHOW_NOTIFICATION) {
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
                }

                // tries to retrieve the current top loader element, in case it's
                // not found inserts it in the correct position in the top bar
                var topLoader = jQuery(".top-loader");
                if (topLoader.length == 0) {
                    var rightPanel = jQuery(".top-bar > .content-wrapper > .right");
                    var topLoader = jQuery("<div class=\"top-loader\">"
                            + "<div class=\"loader-background\"></div>"
                            + "</div>");
                    rightPanel.after(topLoader);
                }

                // sets the top loader to the initial position then shows it in the
                // the current screen and runs the initial animation in it
                topLoader.width(0);
                topLoader.show();
                topLoader.animate({
                            width : 60
                        }, 100);
            });

            // registers for the async end event that marks the end of the remote
            // call that performs an async operation with the intesion of chaging
            // the current layout to remote the current loading structures
            _body.bind("async_end", function() {
                // in case the show nofication flag is set the notification must
                // be hidden so that the layout gets back to normal
                if (SHOW_NOTIFICATION) {
                    // retrieves the current notifications container and uses it to
                    // retrieve the current visible notification
                    var container = jQuery(".header-notifications-container");
                    var notification = jQuery(".header-notification", container);

                    // removes the loading notification, as the request has been
                    // completed with success (no need to display it anymore)
                    notification.remove();
                }

                // runs the final part of the loading animation, moving the loading
                // bar to the final part of the contents and fading it afterwards
                var topLoader = jQuery(".top-loader");
                topLoader.animate({
                            width : 566
                        }, 150, function() {
                            // verifies if the top loader is currently visible if that's
                            // the case fades it out (ux effect) otherwise hides it immediately
                            // to avoid problems with the fading effect
                            var isVisible = topLoader.is(":visible");
                            if (isVisible) {
                                topLoader.fadeOut(150);
                            } else {
                                topLoader.hide();
                            }
                        });
            });

            // registers for the location changed event in order to validated the
            // location changes for async execution then sets the async flag in the
            // current body in order duplicated registration
            _body.bind("location", function(event, location) {
                        // tries to runthe async link logic and in case it goes through
                        // cancels the current event returning an invalid value, so that
                        // the default location setting logic does not run
                        var result = jQuery.uxlinkasync(location, false);
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

            // registers the pop state changed handler function so that
            // it's possible to restore the state using an async approach
            window.onpopstate = function(event) {
                // verifies if the current state is valid by checking the current
                // document url agains the link defined in the state in case it's
                // the same or no state exists it's considered valid
                var isValid = event.state == null
                        || event.state.href == document.URL;

                // retrieves the proper uuid value to be used in the trigger
                // of the link action, taking into account the current state
                var uuid = event.state ? event.state.uuid : null;

                // in case the event raised contains no state (not pushed)
                // and the location or the location is the initial one the
                // async login must be run
                if (event.state != null || document.location == initial) {
                    var href = document.location;
                    isValid && jQuery.uxlinkasync(href, true, uuid);
                }

                // in case the initial location value is not set this is the
                // the right time to set it
                if (initial == null) {
                    initial = document.location;
                }
            };
        };

        // validates if the current system has support for the async
        // behavior in case it does not returns immediately avoiding
        // any async behavior to be applied, but first it unsets the
        // async flag in the current body to avoid async behavior
        var result = _validate();
        if (!result) {
            var _body = jQuery("body");
            _body.data("async", false);
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

        return true;
    };

    var isSimple = function() {
        var hasTopBar = jQuery(".top-bar").length > 0;
        if (!hasTopBar) {
            return false;
        }

        var contentWrapper = jQuery("body > .content-wrapper");
        var childCount = contentWrapper.children().length;

        if (childCount != 1) {
            return false;
        }

        return true;
    };

    var isBaseFull = function(base) {
        var hasTopBar = base.filter(".top-bar");
        if (!hasTopBar) {
            return false;
        }

        var hasSideLeft = jQuery(".sidebar-left", base).length > 0
        if (!hasSideLeft) {
            return false;
        }

        return true;
    };

    var isBaseSimple = function(base) {
        var contentWrapper = base.filter(".content-wrapper");
        var childCount = contentWrapper.children().length;

        if (childCount != 1) {
            return false;
        }

        return true;
    };

    var updateBase = function(hbase) {
        var _base = jQuery("head base");
        if (_base.length == 0) {
            var _head = jQuery("head");
            var _base = jQuery("<base></base>");
            _head.append(_base);
        }
        _base.attr("href", hbase);
    };

    var updateGuid = function(uuid) {
        var _body = jQuery("body");
        _body.attr("uuid", uuid);
    };

    var updateFull = function(base, body) {
        updateBody(body);
        updateIcon(base);
        updateResources(base);
        updateLocale(base);
        updateMeta(base);
        updateWindow(base);
        updateHeaderImage(base);
        updateSecondLeft(base);
        updateMenu(base);
        updateNotification(base);
        updateContent(base);
        updateFooter(base);
        updateNavigationList(base);
        updateSidebarRight(base);
        updateOverlaySearch(base);
        updateNotifications(base);
        updateChat(base);
    };

    var updateSimple = function(base, body) {
        updateBody(body);
        updateIcon(base);
        updateResources(base);
        updateLocale(base);
        updateMeta(base);
        updateWindow(base);
        updateHeaderImage(base);
        updateSecondLeft(base);
        updateMenu(base);
        updateNotification(base);
        updateContentFull(base);
        updateFooter(base);
        updateOverlaySearch(base);
        updateNotifications(base);
        updateChat(base);
    };

    var updateBody = function(body) {
        var _body = jQuery("body");
        var bodyClass = body.attr("class");
        _body.attr("class", bodyClass);
    };

    var updateIcon = function(base) {
        // updates the currently defined favicon with the new relative
        // path so that it does not become unreadable
        var icon = base.filter("[rel=\"shortcut icon\"]");
        var icon_ = jQuery("[rel=\"shortcut icon\"]");
        icon_.replaceWith(icon);
    };

    var updateResources = function(base) {
        // retrieves the references to the top level head
        // and body elements to be used in the resource update
        var _head = jQuery("head");
        var _body = jQuery("body");

        // retrieves the contents of the new base path and the
        // section value to be used in section comparision
        var section = jQuery("#section", base);
        var basePath = jQuery("#base-path", base);
        var section_ = jQuery(".meta > #section");

        // retrieves the complete set of contents from the sections
        // and the base path so that it's possible to verify if the
        // section has changed and if such change the sections list
        // value and inlcude the proper (specific) files
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

    var updateLocale = function(base) {
        // retrieves the currently set locale from the base
        // structure and uses it to update the data locale
        // attribute of the current content (locale change)
        var locale = jQuery("#locale", base);
        var locale_ = jQuery("[data-locale]");
        var language = locale.html().replace("_", "-");
        locale_.attr("data-locale", language);
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
        var menu = jQuery(".system-menu", topBar);
        var menu_ = jQuery(".top-bar .system-menu");
        var menuHtml = menu.html();
        menuHtml = menuHtml.replace(/aux-src=/ig, "src=");
        menu_.replaceWith("<div class=\"menu system-menu\">" + menuHtml
                + "</div>");
        menu_ = jQuery(".top-bar .system-menu");
        menu_.uxapply();
    };

    var updateNotification = function(base) {
        var container = jQuery(".header-notifications-container");
        var notifications = jQuery(".header-notification", base);
        container.empty();
        container.append(notifications);
        container.uxapply();
    };

    var updateContent = function(base) {
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

    var updateContentFull = function(base) {
        // retrieves the reference to both the new content structures
        // that are going to be used in the replace operation and to
        // the already existing content in the dom
        var content = base.filter(".content-wrapper");
        var content_ = jQuery("body > .content-wrapper");

        // fixes the content using the provided base value, this
        // should manipulate the base html structure so that only
        // the relevant nodes are left (the others are removed)
        fixContent(base, content);

        var contentClass = content.attr("class");
        var contentHtml = content.html();
        contentHtml = contentHtml.replace(/aux-src=/ig, "src=");
        content_.html(contentHtml);
        content_.attr("class", contentClass);
        content_.uxapply();
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
        // widows currently set the body element
        var windowOuter = base.filter(".window")
        var windowInner = jQuery(".window", base);
        var window = windowOuter.add(windowInner);
        var window_ = jQuery(".window");

        // tries to find the window placeholder section in the current
        // element in case it's not fond creates a new placeholder and
        // sets it in the content wrapper section of the body
        var placeholder = jQuery(".window-placeholder");
        if (placeholder.length == 0) {
            var _body = jQuery("body");
            placeholder = jQuery("<div class=\"window-placeholder\"></div>");
            _body.append(placeholder);
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

    var updateNavigationList = function(base) {
        var navigationList = jQuery(".sidebar-left > .navigation-list", base);
        var navigationList_ = jQuery(".sidebar-left > .navigation-list");
        var navigationListHtml = navigationList.html();
        navigationListHtml = navigationListHtml.replace(/aux-src=/ig, "src=");
        navigationList_.html(navigationListHtml);
        navigationList_.uxapply();
        navigationList_.uxlist();
    };

    var updateSidebarRight = function(base) {
        var sidebarRight = jQuery(".sidebar-right", base);
        var sidebarRight_ = jQuery(".sidebar-right");

        if (sidebarRight_.length == 0) {
            var content_ = jQuery(".content");
            content_.after(sidebarRight);
        }

        var sidebarRightHtml = sidebarRight.html() || "";
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

    var updateNotifications = function(base) {
        var notitifications = jQuery(".top-bar .notifications-menu");
        notitifications.triggerHandler("refresh");
        notitifications.triggerHandler("hide");
    };

    var updateChat = function(base) {
        var chat = jQuery(".chat", base);
        var chat_ = jQuery(".chat");
        var exists = chat_.length > 0;

        if (exists) {
            var sideLeft = jQuery(".sidebar-left");
            var chatParent = jQuery(".chat-parent");

            if (sideLeft.length > 0) {
                var parent = chat_.parent(".sidebar-left")
                parent.length == 0 && sideLeft.append(chat_);
            } else {
                var parent = chat_.parent(".chat-parent")
                parent.length == 0 && chatParent.append(chat_);
            }

            var url = chat.attr("data-url");
            chat_.attr("data-url", url);
            chat_.triggerHandler("init");
            chat_.triggerHandler("refresh");
        } else {
            var sideLeft = jQuery(".sidebar-left");
            sideLeft.append(chat);
            chat.uchat();
        }
    };

    var fixContent = function(base, content) {
        fixChat(base, content);
    };

    var fixChat = function(base, content) {
        var _body = jQuery("body");
        var chat = jQuery(".chat");
        if (chat.length > 0) {
            var _chat = jQuery(".chat", content);
            _chat.remove();
        }
        _body.append(chat);
    };
})(jQuery);
