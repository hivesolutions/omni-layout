// Hive Omni ERP
// Copyright (c) 2008-2016 Hive Solutions Lda.
//
// This file is part of Hive Omni ERP.
//
// Hive Omni ERP is free software: you can redistribute it and/or modify
// it under the terms of the Apache License as published by the Apache
// Foundation, either version 2.0 of the License, or (at your option) any
// later version.
//
// Hive Omni ERP is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// Apache License for more details.
//
// You should have received a copy of the Apache License along with
// Hive Omni ERP. If not, see <http://www.apache.org/licenses/>.

// __author__    = João Magalhães <joamag@hive.pt>
// __version__   = 1.0.0
// __revision__  = $LastChangedRevision$
// __date__      = $LastChangedDate$
// __copyright__ = Copyright (c) 2008-2016 Hive Solutions Lda.
// __license__   = Apache License, Version 2.0

(function(jQuery) {
    jQuery.fn.uapply = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // applies the async logic plugin to the current
        // matched object this should provide the structures
        // for the initial async execution
        matchedObject.uasync();

        // applies the configurations to the matched object
        // (global configurations)
        matchedObject.uconfigurations();

        // applies the top bar related configuations to the
        // current top level object
        matchedObject.utopbar();

        // starts the scan plugin system in the matched object
        // (this is going to be a global scan)
        matchedObject.uscan();

        // filters the menu elements from the current structure
        // structure and applies the menu logic on it
        var menu = matchedObject.filter(".system-menu");
        menu.umenu();

        // retrieves the menu elements for the the current
        // structure and applies the menu logic on it
        var menu = jQuery(".system-menu", matchedObject);
        menu.umenu();

        // retrieves the chat elements for the the current
        // structure and applies the chat logic on it
        var chat = jQuery(".chat", matchedObject)
        chat.uchat();

        // retrieves the notifications (menu) as the notifications
        // (panel) and then starts the notifications logic on it
        var notifications = jQuery(".notifications-menu", matchedObject);
        notifications.unotifications();

        // retrieves the eureka as the eureka and
        // then starts the eureka logic on it
        var eureka = jQuery(".eureka", matchedObject);
        eureka.ueureka();

        // retrieves the summary as the summary and
        // then starts the summary logic on it
        var summary = jQuery(".summary", matchedObject);
        summary.usummary();

        // retrieves the report as the report and
        // then starts the report logic on it
        var report = jQuery(".report", matchedObject);
        report.ureport();

        // retrieves the activity (list) element and starts
        // it with the activity logic (post processing)
        var activty = jQuery(".activity-list", matchedObject);
        activty.uactivity();

        // retrieves the sidebar sections as the set of side
        // elements to be processed with the proper extension
        var side = jQuery(".sidebar-section", matchedObject);
        side.uside();

        // retrieves the reference to the various images that are
        // going to be used as lightbox triggers
        var image = jQuery(".lightbox-trigger, .entity-big-picture > img",
            matchedObject);
        image.ulightbox();
    };
})(jQuery);

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
            links = links.filter(":not(.link-confirm)");

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
                // event should be ignored not meant to be overriden
                if (event.which == 2 || event.which == 3) {
                    return;
                }

                // retrieves the current element and the current link
                // associated so that it can be validated and tested in
                // the current async environment
                var element = jQuery(this);
                var href = element.attr("href");

                // verifies if the link element contains the flag class
                // that prevent the typical async behavior, if that's the
                // case the current method returns immediately
                var noAsync = element.hasClass("no-async");
                if (noAsync) {
                    return;
                }

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
                    uuid: uuid,
                    href: href
                };

                try {
                    // replaces the image source references in the requested
                    // data so that no extra images are loaded then loads the
                    // data as the base object structure
                    data = data.replace(/src=/ig, "aux-src=");
                    var base = jQuery(data);

                    // extracts the special body associated data from the data
                    // value escapes it with a special value and then creates
                    // the logical element representation for it
                    var bodyData = data.match(/<body.*>[^\0]*<\/body>/ig)[0];
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
                    var isValid = (_isFull || _isSimple) && (_isBaseFull || _isBaseSimple);
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

                    // in case this is not a verified operation the current state
                    // must be pushed into the history stack, so that we're able
                    // to rollback to it latter, note that in case the a google
                    // analytics reference exists a new event is triggered
                    push && window.history.pushState(state, null, href);
                    push && window._gaq && _gaq.push(["_trackPageview", href]);
                } catch (exception) {
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
                    var notification = jQuery("<div class=\"header-notification warning\"><strong>" +
                        loading + "</strong></div>");
                    container.append(notification);
                }

                // tries to retrieve the current top loader element, in case it's
                // not found inserts it in the correct position in the top bar
                var topLoader = jQuery(".top-loader");
                if (topLoader.length == 0) {
                    var rightPanel = jQuery(".top-bar > .content-wrapper > .right");
                    var topLoader = jQuery("<div class=\"top-loader\">" +
                        "<div class=\"loader-background\"></div>" + "</div>");
                    rightPanel.after(topLoader);
                }

                // sets the top loader to the initial position then shows it in the
                // the current screen and runs the initial animation in it
                topLoader.width(0);
                topLoader.show();
                topLoader.animate({
                    width: 60
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
                    width: 566
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

            // registers for the location changed event in order to validate the
            // location changes for async execution then sets the async flag in the
            // current body in order duplicated registration
            _body.bind("location", function(event, location) {
                // tries to run the async link logic and in case it goes through
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

            // while setting the pop handler for the first time, the first and
            // initial state must be populated with the current identifier and
            // the reference to the initial state, this is required to provide
            // compatability with the current invalid state support
            var href = document.location.href;
            var state = {
                uuid: jQuery.uxguid(),
                href: href
            };
            window.history.replaceState(state, null, href);

            // registers the pop state changed handler function so that
            // it's possible to restore the state using an async approach
            window.onpopstate = function(event) {
                // retrieves the proper uuid value to be used in the trigger
                // of the link action, taking into account the current state
                var uuid = event.state ? event.state.uuid : null;

                // in case the state of the event is invalid the value the event
                // is ignored and the current state is properly updated so that
                // the value becomes ready and available (just as a safety measure)
                if (event.state == null) {
                    var href = document.location.href;
                    var state = {
                        uuid: jQuery.uxguid(),
                        href: href
                    };
                    window.history.replaceState(state, null, href);
                    return;
                }

                // retrieves the location of the current document and uses it
                // to run the async redirection logic already used by the link
                // async infra-structure for the link click operations
                var href = document.location;
                jQuery.uxlinkasync(href, true, uuid);
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
        // object with the async logic and execution, note that the pop handler
        // has a delayed registration to avoid some problems with the initiaç
        // pop of state generated by some browsers (avoids bug)
        _registerHandlers();
        setTimeout(_setPopHandler);
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
        _body.uxbrowser();
        _body.uxfeature();
        _body.uxmobile();
        _body.uxresponsive();
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
        _head.append("<link rel=\"stylesheet\" href=\"" + basePathValue +
            "resources/css/layout.css\" type=\"text/css\" />");
        _head.append("<script type=\"text/javascript\" src=\"" + basePathValue +
            "resources/js/main.js\"></script>");
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
        var headerImageClass = headerImage.attr("class");
        var headerImageLink = headerImage.attr("href");
        headerImage_.attr("class", headerImageClass);
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
        menu_.replaceWith("<div class=\"menu system-menu\">" + menuHtml + "</div>");
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

        // retrieves the reference to the current overlay panel
        // that is used as background for the window so that it
        // may be hidden from the current interface
        var overlay = jQuery(".overlay");
        overlay.hide();

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
            var baseUrl = chat.attr("data-base_url");
            var key = chat.attr("data-key");
            chat_.attr("data-url", url);
            chat_.attr("data-base_url", baseUrl);
            chat_.attr("data-key", key);
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
        // retrieves the references to the various elements
        // that are going to be used in the chat fixing, note
        // that the chat parent may not exist
        var _body = jQuery("body");
        var chatParent = jQuery(".chat-parent");
        var chat = jQuery(".chat");

        // tries to find out the correct parent for the chat
        // verifying if there's a chat parent in the body,
        // otherwise uses the body as the parent structure for
        // the chat, note that if the proper parent is already
        // in use the chat is not re-added (performance issues)
        var parentQuery = chatParent.length > 0 ? ".chat-parent" : "body";
        var parentTarget = jQuery(parentQuery);
        var parent = chat.parent(parentQuery);
        parent.length == 0 && parentTarget.append(chat);

        // in case there's a chat structure already displayed
        // in the current view must remove the chat part from
        // the content so that it does not get duplicated
        if (chat.length > 0) {
            var _chat = jQuery(".chat", content);
            _chat.remove();
        }
    };
})(jQuery);

(function(jQuery) {
    jQuery.fn.uconfigurations = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // in case the current object ot be matched is not of type
        // body there's no need to continue (nothing to be done)
        var isBody = matchedObject.is("body");
        if (!isBody) {
            return;
        }

        // retrieves the various serializes (meta) elements
        // from the contents and parses the ones that are meant
        // to be parsed (using json)
        var basePath = jQuery("#base-path", matchedObject).html();
        var mvcPath = jQuery("#mvc-path", matchedObject).html();
        var locale = jQuery("#locale", matchedObject).html();
        var objectId = jQuery("#object-id", matchedObject).html();
        var username = jQuery("#username", matchedObject).html();
        var representation = jQuery("#representation", matchedObject).html();
        var definitionsS = jQuery("#definitions", matchedObject).html();
        var aliasS = jQuery("#alias", matchedObject).html();
        var definitions = definitionsS ? jQuery.parseJSON(definitionsS) : {};
        var alias = aliasS ? jQuery.parseJSON(aliasS) : {};
        var sections = definitions["sections"] || {};
        var classIdUrl = definitions["class_id_url"] || {};

        // creates the map that will hold the association between
        // the section name and the relative path for it
        var paths = {};

        // iterates over all the sections to construct the correct
        // paths map taking into account the alias map
        for (name in sections) {
            var section = sections[name];
            var path = alias[section] || section;
            paths[name] = path;
        }

        // creates the regular expression to be used to match the
        // values that are going to be replaces in the template url
        var tagRegex = new RegExp("\%\[[a-z]+\]", "g");

        // iterates over all the elements in the class id url map
        // to process their template items with the real section values
        for (classId in classIdUrl) {
            // retrieves the url for the current class identifier
            // in iteration (to replace and process it)
            var url = classIdUrl[classId];

            // iterates continuously over all the token elements
            // of the url to be replaced
            while (true) {
                // executes the tag regular expression and in case
                // there is no match breaks the loop, nothing more
                // to be replaced
                var result = tagRegex.exec(url);
                if (result == null) {
                    break;
                }

                // retrieves the first result from the match (first
                // and only group of the match)
                result = result[0];

                // retrieves the name of the tag from the result and
                // uses it to retrieve the target relative path and
                // replaces it in the url
                var name = result.slice(2, result.length - 1)
                var path = paths[name]
                url = url.replace(result, path);
            }

            // updates the class id url with the new url
            // value for the proper class id
            classIdUrl[classId] = url;
        }

        // updates the various (configuration) references in the
        // element to be used for reference latter
        matchedObject.data("base_path", basePath);
        matchedObject.data("mvc_path", mvcPath);
        matchedObject.data("locale", locale);
        matchedObject.data("object_id", objectId);
        matchedObject.data("username", username);
        matchedObject.data("representation", representation);
        matchedObject.data("definitions", definitions);
        matchedObject.data("alias", alias);
        matchedObject.data("sections", sections);
        matchedObject.data("class_id_url", classIdUrl);
    };
})(jQuery);

(function(jQuery) {
    jQuery.udates = function(timestamp) {
        var dateS = "n/a";

        if (timestamp < 60) {
            dateS = jQuery.uxlocale("just now");
        } else if (timestamp < 3600) {
            var minutes = Math.round(timestamp / 60);
            var label = minutes == 1 ? "min ago" : "mins ago";
            dateS = String(minutes) + " " + jQuery.uxlocale(label);
        } else if (timestamp < 86400) {
            var hours = Math.round(timestamp / 3600);
            var label = hours == 1 ? "hour ago" : "hours ago";
            dateS = String(hours) + " " + jQuery.uxlocale(label);
        } else {
            var days = Math.round(timestamp / 86400);
            var label = days == 1 ? "day ago" : "days ago";
            dateS = String(days) + " " + jQuery.uxlocale(label);
        }

        return dateS;
    };
})(jQuery);

(function(jQuery) {
    jQuery.uquery = function(param) {
        // retrieves the reference to the body element and uses
        // it to retrieve the currently set mvc path in case it's
        // not found raises an exception (not possible to run query)
        var _body = jQuery("body");
        var mvcPath = _body.data("mvc_path");
        if (!mvcPath) {
            throw jQuery.uxexception("No mvc path variable defined");
        }
        var alias = _body.data("alias") || {};

        // unpacks the various elements of the provided parameters
        // map, these are the elements to be used in the remote query
        var type = param["type"] || "get";
        var url = param["url"];
        var data = param["data"];
        var complete = param["complete"];
        var success = param["success"];
        var error = param["error"];

        // splits the url into the section and the remainder components
        // to be used for the section and alias construction
        var urlSplit = url.split("/");
        var section = urlSplit[0];
        var remainder = urlSplit.slice(1);

        // creates the section url fromthe alias and rejoins the values
        // to created the alias resolved url
        var sectionUrl = alias[section] || section;
        url = sectionUrl + "/" + remainder.join("/")

        // creates the complete url (from the partial one) by
        // prepending the mvc path to it
        url = mvcPath + url;

        // tries to retrieve the complete set of filters in case it+s
        // not found default to an empty list
        var filters = data["filters"] || [];
        var _filters = [];

        // iterates over the complete set of filters (filter structures)
        // in order to create the normalizes string based values for them
        for (var index = 0; index < filters.length; index++) {
            // retrieves the current filter list and unpacks it into
            // its components to be used to create the filter string
            var filter = filters[index];
            var name = filter[0];
            var value = filter.length == 3 ? String(filter[2]) : String(filter[1]);
            var operation = filter.length == 3 ? filter[1] : "equals";

            // creates the filter string from the various components of it
            // adds it to the list that will contain the various filter strings
            var _filter = name + ":" + operation + ":" + value;
            _filters.push(_filter);
        }

        // updates the filters reference in the data to the
        // normalized strings list and removes the previously
        // set filters reference (avoids naming collision)
        data["filters[]"] = _filters;
        delete data["filters"];

        // runs the remote http request with the specified
        // parameters including the composite url and the
        // transformed data object
        jQuery.ajax({
            type: type,
            url: url,
            data: data,
            complete: complete,
            success: success,
            error: error
        });
    };
})(jQuery);

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

        return this;
    };
})(jQuery);

(function(jQuery) {
    jQuery.fn.uscan = function(options) {
        /**
         * The length of the code to be scanned this value should be defined in
         * accordance with the defined specification.
         */
        var SCAN_CODE_LENGTH = 22;

        /**
         * The list of integer based versions that are compatible with the
         * client scan implementation.
         */
        var COMPATIBLE_VERSIONS = [1];

        // sets the jquery matched object
        var matchedObject = this;

        // in case the current object ot be matched is not of type
        // body there's no need to continue (nothing to be done)
        var isBody = matchedObject.is("body");
        if (!isBody) {
            return;
        }

        // retrieves the reference to the top level
        // document and body elements
        var _document = jQuery(document);
        var _body = jQuery("body");

        // registers for the scan event in the document
        // to be able to react to it
        _document.bind("scan", function(event, value) {
            // retrieves the current element that is the
            // target of the scan operation
            var element = jQuery(this);

            // retrieves the mvc path and the class id url
            // map for the current page
            var mvcPath = _body.data("mvc_path");
            var classIdUrl = _body.data("class_id_url");

            // verifies that the size of the code legnth
            // is of the expected size, otherwise returns
            // immediately not an expected code
            if (value.length != SCAN_CODE_LENGTH) {
                return;
            }

            // retrieves the checksum for the barcode value
            // in order to verify it against the base buffer
            // converts the value into an integer value and
            // then converts it back to a string (removal of
            // left based zeros)
            var checksumS = value.slice(0, 4);
            checksumS = parseInt(checksumS);
            checksumS = String(checksumS);

            // retrieves the checksum buffer from the complete
            // value and then computes the checksum string for
            // the value and compares it with the received
            // checksum value in case they do not match returns
            // immediately in error (invalid checksum)
            var buffer = value.slice(4);
            var _checksumS = checksum(buffer);
            if (_checksumS != checksumS) {
                return;
            }

            // retrieves the version of the barcode then
            // retrieves the class of the object that is
            // represented by the barcode and then retrieves
            // the identifier of the object
            var version = value.slice(4, 6);
            var classId = value.slice(6, 10);
            var objectId = value.slice(10);

            // converts the version into an integer
            // to be used in the resolution and verifies that
            // the "generated" integer is valid
            var versionInt = parseInt(version);
            if (isNaN(versionInt)) {
                return;
            }
            // converts the class identifier into an integer
            // to be used in the resolution and verifies that
            // the "generated" integer is valid
            var classIdInt = parseInt(classId);
            if (isNaN(classIdInt)) {
                return;
            }

            // converts the object identifier into an integer
            // to be used in the resolution and verifies that
            // the "generated" integer is valid
            var objectIdInt = parseInt(objectId);
            if (isNaN(objectId)) {
                return;
            }

            // verifies if the current integer version of the
            // provided scan value is compatible with the current
            // scan version (version is included in compatible
            // version set) in case it's not returns immediately
            var isCompatible = COMPATIBLE_VERSIONS.indexOf(versionInt) != -1;
            if (!isCompatible) {
                return;
            }

            // tries to retrieve the "partial" class url for
            // the class with the provided identifier in case
            // it's not found returns immediately in error
            var classUrl = classIdUrl[classIdInt];
            if (!classUrl) {
                return;
            }

            // sets the uscan attribute in the event so that
            // any other handler is able to "understand" that
            // the event has been handled as uscan
            event.uscan = true;

            try {
                // triggers the uscan handler so that any listening handler
                // should be able to handle the scan
                element.triggerHandler("uscan", [versionInt,
                    classIdInt, objectIdInt
                ]);
            } catch (exception) {
                // in case an exception was throw must return
                // immediately as the redirectionis meant to
                // be avoided (exception semantics)
                return;
            }

            // constructs the url using the base mvc path and
            // appending the url to the requested class
            var baseUrl = mvcPath + classUrl;

            // replaces the left padded zeros in the object
            // id to contruct the final object id, then uses
            // it to redirect the user agent to the show page
            objectId = objectId.replace(/^0+|\s+$/g, "");
            jQuery.uxlocation(baseUrl + objectId);
        });

        // registers for the scan erro event in the document
        // to be able to react to it
        _document.bind("scan_error", function(event, value) {});

        var checksum = function(buffer, modulus, salt) {
            // retrieves the various value for the provided
            // parameters defaulting to base valus in case
            // the values were not provided
            modulus = modulus || 10000;
            salt = salt || "omni";

            // creates the complete buffer value by adding
            // the salt value to the buffer and starts the
            // checksum counter value to zero
            var _buffer = buffer + salt;
            var counter = 0;

            // iterates over all the bytes in the buffer
            // to append their ordinal values to the counter
            // note that a left shift is done according to
            // the position of the byte
            for (var index = 0; index < _buffer.length; index++) {
                var _byte = _buffer[index];
                var byteI = _byte.charCodeAt(0);
                counter += byteI << index;
            }

            // retrieves the checksum as an integer with the modulus
            // operation on the current counter value, then converts
            // the value into a string and returns it to the caller
            // method as the final checksum value
            var checksum = counter % modulus;
            var checksumS = String(checksum);
            return checksumS;
        };
    };
})(jQuery);

(function(jQuery) {
    jQuery.fn.uactivity = function(options) {
        // retrieve the current element as the matched object
        var matchedObject = this;

        // retrieves the reference to the body element and uses
        // it to retrieve the mvc path and the class id url map
        var _body = jQuery("body");
        var mvcPath = _body.data("mvc_path");
        var classIdUrl = _body.data("class_id_url");

        // retrieves the current date and uses it to retrieve the current
        // timestamp value (according to the utf format)
        var date = new Date();
        var current = date.getTime();

        // iterates over all the element "inside" the currently matched
        // object to transfor them according to the specification
        matchedObject.each(function(index, element) {
            // retrieves the reference to the current element in iteration
            // and then "gathers" the complete set of items from it and the
            // complete set of links contained in them
            var _element = jQuery(this);
            var items = jQuery("> li", _element);
            var links = jQuery(".link", items);

            // iterates over all the items present in the activity list
            // to populate them with the appropriate description values
            items.each(function(index, element) {
                // retrieves the current element in iteration and then uses it
                // to retrieve the various elements that compose it
                var _element = jQuery(this);
                var data = jQuery(".data", _element);
                var time = jQuery(".time", _element);
                var description = jQuery(".activity-list-description", _element);

                // retrieves the current string value from the time field and
                // tries to parse it as a float value (as defined by specification)
                var timeS = time.text();
                var timeF = parseFloat(timeS);

                // calculates the diff by calculating the difference between
                // the current timestamp and the create date of the notification
                // and then converts it into the appropriate date string
                var diff = (current / 1000.0) - timeF;
                var diffS = jQuery.udates(diff);

                // updates the time element with the newly created diff
                // string that is not going to represent the element
                time.html(diffS);

                // retrieves the text value of the data element and then parses
                // it as json data so that a structure is created
                var dataS = data.text();
                var dataJ = jQuery.parseJSON(dataS);

                // in case the parsed data is not valid must return immediately
                // for the next iteration loop as nothing exists to be parsed
                if (dataJ == null) {
                    return;
                }

                // unpacks the various values from the json parsed data and
                // then localizes the message to the target value
                var message = dataJ["message"];
                var arguments = dataJ["arguments"];
                var meta = dataJ["meta"];
                message = jQuery.uxlocale(message);

                // retrieves the target as the first element of the meta attributes
                // and then unpacks it as the cid (class id) and the object id of
                // the target entity associated with the notification
                var target = meta[0];
                var cid = target[0];
                var objectId = target[1];

                // creates the base url from the mvc path and the class id url
                // resolved using the proper map and then creates the full link value
                // by adding the target entity object id
                var baseUrl = mvcPath + classIdUrl[cid];
                var link = baseUrl + objectId;

                // formats the current message using the provided arguments
                // (uses dynamic function calling)
                message = String.prototype.formatC.apply(message, arguments);

                // performs the various transformation operations on the message
                // so that the rendered value is html compliant
                message = jQuery.utemplate(message, true);

                // updates the current description message with the appropriate
                // message after all the transformation operations are performed
                description.html(message);

                // sets the data link attribute in the element and then starts it
                // as a button so that the proper click handler are created
                _element.attr("data-link", link);
                _element.uxbutton();
            });

            // registers for the mouse leave event so that
            // the next elements have the next class added
            items.mouseenter(function() {
                var _element = jQuery(this);
                var next = _element.next();
                next.addClass("next");
            });

            // registers for the mouse leave event so that
            // the next elements have the next class removed
            items.mouseleave(function() {
                var _element = jQuery(this);
                var next = _element.next();
                next.removeClass("next");
            });

            // registers for the click event in the link items
            // so that no propagation is done in the event
            links.click(function(event) {
                event.stopPropagation();
            });
        });
    };
})(jQuery);

(function(jQuery) {
    var BUNDLE_EN_US = {
        "payment_method:cash": "Cash",
        "payment_method:card": "Card",
        "payment_method:check": "Check",
        "payment_method:credit_note": "Credit Note",
        "payment_method:easypay": "Easypay",
        "payment_method:paypal": "Paypal",
        "Signing in to chat server": "Signing in to chat server",
        "You've been disconnected": "You've been disconnected",
        "mae": "me",
        "retrying ...": "retrying ...",
        "says ...": "says ...",
        "just now": "just now",
        "min ago": "min ago",
        "mins ago": "mins ago",
        "hour ago": "hour ago",
        "hours ago": "hours ago",
        "day ago": "day ago",
        "days ago": "days ago",
        "sold {{%s}} for {{%s}}": "sold {{%s}} for {{%s}}",
        "consigned {{%s}} for {{%s}}": "consigned {{%s}} for {{%s}}",
        "returned {{%s}} worth {{%s}} of sale {{%s}}": "returned {{%s}} worth {{%s}} of sale {{%s}}",
        "created {{%s}}": "created {{%s}}",
        "edited {{%s}}": "edited {{%s}}",
        "deleted {{%s}}": "deleted {{%s}}",
        "undeleted {{%s}}": "undeleted {{%s}}",
        "confirmed {{%s}}": "confirmed {{%s}}",
        "reserved {{%s}}": "reserved {{%s}}",
        "sent {{%s}}": "sent {{%s}}",
        "received {{%s}}": "received {{%s}}",
        "closed {{%s}}": "closed {{%s}}",
        "canceled {{%s}}": "canceled {{%s}}"
    }

    jQuery.uxloadbundle(BUNDLE_EN_US, "en-us")
})(jQuery);

(function(jQuery) {
    var BUNDLE_PT_PT = {
        "payment_method:cash": "Dinheiro",
        "payment_method:card": "Cartão",
        "payment_method:check": "Cheque",
        "payment_method:credit_note": "Nota de Crédito",
        "payment_method:easypay": "Easypay",
        "payment_method:paypal": "Paypal",
        "Signing in to chat server": "Ligando a servidor de chat",
        "You've been disconnected": "Ligação a servidor perdida",
        "mae": "eu",
        "retrying ...": "tentando de novo ...",
        "says ...": "diz ...",
        "just now": "agora mesmo",
        "min ago": "min atrás",
        "mins ago": "min atrás",
        "hour ago": "hora atrás",
        "hours ago": "horas atrás",
        "day ago": "dia atrás",
        "days ago": "dias atrás",
        "sold {{%s}} for {{%s}}": "vendeu {{%s}} por {{%s}}",
        "consigned {{%s}} for {{%s}}": "consignou {{%s}} por {{%s}}",
        "returned {{%s}} worth {{%s}} of sale {{%s}}": "retornou {{%s}} no valor de {{%s}} da venda {{%s}}",
        "created {{%s}}": "criou {{%s}}",
        "edited {{%s}}": "editou {{%s}}",
        "deleted {{%s}}": "apagou {{%s}}",
        "undeleted {{%s}}": "restaurou {{%s}}",
        "confirmed {{%s}}": "confirmou {{%s}}",
        "reserved {{%s}}": "reservou {{%s}}",
        "sent {{%s}}": "enviou {{%s}}",
        "received {{%s}}": "recebeu {{%s}}",
        "closed {{%s}}": "fechou {{%s}}",
        "canceled {{%s}}": "cancelou {{%s}}"
    }

    jQuery.uxloadbundle(BUNDLE_PT_PT, "pt-pt")
})(jQuery);

(function(jQuery) {
    jQuery.fn.uchat = function(options) {
        // sets the jquery matched object and validates
        // that the current size of it is valid otherwise
        // returns immediately to avoid extra computation
        var matchedObject = this;
        if (matchedObject.length == 0) {
            return;
        }

        // retrieves the reference to the "global" window
        // object to be used for calculus
        var _window = jQuery(window);

        // retrieves the global body element that is going
        // to be used for some event registration
        var _body = jQuery("body");

        var placePanels = function(panels, animate) {
            // retrieves the window dimensions, both the
            // height and the width
            var windowHeight = _window.height();
            var windowWidth = _window.width();

            // starts the extra margin value, with a value
            // that gives some space to the right
            var extraMargin = 14;

            // iterates over all the key value contained
            // in the map containing the panels
            for (var key in panels) {
                // retrieves the panel for the current key
                // in ieteration
                var panel = panels[key];

                // retrieves the panel height, width and offset
                // from the current (chat) panel in iteration
                var panelHeight = panel.outerHeight(true);
                var panelWidth = panel.outerWidth(true);
                var panelOffset = panel.data("offset") || 0;

                // "calculates" the top and left positions for the
                // panel from the panel dimensions and the current
                // visible window dimensions
                var chatTop = windowHeight - panelHeight + panelOffset;
                var chatLeft = windowWidth - panelWidth - extraMargin;

                // in case the animation mode is disabled must disable
                // the css animations for the current panel
                !animate && panel.uxanimation("disable");

                // sets the top and left positions of the panel, by
                // setting their respective css attributes
                panel.css("top", chatTop + "px");
                panel.css("left", chatLeft + "px");

                // updates the "extra" margin value, using the chat
                // width and the padding value
                extraMargin += panelWidth + 8;

                // schedules a delayed operation to restore the css based
                // animations for the current panel (in case it's required)
                setTimeout(function() {
                    !animate && panel.uxanimation("enable");
                });
            }
        };

        var createItem = function(matchedObject, data) {
            // retrieves the budy list for the current
            // chat instance for which the item is going
            // to be added, then uses the the list to retrive
            // the complete set of items in it
            var budyList = jQuery(".buddy-list", matchedObject);
            var items = jQuery("li", budyList);

            // unpacks the data structure into the various
            // component of the user, in order to be able to
            // construct the list item representing it
            var status = data["status"];
            var objectId = data["object_id"];
            var username = data["username"];
            var representation = data["representation"];

            // creates the list item (budy item) used to represent
            // the user and adds it to the buddy list
            var item = jQuery("<li class=\"budy-" + status + "\" data-user_id=\"" + username +
                "\" data-object_id=\"" + objectId + "\">" + representation + "</li>");

            // starts the target element (the one after the current element)
            // as invalid so that by default no target is used and then starts
            // the iteration arround the complete set of items to try to uncover
            // the proper target item to be used as pivot
            var target = null;
            items.each(function() {
                // retrieves the current element and the text representation
                // of it to be used in the order of the items
                var element = jQuery(this);
                var value = element.text();

                // in case the current value is the same or less than the
                // current representation no larger value found and so the
                // iteration must continue
                if (value <= representation) {
                    return;
                }

                // in case the control flow has reached this position the
                // target element has been found and so it breaks the iteration
                target = element;
                return false;
            });

            // in case the target element exists inserts the item before
            // the target element otherwise adds the item to the budy list
            target ? target.before(item) : budyList.append(item);

            // registers for the click event on the item so that
            // a new chat panel is created for the the item in
            // case it's required
            item.click(function() {
                // retrieves the reference to the current "clicked"
                // element and then gathers information from the element to
                // be used in the creation of the new chat panel
                var element = jQuery(this);
                var name = element.html();
                var userId = element.attr("data-user_id");
                var objectId = element.attr("data-object_id");

                // creates a new chat panel for the current matched
                // object (chat system) using the current context
                matchedObject.uchatpanel({
                    owner: matchedObject,
                    name: name,
                    user_id: userId,
                    object_id: objectId,
                    focus: true
                });
            });
        };

        var dataProcessor = function(data, mid, timestamp) {
            // parses the data retrieving the json
            // then unpacks the various attributes from it
            var isString = typeof data == "string";
            var jsonData = isString ? jQuery.parseJSON(data) : data;
            var type = jsonData["type"];

            // switches over the type of data that was received
            // handling the different data types accordingly
            switch (type) {
                case "message":
                    messageProcessor(jsonData, mid, timestamp);
                    break;

                case "status":
                    statusProcessor(jsonData);
                    break;

                default:
                    break;
            }
        };

        var messageProcessor = function(envelope, mid, timestamp) {
            // retrieves the current body element and uses it to retrieve
            // the currently loaded username
            var _body = jQuery("body");
            var username = _body.data("username");

            // retrieves the main attributes from the
            // message to be used in the processing
            var message = envelope["message"];
            var sender = envelope["sender"];
            var receiver = envelope["receiver"];

            // defaults the sender to the appropriate value taking into
            // account if the sender is the current user for that case the
            // username should be the receiver
            var owner = sender == username ? receiver : sender

            // retrieves the user status map from the currently matched
            // object and retrieves the reference to the sender from it
            // in case it's not available returns immediately as it's not
            // going to be handled by the message processor
            var userStatus = matchedObject.data("user_status");
            var userS = userStatus[owner];
            if (!userS) {
                return;
            }

            // unpacks some information from the user information structure
            // to be used for the creation of some chat components
            var objectId = userS["object_id"];
            var representation = userS["representation"];

            // tries to retrieve the panel associated with the
            // sender in case no panel is found creates a new
            // one to display the initial message
            var panel = jQuery(".chat-panel[data-user_id=" + owner + "]",
                matchedObject);
            if (panel.length == 0) {
                // create a new chat panel for to be used to the conversation
                // that is going to be started from this (received message)
                panel = matchedObject.uchatpanel({
                    owner: matchedObject,
                    name: representation,
                    user_id: owner,
                    object_id: objectId
                });
            }

            // retrieves the correct name value to be used as the representation
            // of the current line this value should be coherent with the sender
            // username relation, defaulting to me in case it's the same
            var myself = sender == username;
            var name = myself ? "me" : representation;

            // creates the localized version of the message for the blink effect
            // using the anme of the peer as the base for the message
            var title = jQuery.uxlocale("says ...");
            title = name + " " + title;

            // triggers the restore event to show up the panel
            // and then adds a chat line to the panel containing
            // the message that was just received
            panel.trigger("restore");
            panel.uchatline({
                name: name,
                message: message,
                mid: mid,
                timestamp: timestamp
            });

            // verifies if this is a myself message or a message from somebody else
            // and takes the proper action in terms of blinking, note that if the
            // message is from myself no blinking should occur (action taken)
            if (myself) {
                // triggers the unblink event that should remove the
                // current blinking message from visuals
                panel.triggerHandler("unblink");
            } else {
                // triggers the blinking text into the current context
                // with the message that has been created
                panel.triggerHandler("blink", [title]);

                // retrieves the reference to the audio object of the
                // current object and plays it (audio blinking)
                var audio = jQuery("> audio", matchedObject);
                audio[0].play();
            }
        };

        var statusProcessor = function(envelope) {
            // retrieves the "global" reference to the body element
            // used for the communication
            var _body = jQuery("body");

            // retrieves the username of the currently logged user
            // to compare it with the one in the status update
            var username = _body.data("username");

            // retrieves the complete set of components (attributes)
            // from the envelope containing the received message
            var status = envelope["status"];
            var objectId = envelope["object_id"];
            var _username = envelope["username"];
            var representation = envelope["representation"];

            // updates the user structure information so that
            // it contains the latest version of the information
            // provided by the server data source
            var userStatus = matchedObject.data("user_status") || {};
            var userS = userStatus[_username] || {};
            userS["status"] = status;
            userS["object_id"] = objectId;
            userS["username"] = _username;
            userS["representation"] = representation;
            userStatus[_username] = userS;
            matchedObject.data("user_status", userStatus);

            // in case the current status update refers the current
            // users, must return immediately
            if (username == _username) {
                return;
            }

            // switches over the status contained in the evelope to
            // correctly handle the received message and act on that
            // to change the current layout
            switch (status) {
                case "offline":
                    var item = jQuery(".buddy-list > li[data-user_id=" + _username + "]", matchedObject)
                    item.remove();

                    // retrieves the complete set of panels and tries
                    // to find the one for the user to be logged out
                    // and in case it exists disables it
                    var panels = matchedObject.data("panels") || {};
                    var panel = panels[representation];
                    panel && panel.triggerHandler("disable");

                    break;

                default:
                    var item = jQuery(".buddy-list > li[data-user_id=" + _username + "]", matchedObject)
                    if (item.length == 0) {
                        createItem(matchedObject, envelope);
                    }
                    item.removeClass("budy-online");
                    item.removeClass("budy-busy");
                    item.removeClass("budy-unavailable");
                    item.addClass("budy-" + status);

                    // retrieves the complete set of panels and tries
                    // to find the one for the user to be logged in
                    // and in case it exists enables it
                    var panels = matchedObject.data("panels") || {};
                    var panel = panels[representation];
                    panel && panel.triggerHandler("enable");

                    break;
            }
        };

        // iterateas over each of the matched object to add the sound
        // element to be used in notification
        matchedObject.each(function(index, element) {
            // retrieves the reference to the current element in
            // iteration and uses it to retrieve a series of parts
            // of the element that compose it for further usage
            var _element = jQuery(this);

            // checks if the current element is already connection registered
            // in case it is avoid the current logic (skips registration)
            var isRegistered = _element.data("registered") || false;
            if (isRegistered) {
                return;
            }

            // sets the current element as registered avoiding any extra
            // registration in the current context (could cause problems)
            _element.data("registered", true);

            // retrieves the "global" reference to the body element
            // to be used for the communication
            var _body = jQuery("body");

            // retrieves the reference to the variable containing
            var username = _body.data("username");

            // updates the username set in the current account to
            // match the one considered to be the new one
            _element.data("username", username);

            // retrieves the url value to be used for the chat
            // communication, and then creates the full absolute ur
            // from the base url and the communication suffix
            var url = _element.attr("data-url");
            var absolueUrl = jQuery.uxresolve(url + "/pushi.json");

            // retrieves the base url and the app key values to be
            // used for the establishement of the pushi connection,
            // then uses them as the various arguments in the construction
            // of the proxy object
            var url = _element.attr("data-base_url");
            var key = _element.attr("data-key");
            var pushi = new Pushi(key, {
                baseUrl: url,
                authEndpoint: absolueUrl
            });

            // registers for the connect event in the pushi connection in
            // or to be able to register for the channels and to re-enable
            // all the visuals to the default situation
            pushi.bind("connect", function(event) {
                // runs the initial subscription of the channels related with
                // the current chat operations
                this.subscribe("global");
                this.subscribe("presence-status");

                // updates the main status class so the layout may
                // be update according to the status rules
                _element.removeClass("disconnected");
                _element.addClass("connected");

                // retrieves the buddy list associated with the element and
                // clears the current budy list so that it can get populated
                // with the "new" members that are part of the presence channel
                // these are considered to be the new subscriptions
                var buddyList = jQuery("> .buddy-list",
                    _element);
                buddyList.empty();
            });

            // registers for the disconnect event in the pushi connection
            // to be able to change the layout properly disabling the complete
            // set of panels and setting the names panel to disconnected
            pushi.bind("disconnect", function(even) {
                // updates the main status class so the layout may
                // be update according to the status rules
                _element.removeClass("connected");
                _element.addClass("disconnected");

                // gathers all of the panels for the chat and disables them
                // as no communication is allowed for them anymore
                var panels = _element.data("panels") || {};
                for (var key in panels) {
                    var panel = panels[key];
                    panel.triggerHandler("disable");
                }
            });

            // register to the subscribe event in the current pushi
            // object so that its able to detect the registration
            // of the various channel and act on them
            pushi.bind("subscribe", function(event, channel, data) {
                // in case the channel that has been registered is not
                // the presence status nothing is meant to be done and
                // so the control flow returns immediately
                if (channel != "presence-status") {
                    return;
                }

                // retrieves the buddy list associated with the element and
                // clears the current budy list so that it can get populated
                // with the "new" members that are part of the presence channel
                // these are considered to be the new subscriptions
                var buddyList = jQuery("> .buddy-list",
                    _element);
                buddyList.empty();

                // retrieves the list of online members for the current channel
                // and then iterates over them to be able to trigger the online
                // status changed event for each them
                var members = data.members || {};
                for (var key in members) {
                    var member = members[key];
                    var envelope = {
                        type: "status",
                        status: "online",
                        object_id: member.object_id,
                        username: member.username,
                        representation: member.representation
                    };
                    dataProcessor(envelope);
                }
            });

            pushi.bind("message",
                function(event, data, channel, mid, timestamp) {
                    dataProcessor(data, mid, timestamp);
                });

            pushi.bind("member_added",
                function(event, channel, member) {
                    var envelope = {
                        type: "status",
                        status: "online",
                        object_id: member.object_id,
                        username: member.username,
                        representation: member.representation
                    };
                    dataProcessor(envelope);
                });

            pushi.bind("member_removed",
                function(event, channel, member) {
                    var envelope = {
                        type: "status",
                        status: "offline",
                        object_id: member.object_id,
                        username: member.username,
                        representation: member.representation
                    };
                    dataProcessor(envelope);
                });

            // saves the current pushi object reference for
            // latter usage, in the current instance
            _element.data("pushi", pushi);

            // retrieves the value of the sound ti be played (the
            // url to the sound to be played)
            var sound = _element.attr("data-sound");
            var audio = jQuery("<audio src=\"" + sound + "\" preload=\"none\"></audio>");

            // adds the audio element to the matched object
            // then retrieves the underlying audio element
            // and loads it from the server side
            _element.append(audio);
            audio[0].load();
        });

        // registers for the init event that should initialize
        // the chat with the correct values, support for "safe"
        // re-initialization is available and should be used
        matchedObject.bind("init", function() {
            // retrieves the reference to the current elment
            // that its going to be initialized
            var element = jQuery(this);

            // retrieves the reference to the body element and then
            // uses it to retrieves the currently logged  username
            var _body = jQuery("body");
            var username = _body.data("username");

            // verifies if the chat panel is meant to be set as visible
            // or invisible, this is done by checking it agains the proper
            // side bar existence (or not)
            var isVisible = element.parent(".sidebar");
            if (isVisible.length > 0) {
                element.removeClass("invisible");
            } else {
                element.addClass("invisible");
            }

            // localizes the various strings so that they are presented
            // in the correct locale language
            var signinS = jQuery.uxlocale("Signing in to chat server");
            var disconnectedS = jQuery.uxlocale("You've been disconnected");
            var retryingS = jQuery.uxlocale("retrying ...");

            // retrieves the various components of the chat panel so that
            // they may be updated if thats the case
            var buddyList = jQuery("> .buddy-list", element);
            var loading = jQuery("> .loading", element);
            var disconnected = jQuery("> .disconnected", element);

            // checks if there's alrady a buddy list for the current chat
            // panel (retrieval list greater than zero)
            var hasBuddyList = buddyList.length > 0;

            // removes the various localizable components, so that new ones
            // may be added with the new locale information
            loading.remove();
            disconnected.remove();

            // adds the various parts of the chat component with their strings
            // already correctly localized according to the specification
            !hasBuddyList
                && element.append("<ul class=\"list buddy-list\"></ul>");
            element.append("<div class=\"loading\">" + signinS + "<br /><b>" + username + "</b></div>");
            element.append("<div class=\"disconnected\">" + disconnectedS + "<br /><b>" + retryingS +
                "</b></div>");
        });

        // registers for the event triggered when a new chat
        // is requested this shoud create a new chat panel
        matchedObject.bind("new_chat", function() {
            var panels = matchedObject.data("panels") || {};
            placePanels(panels, true);
        });

        // registers for the event triggered when a chat is
        // meant to be removed from the current system this
        // should remove the associated panel
        matchedObject.bind("delete_chat", function() {
            var panels = matchedObject.data("panels") || {};
            placePanels(panels, true);
        });

        // registers for the refresh event for the chat panel
        // this event should try to find out any modification
        // in the current global status and act on that
        matchedObject.bind("refresh", function() {
            // retrieves the reference to both the current element and the
            // top level body element
            var element = jQuery(this);
            var _body = jQuery("body");

            // retrieves the name of the currently signed in user
            // and the name of the user registered in the chat in
            // case they do not match there's an incoherence and
            // the chat panel must be updated
            var username = _body.data("username");
            var _username = element.data("username");
            if (username == _username) {
                return;
            }

            // updates the chat panel data with the new username
            // so that it may be used latter
            element.data("username", username);

            // retrieves the reference to the complete set of chat
            // panels of the current chat panel and then removes
            // them from the layout (not going to be used anymore)
            var panels = element.data("panels") || {};
            for (var key in panels) {
                var panel = panels[key];
                panel.triggerHandler("close");
            }
            element.data("panels", {})

            // retrieves the reference to the current pushi instance/object
            // and then verifies if it's still considered valid by checking
            // the current base url and app key value assigned to the element
            var pushi = element.data("pushi");
            var url = element.attr("data-base_url");
            var key = element.attr("data-key");
            var isValid = pushi.isValid(key, url);

            // in case the current configuration is valid there's just a restart
            // of the subscription process for the presence and the global channels,
            // this is done mostly for security reasons (requires re-authentication)
            if (isValid) {
                pushi.invalidate("global");
                pushi.invalidate("presence-status");
                pushi.subscribe("global");
                pushi.subscribe("presence-status");
            }
            // otherwise the configuration must be changed in the pushi object and
            // then a (re-)open process must be triggered in it so that the connection
            // is set under a valid state for the new key and (base) url values
            else {
                pushi.reconfig(key, {
                    baseUrl: url,
                    authEndpoint: pushi.options.authEndpoint
                });
            }
        });

        matchedObject.bind("push", function() {
            var element = jQuery(this);
            var panels = element.data("panels") || {};
            for (var key in panels) {
                var panel = panels[key];
                panel.triggerHandler("push");
            }
        });

        matchedObject.bind("pop", function() {
            var element = jQuery(this);
            var panels = element.data("panels") || {};
            for (var key in panels) {
                var panel = panels[key];
                panel.triggerHandler("pop");
            }
        });

        // registers for the resize operation in the window to position
        // all of the currently defined panels in the correct place, note
        // that after the chat destruction the registration is disabled
        matchedObject.length > 0 && _window.resize(onResize = function() {
            var panels = matchedObject.data("panels") || {};
            placePanels(panels, false);
        });
        matchedObject.bind("destroyed", function() {
            _window.unbind("resize", onResize);
        });

        // registers for the pre async event in order to push the
        // current state of the chat elements so that the state
        // may be restored (pop operation) in the post async
        matchedObject.length > 0 && _body.bind("pre_async", onPreAsync = function() {
            matchedObject.triggerHandler("push");
        });
        matchedObject.bind("destroyed", function() {
            _body.unbind("pre_async", onPreAsync);
        });

        // enables the post async event listening to be able to
        // restore the state of the chat element back to the original
        // values before the async operation, note that this registration
        // is reverted when the chat panel is removed from dom
        matchedObject.length > 0 && _body.bind("post_async", onPostAsync = function() {
            matchedObject.triggerHandler("pop");
        });
        matchedObject.bind("destroyed", function() {
            _body.unbind("post_async", onPostAsync);
        });

        matchedObject.triggerHandler("init");
    };
})(jQuery);

(function(jQuery) {

    /**
     * The minimum size in pixels to be used for the content area of the chat
     * panel this will be used in the resizing of the text are to compensate for
     * the extra content.
     */
    var MINIMUM_CONTENT_HEIGHT = 80;

    jQuery.fn.uchatpanel = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // retrieves the refernce to the top level element
        // body element to be able to operate globally
        var _body = jQuery("body");

        // retrives the various options to be used in the
        // creation of the chat panel
        var owner = options["owner"];
        var name = options["name"];
        var userId = options["user_id"];
        var objectId = options["object_id"];
        var ownerId = options["owner_id"];
        var large = options["large"];
        var focus = options["focus"];

        // runs the default operation on the large in case
        // the value is not provided as expected
        large = large === undefined ? owner.hasClass("large") : large;

        // retrieves the username associated with the current
        // instance and uses it together with the current panel
        // user id to create the list of names to be used in the
        // channel (for channel composition)
        var username = _body.data("username");
        var channelNames = [username, userId];

        // sorts the list that contains the partial names
        // to be used in the channel naming and the joins
        // them with the appropriate separator
        channelNames.sort();
        var channel = channelNames.join("&");

        // retrieves the current map containin the panels
        // indexed by their "key name" and default to a new
        // map in case it does not exists then tries to retrieve
        // the chat panel with the current name and in case it
        // already exists returns immediately, but retoring it
        // to the front so that it can be used right away
        var panels = matchedObject.data("panels") || {};
        var chatPanel = panels[name];
        if (chatPanel) {
            chatPanel.triggerHandler("restore");
            return chatPanel;
        }

        // creates the chat panel structure containing the "typical"
        // header, contents and message structure then appends the
        // structure to the matched object (chat area) and applies the
        // initializers to the structure and sets the name in it, note
        // that an extra hidden text area is created as it will be used
        // to measure the height of the text contained in the (real)
        // text area and properly act for its resize if required
        chatPanel = jQuery("<div class=\"chat-panel empty budy-available\">" + "<div class=\"chat-header\">" +
            name + "<div class=\"chat-buttons\">" + "<div class=\"chat-button chat-settings\"></div>" +
            "<div class=\"chat-button chat-close\"></div>" + "</div>" + "</div>" +
            "<div class=\"chat-contents\"></div>" + "<div class=\"chat-message\">" +
            "<textarea type=\"text\" class=\"text-area\"></textarea>" +
            "<textarea type=\"text\" class=\"text-area hidden\"></textarea>" + "</div>" + "</div>");
        matchedObject.append(chatPanel);
        chatPanel.uxapply();
        chatPanel.hide();
        chatPanel.attr("data-user_id", userId);
        chatPanel.data("name", name);
        chatPanel.data("owner", owner);
        chatPanel.data("user_id", userId);
        chatPanel.data("object_id", objectId);
        chatPanel.data("owner_id", ownerId);

        // in case the large flag is set the large class is added
        // to the chat panel to set it to large mode
        large && chatPanel.addClass("large");

        // initalizes a series of values that are going to be calculated
        // once the panel is displayed and that will be used for the
        // calculus of the text area height (area growing/shrinking)
        var currentScroll = 0;
        var maxScrollHeight = 0;

        // creates the function that will be used for the display of the
        // shat panel under the current environment, the display is performed
        // using a fade in operation (for smoth display)
        var show = function(timeout) {
            // runs the fade in operation for the created chat panel, this
            // will start showing the panel and provinding the required
            // environment for further height measures
            chatPanel.fadeIn(timeout);

            // retrieves both the height of the contents section and the
            // (current/original) scroll height of the text area, then
            // uses them to compute the maximum scroll height to be used
            // for the calculus of the maximum text area height
            var contentsHeight = contents.height();
            currentScroll = textArea[0].scrollHeight;
            maxScrollHeight = currentScroll + contentsHeight - MINIMUM_CONTENT_HEIGHT;
        };

        // creates the function that will be used to request more chat lines
        // from the server side, this operation should take into account the
        // current chat status and reduce the server communications to a minimum
        var more = function(count, target) {
            // runs the defaulting operation on the provided count value so
            // that the value is allways defined according to specification
            count = count || 20;

            // in case the current chat panel still has a pending more action
            // must ignore the current one, can only process one request at a
            // time in order to avoid possible async issues
            var pending = chatPanel.data("pending");
            if (pending) {
                setTimeout(function() {
                    more(count, target);
                }, 100);
                return;
            }
            chatPanel.data("pending", true);

            // retrieve the complete set of chat lines available in the current
            // chat panel and uses the count of it as the skip of the query, this
            // operation assumes a proper order in the chat messages receival
            var chatLines = jQuery(".chat-line", chatPanel);
            var skip = chatLines.length;

            // retrieves the reference to the pushi data structure from the owner
            // and then tries to retrieve the latest information/messages for the
            // current peer channel this would populate the chat initialy
            var pushi = owner.data("pushi");
            pushi.latest("peer-status:" + channel, skip, count,
                function(channel, data) {
                    // retrieves the reference to the events sequence from the
                    // provided data object, this value will be percolated
                    // to be able to create the initial chat lines
                    var events = data.events;
                    for (var index = 0; index < events.length; index++) {
                        var event = events[index];
                        var mid = event.mid;
                        var timestamp = event.timestamp;
                        var _data = event.data.data;
                        var struct = _data ? jQuery.parseJSON(_data) : _data;
                        chatPanel.uchatline({
                            name: struct.sender == username ? "me" : name,
                            message: struct.message,
                            mid: mid,
                            timestamp: timestamp,
                            target: target
                        });
                    }
                    chatPanel.data("pending", false);
                });
        };

        // runs the show/display operation in the created chat panel so that
        // it becomes visible after the animation (as expected), note that
        // this operation is delayed so that the panel is only positioned
        // once the left and top positions are defined (by the panel placer)
        // by the owner (chat structure) of this chat panel
        setTimeout(function() {
            show(75);
        });

        // runs the more operation for the current chat panel so that it gets
        // pre-populated with some information from history, this way the
        // end user gets access to some context in the new chat session
        more();

        // retrieves the various components (structures) from the chat pane
        // in order to be used in the operations
        var header = jQuery(".chat-header", chatPanel);
        var contents = jQuery(".chat-contents", chatPanel);
        var message = jQuery(".chat-message", chatPanel);
        var buttonClose = jQuery(".chat-close", chatPanel);
        var buttonMinimize = jQuery(".chat-minimize", chatPanel);
        var textArea = jQuery(".chat-message > .text-area:not(.hidden)",
            chatPanel);
        var textAreaHidden = jQuery(".chat-message > .text-area.hidden",
            chatPanel);

        // registers for the enable operation, this should re-enable
        // the interaction with the chat panel (text area)
        chatPanel.bind("enable", function() {
            // retrieves the reference to the current element
            // to be used in the enable operation
            var element = jQuery(this);

            // removes the disabled class from the element as
            // the interaction should be enabled in the element
            element.removeClass("disabled");

            // retrieves the text area of the chat panel and the
            // re-enable it for interaction
            var textArea = jQuery(
                ".chat-message > .text-area:not(.hidden)", element);
            textArea.uxenable();
        });

        // registers for the disable operation, this operation should
        // disallow any further interaction with the chat panel
        chatPanel.bind("disable", function() {
            // retrieves the reference to the current element
            // to be used in the disable operation
            var element = jQuery(this);

            // adds the disabled class to the current element so
            // that the proper style is set in the panel
            element.addClass("disabled");

            // retrieves the text area component for the current
            // element and then disables it (no more interaction
            // is allowed fot the chat panel)
            var textArea = jQuery(
                ".chat-message > .text-area:not(.hidden)", element);
            textArea.uxdisable();

            // triggers the unblick event because a disabled panel
            // is not able to blink (no interaction)
            element.triggerHandler("unblink");
        });

        // binds the chat panel to the minimize operation in order
        // to be able to minimize the contents of it
        chatPanel.bind("minimize", function() {
            // retrieves the reference to the current element
            // to be used in the restore operation ad verifies
            // if the kind of animation to be used is discrete
            var element = jQuery(this);
            var discrete = element.data("discrete") || false;

            // verifies if the minimize operation is meant to be
            // performed in a discrete manner or not, meaning that
            // an offset position should be used or not
            if (discrete) {
                // hides the contents and the message parts of
                // the current chat panel
                contents.hide();
                message.hide();
            } else {
                // tries to retrieve a possible border in the
                // bottom of the chat panel and parsed the value
                // as an integer to get its width
                var borderBottom = element.css("border-bottom");
                borderBottom = borderBottom || element.css("border-bottom-width");
                var borderWidth = parseInt(borderBottom);
                borderWidth = borderWidth || 0;

                // retrieves the height of both the contents and
                // message areas and then calculates the final
                // offset from their height values and a possible
                // extra border value from the chat panels
                var contentsHeight = contents.outerHeight(true);
                var messageHeight = message.outerHeight(true);
                var offset = contentsHeight + messageHeight + borderWidth;

                // updates the element's offset value so that
                // any new layout operation will take that into
                // account and move the chat panel down
                element.data("offset", offset);
            }

            // triggers the layout event (reposition the window)
            // and sets the current element as minimized
            element.triggerHandler("layout", []);
            element.data("minimized", true);
        });

        // binds the chat panel to the restore operation in order
        // to be able to "restore" the contents of it
        chatPanel.bind("restore", function() {
            // retrieves the reference to the current element
            // to be used in the restore operation ad verifies
            // if the kind of animation to be used is discrete
            var element = jQuery(this);
            var discrete = element.data("discrete") || false;

            // verifies if the restore operation is meant to be
            // performed in a discrete manner or not, meaning that
            // an offset position should be used or not
            if (discrete) {
                // shows the contents and the message parts of
                // the current chat panel and schedules the focus
                // on the text area for the next tick
                contents.show();
                message.show();
            } else {
                // restores the offset of the current element to
                // the original (zero value) brings it to top
                element.data("offset", 0);
            }

            // triggers the layout event (reposition the window)
            // and sets the current element as maximized
            element.triggerHandler("layout", []);
            element.data("minimized", false);
        });

        // binds the chat panel to the layout operation in order
        // to be able to "draw" the contents of it correctly
        chatPanel.bind("layout", function() {
            // retrieves the reference to the current element
            // to be used in the layout operation and the value
            // of it's current offset for top value calculus
            var element = jQuery(this);
            var offset = element.data("offset") || 0;

            // retrieves the reference to the "global" window
            // element to be used in the positioning
            var _window = jQuery(window);

            // retrieves the height of both the window and the
            // panel and uses both values to calculate the top
            // position for the panel
            var windowHeight = _window.height();
            var panelHeight = element.outerHeight(true);
            var panelTop = windowHeight - panelHeight + offset;

            // sets the top position of the element as the "calculated"
            // value for the panel top
            element.css("top", panelTop + "px");
        });

        // regiters for the blink event so that the blink operation
        // may be triggered by the blink event
        chatPanel.bind("blink", function(event, message) {
            // retrieves the reference to the current element, that is
            // going to be used in the blink operation
            var element = jQuery(this);

            // retrieves the current text area and checks if it
            // is currently focsued in case it is returns immediately
            // as it's not possible to blick a focused panel
            var textArea = jQuery(
                ".chat-message > .text-area:not(.hidden)", element);
            var isFocused = textArea.is(":focus");
            if (isFocused) {
                return;
            }

            // tries to retrieve a previous blink handler for the current
            // chat panel in case it exists returns immediately
            var _handler = element.data("blink");
            if (_handler) {
                return;
            }

            // defaults the message argument to the default string so
            // there's allways a value to be posted in the document title
            message = message || "blink";

            // retrieves the owner of the element and uses it to retrieve
            // the reference to the original title of the page defaulting
            // to the current one in case none is defined
            var owner = element.data("owner");
            var title = owner.data("title_s") || document.title;
            owner.data("title_s", title);

            // retrieves the existing reference to the interval set in the
            // owner and in case it exists cancel it (the new one takes
            // priority over the older ones)
            var _handlerT = owner.data("title");
            _handlerT && clearInterval(_handlerT);

            // creates the interval handler for the title changing, that
            // basically toggles between the current title and the provided
            // message value, this is a global handler
            var handlerT = setInterval(function() {
                if (document.title == title) {
                    document.title = message;
                } else {
                    document.title = title;
                }
            }, 1250);

            // updates the references to the title changing handlers
            // in both the owner od the element and the current element
            owner.data("title", handlerT)
            element.data("title", handlerT)

            // starts the various elements that are going to be used
            // during the blinking process
            element.addClass("blink");

            // creates the interval handler tha handles the blink
            // operation and then saves it under the current element
            var handler = setInterval(function() {
                element.toggleClass("blink");
            }, 1250);
            element.data("blink", handler)
        });

        // registers for the unblink operation that cancels the current
        // "blinking" for the chat panel (reverse operation)
        chatPanel.bind("unblink", function() {
            // retrieves the current element and uses it to retrieve the
            // the handler to the blink interval and the information on
            // the title interval also (includes handler and value)
            var element = jQuery(this);
            var handler = element.data("blink");
            var owner = element.data("owner");
            var handlerT = element.data("title");
            var _handlerT = owner.data("title");
            var title = owner.data("title_s");

            // verifies if the handler to the title changin is still the
            // same and in case it is clears the interval and then restores
            // the title to the original one and unsets the value in the
            // owner chat element (avoid problems)
            var isSame = handlerT && handlerT == _handlerT;
            if (isSame) {
                clearInterval(_handlerT);
                document.title = title
                owner.data("title", null);
            }

            // in case there's a valid interval cancels it so that the
            // handler stops from being called
            handler && clearInterval(handler);

            // removes the blink class from the element and then unsets
            // the blink handler from it also
            element.removeClass("blink");
            element.data("title", null);
            element.data("blink", null);
        });

        // registers for the close operation in the current panel this
        // should be an action and not a proper event
        chatPanel.bind("close", function() {
            // retrieves the reference to the current element
            // and uses it to triger the unblink operation in it
            var element = jQuery(this);
            element.triggerHandler("unblink");

            // retrieves the list of panels from the chat controllers
            // and removes the current panel from it
            var panels = matchedObject.data("panels") || {};
            delete panels[name];

            // removes the contents of the chat panel and triggers
            // the delete chat event to redraw the other panels
            chatPanel.fadeOut(50, function() {
                chatPanel.remove();
                matchedObject.triggerHandler("delete_chat", []);
            });
        });

        // registers for the push operation that "saves" the current
        // chat panel state to be latter restored
        chatPanel.bind("push", function() {
            // retrieves the current element and uses it to rerive
            // the various components that are going to be used in
            // the push operation of the chat panel
            var element = jQuery(this);
            var contents = jQuery(".chat-contents", element);

            // retrieves the various value that are going to
            // be part of the state from the various elements
            // that compose the chat panel
            var scrollTop = contents.scrollTop();

            // creates the state structure and then stores it
            // under the current chat panel
            var state = {
                scrollTop: scrollTop
            };
            element.data("state", state);
        });

        // registers for the pop operation that restores the
        // state of the chat panel from the currently saved one
        chatPanel.bind("pop", function() {
            // retrieves the current element and uses it to rerive
            // the various components that are going to be used in
            // the pop operation of the chat panel
            var element = jQuery(this);
            var contents = jQuery(".chat-contents", element);

            // retrieves the current state from the element and
            // in case it's not valid returns immediately
            var state = element.data("state");
            if (!state) {
                return;
            }

            // updates the various components according to the
            // currently defined state in the chat panel and then
            // invalidates the state (restore complete)
            contents.scrollTop(state.scrollTop);
            element.data("state", null);
        });

        // registers for the click event in the close button to
        // trigger the removal of the chat panel
        buttonClose.click(function(event) {
            // retrieves the current element then uses it to retrieve
            // the parent chat panel and then closes it
            var element = jQuery(this);
            var chatPanel = element.parents(".chat-panel");
            chatPanel.triggerHandler("close");

            // prevents the default event behaviour and
            // stops the propagation of it in order to
            // avoid problems (event collision)
            event.preventDefault();
            event.stopPropagation();
        });

        // registers for the click event in the minimize button to
        // trigger the minimization/restore of the chat panel
        buttonMinimize.click(function(event) {
            // checks if the current chat panel is in the minimized
            // state and restores or minimizes the window according
            // to such state
            var minimized = chatPanel.data("minimized");
            if (minimized) {
                chatPanel.triggerHandler("restore", []);
            } else {
                chatPanel.triggerHandler("minimize", []);
            }

            // prevents the default event behaviour and
            // stops the propagation of it in order to
            // avoid problems (event collision)
            event.preventDefault();
            event.stopPropagation();
        });

        // registers for the click even in the header panel of
        // the chat panel to trigger the minimization/restore of the chat panel
        header.click(function() {
            // checks if the current chat panel is in the minimized
            // state and restores or minimizes the window according
            // to such state
            var minimized = chatPanel.data("minimized");
            if (minimized) {
                chatPanel.triggerHandler("restore", []);
            } else {
                chatPanel.triggerHandler("minimize", []);
            }
        });

        // registers for the click event on the contents as this
        // click will also disable the blinking
        contents.click(function() {
            var element = jQuery(this);
            var chatPanel = element.parents(".chat-panel");
            chatPanel.triggerHandler("unblink");
        });

        // registers for the scroll operation in the contents
        // area so that it's possible to provide infine scroll
        contents.scroll(function() {
            var element = jQuery(this);
            var counter = element.data("counter") || 0;
            element.data("counter", counter + 1);
            var scroll = element.scrollTop();
            if (scroll != 0) {
                return;
            }
            var first = jQuery("> :nth-child(2)", element);
            more(14, first);
        });

        // registers for the focus on the text area so that the
        // blink operation may be canceled
        textArea.focus(function() {
            var element = jQuery(this);
            var chatPanel = element.parents(".chat-panel");
            chatPanel.triggerHandler("unblink");
        });

        // registers for the key down event in the text area
        // to detect enter key press and send the current text
        textArea.keydown(function(event) {
            // retrieves the key value for the current event
            // to be used to condition changes
            var keyValue = event.keyCode ? event.keyCode : event.charCode ? event.charCode : event.which;

            // in case the current key to be pressed is an
            // enter key must submit the data
            if (keyValue != 13) {
                return;
            }

            // in case the shift key is pressed the event
            // processing is ignored (assumes newline)
            if (event.shiftKey) {
                return;
            }

            // retrieves the proper message value from the text
            // area and in case the value is empty ignores it as
            // empty messages are not allowed
            var message = textArea.val();
            message = message.trim();
            if (message == "") {
                event.preventDefault();
                event.stopPropagation();
                return;
            }

            // creates the envelope structure containing
            // the data of the target user and the message
            // extraceterd from the current text area
            var data = JSON.stringify({
                type: "message",
                sender: username,
                receiver: userId,
                message: message
            });

            // retrieves the current pushi object reference and
            // uses it to send a message to the peer channel
            // associated with the pair (echo is enabled)
            var pushi = owner.data("pushi");
            pushi.sendChannel("message", data,
                "peer-status:" + channel, true);

            // unsets the value from the text area, this should
            // be considered a clenaup operation
            textArea.val("");

            // prevents the default operations for the event
            // and stops the propagation of it to the top layers
            event.preventDefault();
            event.stopPropagation();
        });

        // registers for the value change(d) event on the
        // text area so that a resize operation is possible
        // to be done if required by its new contents
        textArea.bind("value_change", function(event, value) {
            // retrieves the reference to the current element,
            // the text area that may be resized as a result of
            // the changing of its internal value
            var element = jQuery(this);

            // updates the virtual/hidden text area element with
            // the new value and then retrieves the new scroll height
            // that will be compared with the previous one to check
            // for any change in the requested height, note that the
            // hidden are is show and then hidden again so that it's
            // possible to gather it's scroll height (must be visible)
            textAreaHidden.val(value);
            textAreaHidden.show();
            var scrollHeight = textAreaHidden[0].scrollHeight;
            textAreaHidden.hide();

            // "normalizes" the scroll height value taking into account
            // the maximum scroll height value required to avoid the
            // contents section from becoming to small/unreadable
            scrollHeight = scrollHeight > maxScrollHeight ? maxScrollHeight : scrollHeight;

            // calculates the delta (height) value from the current
            // and the previous scroll height values from the virtual
            // text area and verifies if there's a change, then updates
            // the current scroll height with the new one
            var delta = scrollHeight - currentScroll;
            var changed = delta != 0;
            currentScroll = scrollHeight;

            // in case there's no change in the scroll height there's
            // no need to proceed with the resizing operation
            if (!changed) {
                return;
            }

            // retrieves the complete set of height, scroll top and
            // offsets from the various components to be used in the
            // resizing, note that there's an extra calculus to determine
            // if the contents section is currently scrolled to the bottom
            var contentsHeight = contents.height();
            var messageHeight = message.height();
            var textAreaHeight = textArea.height();
            var contentsScroll = contents.scrollTop();
            var contentsScrollHeight = contents[0].scrollHeight;
            var contentsOffset = contentsHeight - contentsScroll;
            var contentsBottom = contentsScroll + contentsHeight == contentsScrollHeight;

            // updates the contents, message and text area height with the
            // incrementings/decrementings of the calculated delta value
            contents.height(contentsHeight - delta);
            message.height(messageHeight + delta);
            textArea.height(textAreaHeight + delta);

            // verifies if the contents section is currently scrolled to the
            // bottom and if that's not the case returns immediately, as there's
            // no need to re-scroll the panel to the bottom
            if (!contentsBottom) {
                return;
            }

            // re-runs the scrolling operation in the contents element so that
            // the contents are restored to the bottom section (after the resize)
            contentsScrollHeight = contents[0].scrollHeight;
            contents.scrollTop(contentsScrollHeight);
        });

        // schedules the a focus operation in the text area
        // for the next tick in the event loop
        focus && setTimeout(function() {
            textArea.focus();
        });

        // sets the chat panel in the panels sequence
        // and updates it in the matched objec
        panels[name] = chatPanel;
        matchedObject.data("panels", panels);

        // triggers the new chat event in the chat object so that
        // the layout of the panels is handled
        matchedObject.triggerHandler("new_chat", []);

        // returns the chat panel that was creater as a result
        // of the current call (current chat panel)
        return chatPanel;
    };
})(jQuery);

(function(jQuery) {
    jQuery.fn.uchatline = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // retrieves the current body reference and uses it to retrieve
        // the base mvc path associated with it to be able to correctly
        // compute that paths to the relative resources
        var _body = jQuery("body");
        var mvcPath = _body.data("mvc_path");
        var alias = _body.data("alias") || {};

        // uses the alias map to try to resolve the current adm link
        // into the concrete url for the adm section
        var admSection = alias["omni_adm"] || "omni_adm";

        // retrieves the current attributes to be used
        // for the filling of the line
        var name = options["name"] || matchedObject.data("name");
        var objectId = options["object_id"] || matchedObject.data("object_id");
        var message = options["message"];
        var mid = options["mid"] || "";
        var timestamp = options["timestamp"] || new Date().getTime() / 1000;
        var plain = options["plain"] || false;
        var target = options["target"] || null;
        var bottom = options["bottom"] || false;

        // creates the date value for the current line and
        // the associated string value of it
        var date = new Date(timestamp * 1000);
        var dateS = _body.uxtimestamp("format", {
            date: date,
            format: "%d/%m %H:%M"
        });

        // retrieves the chat contents for the matched object (chat panel)
        // and then uses it to try to find any previously existing and equivalent
        // message chat line and in case it exists and the mid is set returns
        // immediately to avoid any kind of duplicated lines
        var contents = jQuery(".chat-contents", matchedObject);
        var previous = jQuery(".chat-line[data-mid=\"" + mid + "\"]", contents);
        if (mid && previous.length > 0) {
            return previous;
        }

        // in case the provided name for the chat line is self/me
        // based it's converted in the locale representation
        var nameLocale = name == "me" ? jQuery.uxlocale(name) : name;

        // treats the message so that any newline character found
        // is replaces by the break line tag (html correspondent)
        message = message.replace("\n", "<br/>");

        // verifies that the type of message is not plain and if that's
        // the case runs the chat replacer so that certain keywords
        // are replaced with the proper image/graphical representation
        if (plain == false) {
            result = jQuery.uchatreplacer(message);
            message = result[0];
            extras = result[1];
            options["message"] = extras;
            options["plain"] = true;
            extras && matchedObject.uchatline(options);
        }

        // retrieves the correct object id for the current message owner
        // and uses it to create the image url of the user that
        // created the current chat line
        objectId = name == "me" ? _body.data("object_id") : objectId;
        var imageUrl = mvcPath + admSection + "/users/" + objectId + "/image?size=32";

        // retrieves the complete set of paragraphs from the current chat
        // panel and then runs a reverse iteration in them trying to
        // find the best matching paragraph for the current line, the
        // first that contains a lower timestamp than the provided one
        var paragraphs = jQuery("> .chat-paragraph", contents);
        var paragraph = null;
        for (var index = paragraphs.length - 1; index >= 0; index--) {
            // retrieves the reference to the current paragraph in
            // iteration and then gathers the name and the timestamp
            // for it, these values are going to be used in determining
            // if it's a good fit for the current line operation
            var _paragraph = jQuery(paragraphs[index]);
            var _previous = jQuery(paragraphs[index - 1]);
            var _name = _paragraph.data("name");
            var _dateS = _paragraph.data("date");
            var _timestamp = _paragraph.data("timestamp") || 0;
            var _reference = _previous.data("timestamp") || 0;

            // verifies if this is the first iteration and if that's
            // the case a special verification is performed to make
            // sure that the line should be introduced at the beginning
            var isFirst = index == paragraphs.length - 1;
            var isInitial = isFirst && _timestamp < timestamp;

            // determines if this is the proper buble for which the
            // newline value should be added, for that a proper
            // verification on the name of the paragraph, string
            // data of it and the timestamp of the next (up paragraph)
            // is going to be performed and verified
            var isBuble = _name == name && _dateS == dateS && _reference < timestamp;

            // verifies if any of the coditions (initial, buble found
            // or forced bottom) is matched and if that's not the case
            // continues the iteration trying to find a paragraph up
            if (!isInitial && !isBuble && !bottom) {
                continue;
            }

            // sets the current paragraph in iteration as the target
            // one and then breaks the current iteration loop
            paragraph = _paragraph;
            break;
        }

        // retrieves the name (identifier) of the current (last)
        // paragraph to be used and the timestamp of the same
        // item to measure the "time gap between both"
        var _name = paragraph ? paragraph.data("name") : null;
        var _timestamp = paragraph ? paragraph.data("timestamp") : 0;
        var _dateS = paragraph ? paragraph.data("date") : "";

        // in case the name for the author of the line is different
        // from the current name or the time gap between messages
        // is greater than expected a new paragraph must be created
        if (name != _name || dateS != _dateS) {
            // sets the initial reference value as the selected (previous)
            // paragraph and verifies if this is a top (header) paragraph
            // that should be inserted at the the initial part of the contents
            var reference = paragraph;
            var isTop = reference == null;

            // creates the date object that represents the provided timestamp
            // and thens runs the date converter using the defined format to
            // obtain the "final" time string value to be used
            var date = new Date(timestamp * 1000);
            var timeString = _body.uxtimestamp("format", {
                date: date,
                format: "%d/%m %H:%M"
            });
            var dayString = _body.uxtimestamp("format", {
                date: date,
                format: "%d %B %Y"
            });

            // "construct" the chat day stucture that is going to be used
            // in the presentation of the initial part of a day in chat
            var day = jQuery("<div class=\"chat-day\">" + dayString + "</div>");
            day.attr("data-string", dayString);
            day.data("timestamp", timestamp);

            // tries to retrieve any previously existing day starting line and in
            // case the element is considered outdated it's removed and the add
            // day flag is set so that it's added latter on the process
            var previousDay = jQuery("[data-string=\"" + dayString + "\"]",
                contents);
            var previousTimestamp = previousDay.data("timestamp");
            var addDay = !previousTimestamp || previousTimestamp >= timestamp;
            addDay && previousDay.remove();

            // in case the current paragraph to be created is not the
            // first one a separator element must be created and added
            // to the contents section
            var separator = jQuery("<div class=\"chat-separator\"></div>");
            if (!isTop) {
                reference.after(separator);
                reference = separator;
            }

            // creates a new paragraph element associated with the current
            // name and with the proper background (avatar) image
            paragraph = jQuery("<div class=\"chat-paragraph\">" + "<div class=\"chat-name\">" + nameLocale +
                "</div>" + "<div class=\"chat-time\">" + timeString + "</div>" + "</div>");
            paragraph.css("background-image", "url(" + imageUrl + ")");
            paragraph.css("background-repeat", "no-repeat");
            paragraph.attr("data-date", timeString);
            paragraph.data("data-date", timeString);
            paragraph.data("name", name);

            // verifies if the current paragraph is a top one and adds the
            // paragraph to the proper position taking that into account,
            // note that the day line is also added if required
            if (isTop) {
                contents.prepend(paragraph);
                addDay && contents.prepend(day);
            } else {
                reference.after(paragraph);
                addDay && reference.after(day);
            }

            // in case the current paragraph is top and there's already more
            // than one paragraph in the contents the separator must be added
            // after the paragraph, to maintain visual coherence
            if (isTop && paragraphs.length > 0) {
                paragraph.after(separator);
            }
        }

        // creates the chat line structure with the message that has been received
        // and then sets the mid (message identifer) attribute and the timestamp
        // of the received message so that it may be used latter for reference
        var chatLine = jQuery("<div class=\"chat-line\">" + message + "</div>");
        chatLine.attr("data-mid", mid);
        chatLine.attr("timestamp", String(timestamp));
        chatLine.attr("date", dateS);
        chatLine.data("timestamp", timestamp);
        chatLine.data("date", dateS);

        // retrieves the complete set of previously existing chat line in the paragraph
        // so that it's possible to determine the target position fo line insertion,
        // the default/initial value for the target is the chat line element
        var chatLines = jQuery(".chat-line", paragraph);
        var position = jQuery(".chat-time", paragraph);

        // iterates over the complete set of chat lines in the paragraph to discover
        // the line that is going to be considered to the "target position" for insertion
        for (var index = 0; index < chatLines.length; index++) {
            var _chatLine = jQuery(chatLines[index]);
            var _timestamp = _chatLine.data("timestamp");
            if (_timestamp > timestamp) {
                break;
            }
            position = _chatLine;
        }

        // inserts the newly created chat line after the target position and then
        // runs the apply operation on the chat line so that it becomes ready
        // for interaction according to the uxf rules (action ready)
        position.after(chatLine);
        chatLine.uxapply();

        // updates the timestamp value for the paragraph so that it may
        // be used latter to infer the current time for the paragraph
        // the new value should be the oldest timestamp value
        var lastLine = jQuery(".chat-line:last", paragraph);
        var lastTimestamp = lastLine.data("timestamp");
        paragraph.data("timestamp", timestamp);
        paragraph.attr("timestamp", timestamp);

        // verifies if there's a target area for the scroll result, meaning
        // that the scroll of the chat contents should be restored to the
        // upper position of that same provided target, to be able to restore
        // the scroll position the fix scroll function is created
        if (target) {
            target = jQuery(target);
            var targetMargin = parseInt(target.css("margin-top"));
            targetMargin = isNaN(targetMargin) ? 0 : targetMargin;
            var settings = {
                offset: targetMargin * -1
            };
            var fixScroll = function() {
                contents.uxscrollto(target, 0, settings);
            };
        }
        // otherwise the default bottom contents position is used as reference
        // meaning that the scroll position will be restored to the bottom of
        // the chat contents area (last/newest received message)
        else {
            var fixScroll = function() {
                // retrieves the scroll height of the contents section and used the
                // value to scroll the contents to the bottom position
                var scrollHeight = contents[0].scrollHeight;
                contents.scrollTop(scrollHeight);
            };
        }

        // runs the initial fix scroll operation scrolling the contents area
        // to the requested target (default is the chat bottom), note that in
        // case the contents are is not visible (delayed rendering) the fixing
        // of the scroll is delayed so that the scroll height is measurable
        var isVisible = contents.is(":visible");
        isVisible && fixScroll();
        !isVisible && setTimeout(function() {
            fixScroll();
        });

        // retrieves the current value of the scroll counter to be able to
        // detect if a scroll (using mouse) has been done between the loadin
        // of the line and the final (possible) loading of the image
        var counter = contents.data("counter") || 0;

        // retrieves the reference to the possible images included in the line
        // and then registers them for the loading operation so that, the scroll
        // is set down in the contents of the chat (as new area was created)
        var images = jQuery("img", chatLine);
        images.load(function() {
            var _counter = contents.data("counter");
            if (counter != _counter) {
                return;
            }
            fixScroll();
        });

        // removes the (chat) empty flag/class from the currently matched object
        // chat panel as the current panel is no longer considered empty as at
        // least one chat line has been placed under it (as expected)
        matchedObject.removeClass("empty");

        // returns the final created chat line to the caller function so
        // it able to run extra logic on top of it
        return chatLine;
    };
})(jQuery);

(function(jQuery) {

    /**
     * The regular expression that is going to be used to match valid image
     * urls, note that no mime type inspection is used.
     */
    var IMAGE_REGEX = new RegExp(
        /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*\.(png|jpg|jpeg|gif)[-A-Z0-9+&@#\/%?=~_|!:,.;]*)/ig);

    /**
     * The regular expression that is going to be used to try to find/match the
     * youtube link based relations.
     */
    var YOUTUBE_REGEX = new RegExp(/(\b(https?):\/\/(www\.)?youtube.com[-A-Z0-9+&@#\/%?=~_|!:,.;]*)/ig);

    /**
     * The regular expression to be used in the matching of url expression to be
     * substituted with link based elements.
     */
    var URL_REGEX = new RegExp(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig);

    jQuery.uchatreplacer = function(message) {
        var extras = "";

        var parse = function(url) {
            var parts = url.split("?");
            if (parts.length < 2) {
                return {};
            }
            var query = parts[1];
            var assocs = query.split("&");
            var result = {};
            for (var index = 0; index < assocs.length; index++) {
                var assoc = assocs[index];
                var struct = assoc.split("=");
                result[struct[0]] = struct[1];
            }
            return result;
        };

        var image = function(message) {
            var result = message.match(IMAGE_REGEX);
            if (!result) {
                return message;
            }
            result = result[0];
            extras += "<a href=\"" + result + "\" target=\"_blank\">" + "<img src=\"" + result + "\"/>" +
                "</a>";
            return result == message ? "" : message;
        };

        var youtube = function(message) {
            var result = message.match(YOUTUBE_REGEX);
            if (!result) {
                return message;
            }
            result = result[0];
            var parsed = parse(result);
            var youtubeId = parsed["v"];
            extras += "<iframe height=\"200\"" + " src=\"//www.youtube.com/embed/" + youtubeId +
                "?controls=0\"" + " frameborder=\"0\"></iframe>";
            return result == message ? "" : message;
        };

        var url = function(message) {
            // runs the regex based replacement in the values so that
            // the correct component is displayed in the chat line
            message = message.replace(URL_REGEX,
                "<a href=\"$1\" target=\"_blank\" class=\"link link-blue\">$1</a>");
            return message;
        };

        message = image(message);
        message = youtube(message);
        message = url(message);
        return [message, extras];
    };
})(jQuery);

(function(jQuery) {
    jQuery.fn.ueureka = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // in case the matched object is not defined
        // or in case it's an empty list must return
        // immediatly initialization is not meant to
        // be run (corruption may occur)
        if (!matchedObject || matchedObject.length == 0) {
            return;
        }

        // retrieves the reference to the top level
        // body element that is going to be used in some
        // of the operations associated with eureka
        var _body = jQuery("body");

        // retrieves the complete set of overlay panels associatd
        // with the various provided eureka element, they are going
        // to be used for some of the event registration
        var overlayPanel = matchedObject.parents(".overlay-panel");

        // retrieves the text field associated with the drop field
        // element of the eureka element and registers for the key
        // down event to avoid its propagation, could cause global
        // key events to have unexpected behaviour
        var textField = jQuery(".text-field", matchedObject);
        textField.keydown(function(event) {
            // retrievs the current element and uses it to retrieve
            // the associated overlay panel element
            var element = jQuery(this);
            var overlayPanel = element.parents(".overlay-panel");

            // retrieves the current activation key associated with
            // the overlay panel so that it may be "allowed"
            var key = overlayPanel.attr("data-key");
            key = key ? parseInt(key) : key;

            // retrieves the event key code and in case the code refers
            // the escape key returns immediately to avoid behavior
            var eventKeyCode = event.keyCode ? event.keyCode : event.which;
            if (eventKeyCode == 27 || eventKeyCode == key) {
                return;
            }

            // stops the event propagation in order to avoid
            // unwanted global behavior coming  from this key press
            event.stopPropagation();
            event.stopImmediatePropagation();
        });

        // registers for the shown event in the overlay panel associated
        // with the eureka element so that various element of the eureka
        // are restored to the unset original values
        overlayPanel.bind("shown", function() {
            // retrieves the current element and the associated text field
            // and then runs the reset operation to restore it to the original
            // value as expected by the specification
            var element = jQuery(this);
            var textField = jQuery(".text-field", element);
            textField.uxreset();
        });

        // registers for the (new) item event to change
        // the item inserting new attributes in it
        matchedObject.bind("item", function(event, item) {
            // retrieves the mvc path and the class id url
            // map for the current page
            var mvcPath = _body.data("mvc_path");
            var classIdUrl = _body.data("class_id_url");

            // retrieves the various attribute values from the
            // item to be used in the link construction
            var objectId = item["object_id"];
            var cid = item["cid"];

            // constructs the url using the base mvc path and
            // appending the url to the requested class
            var baseUrl = mvcPath + classIdUrl[cid];

            // creates the final link value and updates the
            // item with it
            var link = baseUrl + objectId;
            item["link"] = link;
        });

        // registers for the value selection event so that it's possible
        // to hide the panel and invalidate the current value
        matchedObject.bind("value_select",
            function(event, value, valueLogic, item) {
                // retrieves the current element and uses it to retrieve
                // the associated overlay panel element
                var element = jQuery(this);
                var overlayPanel = element.parents(".overlay-panel");

                // triggers the hide event on the overlay panel to initate
                // the process of hidding the panel
                overlayPanel.triggerHandler("hide");
            });

        // registers for the post async event so that the overlay panel associated
        // with the eureka structure is properly hidden and does not remains displayed
        // in the current screen, otherwise garbage would be left (ux problems)
        matchedObject.length > 0 && _body.bind("post_async", onPostAsync = function() {
            var overlayPanel = matchedObject.parents(".overlay-panel");
            overlayPanel.triggerHandler("hide");
        });
        matchedObject.bind("destroyed", function() {
            _body.unbind("post_async", onPostAsync);
        });
    };
})(jQuery);

(function(jQuery) {
    jQuery.fn.ulightbox = function(options) {
        // retrieves the currently matched object and the top
        // level body element also for general usage
        var matchedObject = this;
        var _body = jQuery("body");

        // adds the lightbox trigger class to the component
        // so that proper classes may be used
        matchedObject.addClass("lightbox-trigger");

        // register for the click event in the matched objects
        // to be able to extract the image
        matchedObject.click(function() {
            // retrieves the current element to display the
            // lightbox image for it
            var element = jQuery(this);

            // retrieves the url from the currently selected
            // element ans then used it to retrieve the base
            // url value from it (url extraction)
            var url = element.attr("src");
            var split = url.split("?");
            var base = split[0];
            var query = split.length > 1 ? split[1] : "";

            // splits the current query string arroud its parts
            // and creates a new list that will hold the various
            // partss that are considered valid
            var parts = query.split("&");
            var valid = [];

            // iterates over the current query string parts to
            // removed the ones considered invalid
            for (var index = 0; index < parts.length; index++) {
                var part = parts[index];
                var invalid = part.startsWith("size=") || part.startsWith("fallback=");
                if (invalid) {
                    continue;
                }
                valid.push(part);
            }

            // re-joins back the valid parts of the query string,
            // this string will be used as extra parameters for
            // the various images urls to be generated
            var validQuery = valid.join("&");

            // creates the new urls from the base one asking for
            // a base image to be displayed instead of the small
            // and then a large one for the "expanded mode"
            var baseUrl = base + "?size=512&fallback=1&" + validQuery;
            var largeUrl = base + "?size=original&fallback=1&" + validQuery;

            // shows the lightbox on the body element using the
            // lightbox path retrieved from the image
            _body.uxlightbox(baseUrl, null, largeUrl);

            // retrieves the referece to the "possible" generated/new
            // lightbox, this element may be either an existing element
            // or a new one for which handlers must be registered
            var lightbox = jQuery(".window-lightbox", _body);

            // retrieves the reference to both buttons of the ligthbox,
            // these elements are going to be changed/prepared for animation
            var buttons = jQuery(".button-confirm, .button-expand",
                lightbox);

            // runs the initial animation registration on the buttons
            // this is required to update their initial state
            buttons.uxanimation();

            // gathers the value for the marked variable, that controls
            // the process of registering the proper handlers, this
            // strategy avoids possible double registration of handlers
            var marked = lightbox.data("ulightbox");
            if (marked) {
                return;
            }

            // registers the lightbox for the show event so that the
            // buttons are properly animated according to their dimensions
            // and visibility (required for compatibility issues)
            lightbox.bind("show", function() {
                buttons.uxanimation();
            });

            // registers the lightbox for the hide event so that the
            // buttons are properly animated according to their dimensions
            // and visibility (required for compatibility issues)
            lightbox.bind("hide", function() {
                buttons.uxanimation();
            });

            // registers the lightbox for the loading event so that the
            // buttons may be triggered for animation (animation start)
            lightbox.bind("loading", function() {
                buttons.uxanimation();
            });

            // registers the lightbox for the loaded event so that the
            // buttons may be triggered for de-animation (animation stop)
            lightbox.bind("loaded", function() {
                buttons.uxanimation();
            });

            // "marks" the lightbox element so that no more event registration
            // will be done for the element (avoids duplicated registration)
            lightbox.data("ulightbox", true);
        });

        // returns the object
        return this;
    };
})(jQuery);

(function(jQuery) {
    jQuery.fn.unotifications = function(options) {
        /**
         * The maximum number of notifications that are allowed to stay at a
         * given notification panel. This value should be overriden by the
         * underlying function to allow some control.
         */
        var MAXIMUM_NOTIFICATIONS = 5;

        // sets the jquery matched object and verifies if
        // at least one object as been matched, in case not
        // a single object has been matched returns immediately
        // as there's nothing remaining to be done
        var matchedObject = this;
        if (matchedObject.length == 0) {
            return;
        }

        // retrieves the reference to the global elements
        // that are going to be used latter for the various
        // operations and event registration
        var _window = jQuery(window);
        var _body = jQuery("body");

        // retrieves the values for the is registered to the
        // notifications global registration and then updates
        // the value to a valid value
        var isRegistered = _window.data("notifications_global");
        _window.data("notifications_global", true);

        // adds the various inner elements of the notifications
        // container to the notification activator icon
        var link = jQuery("<div class=\"button menu-button menu-link notifications\"></div>")
        var container = jQuery("<div class=\"menu-contents notifications-container\">" +
            "<ul class=\"notifications-list\"></ul>" + "</div>");
        matchedObject.append(link)
        matchedObject.append(container);

        // starts the menu link with the proper structures to be
        // able to open the associated panel
        link.uxmenulink();

        // iterates over each of the notifications containers
        // to initialize their structures and start the remote
        // connections for notification interaction
        matchedObject.each(function(index, element) {
            // retrieves the reference to the current element in
            // iteration
            var _element = jQuery(this);

            // retrieves the references to both the menu link asscoiated
            // with the notifications contqainer and to the list that
            // contains the notifications
            var link = jQuery(".menu-link", _element);
            var contents = jQuery(".menu-contents", _element);
            var list = jQuery(".notifications-list", _element);

            // retrieves the url value to be used for the chat
            // communication, and then creates the full absolute ur
            // from the base url and the communication suffix
            var url = _element.attr("data-url");
            var absolueUrl = jQuery.uxresolve(url + "/pushi.json");

            // retrieves the name of the currently signed in user
            // from the body element, to be used for the current panel
            var username = _body.data("username");
            _element.data("username", username);

            // retrieves the (base) url and the app key values to be used
            // for the establishement of the pushi connection, then uses them
            // as the various arguments for the construction of the proxy object
            var url = _element.attr("data-url");
            var key = _element.attr("data-key");
            var pushi = new Pushi(key, {
                baseUrl: url,
                authEndpoint: absolueUrl
            });

            // updates the current element with the reference to the pushi
            // element so that it may be re-used for retrieval latter
            _element.data("pushi", pushi);

            // registers for the notification event in the element so
            // that a new notification element is created
            _element.bind("notification", function(event, data, isNew) {
                // retrieves the current element
                var _element = jQuery(this);

                // retrieves the mvc and base paths and the class id url
                // map for the current page
                var mvcPath = _body.data("mvc_path");
                var basePath = _body.data("base_path");
                var classIdUrl = _body.data("class_id_url");

                // creates a new date object and uses it to retrieve
                // the current timestamp as defined in utf for unix
                var date = new Date();
                var current = date.getTime();

                // unpacks both the object id and the cid (class id)
                // from the current data strcucture
                var uniqueId = data.unique_id;
                var objectId = data.entity.object_id;
                var uobjectId = data.create_user.object_id;
                var cid = data.cid;
                var ucid = data.u_cid;

                // constructs the url using the base mvc path and
                // appending the url to the requested class
                var baseUrl = mvcPath + classIdUrl[cid];
                var baseUrlU = mvcPath + classIdUrl[ucid];

                // creates the final url value to be used in the
                // contruction of the various relative urls
                var url = baseUrl + objectId;
                var urlU = baseUrlU + uobjectId;

                // resolves the current url value so that it may
                // be used independently from the current state
                var urlR = jQuery.uxresolve(url);

                // calculates the diff by calculating the difference between
                // the current timestamp and the create date of the notification
                // and then converts it into the appropriate date string
                var diff = (current / 1000.0) - data.create_date;
                var diffS = jQuery.udates(diff);

                // extracs the message value from the base notification structure
                // and then retrieves the argumentss from it also, then runs the
                // localization system on the message and formats the arguments
                // on the provided message (according to the c standard)
                var message = data.notification.message;
                var arguments = data.notification.arguments;
                message = jQuery.uxlocale(message);
                message = String.prototype.formatC.apply(message, arguments);

                // creates the plain text representation of the message to be
                // used for notification that use plain text
                var messageT = jQuery.utext(message);

                // runs the template (replacer) infra-structure in the message
                // so the message is correctly displayed with the right style
                message = jQuery.utemplate(message, true);

                // creates the various items that are going to be used
                // in the notification, this is important to maintain
                // the notification as useful as possible
                var imageUrl = urlU + "/image?size=50";
                var userName = data.create_user.representation;
                var time = diffS;

                // "calulates" the path to the logo url using the retrieved
                // base path as the reference for it
                var logoUrl = basePath + "common/images/logos/front-door-not-large.png";

                // adds a new notification item to the list of
                // notifications, this notification should have
                // the pre-defined username and time as defined
                // in the received data
                var notification = jQuery("<li class=\"button\" data-link=\"" + url + "\">" +
                    "<img class=\"entity-picture\" src=\"" + imageUrl + "\">" +
                    "<div class=\"contents\">" + "<p class=\"title\">" + userName + "</p>" +
                    "<p class=\"subject\"></p>" + "</div>" + "<div class=\"time\">" + time +
                    "</div>" + "<div class=\"break\"></div>" + "</li>");
                list.prepend(notification);
                notification.uxbutton();

                // retrieves the current set of items in the list of notification
                // and then counts them so that the overflow elements may be removed
                var items = jQuery("> li", list);
                var size = items.length;

                // iterates while the number is above the maximum allowed by the current
                // rules to remove the items that "overflow" that number
                while (size > MAXIMUM_NOTIFICATIONS) {
                    var index = size;
                    var element = jQuery("> li:nth-child(" + index + ")", list);
                    element.remove();
                    size--;
                }

                // sets the data in the notification so that it's
                // possible to update the notification latter on
                notification.data("data", data)

                // adds the pending class to the link so that it
                // notifies that there are notifications pending
                // to be read in the current environment
                isNew && notification.addClass("pending");
                isNew && link.addClass("pending");

                // in case the current notification is new creates
                // a new notification box for the current notification
                // so that the user gets an immediate visual effect
                isNew && _body.uxnotification({
                    "title": userName,
                    "message": message,
                    "link": jQuery.uxresolve(url),
                    "timeout": 15000
                });

                // in case this is a new notification creates a desktop
                // notification and registers the appropriate handlers to
                // it so that the target page opens on click and the notification
                // hides after a certain ammount of time, note that if there's
                // not enought permissions the show is disabled
                var hasNotifications = typeof(Notification) != "undefined";
                if (hasNotifications && isNew) {
                    var _notification = new Notification(userName, {
                        dir: "auto",
                        icon: jQuery.uxresolve(logoUrl),
                        lang: "en",
                        body: messageT,
                        tag: uniqueId
                    });
                    _notification.onclick = function() {
                        window.open(urlR, "_blank");
                    };
                    _notification.show && _notification.show();
                    _notification.close && setTimeout(function() {
                        _notification.close();
                    }, 15000);
                    _body.data("_notification", _notification);
                }

                // runs a refresh operation in the current element
                // so that it's status becomes updated
                _element.triggerHandler("refresh");
            });

            // registers for the referesh operation in the current element
            // so that it's possible to refresh the links of the
            // notifications according to the current location
            _element.bind("refresh", function() {
                // retrieves the complete set of items currently defined
                // in the items (notifications) list
                var items = jQuery("li", list);

                // retrieves the mvc path and the class id url
                // map for the current page
                var mvcPath = _body.data("mvc_path");
                var classIdUrl = _body.data("class_id_url");

                // retrieves the current number of notifications (items
                // size) and in case the number is zero disables the current
                // link, reverting it to a non action state, otherwise enables
                // it so that it becomes actionable (reverse operation)
                var itemsSize = items.length;
                if (itemsSize == 0) {
                    link.uxdisable();
                } else {
                    link.uxenable();
                }

                // retrieves the current date and uses it to retrieve the current
                // timestamp value (according to the utf format)
                var date = new Date();
                var current = date.getTime();

                // iterates over each of the items to be able to update
                // their like associations to the apropriate values
                items.each(function(index, element) {
                    // retrieves the current notification in iteration (element)
                    // and uses it to retrieve its data (notification data) in case
                    // there's no data skips the current iteration
                    var _element = jQuery(this);
                    var data = _element.data("data");
                    if (!data) {
                        return;
                    }

                    // retrieves the reference to the subject element from the
                    // element so that it gets updated with the new locale string
                    var subject = jQuery(".subject", _element);

                    // retrieves the reference to the time element of the
                    // current element in iteration, this is the value that
                    // is going to be update with the new string value
                    var time = jQuery(".time", _element);

                    // extracs the message value from the base notification structure
                    // and then retrieves the argumentss from it also, then runs the
                    // localization system on the message and formats the arguments
                    // on the provided message (according to the c standard)
                    var message = data.notification.message;
                    var arguments = data.notification.arguments;
                    message = jQuery.uxlocale(message);
                    message = String.prototype.formatC.apply(message, arguments);

                    // runs the template (replacer) infra-structure in the message
                    // so the message is correctly displayed with the right style
                    message = jQuery.utemplate(message, true);

                    // updates the subject of the notification with the new localized
                    // message value according to the new locale
                    subject.html(message);

                    // calculates the diff by calculating the difference between
                    // the current timestamp and the create date of the notification
                    // and then converts it into the appropriate date string
                    var diff = (current / 1000.0) - data.create_date;
                    var diffS = jQuery.udates(diff);

                    // updates the time element with the newly created diff
                    // string that is not going to represent the element
                    time.html(diffS);

                    // unpacks the various information from the notification
                    // data and constructs the base url that is going to be
                    // used on the click in the notification
                    var objectId = data.entity.object_id;
                    var cid = data.cid;
                    var baseUrl = mvcPath + classIdUrl[cid];
                    var url = baseUrl + objectId;

                    // updates the link information in the notification list item
                    // so that a new click is properly changed
                    _element.attr("data-link", url);
                    _element.data("link", url);
                });

                // retrieves the username of the currently signed in user and the
                // username associated with the current element in case they
                // remain the same nothing else remains to be done and so the
                // function returns immediately (to the caller method)
                var username = _body.data("username");
                var _username = _element.data("username");
                if (username == _username) {
                    return;
                }

                // retrieves the reference to the current pushi instance/object
                // and then verifies if it's still considered valid by checking
                // the current base url and app key value assigned to the element
                var pushi = _element.data("pushi");
                var url = _element.attr("data-base_url");
                var key = _element.attr("data-key");
                var isValid = pushi.isValid(key, url);

                // in case the current configuration is valid there's just a restart
                // of the subscription process for the personal channel, this is done
                // mostly for security reasons (requires re-authentication)
                if (isValid) {
                    pushi.unsubscribe("personal-" + _username);
                    pushi.subscribe("personal-" + username);
                }
                // otherwise the configuration must be changed in the pushi object and
                // then a (re-)open process must be triggered in it so that the connection
                // is set under a valid state for the new key and (base) url values
                else {
                    pushi.reconfig(key, {
                        baseUrl: url,
                        authEndpoint: pushi.options.authEndpoint
                    });
                }

                // clears the current list of notification because the list will
                // be filled with new notifications once they "come" from the new
                // subscriptions that have been created
                list.empty();

                // disables the link by default, this value will be re-enabled in case
                // the new channel contain any notification values
                link.uxdisable();

                // changes the username associated wit the current element to the new
                // on, as all the changes have taken place
                _element.data("username", username);
            });

            // registers for the before unload event in the window
            // element so that any pending native notification is
            // closed and not left over as garbage
            !isRegistered && _window.bind("beforeunload", function() {
                var _notification = _body.data("_notification");
                _notification && _notification.close();
            });

            // registers for the unload event in the window
            // element so that any pending native notification is
            // closed and not left over as garbage
            !isRegistered && _window.bind("unload", function() {
                var _notification = _body.data("_notification");
                _notification && _notification.close();
            });

            // registers for the show event so that the reading
            // class may be added to the link indicating that the
            // notifications panel is being "read"
            contents.bind("shown", function() {
                // adds the reading class to the link, marking it as
                // reading for latter usage
                link.addClass("reading");
            });

            // registers for the hide event so that the pending
            // class may be removed from the notification container
            // and for the various pending notifications
            contents.bind("hidden", function() {
                // retrieves the complete set of list items for the
                // current list so that they may be marked as read
                var items = jQuery("li", list);

                // verifies if the user is currently reading the
                // contents of the menu link in case it's not returns
                // immediately as it's not possible to unmark it
                var isReading = link.hasClass("reading");
                if (!isReading) {
                    return;
                }

                // removes the reading class from the link because
                // with the hide event there's no more reading
                link.removeClass("reading");

                // removes the pending class from all of the
                // currently available items
                items.removeClass("pending");
                link.removeClass("pending");
            });

            // registers for the click event in the list, so that
            // any click in an item hides the menu immediately while
            // it also redirect the user to the target page
            list.click(function() {
                _element.triggerHandler("hide");
            });

            // registers for the connect event so that at the end of
            // the connection the base channels are subscribed
            pushi.bind("connect", function(event) {
                // retrieves the complete set of list items for the
                // current list so that they may be marked as read
                var items = jQuery("li", list);

                // empties the current list so that all the elements contained
                // in it are removed and none is present
                list.empty();

                // removes the pending class from all of the
                // currently available items so that the state
                // is restored to the original state
                items.removeClass("pending");
                link.removeClass("pending");

                // retrieves the current username set in the global body
                // object to be able to create the name of the personal
                // channel that is going to be subscribed for notifications
                var username = _body.data("username");

                // subscribes to the personal channel for the user, this channeç
                // should contain notification related infromation
                this.subscribe("personal-" + username);
            });

            // registers for the subscribe event to be able to create the previously
            // existing events from the stored (logged) ones
            pushi.bind("subscribe", function(event, channel, data) {
                // verifies if the cyrrent channel type is personal and in
                // case it's not returns immediately (nothing to be done)
                var isPersonal = channel.startsWith("personal-");
                if (!isPersonal) {
                    return;
                }

                // extracts the list of events from the provided data and
                // the iterates over them to create the various notifications
                // in the oposite order of arrival (correct order)
                var events = data.events || [];
                var length = events.length > MAXIMUM_NOTIFICATIONS ? MAXIMUM_NOTIFICATIONS :
                    events.length;
                for (var index = length - 1; index >= 0; index--) {
                    var event = events[index];
                    var data = event.data.data;
                    var _data = data ? jQuery.parseJSON(data) : data;
                    _element.triggerHandler("notification", [_data,
                        false
                    ]);
                }
            });

            // registers for the notification event to be able to
            // present the notification to the end user using the
            // notifications list container
            pushi.bind("notification", function(event, data, channel) {
                // verifies if the data type of the provided data is string
                // in case it's parses it as a json string "saving" it in
                // place of the current data element
                var isString = typeof data == "string";
                data = isString ? jQuery.parseJSON(data) : data;

                // triggers the notification event in the element to display
                // the element visual structure in the notifications list
                _element.triggerHandler("notification", [data, true]);
            });

            // schedules an interval to update the current set of items so that
            // their time range values are correctly displayed
            setInterval(function() {
                // retrieves the current date and uses it to retrieve the current
                // timestamp value (according to the utf format)
                var date = new Date();
                var current = date.getTime();

                // retrieves the complete set of items and iterates over them
                // to update the time value for each of them
                var items = jQuery("li", list);
                items.each(function(index, element) {
                    // retrieves the current element in iteration and tries to
                    // retrieve the data table structure from it
                    var _element = jQuery(this);
                    var data = _element.data("data");
                    if (!data) {
                        return;
                    }

                    // retrieves the reference to the time element of the
                    // current element in iteration, this is the value that
                    // is going to be update with the new string value
                    var time = jQuery(".time", _element);

                    // calculates the diff by calculating the difference between
                    // the current timestamp and the create date of the notification
                    // and then converts it into the appropriate date string
                    var diff = (current / 1000.0) - data.create_date;
                    var diffS = jQuery.udates(diff);

                    // updates the time element with the newly created diff
                    // string that is not going to represent the element
                    time.html(diffS);
                });
            }, 60000);
        });

        var buildNotification = function() {};

        // triggers the initial refresh in the notification elements
        // this will run the initial update and initialize the
        // various components (startup process)
        matchedObject.triggerHandler("refresh");
    };
})(jQuery);

(function(jQuery) {
    jQuery.fn.uside = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // iterates over all the side elements to correctly
        // process them so that their display is apropriate
        matchedObject.each(function(index, element) {
            // retrieves the current side element in iteration
            // that is going to be processed accordint to its links
            var _element = jQuery(this);

            // retieves the list of links in the element and
            // validations if it exists in case it does not
            // returns immediately so that the next iteration
            // cycle starts and new elements are processed
            var linksList = jQuery(".links-list", _element);
            if (linksList.length == 0) {
                return;
            }

            // retrieves the complete set of children of the
            // current links list in case at least one exists
            // continues the loop nothing to be done
            var links = linksList.children();
            if (links.length != 0) {
                return;
            }

            // hides the current side element as there are no
            // links under its links list
            _element.hide();
        });
    };
})(jQuery);

(function(jQuery) {
    jQuery.fn.usummary = function(options) {
        /**
         * The list containing the various string describing the valus that are
         * going to be part of the summary section.
         */
        var VALUES = ["count", "sum", "average"];

        /**
         * The localized version of the various string values that describe the
         * values that are going to be part of the summary.
         */
        var VALUES_LOCALE = jQuery.uxlocale(VALUES);

        // sets the jquery matched object
        var matchedObject = this;

        // in case the matched object is not defined
        // or in case it's an empty list must return
        // immediatly initialization is not meant to
        // be run (corruption may occur)
        if (!matchedObject || matchedObject.length == 0) {
            return;
        }

        // iterates over each of the summary elements to register
        // each of them for their properties and operations
        matchedObject.each(function(index, element) {
            // retrieves the reference to the current element
            // (summary element) to be used
            var _element = jQuery(this);

            // retrieves the reference string to be used to select
            // the reference element that will be used in operations
            var reference = _element.attr("data-reference");
            var element = jQuery(reference);

            // creates the sidebar list element and then iterates over
            // the complete set of values that are going to be used to
            // populate the various key value relations contained in it
            var sidebarList = jQuery("<ul class=\"sidebar-list\"></ul>");
            for (var index = 0; index < VALUES.length; index++) {
                var value = VALUES[index];
                var valueL = VALUES_LOCALE[index];
                var item = jQuery("<li class=\"" + value + "\">" + "<span class=\"key\">" + valueL +
                    "</span>" + "<span class=\"value\"></span>" +
                    "<div class=\"sidebar-clear\"></div>" + "</li>");
                sidebarList.append(item)
            }

            // adds the complete set of contents in the sidebar list to
            // the summary element (required by definition)
            _element.append(sidebarList);

            // retrieves the reference to the various element that are going
            // to be used latter in the populate operations
            var countElement = jQuery(".count > .value", _element);
            var sumElement = jQuery(".sum > .value", _element);
            var averageElement = jQuery(".average > .value", _element);

            // hides the panel as this is the default behavior
            // to be used for the summary
            _element.hide();

            // registers for the slected event in the target element
            // so that the proper values are updated for the summary
            element.bind("selected", function(event, elements) {
                // verifies if the summary element is meant to be shown
                // or hidden (set visible or not)
                var isVisible = elements.length > 1;

                // retrieves the number of element that have been
                // selected and then starts the sum value to zero
                var count = elements.length;
                var sum = 0;

                // iterates over each of the elements in order to
                // gather the ammount value that is going to be
                // used for the calculus, this uses a strategy of
                // finding the last number value in the target
                elements.each(function(index, element) {
                    var _element = jQuery(this);
                    var numbers = jQuery(".number", _element);
                    var length = numbers.length;
                    var target = jQuery(numbers[length - 1]).html();
                    var value = parseFloat(target);
                    sum += value;
                });

                // calculates the average value by deviding the complete
                // sum over the total count of elements
                var average = sum / count;

                // converts the various values into the appropriate string
                // representation for each of them
                var countS = count.toString();
                var sumS = sum.toFixed(2);
                var averageS = average.toFixed(2);

                // sets the various valus in the corresponding target elements
                // so that the update values are set
                countElement.uxvalue(countS);
                sumElement.uxvalue(sumS);
                averageElement.uxvalue(averageS);

                // shows or hides the element according to the
                // pre-defined element value
                if (isVisible) {
                    _element.show();
                } else {
                    _element.hide();
                }
            });

            // registers for the update complete event on the target
            // element as that means that all of the elements have
            // been unselected as new data has been receieved
            element.bind("update_complete", function(event, reset) {
                reset && _element.hide();
            });
        });
    };
})(jQuery);

(function(jQuery) {
    jQuery.fn.utopbar = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // retrieves the reference associated with the various content
        // related elements to be used in the toggle operation
        var contentBar = jQuery(".content-bar", matchedObject);
        var contentMargin = jQuery(".content-margin", matchedObject);

        // retrieves the reference to the handle associated with the
        // top bar and registers it for the click event to toggle the
        // visibility of the top bar
        var handle = jQuery(".top-bar-handle", matchedObject)
        handle.click(function() {
            var element = jQuery(this);
            var slider = element.parents(".top-bar-slider");

            var isUp = element.hasClass("up");
            if (isUp) {
                contentBar.removeClass("visible");
                contentMargin.removeClass("visible");
                slider.removeClass("visible");
                element.removeClass("up");
            } else {
                contentBar.addClass("visible");
                contentMargin.addClass("visible");
                slider.addClass("visible");
                element.addClass("up");
            }
        });

        return this;
    };
})(jQuery);

(function(jQuery) {
    jQuery.fn.ureport = function(options) {
        // the default value to be used when no number of
        // values to be printed in case the print mode is
        // currently active
        var MAX_RECORDS = 100000000;

        // sets the jquery matched object and the reference
        // to the parent document element
        var matchedObject = this;
        var _document = jQuery(document);

        // in case there's no matched object there's not need
        // to run the report initialization, global handlers
        // exist and may cause conflicts
        if (matchedObject.length == 0) {
            return;
        }

        // retieves the currently set search parameters present
        // in the url string (from the window object)
        var pathname = window.location.pathname;
        var pathname_l = pathname.length;

        // retrieves the extension from the path name and in case
        // the current extension refers a print document the print
        // report attribute is set
        var extension = pathname.slice(pathname_l - 4, pathname_l);
        if (extension == ".prt") {
            matchedObject.attr("data-print", 1);
        }

        // retrieves the various elements that componse the
        // current report contents, they are going to be used
        // for the various processing parts of the extension
        var buttons = jQuery(".report-header > .buttons", matchedObject);
        var links = jQuery("> a", buttons);
        var linkOptions = jQuery("> .link-options", buttons);
        var table = jQuery(".report-table > table", matchedObject);
        var headers = jQuery("thead > tr > th", table);
        var loading = jQuery(".report-loading", matchedObject);
        var location = jQuery(".report-location", matchedObject);
        var more = jQuery(".report-more", matchedObject);
        var options = jQuery(".options", matchedObject);
        var previous = jQuery(".previous", more);
        var next = jQuery(".next", more);
        var iconOptions = linkOptions.prev("img");

        // prepends the loader (indicator) to the loading section of the
        // report so that the proper animation is displayed in the screen
        loading.prepend("<div class=\"loader\"></div>");

        // updates the report location contents with the unset
        // value set, indicating that no page information is available
        location.html("-");

        // adds the hidden optins field to the options form so that the
        // options section is allways shown on submissions
        options.prepend("<input type=\"hidden\" name=\"options\" value=\"show\" />");

        // disables both the previous and the next buttons
        // to while no actions are available, on the next
        // update operation their status will be updated
        previous.uxdisable();
        next.uxdisable();

        // in case the there're no options panel defined for the current
        // report the options link and icons must be hidden and not displayed
        // as no interaction would be possible/visible
        options.length == 0 && linkOptions.hide() && iconOptions.hide();

        // schedules a timeout operation that is going to be
        // executed after this tick operation so that the
        // proper search (url) string is available for the
        // update of url values in a series of elements
        setTimeout(function() {
            // retrieves the path name for the current location
            // and uses it to update the options form submit information
            // so that it reflects the most up-to-date values
            var pathname = window.location.pathname;
            options.attr("method", "get");
            options.attr("action", pathname);

            // iterates over all the present links to update their
            // link values to match the arguments of the current request
            links.each(function(index, element) {
                var _element = jQuery(this);
                var href = _element.attr("href");
                var search = window.location.search;
                _element.attr("href", href + search);
            });
        });

        // retrieves the number of rows to be used in the table
        // associated with the report
        var print = matchedObject.attr("data-print");
        var count = matchedObject.attr("data-rows") || "30";
        count = print ? MAX_RECORDS : parseInt(count);
        matchedObject.data("count", count);
        matchedObject.data("page", 0);

        // in case the current mode is print the proper changes
        // for the layout are actioned and the print dialog is
        // shown in the screen
        if (print) {
            // retrieves the reference to the various elements
            // that are going to be changed for the print mode
            var header = jQuery(".header");
            var footer = jQuery(".footer");
            var topBar = jQuery(".top-bar");

            // adds the print class to the current report element
            matchedObject.addClass("print");

            // removes the various elements that are considered
            // not required from the print mode
            header.remove();
            footer.remove();
            topBar.remove();
        }

        // registers for the click event in the table headers so that a new
        // order direction may be provided to the or the reverse applied to
        // the contents of the current report, note that this registration
        // is not applied for a print environment
        !print && headers.click(function() {
            var element = jQuery(this);
            var currentOrder = matchedObject.data("order");
            var reverse = matchedObject.data("reverse") || false;
            var newOrder = element.attr("data-order");
            reverse = newOrder != currentOrder ? true : !reverse;
            matchedObject.data("reverse", reverse);
            matchedObject.data("order", newOrder);
            matchedObject.data("dirty", true);
            headers.removeClass("sorter");
            element.addClass("sorter");
            newOrder && update(matchedObject, options);
        });

        // registers for the key down event on the document in order
        // to provide easy of use shortcut for navigation
        matchedObject.length > 0 && _document.keydown(onKeyDown = function(event) {
            // sets the report as the matched object, provides
            // a compatability layer
            var report = matchedObject;

            // retrieves the key value
            var keyValue = event.keyCode ? event.keyCode : event.charCode ? event.charCode : event.which;

            // switches over the key value
            switch (keyValue) {
                // in case it's one of the next keys
                // (the right arrow or the 'j')
                case 39:
                case 74:
                    increment(report, options);

                    // breaks the switch
                    break;

                    // in case it's one of the previous keys
                    // (the left arrow or the 'k')
                case 37:
                case 75:
                    decrement(report, options);

                    // breaks the switch
                    break;

                    // in case it's default
                default:
                    // breaks the switch
                    break;
            }
        });
        matchedObject.bind("destroyed", function() {
            _document.unbind("keydown", onKeyDown);
        });

        // registers for the click operation in the options
        // link so that the options panel visibility is toggled
        linkOptions.click(function() {
            var element = jQuery(this);
            var report = element.parents(".report");
            var options = jQuery(".options", report);
            options.toggle();
        });

        // registers for the click even on the previous
        // button to decrement one page
        previous.click(function() {
            var element = jQuery(this);
            var report = element.parents(".report");
            decrement(report, options);
        });

        // registers for the click even on the next
        // button to increment one page
        next.click(function() {
            var element = jQuery(this);
            var report = element.parents(".report");
            increment(report, options);
        });

        var update = function(matchedObject, options) {
            // retrieves the various element that componse the
            // current report contents
            var table = jQuery(".report-table > table", matchedObject);
            var tableBody = jQuery("tbody", table);
            var template = jQuery("tr.template", table);
            var location = jQuery(".report-location", matchedObject);
            var more = jQuery(".report-more", matchedObject);
            var previous = jQuery(".previous", more);
            var next = jQuery(".next", more);

            // retrieves the current configuration values for
            // the report to be used, will condition the update
            var count = matchedObject.data("count");
            var page = matchedObject.data("page");
            var order = matchedObject.data("order");
            var reverse = matchedObject.data("reverse");
            var dirty = matchedObject.data("dirty");
            var limit = matchedObject.data("limit");
            var items = matchedObject.data("items");

            // creates the sorter function for the update operation
            // taking into account the clojure around the order name
            var sorter = function(first, second) {
                var isNumber = typeof first == "number";
                if (isNumber) {
                    return first[order] - second[order];
                } else {
                    if (first[order] < second[order]) {
                        return -1;
                    }
                    if (first[order] > second[order]) {
                        return 1;
                    }
                    return 0;
                }
            };

            // runs the sorting operation for the current set of items
            // in cae the order value is defined (avoid extra delay)
            // and then reverses the order of the values (if requested)
            items = dirty && order ? items.sort(sorter) : items;
            items = dirty && reverse ? items.reverse() : items;

            // calculates the offset position from the current
            // page and sets the end value using it then calculated
            // the maximum index value from the minimum of the end
            // and items length values
            var offset = page * count;
            var end = offset + count;
            var max = items.length < end ? items.length : end;

            // retrieves the current set of valid rows from the
            // table and removes them from the current view
            var rows = jQuery("tr:not(.template)", tableBody);
            rows.remove();

            // starts the list that will hold the various rendered
            // items to be added to the table body at the end
            var _items = [];

            // iterates over all the items in the set to be presented
            // for the current report page
            for (var index = offset; index < max; index++) {
                var current = items[index];
                var item = template.uxtemplate(current);
                _items.push(item[0]);
            }

            // adds the various table items to the table body at one
            // single operation (performance is improved)
            tableBody.append(_items);

            // in cae the current page is the first one the previous
            // button must be disabled otherwise it's enabled
            if (page == 0) {
                previous.uxdisable();
            } else {
                previous.uxenable();
            }

            // in cae the current page is the last one the next
            // button must be disabled otherwise it's enabled
            if (page == limit) {
                next.uxdisable();
            } else {
                next.uxenable();
            }

            // updates the location string/label value with the new page
            // that has been selected (provide visual information)
            location.html(String(page + 1) + " / " + String(limit + 1));

            // unsets the dirty flag as the ordering (expensive) part of
            // the update has been correctly performed, no need to do it
            // again until the sorting order changes (performance issue)
            // then saves the new items reference in the structure
            matchedObject.data("dirty", false);
            matchedObject.data("items", items);
        };

        var print = function() {
            // shows the print dialog window to start the print
            // procedure, only uppon the complete loading
            var print = matchedObject.attr("data-print");
            print && window.print();
        };

        var limits = function(matchedObject, options) {
            var items = matchedObject.data("items");
            var count = matchedObject.data("count");
            var limit = Math.ceil(items.length / count) - 1;
            limit = limit > 0 ? limit : 0;

            matchedObject.data("limit", limit);
        };

        var decrement = function(matchedObject, options) {
            var page = matchedObject.data("page");
            if (page == 0) {
                return;
            }
            page--;
            matchedObject.data("page", page);
            update(matchedObject, options)
        };

        var increment = function(matchedObject, options) {
            var page = matchedObject.data("page");
            var limit = matchedObject.data("limit");
            if (page == limit) {
                return;
            }
            page++;
            matchedObject.data("page", page);
            update(matchedObject, options)
        };

        var load = function(matchedObject, options) {
            var dataSource = jQuery(".report-table > .data-source",
                matchedObject);
            matchedObject.addClass("loading");
            dataSource.uxdataquery({}, function(validItems, moreItems) {
                matchedObject.removeClass("loading");
                matchedObject.data("items", validItems);
                limits(matchedObject, options);
                update(matchedObject, options);
                print(matchedObject, options);
            });
        };

        load(matchedObject, options);
    };
})(jQuery);

(function(jQuery) {
    jQuery.utext = function(value) {
        value = value.replace(/{{/g, "");
        value = value.replace(/}}/g, "");
        value = value.capitalize(true);
        return value;
    };
})(jQuery);

(function(jQuery) {
    jQuery.utemplate = function(value, noformat) {
        value = value.replace(/{{/g, noformat ? "" : "<b>");
        value = value.replace(/}}/g, noformat ? "" : "</b>");
        value = value.capitalize(true);
        return value;
    };
})(jQuery);

(function(jQuery) {
    jQuery.fn.uchart = function(method, options) {
        // flags that control the behaviour of the draw operation
        // of the chart, they may be used to avoid the plotting
        // of certaing parts of the chart
        var DRAW_AXIS = true;
        var DRAW_AUXILIARY_AXIS = false;
        var DRAW_LABELS = true;
        var DRAW_LINES = true;
        var DRAW_LABEL_BOX = false;

        // the label related information static variables
        // to be used in font configuration
        var LABEL_FONT_NAME = "\"Open Sans\", Arial";
        var LABEL_FONT_SIZE = 10;
        var LABEL_FONT_REAL_SIZE = 8;

        // the base values to be used in the global operation
        // for the drawing of the chart
        var BASE_COLOR = "#4d4d4d";
        var LABEL_COLOR = "#000000";
        var AXIS_COLOR = "#888888";
        var AUXILIARY_AXIS_COLOR = "#aaaaaa";
        var VALUE_CIRCLE_COLOR = "#ffffff";

        // background color for the various elements that are
        // part of the chart (may containg rgba based values)
        var BACKGROUND_COLOR = "#222222";
        var BACKGROUND_CIRCLE_COLOR = "#000000";
        var BACKGROUND_BOX_COLOR = "rgba(0, 0, 0, 1)";

        // the various colors that are going to be used in the
        // plot of the various chart lines
        var CHART_COLORS = ["#77a9df", "#ffd67e", "#0176ff", "#e0cf21",
            "#22b573", "#c69c6d", "#c14f53", "#f0e7d0", "#ff78ff"
        ];

        // the counting of the vaious elements of the chart (steps)
        // and value control for the various elements
        var VERTICAL_STEPS = 7;
        var HORIZONTAL_STEPS = 8;
        var MAXIMUM_VALUE = 999;
        var MINIMUM_VALUE = 0;

        // the label related values that are going to be used to
        // both position and define sizes
        var VERTICAL_LABEL_WIDTH = 36;
        var HORIZONTAL_LABEL_HEIGHT = 20;
        var LABEL_OFFSET = 10;

        // margins and paddings for the draw of the chart area, use
        // this values with care to avoid overflows
        var MARGIN_LEFT = 3;
        var MARGIN_RIGHT = 20;
        var MARGIN_TOP = 18;
        var MARGIN_BOTTOM = 4;

        // values for the boxing that is going to be used to describe
        // the vaious elements in the chart
        var BOX_MARGIN_HORIZONTAL = 20;
        var BOX_MARGIN_VERTICAL = 20;
        var BOX_HORIZONTAL_OFFSET = 20;
        var BOX_VERTICAL_OFFSET = 20;

        // unit map meant to be used in the conversion of very large
        // values so that they can fit in the current grid for labels.
        var UNIT_MAP = {
            1: "K",
            2: "M",
            3: "G",
            4: "T"
        };

        // the inital data map that is going to be used in
        // the parsing of the various value that will be part
        // of the global chart to be draw
        var DATA = {
            labels: [],
            horizontalLabels: [],
            values: {}
        }

        // the default values for the menu
        var defaults = {};

        // sets the default method value
        var method = method ? method : "default";

        // sets the default options value
        var options = options ? options : {};

        // constructs the options
        var options = jQuery.extend(defaults, options);

        // sets the jquery matched object
        var matchedObject = this;

        /**
         * Initializer of the plugin, runs the necessary functions to initialize
         * the structures.
         */
        var initialize = function() {
            _appendHtml();
            _registerHandlers();
        };

        /**
         * Creates the necessary html for the component.
         */
        var _appendHtml = function() {};

        /**
         * Registers the event handlers for the created objects.
         */
        var _registerHandlers = function() {};

        var drawAxis = function(matchedObject, options) {
            // retrieves the options values, that are going to
            // be used int he drawing operation for the axis
            var context = options["context"];
            var axisColor = options["axisColor"];
            var verticalLabelWidth = options["verticalLabelWidth"];
            var marginLeft = options["marginLeft"];
            var marginTop = options["marginTop"];
            var horizontalAxisSize = options["horizontalAxisSize"];
            var verticalAxisSize = options["verticalAxisSize"];

            // saves the current state, as it's going to be used
            // restored at the end of the axis draw and then sets
            // the initial context attributes for the axis
            context.save();
            context.lineWidth = 1;
            context.strokeStyle = axisColor;

            // begins the path that is going to be used for the
            // drawing of the axis lines of the chart
            context.beginPath();

            // draws the left vertical axis to the current context
            // note that the line function is used for the drawing
            context.line(marginLeft + verticalLabelWidth, marginTop - 1,
                marginLeft + verticalLabelWidth, marginTop + verticalAxisSize);

            // draws the bottom horizontal axis to the current context
            // note that the line function is used for the drawing
            context.line(marginLeft + verticalLabelWidth, marginTop + verticalAxisSize, marginLeft +
                verticalLabelWidth + horizontalAxisSize + 1, marginTop + verticalAxisSize);

            // strokes and closes the path, this should flush the axis
            // into the current canvas area
            context.stroke();
            context.closePath();

            // restores the state
            context.restore();
        };

        var drawAuxiliaryAxis = function(matchedObject, options) {
            // retrieves the options values
            var context = options["context"];
            var auxiliaryAxisColor = options["auxiliaryAxisColor"];
            var horizontalSteps = options["horizontalSteps"];
            var verticalSteps = options["verticalSteps"];
            var horizontalLabelHeight = options["horizontalLabelHeight"];
            var verticalLabelWidth = options["verticalLabelWidth"];
            var marginLeft = options["marginLeft"];
            var marginTop = options["marginTop"];
            var horizontalAxisSize = options["horizontalAxisSize"];
            var verticalAxisSize = options["verticalAxisSize"];

            // saves the current state and starts populating
            // the various context related attribute for the
            context.save();
            context.lineWidth = 1;
            context.strokeStyle = auxiliaryAxisColor;

            // begins the path
            context.beginPath();

            // calculates the x position increment
            var xPositionIncrement = horizontalAxisSize / (horizontalSteps - 1);

            // sets the intial current x position value
            var currentX = marginLeft + verticalLabelWidth + xPositionIncrement;

            // iterates over the range of values
            for (var index = 0; index < horizontalSteps - 1; index++) {
                // draws a dashed line
                context.dashedLine(currentX, marginTop, currentX, marginTop + verticalAxisSize, [2, 3]);

                // increments the current x position with the x
                // position increment
                currentX += xPositionIncrement;
            }

            // calculates the y position increment
            var yPositionIncrement = verticalAxisSize / verticalSteps;

            // sets the initial current y position value
            var currentY = marginTop + verticalAxisSize - yPositionIncrement;

            // iterates over the range of values
            for (var index = 0; index < verticalSteps - 1; index++) {
                // draws a dashed line
                context.dashedLine(marginLeft + verticalLabelWidth, currentY,
                    marginLeft + verticalLabelWidth + horizontalAxisSize,
                    currentY, [2, 3]);

                // decrements the current y position with the y
                // position increment
                currentY -= yPositionIncrement;
            }

            // strokes and closes the path
            context.stroke();
            context.closePath();

            // restores the state
            context.restore();
        };

        var drawAxisLabels = function(matchedObject, options) {
            // retrieves the options values
            var context = options["context"];
            var data = options["data"];
            var labelColor = options["labelColor"];
            var axisColor = options["axisColor"];
            var labelFontRealSize = options["labelFontRealSize"];
            var horizontalAxisSize = options["horizontalAxisSize"];
            var verticalAxisSize = options["verticalAxisSize"];
            var horizontalSteps = options["horizontalSteps"];
            var verticalSteps = options["verticalSteps"];
            var maximumValue = options["maximumValue"];
            var minimumValue = options["minimumValue"];
            var stepValue = options["stepValue"];
            var verticalLabelWidth = options["verticalLabelWidth"];
            var labelOffset = options["labelOffset"];
            var marginLeft = options["marginLeft"];
            var marginTop = options["marginTop"];
            var marginBottom = options["marginBottom"];

            // calculates the x position increment
            var xPositionIncrement = horizontalAxisSize / (horizontalSteps - 1);

            // sets the intial current x position value
            var currentX = marginLeft + verticalLabelWidth;

            // sets the line width and the color for the extra small
            // lines that sit next to the labels (for reference)
            context.lineWidth = 1;
            context.strokeStyle = axisColor;
            context.fillStyle = labelColor;

            // iterates over the range of horizontal steps
            for (var index = 0; index < horizontalSteps; index++) {
                // retreives the current horizontal label
                var horizontalLabel = data.horizontalLabels[index];

                // measures the text size to retrieve
                // the text width
                var textMetrics = context.measureText(horizontalLabel);
                var textWidth = textMetrics.width;
                var currentY = marginTop + verticalAxisSize;

                // draws the current value as string
                context.fillText(horizontalLabel, currentX - (textWidth / 2),
                    currentY + labelOffset + labelFontRealSize);

                // creates the simple line that sits next to the label
                // to create a visual reference to it
                context.beginPath();
                context.line(currentX, currentY, currentX, currentY + 4);
                context.stroke();
                context.closePath();

                // increments the current x position with the x
                // position increment
                currentX += xPositionIncrement;
            }

            // calculates the y position increment
            var yPositionIncrement = verticalAxisSize / verticalSteps;

            // sets the initial current y position value
            var currentY = marginTop + verticalAxisSize;

            // sets the initial current value
            var currentValue = minimumValue;

            // iterates over the range of values of vertical steps
            // to draw both the labels for the vertical lines and
            // the small lines that sit next to the label in the
            // axis line (that create a visual reference)
            for (var index = 0; index < verticalSteps + 1; index++) {
                // converts the current value into a string and then
                // calculates the size of it in order to be able to
                // normalize it into an unit based value
                var valueS = currentValue.toString();
                var count = valueS.length - 1;
                var unit = Math.floor(count / 3);
                var unitS = unit >= 1 ? UNIT_MAP[unit] : "";
                var value = Math.floor(currentValue / Math.pow(10, unit * 3));
                valueS = value.toString() + " " + unitS;

                // measures the text size to retrieve the text
                // width so that is possible to correctly
                // position the text label within the canvas, then
                // uses this value to correctly calculate the x position
                var textMetrics = context.measureText(valueS);
                var textWidth = textMetrics.width;
                var currentX = marginLeft + verticalLabelWidth;

                // draws the current value as string
                context.fillText(valueS, currentX - labelOffset - textWidth,
                    currentY + Math.round(labelFontRealSize / 2));

                // creates the simple line that sits next to the label
                // to create a visual reference to it
                context.beginPath();
                context.line(currentX, currentY, currentX - 4, currentY);
                context.stroke();
                context.closePath();

                // drecrements the current y position with the y
                // position increment
                currentY -= yPositionIncrement;

                // increments the current value with
                // the step value
                currentValue += stepValue;
            }
        };

        var drawLines = function(matchedObject, options) {
            // retrieves the various options values that control
            // the way the chart is going to be drawn
            var context = options["context"];
            var data = options["data"];
            var valueCircleColor = options["valueCircleColor"];
            var backgroundCircleColor = options["backgroundCircleColor"];
            var chartColors = options["chartColors"];
            var maximumValue = options["maximumValue"];
            var minimumValue = options["minimumValue"];
            var horizontalSteps = options["horizontalSteps"];
            var verticalSteps = options["verticalSteps"];
            var verticalLabelWidth = options["verticalLabelWidth"];
            var marginLeft = options["marginLeft"];
            var marginTop = options["marginTop"];
            var horizontalAxisSize = options["horizontalAxisSize"];
            var verticalAxisSize = options["verticalAxisSize"];

            // retrieves the data values
            var dataValues = data["values"];

            // retrieves the chart colors length
            var chartColorsLength = chartColors.length;

            // saves the current state
            context.save();

            // changes the context configuration
            context.lineWidth = 2;

            // calculates both of the axis increment using the size
            // of the axis diving by the number of steps in each way
            var xPositionIncrement = horizontalAxisSize / (horizontalSteps - 1);
            var yPositionIncrement = verticalAxisSize / verticalSteps;

            // starts the values index
            var valuesIndex = 0;

            // iterates over all the data values
            // to draw the respective lines
            for (var key in dataValues) {
                // retrieves the current values
                var currentValues = dataValues[key];

                // retrieves the color index (modulus)
                var colorIndex = valuesIndex % chartColorsLength;

                // retrieves the current color for the value set
                // and sets it in the current context
                var currentColor = chartColors[colorIndex];
                context.strokeStyle = currentColor

                // begins the path that is going to be used for
                // value line to be drawn
                context.beginPath()

                // calculates the various values that are going to be
                // uses for the initial x and y positions
                var initialValue = currentValues[0];
                var currentX = marginLeft + verticalLabelWidth;
                var deltaValue = initialValue - minimumValue;
                var valueSteps = (deltaValue * verticalSteps) / maximumValue;
                var positionValue = valueSteps * yPositionIncrement;
                var currentY = marginTop + verticalAxisSize - positionValue;

                // sets the initial x and y values so that they may be used
                // latter for further iterations
                var initialX = currentX;
                var initialY = currentY;

                // moves to the initial line position
                context.moveTo(currentX, currentY);

                // increments the current x position with the x
                // position increment
                currentX += xPositionIncrement;

                // iterates over the horizontal steps to draw the various lines
                for (var index = 1; index < horizontalSteps; index++) {
                    // retrieves the current value
                    var currentValue = currentValues[index];

                    // calculates the (vertical) position from the current value
                    var deltaValue = currentValue - minimumValue;
                    var valueSteps = ((deltaValue * verticalSteps) / maximumValue);
                    var positionValue = valueSteps * yPositionIncrement;
                    var currentY = marginTop + verticalAxisSize - positionValue;

                    // draws the line to the current position value
                    context.lineTo(currentX, currentY);

                    // increments the current x position with the x
                    // position increment
                    currentX += xPositionIncrement;
                }

                // strokes and closes the path so that all the lines
                // are correctly drawn into the current context
                context.stroke();
                context.closePath();

                // sets the initial current x position value
                var currentX = marginLeft + verticalLabelWidth;

                // iterates over the horizontal steps to draw the various
                // circles (inner and outer) for the various steps
                for (var index = 0; index < horizontalSteps; index++) {
                    // retrieves the current value in iteration to
                    // be used in the drawing
                    var currentValue = currentValues[index];

                    // calculates the (vertical) position from the current value
                    var deltaValue = currentValue - minimumValue;
                    var valueSteps = ((deltaValue * verticalSteps) / maximumValue);
                    var positionValue = valueSteps * yPositionIncrement;
                    var currentY = marginTop + verticalAxisSize - positionValue;

                    // sets the inner cicle color that should be made as
                    // neutral as possible to avoid "vissual" collisions
                    context.fillStyle = valueCircleColor;

                    context.beginPath();
                    context.arc(currentX, currentY, 5, 0, Math.PI * 2, true);
                    context.fill();
                    context.closePath();

                    // sets the background circle color as the fill color
                    context.fillStyle = currentColor;

                    // draws the bigger background circle, by using an arc
                    // based path to perform the action
                    context.beginPath();
                    context.arc(currentX, currentY, 4, 0, Math.PI * 2, true);
                    context.fill();
                    context.closePath();

                    // sets the inner cicle color that should be made as
                    // neutral as possible to avoid "vissual" collisions
                    context.fillStyle = valueCircleColor;

                    // draws the smaller neutral circle so that the global
                    // circle feel is more neutral
                    context.beginPath();
                    context.arc(currentX, currentY, 2, 0, Math.PI * 2, true);
                    context.fill();
                    context.closePath();

                    // increments the current x position with the x
                    // position increment so that the next position is
                    // set for the current iteration cycle
                    currentX += xPositionIncrement;
                }

                // increments the values index
                valuesIndex++;
            }

            // restores the state
            context.restore();
        };

        var initializeContext = function(matchedObject, options) {
            // retrieves the options values that are going
            // to be used to setup the environment
            var context = options["context"];
            var labelFontName = options["labelFontName"];
            var labelFontSize = options["labelFontSize"];

            // sets the initial context configuration so that
            // the global enviornment is correctly set
            context.fillStyle = "#4d4d4d";
            context.strokeStyle = "#4d4d4d";
            context.lineWidth = 1;
            context.font = labelFontSize + "px " + labelFontName;
        };

        var populateOptions = function(matchedObject, options) {
            // retrieves the options values
            var chartWidth = options["width"];
            var chartHeight = options["height"];

            // sets the various option flag based values to enable
            // and disable certain features
            var drawAxis = options["drawAxis"] ? options["drawAxis"] : DRAW_AXIS;
            var drawAuxiliaryAxis = options["drawAuxiliaryAxis"] ? options["drawAuxiliaryAxis"] :
                DRAW_AUXILIARY_AXIS;
            var drawLabels = options["drawLabels"] ? options["drawLabels"] : DRAW_LABELS;
            var drawLines = options["drawLines"] ? options["drawLines"] : DRAW_LINES;
            var drawLabelBox = options["drawLabelBox"] ? options["drawLabelBox"] : DRAW_LABEL_BOX;

            // sets the ui values
            var labelFontName = options["labelFontName"] ? options["labelFontName"] : LABEL_FONT_NAME;
            var labelFontSize = options["labelFontSize"] ? options["labelFontSize"] : LABEL_FONT_SIZE;
            var labelFontRealSize = options["labelFontRealSize"] ? options["labelFontRealSize"] :
                LABEL_FONT_REAL_SIZE;
            var baseColor = options["baseColor"] ? options["baseColor"] : BASE_COLOR;
            var labelColor = options["labelColor"] ? options["labelColor"] : LABEL_COLOR;
            var axisColor = options["axisColor"] ? options["axisColor"] : AXIS_COLOR;
            var auxiliaryAxisColor = options["auxiliaryAxisColor"] ? options["auxiliaryAxisColor"] :
                AUXILIARY_AXIS_COLOR;
            var valueCircleColor = options["valueCircleColor"] ? options["valueCircleColor"] :
                VALUE_CIRCLE_COLOR;
            var backgroundCircleColor = options["backgroundCircleColor"] ? options["backgroundCircleColor"] :
                BACKGROUND_CIRCLE_COLOR;
            var backgroundBoxColor = options["backgroundBoxColor"] ? options["backgroundBoxColor"] :
                BACKGROUND_BOX_COLOR;
            var chartColors = options["chartColors"] ? options["chartColors"] : CHART_COLORS;

            // sets the number of steps
            var verticalSteps = options["verticalSteps"] ? options["verticalSteps"] : VERTICAL_STEPS;
            var horizontalSteps = options["horizontalSteps"] ? options["horizontalSteps"] :
                HORIZONTAL_STEPS;

            // sets the maximum and minimum values and calculates
            // the range value
            var maximumValue = options["maximumValue"] ? Math.ceil(options["maximumValue"] / verticalSteps) *
                verticalSteps : MAXIMUM_VALUE;
            var minimumValue = options["minimumValue"] ? options["minimumValue"] : MINIMUM_VALUE;
            var rangeValue = maximumValue - minimumValue;

            // the increment in each step value to be used
            var stepValue = Math.round(rangeValue / verticalSteps);

            // retrieves the horizontal and vertical label width
            // and height values
            var horizontalLabelHeight = options["horizontalLabelHeight"] ? options["horizontalLabelHeight"] :
                HORIZONTAL_LABEL_HEIGHT;
            var verticalLabelWidth = options["verticalLabelWidth"] ? options["verticalLabelWidth"] :
                VERTICAL_LABEL_WIDTH;

            // retrieves the label offset
            var labelOffset = options["labelOffset"] ? options["labelOffset"] : LABEL_OFFSET;

            // calculates the horizontal margins
            var marginLeft = options["marginLeft"] ? options["marginLeft"] : MARGIN_LEFT;
            var marginRight = options["marginRight"] ? options["marginRight"] : MARGIN_RIGHT;
            var horizontalMargin = marginLeft + marginRight + verticalLabelWidth;

            // calculates the vertical margins
            var marginTop = options["marginTop"] ? options["marginTop"] : MARGIN_TOP;
            var marginBottom = options["marginBottom"] ? options["marginBottom"] : MARGIN_BOTTOM;
            var verticalMargin = marginTop + marginBottom + horizontalLabelHeight;

            // calculates the box margins and offsets
            var boxMarginHorizontal = options["boxMarginHorizontal"] ? options["boxMarginHorizontal"] :
                BOX_MARGIN_HORIZONTAL;
            var boxMarginVertical = options["boxMarginVertical"] ? options["boxMarginVertical"] :
                BOX_MARGIN_VERTICAL;
            var boxHorizontalOffset = options["boxHorizontalOffset"] ? options["boxHorizontalOffset"] :
                BOX_HORIZONTAL_OFFSET;
            var boxVerticalOffset = options["boxVerticalOffset"] ? options["boxVerticalOffset"] :
                BOX_VERTICAL_OFFSET;

            // calculates the size of the axis based on the
            var horizontalAxisSize = chartWidth - horizontalMargin;
            var verticalAxisSize = chartHeight - verticalMargin;

            // sets the options values, so that they may be used
            // latter on in the extension
            options["drawAxis"] = drawAxis;
            options["drawAuxiliaryAxis"] = drawAuxiliaryAxis;
            options["drawLabels"] = drawLabels;
            options["drawLines"] = drawLines;
            options["drawLabelBox"] = drawLabelBox;
            options["labelFontName"] = labelFontName;
            options["labelFontSize"] = labelFontSize;
            options["labelFontRealSize"] = labelFontRealSize;
            options["baseColor"] = baseColor;
            options["labelColor"] = labelColor;
            options["axisColor"] = axisColor;
            options["auxiliaryAxisColor"] = auxiliaryAxisColor;
            options["valueCircleColor"] = valueCircleColor;
            options["backgroundCircleColor"] = backgroundCircleColor;
            options["backgroundBoxColor"] = backgroundBoxColor;
            options["chartColors"] = chartColors;
            options["verticalSteps"] = verticalSteps;
            options["horizontalSteps"] = horizontalSteps;
            options["maximumValue"] = maximumValue;
            options["minimumValue"] = minimumValue;
            options["rangeValue"] = rangeValue;
            options["stepValue"] = stepValue;
            options["horizontalLabelHeight"] = horizontalLabelHeight;
            options["verticalLabelWidth"] = verticalLabelWidth;
            options["labelOffset"] = labelOffset;
            options["marginLeft"] = marginLeft;
            options["marginRight"] = marginRight;
            options["horizontalMargin"] = horizontalMargin;
            options["marginTop"] = marginTop;
            options["marginBottom"] = marginBottom;
            options["verticalMargin"] = verticalMargin;
            options["boxMarginHorizontal"] = boxMarginHorizontal;
            options["boxMarginVertical"] = boxMarginVertical;
            options["boxHorizontalOffset"] = boxHorizontalOffset;
            options["boxVerticalOffset"] = boxVerticalOffset;
            options["horizontalAxisSize"] = horizontalAxisSize;
            options["verticalAxisSize"] = verticalAxisSize;
        };

        var drawLabelBox = function(matchedObject, options) {
            // retrieves the options values
            var context = options["context"];
            var data = options["data"];
            var labelFontRealSize = options["labelFontRealSize"];
            var backgroundBoxColor = options["backgroundBoxColor"];
            var chartColors = options["chartColors"];
            var auxiliaryAxisColor = options["auxiliaryAxisColor"];
            var verticalLabelWidth = options["verticalLabelWidth"];
            var marginLeft = options["marginLeft"];
            var marginTop = options["marginTop"];
            var boxMarginHorizontal = options["boxMarginHorizontal"];
            var boxMarginVertical = options["boxMarginVertical"];
            var boxHorizontalOffset = options["boxHorizontalOffset"];
            var boxVerticalOffset = options["boxVerticalOffset"];
            var horizontalAxisSize = options["horizontalAxisSize"];
            var verticalAxisSize = options["verticalAxisSize"];

            // retrieves the data values
            var dataValues = data["values"];

            // retrieves the chart colors length
            var chartColorsLength = chartColors.length;

            // sets the initial value count
            var valueCount = 0;

            // sets the initial largest width value
            var largestWidth = 0;

            // iterates over all the data values
            for (var key in dataValues) {
                // measures the text size to retrieve
                // the text width
                var textMetrics = context.measureText(key);
                var textWidth = textMetrics.width;

                // updates the largest width
                largestWidth = textWidth > largestWidth ? textWidth : largestWidth;

                // increments the value count
                valueCount++;
            }

            // calculates the line height from the label font real size
            // and the vertical margin
            var lineHeight = labelFontRealSize + boxMarginVertical;

            // calculates the box dimension with the border values in mind
            // and also counting with the number of items
            var boxWidth = largestWidth + (2 * boxMarginHorizontal) + 46;
            var boxHeight = valueCount * lineHeight + boxMarginVertical;

            // calculates the box position with the offset and anchored
            // to the current defined position
            var boxX = marginLeft + verticalLabelWidth + horizontalAxisSize - boxWidth -
                boxHorizontalOffset;
            var boxY = marginTop + boxVerticalOffset;

            // sets the background box fill color as the background box color
            context.fillStyle = backgroundBoxColor;

            // draws the box rectangle
            context.beginPath()
            context.roundRectangle(boxX, boxY, boxWidth, boxHeight, 6);
            context.stroke();
            context.fill();
            context.closePath();

            // sets the initial curret x value
            var currentX = boxX + boxMarginHorizontal + 40;

            // sets the initial curret y value
            var currentY = boxY + lineHeight;

            // starts the values index value
            var valuesIndex = 0;

            // iterates over all the data values to draw the respective
            // value circles correspondent to the current line
            for (var key in dataValues) {
                // retrieves the color index (modulus)
                var colorIndex = valuesIndex % chartColorsLength;

                // retrieves the current color
                var currentColor = chartColors[colorIndex];

                // sets the current stroke color in the context
                context.strokeStyle = currentColor
                context.fillStyle = "#ffffff";
                context.fillText(key, currentX, currentY);
                context.fillStyle = currentColor;

                // draws the color indicator circle in the current value
                // position, the size of it is pre-defined
                context.beginPath();
                context.arc(currentX - 24, currentY - 10, 10, 0, Math.PI * 2,
                    true);
                context.fill();
                context.closePath();

                // increments the current y position
                // with the line height
                currentY += lineHeight;

                // increments the values index
                valuesIndex++;
            }
        };

        var processData = function(matchedObject, options) {
            // retrieves the options values
            var data = options["data"] ? options["data"] : DATA;

            // retrieves the data values
            var dataValues = data["values"];

            // initializes the maximum and minimum value
            var maximumValue = 0;

            // iterates over all the data values
            for (var key in dataValues) {
                // retrieves the current values
                var currentValues = dataValues[key]

                // retrieves the current values length
                var currentValuesLength = currentValues.length;

                // iterates over all the current values
                for (var index = 0; index < currentValuesLength; index++) {
                    // retrieves the current value
                    var currentValue = currentValues[index];

                    // in case the current value is greater
                    // than the maximum value
                    if (currentValue > maximumValue) {
                        // replaces the current maximum value
                        // with the current value
                        maximumValue = currentValue;
                    }
                }
            }

            // sets the options values
            options["data"] = data;
            options["maximumValue"] = maximumValue;
        };

        var draw = function() {
            // retrieves the chart as the matched object
            var chart = matchedObject;

            // retrieves the chart element reference
            var chartElement = chart.get(0);

            // in case there is no chart element to draw in
            // must avoid corrupt drawing, returns immediately
            if (!chartElement) {
                // returns immediately to avoid possible
                // problems in the drawing process
                return;
            }

            // retrieves the chart element context
            var context = chartElement.getContext("2d");

            // retrieves the chart size
            var chartWidth = chartElement.width;
            var chartHeight = chartElement.height;

            // clears the context
            context.clearRect(0, 0, chartWidth, chartHeight);

            // sets the base information in the options, these
            // are references to the based object elements
            options["chart"] = chart;
            options["context"] = context;

            // sets the size in the options, the valus are measured
            // in pixel size values
            options["width"] = chartWidth;
            options["height"] = chartHeight;

            // processes the data in the options, so that the
            // proper options values are set
            processData(matchedObject, options);

            // populates the options with the measured values
            populateOptions(matchedObject, options);

            // retrieves the various options that will contion
            // the execution of certain tasks in the chart drawing
            var _drawAxis = options["drawAxis"];
            var _drawAuxiliaryAxis = options["drawAuxiliaryAxis"];
            var _drawLabels = options["drawLabels"];
            var _drawLines = options["drawLines"];
            var _drawLabelBox = options["drawLabelBox"];

            // initializes the context, that is going to be used
            // for the drawing of the canvas and then runs the
            // various drawing operation, so that at the end of
            // the sequence the line chart is correctly drawn
            initializeContext(matchedObject, options);
            _drawAuxiliaryAxis && drawAuxiliaryAxis(matchedObject, options);
            _drawAxis && drawAxis(matchedObject, options);
            _drawLabels && drawAxisLabels(matchedObject, options);
            _drawLines && drawLines(matchedObject, options);

            // draws the label box
            _drawLabelBox && drawLabelBox(matchedObject, options);
        };

        // switches over the method
        switch (method) {
            case "draw":
                // initializes the plugin
                draw();

                // breaks the switch
                break;

            case "default":
                // initializes the plugin
                initialize();

                // breaks the switch
                break;
        }

        // returns the object
        return this;
    };
})(jQuery);

jQuery(document).ready(function() {
    // retrieves the reference to the top level
    // body element to apply the components in it
    var _body = jQuery("body");

    // applies the ui component to the body element (main
    // element) and then applies the extra component logic
    // from the composite extensions
    _body.uxapply();
    _body.uapply();

    // registers for the applied event on the body to be
    // notified of new apply operations and react to them
    // in the sense of applying the specifics
    _body.bind("applied", function(event, base) {
        base.uapply();
    });
});
