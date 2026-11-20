// Hive Omni ERP
// Copyright (c) 2008-2024 Hive Solutions Lda.
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
// __copyright__ = Copyright (c) 2008-2024 Hive Solutions Lda.
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

        // retrieves the debug bar elements for the current structure
        // and applies the debug logic on them, before the other plugins
        // so that the records of their logs are captured by the bar
        var debug = jQuery(".debug-bar", matchedObject);
        debug.udebug();

        // applies the top bar related configurations to the
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

        // retrieves the search (menu) as the search (button)
        // and then starts the search logic on it
        var search = jQuery(".search-menu", matchedObject);
        search.usearch();

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

        // retrieves the sidebar open as the set of elements
        // that are going to apply a button to the side of the screen
        var sidebarOpen = jQuery(".sidebar-open", matchedObject);
        sidebarOpen.usidebaropen();

        // retrieves the sidebar overlay as the set of elements
        // that are going to apply an overlay for sidebar usage
        var sidebarOverlay = jQuery(".sidebar-overlay", matchedObject);
        sidebarOverlay.usidebaroverlay();

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
                if (event.which === 2 || event.which === 3) {
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

                // tries to retrieve the value of the target attribute an
                // in case the value of it is not self (current frame) then
                // avoid handling as an aysnc link (browser handling)
                var target = element.attr("target");
                if (target && target !== "_self") {
                    return;
                }

                // runs the async link execution with no force flag set
                // and in case it run through avoids the default link
                // behavior (avoid duplicated execution)
                var result = jQuery.uxlinkasync(href, false);
                result && event.preventDefault();
            });

            // retrieves the current async registration flag from the body
            // element in case it's currently set returns immediately to
            // avoid duplicated registration
            var async = _body.data("async") || false;
            if (async) {
                return;
            }

            // registers for the data changed event so that if there's new panel
            // data available the layout is updated in accordance, so that the async
            // requests are reflected in a layout change
            _body.bind("data", function(event, data, href, uuid, push, hbase) {
                // in case no unique identifier for the state exists generates a new
                // one in order to identify the current layout state
                uuid = uuid || jQuery.uxguid();

                // retrieves the default hyperlink base value as the target link value
                // this value may be used to customize the url versus link resolution
                hbase = hbase || href;

                // constructs the relative path from the possibly absolute href
                // value, so that it may be used for some of the operations
                var relative = href.replace(/^(?:\/\/|[^\/]+)*\//, "/");

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
                    var bodyData = data.match(/<body[^\0]*>[^\0]*<\/body>/ig)[0];
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
                    // loading are valid for layout change in case they're not
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

                    // in case this is not a verified operation the current state
                    // must be pushed into the history stack, so that we're able
                    // to rollback to it latter, note that this is done before the
                    // layout is updated so that the target url is the current one
                    // when the elements of the new contents are initialized
                    push && window.history.pushState(state, null, href);

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

                    // triggers do async event, responsible for the possible changing
                    // of the body of the current document by any external operation
                    // binding to the current execution logic (allows extension)
                    _body.triggerHandler("do_async", [base, body]);

                    // updates the globally unique identifier representation for
                    // the current state in the current structures
                    updateGuid(uuid);

                    // updates the relative path for the currently loaded page so
                    // that it may be used for path discovery operations
                    updateRelative(relative);

                    // restores the display of the body so that the elements of
                    // it are restored to the user, also scroll to the element
                    // targeted by the hash of the link (as the browser does) or
                    // else to the top so that the feel is of a new page
                    _body.show();
                    updateScroll(href);

                    // triggers the post async event to notify the listening
                    // handlers about the end of the dom modification operations
                    // so that many operations may be resumed
                    _body.triggerHandler("post_async");

                    // in case this is not a verified operation and the google
                    // analytics reference exists a new event is triggered, the
                    // same is also performed for conversion tracking
                    push && window._gaq && _gaq.push(["_trackPageview", relative]);
                    push && window.ga && ga("send", {
                        hitType: "pageview",
                        page: relative
                    });
                    push && window.google_trackConversion && trackConversion();
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
                    var notification = jQuery("<div class=\"header-notification warning\"><strong>"
                        + loading + "</strong></div>");
                    container.append(notification);
                }

                // tries to retrieve the current top loader element, in case it's
                // not found inserts it in the correct position in the top bar
                var topLoader = jQuery(".top-loader");
                if (topLoader.length === 0) {
                    var rightPanel = jQuery(".top-bar > .content-wrapper > .right");
                    var topLoader = jQuery("<div class=\"top-loader\">"
                        + "<div class=\"loader-background\"></div>" + "</div>");
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
            if (window.onpopstate !== null && window.onpopstate !== undefined) {
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
            updateGuid(state.uuid);

            // registers the pop state changed handler function so that
            // it's possible to restore the state using an async approach
            window.onpopstate = function(event) {
                // retrieves the reference to the top level body element
                // that is going to be used for global operations
                var _body = jQuery("body");

                // retrieves the proper uuid value to be used in the trigger
                // of the link action, taking into account the current state
                var uuid = event.state ? event.state.uuid : null;

                // verifies if the uuid of the event in the pop is the same
                // as the one currently defined in the body, if that's the case
                // the async operation should be ignored
                if (uuid && uuid === _body.attr("uuid")) {
                    return;
                }

                // in case the state of the event is invalid the value of the event
                // is ignored and the current state is properly updated so that
                // the value becomes ready and available (just as a safety measure)
                if (event.state === null) {
                    var href = document.location.href;
                    var state = {
                        uuid: jQuery.uxguid(),
                        href: href
                    };
                    window.history.replaceState(state, null, href);
                    updateGuid(state.uuid);
                    return;
                }

                // retrieves the location of the current document and uses it
                // to run the async redirection logic already used by the link
                // async infra-structure for the link click operations
                var href = document.location.href;
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

        if (childCount !== 1) {
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

        if (childCount !== 1) {
            return false;
        }

        return true;
    };

    var updateBase = function(hbase) {
        var _base = jQuery("head base");
        if (_base.length === 0) {
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

    var updateRelative = function(relative) {
        var _body = jQuery("body");
        _body.attr("relative", relative);
    };

    var updateScroll = function(href) {
        // retrieves the element targeted by the hash of the link, by its
        // identifier as it is and then decoded (eg: an identifier with
        // accents), as the browser does on the complete loading of a page
        var index = href.indexOf("#");
        var hash = index === -1 ? "" : href.slice(index + 1);
        var target = hash ? document.getElementById(hash) : null;
        if (hash && !target) {
            try {
                target = document.getElementById(decodeURIComponent(hash));
            } catch (exception) {
                // ignores the exception as the hash is not a valid percent
                // encoded value (eg: 100%) and so it's only used as it is
            }
        }

        // ignores the element targeted by the hash when it's a tab of a tab
        // panel (eg: #tab-prices), as the hash selects the tab (as a click
        // in its selector does) instead of being a place of the page
        var isTab = target ? jQuery(target).is(".tab-panel .tab") : false;
        target = isTab ? null : target;

        // scrolls to the element targeted by the hash, below the top bar
        // (by the scroll padding of the document), or else to the top of
        // the page when there's no hash, no element with its identifier or
        // when it's a tab
        if (target) {
            target.scrollIntoView();
        } else {
            var _window = jQuery(window);
            _window.scrollTop(0);
        }

        // scrolls again to the element once the stylesheets that are still
        // loading (eg: the one of a new section, added by the update of the
        // resources) are loaded, as they may change its position, as the
        // browser waits for them on the complete loading of a page, unless
        // the page has been left meanwhile (eg: a link within the page)
        var links = jQuery("link[rel=\"stylesheet\"]").filter(function() {
            return !this.sheet;
        });
        target && links.one("load", function() {
            if (document.location.href !== href) {
                return;
            }
            target.scrollIntoView();
        });
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
        updateSidebarOpen(base);
        updateOverlaySearch(base);
        updateNotifications(base);
        updateChat(base);
        updateDebug(base);
        runGarbage(base);
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
        runGarbage(base);
    };

    var updateBody = function(body) {
        var _body = jQuery("body");
        var bodyClass = body.attr("class");
        var bodyStyle = body.attr("style") || "";
        var isVisible = body.is(":visible");
        bodyStyle += isVisible ? "" : "display:none;";
        _body.attr("class", bodyClass);
        _body.attr("style", bodyStyle);
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
        var isDifferent = sectionValue !== sectionValue_;
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
        menu_.uxmenu();
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
        var isShortcuts = content.hasClass("shortcuts");
        contentHtml = contentHtml.replace(/aux-src=/ig, "src=");
        content_.html(contentHtml);
        content_.attr("class", contentClass);
        content_.uxapply();
        isShortcuts && content_.uxshortcuts();
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
        if (placeholder.length === 0) {
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

        if (sidebarRight_.length === 0) {
            var content_ = jQuery(".content");
            content_.after(sidebarRight);
        }

        var sidebarRightHtml = sidebarRight.html() || "";
        sidebarRightHtml = sidebarRightHtml.replace(/aux-src=/ig, "src=");
        sidebarRight_.html(sidebarRightHtml);
        sidebarRight_.uxapply();
    };

    var updateSidebarOpen = function(base) {
        var sidebarOpen = jQuery(".sidebar-open", base);
        var sidebarOpen_ = jQuery(".sidebar-open");
        if (sidebarOpen.length === 0 || sidebarOpen_.length === 0) {
            return;
        }
        var sidebarOpenHtml = sidebarOpen.html();
        sidebarOpenHtml = sidebarOpenHtml.replace(/aux-src=/ig, "src=");
        sidebarOpen_.html(sidebarOpenHtml);
        sidebarOpen_.uxapply();
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
                parent.length === 0 && sideLeft.append(chat_);
            } else {
                var parent = chat_.parent(".chat-parent")
                parent.length === 0 && chatParent.append(chat_);
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

    var updateDebug = function(base) {
        // retrieves the debug bar of the target page and the current one, as
        // well as the values of the session rendered in each of them (eg: the
        // user, the module and the locale of the page)
        var debugBar = base.filter(".debug-bar");
        var debugBar_ = jQuery(".debug-bar");
        var session = jQuery(".debug-bar-session", debugBar);
        var session_ = jQuery(".debug-bar-session", debugBar_);
        var sessionHtml = session.html();
        var sessionHtml_ = session_.html();

        // verifies if the debug bar of the target page is different from the
        // current one (in its existence or in its values of the session) and
        // in case it's not returns immediately, keeping the state of its tools
        // (eg: the text of a filter), as there's nothing to be done
        var isDifferent = debugBar.length !== debugBar_.length || sessionHtml !== sessionHtml_;
        if (!isDifferent) {
            return;
        }

        // replaces the current debug bar (if any) with the one of the target
        // page, placed after the footer as rendered by the server, and builds
        // it again, its state being kept in the storage of the browser
        var footer_ = jQuery(".footer");
        debugBar_.remove();
        footer_.after(debugBar);
        debugBar.udebug();
    };

    var runGarbage = function(base) {
        var gcElements = jQuery(".gc");
        gcElements.each(function(index, element) {
            var _element = jQuery(this);
            _element.triggerHandler("collect");
        });
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
        parent.length === 0 && parentTarget.append(chat);

        // in case there's a chat structure already displayed
        // in the current view must remove the chat part from
        // the content so that it does not get duplicated
        if (chat.length > 0) {
            var _chat = jQuery(".chat", content);
            _chat.remove();
        }
    };

    var trackConversion = function() {
        var meta = jQuery(".meta");
        var conversionId = jQuery("[name=adwords-conversion-id]", meta);
        var itemId = jQuery("[name=adwords-dynx-itemid]", meta);
        var totalValue = jQuery("[name=adwords-dynx-totalvalue]", meta);
        var pageType = jQuery("[name=adwords-dynx-pagetype]", meta);
        if (!window.google_trackConversion) {
            return;
        }
        if (!conversionId || conversionId.length === 0) {
            return;
        }
        conversionId = parseInt(conversionId.attr("content"));
        if (!conversionId) {
            return;
        }
        totalValue = parseFloat(totalValue.attr("content"));
        pageType = pageType.attr("content");
        var itemIdList = [];
        itemId.each(function(index, element) {
            var _element = jQuery(this);
            var elementId = _element.text();
            itemIdList.push(elementId);
        });
        google_trackConversion({
            google_conversion_id: conversionId,
            google_custom_params: {
                dynx_itemid: itemIdList,
                dynx_totalvalue: totalValue,
                dynx_pagetype: pageType
            },
            google_remarketing_only: true
        });
    };
})(jQuery);

(function(jQuery) {
    jQuery.uchecksum = function(buffer, modulus, salt) {
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

        // retrieves the (global) settings of the colony print as text, as
        // they are used as raw values (eg: in the URL and in the headers of
        // the print jobs) and the HTML of an element escapes its characters
        var colonyPrintUrl = jQuery("#colony-print-url", matchedObject).text();
        var colonyPrintKey = jQuery("#colony-print-key", matchedObject).text();
        var colonyPrintNode = jQuery("#colony-print-node", matchedObject).text();
        var colonyPrintPrinter = jQuery("#colony-print-printer", matchedObject).text();
        var colonyPrintLabelNode = jQuery("#colony-print-label-node", matchedObject).text();
        var colonyPrintLabelPrinter = jQuery("#colony-print-label-printer", matchedObject).text();

        // retrieves the (global) setting that silences the notifications as
        // text, as the other settings, to build the sounds of the notifications
        var notificationSilent = jQuery("#notification-silent", matchedObject).text();

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
                if (result === null || result === undefined) {
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

        // builds the map of the sounds of the notifications, by their type,
        // from the URLs of the sounds in the meta (as text, an empty one in
        // case the page has no such element, playing no sound), empty in
        // case the notifications are silent
        var notificationSounds = {};
        if (notificationSilent !== "1") {
            notificationSounds = {
                error: jQuery("#notification-sound-error", matchedObject).text(),
                warning: jQuery("#notification-sound-warning", matchedObject).text(),
                success: jQuery("#notification-sound-success", matchedObject).text(),
                information: jQuery("#notification-sound-information", matchedObject).text()
            };
        }

        // updates the various (configuration) references in the
        // element to be used for reference latter
        matchedObject.data("base_path", basePath);
        matchedObject.data("mvc_path", mvcPath);
        matchedObject.data("locale", locale);
        matchedObject.data("object_id", objectId);
        matchedObject.data("username", username);
        matchedObject.data("representation", representation);
        matchedObject.data("colony_print_url", colonyPrintUrl);
        matchedObject.data("colony_print_key", colonyPrintKey);
        matchedObject.data("colony_print_node", colonyPrintNode);
        matchedObject.data("colony_print_printer", colonyPrintPrinter);
        matchedObject.data("colony_print_label_node", colonyPrintLabelNode);
        matchedObject.data("colony_print_label_printer", colonyPrintLabelPrinter);
        matchedObject.data("notification_sounds", notificationSounds);
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

(function(jQuery) {
    jQuery.uquery = function(param) {
        // retrieves the reference to the body element and uses
        // it to retrieve the currently set mvc path in case it's
        // not found raises an exception (not possible to run query)
        // note that an empty mvc path is valid (top level pages)
        var _body = jQuery("body");
        var mvcPath = _body.data("mvc_path");
        if (mvcPath === null || mvcPath === undefined) {
            throw jQuery.uxexception("No mvc path variable defined");
        }
        var alias = _body.data("alias") || {};

        // unpacks the various elements of the provided parameters
        // map, these are the elements to be used in the remote query
        var type = param["type"] || "get";
        var url = param["url"];
        var data = param["data"];
        var processData = param["processData"];
        var contentType = param["contentType"];
        var complete = param["complete"];
        var success = param["success"];
        var error = param["error"];

        // splits the url into the section and the remainder components
        // to be used for the section and alias construction
        var urlSplit = url.split("/");
        var section = urlSplit[0];
        var remainder = urlSplit.slice(1);

        // creates the section url from the alias and rejoins the values
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
            var value = filter.length === 3 ? String(filter[2]) : String(filter[1]);
            var operation = filter.length === 3 ? filter[1] : "equals";

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
            processData: processData,
            contentType: contentType,
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

        /**
         * The regular expression that matches the QR codes printed in the
         * documents according to the AT rules, starting with their mandatory
         * fields in order, from the tax number of the issuer (A) to the ATCUD
         * of the document (H).
         */
        var QR_CODE_REGEX = /^A:[^*]*\*B:[^*]*\*C:[^*]*\*D:[^*]*\*E:[^*]*\*F:[^*]*\*G:[^*]*\*H:/;

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

        // retrieves the logger of the plugin, to be used to
        // log the steps of the resolution of the scans
        var logger = jQuery.uxlogger("uscan");

        // registers for the scan event in the document
        // to be able to react to it
        _document.bind("scan", function(event, value, alternative) {
            // logs the detection of the scan so that the resolution
            // process of it may be followed in the console
            logger.info("Scan detected:", value);

            // retrieves the current timestamp as the identifier of the scan
            // (assumes uniqueness) and sets it as the current one in the body
            // so that a pending lookup of a previous scan is not scanned
            var identifier = new Date().getTime();
            _body.data("current", identifier);

            // retrieves the current element that is the
            // target of the scan operation
            var element = jQuery(this);

            // retrieves the mvc path and the class id url
            // map for the current page
            var mvcPath = _body.data("mvc_path");
            var classIdUrl = _body.data("class_id_url");

            // in case the scanned value is not a QR code but its alternative is
            // (eg: the scanner has the keyboard layout of the system instead of
            // the US one) the alternative value is the one used as the QR code
            if (!QR_CODE_REGEX.test(value) && alternative && QR_CODE_REGEX.test(alternative)) {
                logger.info("Scan with alternative QR code:", alternative);
                value = alternative;
            }

            // verifies if the scanned value is the QR code of a document, in
            // which case the barcode of the document is retrieved and scanned
            // instead, so that the QR code behaves as the barcode
            if (QR_CODE_REGEX.test(value)) {
                // sets the uscan attribute in the event so that any
                // other handler ignores the QR code (handled as uscan)
                event.uscan = true;

                // runs the remote query that retrieves the barcode of the
                // document of the QR code and scans it, logging the miss
                // in case no document is represented by the QR code
                jQuery.uquery({
                    url: "omni_util/qr_code.json",
                    data: {
                        value: value
                    },
                    success: function(data) {
                        // retrieves the current identifier from the body and
                        // checks it against the closure based identifier in
                        // case it's not the same (a scan has come in between)
                        // the response is outdated and must be ignored
                        var current = _body.data("current");
                        if (current !== identifier) {
                            logger.info("Scan with outdated QR code:", value);
                            return;
                        }

                        var barcode = data["barcode"];
                        if (!barcode) {
                            logger.info("Scan with unknown QR code:", value);
                            return;
                        }
                        logger.info("Scan resolved into barcode:", barcode);
                        _document.trigger("scan", [barcode]);
                    },
                    error: function(xhr, status, error) {
                        logger.error("Scan with failed QR code lookup:", value, status, error);
                    }
                });

                // returns immediately as the barcode is going to be
                // scanned once it's retrieved (asynchronous operation)
                return;
            }

            // verifies that the size of the code legnth
            // is of the expected size, otherwise the value is
            // not an expected code and may be the code of a
            // merchandise (eg: its EAN) to be resolved
            if (value.length !== SCAN_CODE_LENGTH) {
                logger.info("Scan with unexpected length:", value.length);

                // schedules a delayed operation so that the code is only
                // resolved after the other handlers of the scan, in case
                // none of them has handled it (eg: the pos adding the
                // merchandise to the sale)
                setTimeout(function() {
                    // in case the uscan attribute has been set in the event
                    // meanwhile the scan has been handled by another handler
                    // and so the code must not be resolved
                    if (event.uscan) {
                        return;
                    }

                    // runs the remote query that retrieves the barcode of the
                    // merchandise of the code and scans it, logging the miss
                    // in case no merchandise is represented by the code
                    jQuery.uquery({
                        url: "omni_util/merchandise_code.json",
                        data: {
                            value: value
                        },
                        success: function(data) {
                            // retrieves the current identifier from the body and
                            // checks it against the closure based identifier in
                            // case it's not the same (a scan has come in between)
                            // the response is outdated and must be ignored
                            var current = _body.data("current");
                            if (current !== identifier) {
                                logger.info("Scan with outdated code:", value);
                                return;
                            }

                            var barcode = data["barcode"];
                            if (!barcode) {
                                logger.info("Scan with unknown code:", value);
                                return;
                            }
                            logger.info("Scan resolved into barcode:", barcode);
                            _document.trigger("scan", [barcode]);
                        },
                        error: function(xhr, status, error) {
                            logger.error("Scan with failed code lookup:", value, status, error);
                        }
                    });
                });

                // returns immediately as the barcode is going to be
                // scanned once it's retrieved (asynchronous operation)
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
            var _checksumS = jQuery.uchecksum(buffer);
            if (_checksumS !== checksumS) {
                logger.warn("Scan with invalid checksum:", checksumS);
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
                logger.warn("Scan with invalid version:", version);
                return;
            }
            // converts the class identifier into an integer
            // to be used in the resolution and verifies that
            // the "generated" integer is valid
            var classIdInt = parseInt(classId);
            if (isNaN(classIdInt)) {
                logger.warn("Scan with invalid class id:", classId);
                return;
            }

            // converts the object identifier into an integer
            // to be used in the resolution and verifies that
            // the "generated" integer is valid
            var objectIdInt = parseInt(objectId);
            if (isNaN(objectId)) {
                logger.warn("Scan with invalid object id:", objectId);
                return;
            }

            // verifies if the current integer version of the
            // provided scan value is compatible with the current
            // scan version (version is included in compatible
            // version set) in case it's not returns immediately
            var isCompatible = COMPATIBLE_VERSIONS.indexOf(versionInt) !== -1;
            if (!isCompatible) {
                logger.warn("Scan with incompatible version:", versionInt);
                return;
            }

            // tries to retrieve the "partial" class url for
            // the class with the provided identifier in case
            // it's not found returns immediately in error
            var classUrl = classIdUrl[classIdInt];
            if (!classUrl) {
                logger.warn("Scan with no class url:", classIdInt);
                return;
            }

            // logs the resolution of the scan into its version, class
            // and object identifiers (before the uscan handling)
            logger.info("Scan resolved:", versionInt, classIdInt, objectIdInt);

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
                // immediately as the redirections are meant to
                // be avoided (exception semantics)
                logger.info("Scan redirection avoided:", classIdInt);
                return;
            }

            // constructs the url using the base mvc path and
            // appending the url to the requested class
            var baseUrl = mvcPath + classUrl;

            // replaces the left padded zeros in the object
            // id to construct the final object id, then uses
            // it to redirect the user agent to the show page
            objectId = objectId.replace(/^0+|\s+$/g, "");
            logger.info("Scan redirecting to:", baseUrl + objectId);
            jQuery.uxlocation(baseUrl + objectId);
        });

        // registers for the scan error event in the document
        // to be able to react to it
        _document.bind("scan_error", function(event, value) {
            // logs the scan error with only the length of the value
            // as it may contain keys typed by the user
            logger.debug("Scan error with length:", value.length);
        });
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
                if (dataJ === null || dataJ === undefined) {
                    return;
                }

                // unpacks the various values from the json parsed data and
                // then localizes the message to the target value
                var message = dataJ["message"];
                var arguments = dataJ["arguments"];
                var meta = dataJ["meta"];
                message = jQuery.uxlocale(message);

                // retrieves the target as the first element of the meta attributes
                // and then unpacks it as the CID (class ID) and the object id of
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
        "payment_method:bank_transfer": "Bank Transfer",
        "payment_method:cash": "Cash",
        "payment_method:card": "Card",
        "payment_method:check": "Check",
        "payment_method:credit_note": "Credit Note",
        "payment_method:custom": "Other",
        "payment_method:easypay": "Easypay",
        "payment_method:paypal": "Paypal",
        "physical_signature:signed": "Signed",
        "physical_signature:not_signed": "Not Signed",
        "physical_signature:unknown": "Unknown",
        "time:just_now": "Just now",
        "Signing in to chat server": "Signing in to chat server",
        "You've been disconnected": "You've been disconnected",
        "mae": "me",
        "retrying ...": "retrying ...",
        "says ...": "says ...",
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
        "canceled {{%s}}": "canceled {{%s}}",
        "Logs": "Logs",
        "Notifications": "Notifications",
        "Scan": "Scan",
        "Session": "Session",
        "Theme": "Theme",
        "Close": "Close",
        "Omni Light": "Omni Light",
        "Graphite": "Graphite",
        "Midnight": "Midnight",
        "Amber Terminal": "Amber Terminal",
        "Frontdoor": "Frontdoor",
        "Aubergine": "Aubergine",
        "Level": "Level",
        "Debug": "Debug",
        "Info": "Info",
        "Warning": "Warning",
        "Error": "Error",
        "Plugin": "Plugin",
        "All plugins": "All plugins",
        "Clear": "Clear",
        "No records": "No records",
        "%s of %s records, newest first": "%s of %s records, newest first",
        "Kind": "Kind",
        "Success": "Success",
        "Information": "Information",
        "Small": "Small",
        "At the top center": "At the top center",
        "As a panel notification (Pushi)": "As a panel notification (Pushi)",
        "Title": "Title",
        "Message": "Message",
        "Dismiss all": "Dismiss all",
        "Show notification": "Show notification",
        "Product not found": "Product not found",
        "No product with the code 5609999999999": "No product with the code 5609999999999",
        "Store without product": "Store without product",
        "Scan a product before the tag of a store": "Scan a product before the tag of a store",
        "Sale closed": "Sale closed",
        "Receipt issued": "Receipt issued",
        "Notification": "Notification",
        "This is a test notification": "This is a test notification",
        "From this instance": "From this instance",
        "Loading": "Loading",
        "No presets on this instance": "No presets on this instance",
        "EAN": "EAN",
        "Barcode": "Barcode",
        "QR": "QR",
        "Store tag": "Store tag",
        "Unknown": "Unknown",
        "Omni code": "Omni code",
        "Entity, eg: Product": "Entity, eg: Product",
        "No entity found": "No entity found",
        "Object id": "Object id",
        "object": "object",
        "Checksum": "Checksum",
        "Version": "Version",
        "Pick an entity": "Pick an entity",
        "The object id is a number of up to 12 digits": "The object id is a number of up to 12 digits",
        "Type scan": "Type scan",
        "Any code": "Any code",
        "eg: 5601234567892": "eg: 5601234567892",
        "Recent": "Recent",
        "Typed %s (%s keys in %s ms)": "Typed %s (%s keys in %s ms)",
        "User": "User",
        "Environment": "Environment",
        "Run mode": "Run mode",
        "Module": "Module",
        "Log level": "Log level",
        "Silent notifications": "Silent notifications",
        "Yes": "Yes",
        "No": "No",
        "Print": "Print",
        "Pushi": "Pushi",
        "Errors": "Errors",
        "Storage": "Storage",
        "Page": "Page",
        "Settings": "Settings",
        "Permissions": "Permissions",
        "Open the debug bar": "Open the debug bar",
        "Drag to resize, double click to reset": "Drag to resize, double click to reset",
        "Edge cases": "Edge cases",
        "Bad checksum": "Bad checksum",
        "Wrong version": "Wrong version",
        "Unknown CID": "Unknown CID",
        "Too short": "Too short",
        "Too slow": "Too slow",
        "Typed the edge case %s: %s (%s keys in %s ms)": "Typed the edge case %s: %s (%s keys in %s ms)",
        "Gateway of this page": "Gateway of this page",
        "Test": "Test",
        "Gateway": "Gateway",
        "Browser plugin": "Browser plugin",
        "Base URL": "Base URL",
        "Key": "Key",
        "Node": "Node",
        "Printer": "Printer",
        "Label node": "Label node",
        "Label printer": "Label printer",
        "Fallback": "Fallback",
        "this browser": "this browser",
        "settings": "settings",
        "Print a test receipt": "Print a test receipt",
        "Print a test label": "Print a test label",
        "The tests print a document of this instance through uxgprint, with the gateway above, as the documents of the pages do": "The tests print a document of this instance through uxgprint, with the gateway above, as the documents of the pages do",
        "Sent %s to %s (%s)": "Sent %s to %s (%s)",
        "the default printer": "the default printer",
        "Sent %s to the browser plugin": "Sent %s to the browser plugin",
        "No gateway, opened the fallback of %s": "No gateway, opened the fallback of %s",
        "No gateway nor fallback, %s was not printed": "No gateway nor fallback, %s was not printed",
        "No documents to print on this instance": "No documents to print on this instance",
        "Connection": "Connection",
        "Channels": "Channels",
        "Send a test notification": "Send a test notification",
        "Reconnect": "Reconnect",
        "The test is sent by the server (as the test of the local services) and comes back through the socket to the notifications panel": "The test is sent by the server (as the test of the local services) and comes back through the socket to the notifications panel",
        "State": "State",
        "Not available": "Not available",
        "Connected": "Connected",
        "Disconnected": "Disconnected",
        "Server": "Server",
        "App key": "App key",
        "Socket": "Socket",
        "No channel subscribed": "No channel subscribed",
        "Requesting the test notification": "Requesting the test notification",
        "Test notification requested, it comes back through the socket": "Test notification requested, it comes back through the socket",
        "The test notification failed (%s)": "The test notification failed (%s)",
        "Reconnecting": "Reconnecting",
        "Reconnected": "Reconnected",
        "Last error": "Last error",
        "Each error is raised as a real one would be, so that the error notifications, the logs and the reporting of the errors are tested end to end": "Each error is raised as a real one would be, so that the error notifications, the logs and the reporting of the errors are tested end to end",
        "Throw a JavaScript error": "Throw a JavaScript error",
        "An error of a handler, caught by the window": "An error of a handler, caught by the window",
        "Reject a promise": "Reject a promise",
        "A rejection that nothing handles": "A rejection that nothing handles",
        "Fail an async link": "Fail an async link",
        "The asynchronous navigation to a missing page, then loaded": "The asynchronous navigation to a missing page, then loaded",
        "Request a server error": "Request a server error",
        "A request answered with an error 500": "A request answered with an error 500",
        "Server error": "Server error",
        "There was an error processing the request (%s)": "There was an error processing the request (%s)",
        "None": "None",
        "None in this page": "None in this page",
        "Clear Omni keys": "Clear Omni keys",
        "Clear all": "Clear all",
        "Remove the %s keys of Omni from the local storage of this browser?": "Remove the %s keys of Omni from the local storage of this browser?",
        "Remove the %s keys of Omni and uxf from the local storage of this browser?": "Remove the %s keys of Omni and uxf from the local storage of this browser?",
        "The preferences kept by the pages in this browser are lost.": "The preferences kept by the pages in this browser are lost.",
        "Remove the key": "Remove the key",
        "No keys of Omni or uxf in this browser": "No keys of Omni or uxf in this browser",
        "%s keys of Omni and uxf in the local storage of this browser": "%s keys of Omni and uxf in the local storage of this browser",
        "Body classes": "Body classes",
        "Force the classes of a phone (mobile-s, touch)": "Force the classes of a phone (mobile-s, touch)",
        "Timings": "Timings",
        "Route": "Route",
        "Base path": "Base path",
        "MVC path": "MVC path",
        "Section": "Section",
        "Last navigation": "Last navigation",
        "%s, %s ms (%s)": "%s, %s ms (%s)",
        "None, loaded in full": "None, loaded in full",
        "No classes": "No classes",
        "DOM ready": "DOM ready",
        "Load": "Load",
        "Requests": "Requests",
        "%s, %s KB": "%s, %s KB",
        "Filter": "Filter",
        "Name or key": "Name or key",
        "Text, /regular expression/ or -text to exclude": "Text, /regular expression/ or -text to exclude",
        "The flags read by the pages apply at the next login, as the session keeps them": "The flags read by the pages apply at the next login, as the session keeps them",
        "Name": "Name",
        "Value": "Value",
        "Source": "Source",
        "Applies": "Applies",
        "Enabled": "Enabled",
        "Disabled": "Disabled",
        "Not set or hidden": "Not set or hidden",
        "%s in this session, until the next login": "%s in this session, until the next login",
        "No settings match the filter": "No settings match the filter",
        "Setting": "Setting",
        "Default": "Default",
        "Now": "Now",
        "Next login": "Next login",
        "Fiscal year": "Fiscal year",
        "User type": "User type",
        "Company": "Company",
        "Filter, eg: sale": "Filter, eg: sale",
        "Check a permission": "Check a permission",
        "eg: sale_transaction.show": "eg: sale_transaction.show",
        "Check": "Check",
        "Answers why a user sees (or doesn't see) a page or an action: the key of its permission and the decision for the user type": "Answers why a user sees (or doesn't see) a page or an action: the key of its permission and the decision for the user type",
        "%s permissions": "%s permissions",
        "No permissions match the filter": "No permissions match the filter",
        "Allow": "Allow",
        "Validate": "Validate",
        "Deny": "Deny",
        "%s of %s permissions": "%s of %s permissions",
        "Permission": "Permission",
        "Branch": "Branch",
        "%s keys": "%s keys",
        "Open a segment to see its keys": "Open a segment to see its keys",
        "A click in a key (or the enter key) checks it here, and the arrows of the keyboard move in the columns": "A click in a key (or the enter key) checks it here, and the arrows of the keyboard move in the columns",
        "Type the key of a permission": "Type the key of a permission",
        "%s is allowed for the user type %s": "%s is allowed for the user type %s",
        "%s is denied for the user type %s": "%s is denied for the user type %s",
        "The check of the permission failed (%s)": "The check of the permission failed (%s)",
        "Browser": "Browser",
        "Screen": "Screen",
        "Pixel density": "Pixel density",
        "Language": "Language",
        "Desktop": "Desktop",
        "Tablet": "Tablet",
        "Mobile": "Mobile"
    }

    jQuery.uxloadbundle(BUNDLE_EN_US, "en-us")
})(jQuery);

(function(jQuery) {
    var BUNDLE_PT_PT = {
        "payment_method:bank_transfer": "Transferência Bancária",
        "payment_method:cash": "Dinheiro",
        "payment_method:card": "Cartão",
        "payment_method:check": "Cheque",
        "payment_method:credit_note": "Nota de Crédito",
        "payment_method:custom": "Outro",
        "payment_method:easypay": "Easypay",
        "payment_method:paypal": "Paypal",
        "physical_signature:signed": "Assinado",
        "physical_signature:not_signed": "Não Assinado",
        "physical_signature:unknown": "Desconhecido",
        "time:just_now": "Agora mesmo",
        "Signing in to chat server": "Ligando a servidor de chat",
        "You've been disconnected": "Ligação a servidor perdida",
        "mae": "eu",
        "retrying ...": "tentando de novo ...",
        "says ...": "diz ...",
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
        "canceled {{%s}}": "cancelou {{%s}}",
        "Logs": "Registos",
        "Notifications": "Notificações",
        "Scan": "Leitura",
        "Session": "Sessão",
        "Theme": "Tema",
        "Close": "Fechar",
        "Omni Light": "Omni Claro",
        "Graphite": "Grafite",
        "Midnight": "Meia-noite",
        "Amber Terminal": "Terminal Âmbar",
        "Frontdoor": "Frontdoor",
        "Aubergine": "Beringela",
        "Level": "Nível",
        "Debug": "Depuração",
        "Info": "Informação",
        "Warning": "Aviso",
        "Error": "Erro",
        "Plugin": "Plugin",
        "All plugins": "Todos os plugins",
        "Clear": "Limpar",
        "No records": "Sem registos",
        "%s of %s records, newest first": "%s de %s registos, os mais recentes primeiro",
        "Kind": "Tipo",
        "Success": "Sucesso",
        "Information": "Informação",
        "Small": "Pequena",
        "At the top center": "No topo ao centro",
        "As a panel notification (Pushi)": "Como notificação do painel (Pushi)",
        "Title": "Título",
        "Message": "Mensagem",
        "Dismiss all": "Fechar todas",
        "Show notification": "Mostrar notificação",
        "Product not found": "Produto não encontrado",
        "No product with the code 5609999999999": "Nenhum produto com o código 5609999999999",
        "Store without product": "Loja sem produto",
        "Scan a product before the tag of a store": "Leia um produto antes da etiqueta de uma loja",
        "Sale closed": "Venda fechada",
        "Receipt issued": "Recibo emitido",
        "Notification": "Notificação",
        "This is a test notification": "Esta é uma notificação de teste",
        "From this instance": "Desta instância",
        "Loading": "A carregar",
        "No presets on this instance": "Sem predefinições nesta instância",
        "EAN": "EAN",
        "Barcode": "Código de barras",
        "QR": "QR",
        "Store tag": "Etiqueta de loja",
        "Unknown": "Desconhecido",
        "Omni code": "Código Omni",
        "Entity, eg: Product": "Entidade, ex: Produto",
        "No entity found": "Nenhuma entidade encontrada",
        "Object id": "Id do objeto",
        "object": "objeto",
        "Checksum": "Soma de controlo",
        "Version": "Versão",
        "Pick an entity": "Escolha uma entidade",
        "The object id is a number of up to 12 digits": "O id do objeto é um número até 12 dígitos",
        "Type scan": "Simular leitura",
        "Any code": "Qualquer código",
        "eg: 5601234567892": "ex: 5601234567892",
        "Recent": "Recentes",
        "Typed %s (%s keys in %s ms)": "Escrito %s (%s teclas em %s ms)",
        "User": "Utilizador",
        "Environment": "Ambiente",
        "Run mode": "Modo de execução",
        "Module": "Módulo",
        "Log level": "Nível dos registos",
        "Silent notifications": "Notificações silenciosas",
        "Yes": "Sim",
        "No": "Não",
        "Print": "Impressão",
        "Pushi": "Pushi",
        "Errors": "Erros",
        "Storage": "Armazenamento",
        "Page": "Página",
        "Settings": "Definições",
        "Permissions": "Permissões",
        "Open the debug bar": "Abrir a barra de depuração",
        "Drag to resize, double click to reset": "Arraste para redimensionar, duplo clique para repor",
        "Edge cases": "Casos limite",
        "Bad checksum": "Soma de controlo errada",
        "Wrong version": "Versão errada",
        "Unknown CID": "CID desconhecido",
        "Too short": "Demasiado curto",
        "Too slow": "Demasiado lento",
        "Typed the edge case %s: %s (%s keys in %s ms)": "Escrito o caso limite %s: %s (%s teclas em %s ms)",
        "Gateway of this page": "Gateway desta página",
        "Test": "Teste",
        "Gateway": "Gateway",
        "Browser plugin": "Plugin do browser",
        "Base URL": "URL base",
        "Key": "Chave",
        "Node": "Nó",
        "Printer": "Impressora",
        "Label node": "Nó das etiquetas",
        "Label printer": "Impressora das etiquetas",
        "Fallback": "Alternativa",
        "this browser": "este browser",
        "settings": "definições",
        "Print a test receipt": "Imprimir um recibo de teste",
        "Print a test label": "Imprimir uma etiqueta de teste",
        "The tests print a document of this instance through uxgprint, with the gateway above, as the documents of the pages do": "Os testes imprimem um documento desta instância através do uxgprint, com o gateway acima, como os documentos das páginas",
        "Sent %s to %s (%s)": "%s enviado para %s (%s)",
        "the default printer": "a impressora predefinida",
        "Sent %s to the browser plugin": "%s enviado para o plugin do browser",
        "No gateway, opened the fallback of %s": "Sem gateway, aberta a alternativa de %s",
        "No gateway nor fallback, %s was not printed": "Sem gateway nem alternativa, %s não foi impresso",
        "No documents to print on this instance": "Sem documentos para imprimir nesta instância",
        "Connection": "Ligação",
        "Channels": "Canais",
        "Send a test notification": "Enviar uma notificação de teste",
        "Reconnect": "Ligar novamente",
        "The test is sent by the server (as the test of the local services) and comes back through the socket to the notifications panel": "O teste é enviado pelo servidor (como o teste dos serviços locais) e volta pelo socket ao painel das notificações",
        "State": "Estado",
        "Not available": "Não disponível",
        "Connected": "Ligado",
        "Disconnected": "Desligado",
        "Server": "Servidor",
        "App key": "Chave da aplicação",
        "Socket": "Socket",
        "No channel subscribed": "Nenhum canal subscrito",
        "Requesting the test notification": "A pedir a notificação de teste",
        "Test notification requested, it comes back through the socket": "Notificação de teste pedida, volta pelo socket",
        "The test notification failed (%s)": "A notificação de teste falhou (%s)",
        "Reconnecting": "A ligar novamente",
        "Reconnected": "Ligado novamente",
        "Last error": "Último erro",
        "Each error is raised as a real one would be, so that the error notifications, the logs and the reporting of the errors are tested end to end": "Cada erro é lançado como um real o seria, para que as notificações de erro, os registos e o reporte dos erros sejam testados de ponta a ponta",
        "Throw a JavaScript error": "Lançar um erro de JavaScript",
        "An error of a handler, caught by the window": "Um erro de um handler, apanhado pela janela",
        "Reject a promise": "Rejeitar uma promise",
        "A rejection that nothing handles": "Uma rejeição que nada trata",
        "Fail an async link": "Falhar uma ligação assíncrona",
        "The asynchronous navigation to a missing page, then loaded": "A navegação assíncrona para uma página inexistente, depois carregada",
        "Request a server error": "Pedir um erro do servidor",
        "A request answered with an error 500": "Um pedido respondido com um erro 500",
        "Server error": "Erro do servidor",
        "There was an error processing the request (%s)": "Ocorreu um erro ao processar o pedido (%s)",
        "None": "Nenhum",
        "None in this page": "Nenhum nesta página",
        "Clear Omni keys": "Limpar as chaves do Omni",
        "Clear all": "Limpar tudo",
        "Remove the %s keys of Omni from the local storage of this browser?": "Remover as %s chaves do Omni do armazenamento local deste navegador?",
        "Remove the %s keys of Omni and uxf from the local storage of this browser?": "Remover as %s chaves do Omni e do uxf do armazenamento local deste navegador?",
        "The preferences kept by the pages in this browser are lost.": "As preferências guardadas pelas páginas neste navegador são perdidas.",
        "Remove the key": "Remover a chave",
        "No keys of Omni or uxf in this browser": "Sem chaves do Omni ou do uxf neste browser",
        "%s keys of Omni and uxf in the local storage of this browser": "%s chaves do Omni e do uxf no armazenamento local deste browser",
        "Body classes": "Classes do body",
        "Force the classes of a phone (mobile-s, touch)": "Forçar as classes de um telemóvel (mobile-s, touch)",
        "Timings": "Tempos",
        "Route": "Rota",
        "Base path": "Caminho base",
        "MVC path": "Caminho MVC",
        "Section": "Secção",
        "Last navigation": "Última navegação",
        "%s, %s ms (%s)": "%s, %s ms (%s)",
        "None, loaded in full": "Nenhuma, carregada por completo",
        "No classes": "Sem classes",
        "DOM ready": "DOM pronto",
        "Load": "Carregamento",
        "Requests": "Pedidos",
        "%s, %s KB": "%s, %s KB",
        "Filter": "Filtro",
        "Name or key": "Nome ou chave",
        "Text, /regular expression/ or -text to exclude": "Texto, /expressão regular/ ou -texto a excluir",
        "The flags read by the pages apply at the next login, as the session keeps them": "As flags lidas pelas páginas aplicam-se no próximo login, porque a sessão as guarda",
        "Name": "Nome",
        "Value": "Valor",
        "Source": "Origem",
        "Applies": "Aplica-se",
        "Enabled": "Ativa",
        "Disabled": "Inativa",
        "Not set or hidden": "Não definido ou oculto",
        "%s in this session, until the next login": "%s nesta sessão, até ao próximo login",
        "No settings match the filter": "Nenhuma definição corresponde ao filtro",
        "Setting": "Definição",
        "Default": "Predefinição",
        "Now": "Agora",
        "Next login": "Próximo login",
        "Fiscal year": "Ano fiscal",
        "User type": "Tipo de utilizador",
        "Company": "Empresa",
        "Filter, eg: sale": "Filtro, ex: sale",
        "Check a permission": "Verificar uma permissão",
        "eg: sale_transaction.show": "ex: sale_transaction.show",
        "Check": "Verificar",
        "Answers why a user sees (or doesn't see) a page or an action: the key of its permission and the decision for the user type": "Responde porque um utilizador vê (ou não vê) uma página ou uma ação: a chave da sua permissão e a decisão para o tipo de utilizador",
        "%s permissions": "%s permissões",
        "No permissions match the filter": "Nenhuma permissão corresponde ao filtro",
        "Allow": "Permitir",
        "Validate": "Validar",
        "Deny": "Negar",
        "%s of %s permissions": "%s de %s permissões",
        "Permission": "Permissão",
        "Branch": "Ramo",
        "%s keys": "%s chaves",
        "Open a segment to see its keys": "Abra um segmento para ver as suas chaves",
        "A click in a key (or the enter key) checks it here, and the arrows of the keyboard move in the columns": "Um clique numa chave (ou a tecla enter) verifica-a aqui, e as setas do teclado movem-se nas colunas",
        "Type the key of a permission": "Escreva a chave de uma permissão",
        "%s is allowed for the user type %s": "%s é permitida para o tipo de utilizador %s",
        "%s is denied for the user type %s": "%s é negada para o tipo de utilizador %s",
        "The check of the permission failed (%s)": "A verificação da permissão falhou (%s)",
        "Browser": "Browser",
        "Screen": "Ecrã",
        "Pixel density": "Densidade de píxeis",
        "Language": "Idioma",
        "Desktop": "Computador",
        "Tablet": "Tablet",
        "Mobile": "Telemóvel"
    }

    jQuery.uxloadbundle(BUNDLE_PT_PT, "pt-pt")
})(jQuery);

(function(jQuery) {
    jQuery.fn.uchat = function(options) {
        // sets the jquery matched object and validates
        // that the current size of it is valid otherwise
        // returns immediately to avoid extra computation
        var matchedObject = this;
        if (!matchedObject || matchedObject.length === 0) {
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
            // height (discounting the room left at the end
            // of the page by the debug bar) and the width
            var debugBar = jQuery(".debug-bar");
            var windowHeight = _window.height() - (debugBar.height() || 0);
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
                // visible window dimensions, keeping the top of the
                // panel (with its controls) inside the window
                var chatTop = Math.max(windowHeight - panelHeight + panelOffset, 0);
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
            var item = jQuery("<li class=\"budy-" + status + "\" data-user_id=\"" + username
                + "\" data-object_id=\"" + objectId + "\">" + representation + "</li>");

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
            var isString = typeof data === "string";
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
            var owner = sender === username ? receiver : sender

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
            if (panel.length === 0) {
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
            var myself = sender === username;
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
            if (username === _username) {
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
                    if (item.length === 0) {
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
            var absoluteUrl = jQuery.uxresolve(url + "/pushi.json");

            // retrieves the base url and the app key values to be
            // used for the establishment of the pushi connection,
            // then uses them as the various arguments in the construction
            // of the proxy object
            var url = _element.attr("data-base_url");
            var key = _element.attr("data-key");
            var pushi = new Pushi(key, {
                baseUrl: url,
                authEndpoint: absoluteUrl
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
                if (channel !== "presence-status") {
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
            element.append("<div class=\"disconnected\">" + disconnectedS + "<br /><b>" + retryingS
                + "</b></div>");
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
            if (username === _username) {
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

        // starts the variable that is going to store the handler of the
        // post async event of the body, so that its own handler is the one
        // unregistered once the chat is destroyed (and not the one of
        // another plugin, as the eureka registers one as well)
        var onPostAsync = null;

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
        chatPanel = jQuery("<div class=\"chat-panel empty budy-available\">" + "<div class=\"chat-header\">"
            + name + "<div class=\"chat-buttons\">" + "<div class=\"chat-button chat-settings\"></div>"
            + "<div class=\"chat-button chat-close\"></div>" + "</div>" + "</div>"
            + "<div class=\"chat-contents\"></div>" + "<div class=\"chat-message\">"
            + "<textarea type=\"text\" class=\"text-area\"></textarea>"
            + "<textarea type=\"text\" class=\"text-area hidden\"></textarea>" + "</div>" + "</div>");
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
                            name: struct.sender === username ? "me" : name,
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

            // retrieves the height of both the window (discounting
            // the room left at the end of the page by the debug bar)
            // and the panel and uses both values to calculate the top
            // position for the panel, keeping the top of the panel
            // (with its controls) inside the window
            var debugBar = jQuery(".debug-bar");
            var windowHeight = _window.height() - (debugBar.height() || 0);
            var panelHeight = element.outerHeight(true);
            var panelTop = Math.max(windowHeight - panelHeight + offset, 0);

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
                if (document.title === title) {
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
            var isSame = handlerT && handlerT === _handlerT;
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
            if (scroll !== 0) {
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
            if (keyValue !== 13) {
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
            if (message === "") {
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
            var changed = delta !== 0;
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
            var contentsBottom = contentsScroll + contentsHeight === contentsScrollHeight;

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
        var nameLocale = name === "me" ? jQuery.uxlocale(name) : name;

        // treats the message so that any newline character found
        // is replaces by the break line tag (html correspondent)
        message = message.replace("\n", "<br/>");

        // verifies that the type of message is not plain and if that's
        // the case runs the chat replacer so that certain keywords
        // are replaced with the proper image/graphical representation
        if (plain === false) {
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
        objectId = name === "me" ? _body.data("object_id") : objectId;
        var imageUrl = mvcPath + admSection + "/users/" + objectId + "/image?size=64";

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
            var isFirst = index === paragraphs.length - 1;
            var isInitial = isFirst && _timestamp < timestamp;

            // determines if this is the proper buble for which the
            // newline value should be added, for that a proper
            // verification on the name of the paragraph, string
            // data of it and the timestamp of the next (up paragraph)
            // is going to be performed and verified
            var isBuble = _name === name && _dateS === dateS && _reference < timestamp;

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
        if (name !== _name || dateS !== _dateS) {
            // sets the initial reference value as the selected (previous)
            // paragraph and verifies if this is a top (header) paragraph
            // that should be inserted at the the initial part of the contents
            var reference = paragraph;
            var isTop = reference === null || reference === undefined;

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
            paragraph = jQuery("<div class=\"chat-paragraph\">" + "<div class=\"chat-name\">" + nameLocale
                + "</div>" + "<div class=\"chat-time\">" + timeString + "</div>" + "</div>");
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
            if (counter !== _counter) {
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
            extras += "<a href=\"" + result + "\" target=\"_blank\">" + "<img src=\"" + result + "\"/>"
                + "</a>";
            return result === message ? "" : message;
        };

        var youtube = function(message) {
            var result = message.match(YOUTUBE_REGEX);
            if (!result) {
                return message;
            }
            result = result[0];
            var parsed = parse(result);
            var youtubeId = parsed["v"];
            extras += "<iframe height=\"200\"" + " src=\"//www.youtube.com/embed/" + youtubeId
                + "?controls=0\"" + " frameborder=\"0\"></iframe>";
            return result === message ? "" : message;
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
    jQuery.fn.udebug = function(options) {
        /**
         * The levels of the logs that may be selected in the bar, from the
         * most verbose to the least verbose one, as named by the logger.
         */
        var LEVELS = ["debug", "info", "warning", "error"];

        /**
         * The themes of the bar, by their names, the first one being the
         * default one (the one that follows the style of the pages).
         */
        var THEMES = ["light", "graphite", "midnight", "amber", "frontdoor", "aubergine"];

        /**
         * The names of the themes of the bar, in the order of the themes,
         * to be localized when shown in the theme select.
         */
        var THEME_NAMES = ["Omni Light", "Graphite", "Midnight", "Amber Terminal", "Frontdoor",
            "Aubergine"];

        /**
         * The maximum number of records of the logs kept in memory, the
         * oldest ones being dropped once the limit is reached.
         */
        var MAXIMUM_RECORDS = 500;

        /**
         * The maximum number of recent codes typed by the scan tool that are
         * kept in the local storage, the oldest ones being dropped.
         */
        var MAXIMUM_RECENT = 6;

        /**
         * The maximum number of the classes of the entities that are listed
         * while searching an entity by its name in the scan tool.
         */
        var MAXIMUM_ENTITIES = 5;

        /**
         * The class identifier of the system users, the one of the entity and
         * of the author of the panel notifications, as the test notification
         * of the local services.
         */
        var USER_CID = 34;

        /**
         * The kinds of the notifications shown by the notifications tool,
         * each one with its label and the title and message of its example.
         */
        var KINDS = [{
            name: "error",
            label: "Error",
            title: "Product not found",
            message: "No product with the code 5609999999999"
        }, {
            name: "warning",
            label: "Warning",
            title: "Store without product",
            message: "Scan a product before the tag of a store"
        }, {
            name: "success",
            label: "Success",
            title: "Sale closed",
            message: "Receipt issued"
        }, {
            name: "information",
            label: "Information",
            title: "Notification",
            message: "This is a test notification"
        }];

        /**
         * The labels of the kinds of the presets of the scan tool, by the
         * kinds retrieved from the server.
         */
        var PRESET_KINDS = {
            ean: "EAN",
            barcode: "Barcode",
            qr: "QR",
            store: "Store tag",
            unknown: "Unknown"
        };

        /**
         * The labels of the values of the session rendered in the bar, by
         * their names, the other ones being shown by their names.
         */
        var SESSION_LABELS = {
            user: "User",
            user_type: "User type",
            company: "Company",
            version: "Version",
            environment: "Environment",
            run_mode: "Run mode",
            module: "Module",
            locale: "Language"
        };

        /**
         * The keys of the symbols that may be typed by the scan tool, in the
         * US keyboard layout (the physical code, the key code and the shift
         * state), the other characters being typed by their values.
         */
        var SYMBOLS = {
            " ": ["Space", 32, false],
            "-": ["Minus", 189, false],
            "_": ["Minus", 189, true],
            "=": ["Equal", 187, false],
            "+": ["Equal", 187, true],
            ".": ["Period", 190, false],
            ",": ["Comma", 188, false],
            "/": ["Slash", 191, false],
            ":": ["Semicolon", 186, true],
            "*": ["Digit8", 56, true],
            "$": ["Digit4", 52, true],
            "%": ["Digit5", 53, true]
        };

        /**
         * The interval (in milliseconds) between the keys of the scans typed
         * by the scan tool, as a barcode scanner types them.
         */
        var KEY_INTERVAL = 10;

        /**
         * The interval (in milliseconds) between the keys of the scans typed
         * slower than a scanner, over the maximum interval between the keys
         * of the scan detection (80 ms), so that they're not detected.
         */
        var SLOW_INTERVAL = 120;

        /**
         * The edge cases of the scans typed by the scan tool, each one with
         * its label and either a fixed code or the parts of an omni code (the
         * version, the class identifier, the object identifier and a fixed
         * checksum replacing the valid one), and the interval of its keys.
         */
        var EDGE_CASES = [{
            name: "checksum",
            label: "Bad checksum",
            version: "01",
            cid: 14,
            object: 477,
            checksum: "9999"
        }, {
            name: "version",
            label: "Wrong version",
            version: "02",
            cid: 14,
            object: 477
        }, {
            name: "cid",
            label: "Unknown CID",
            version: "01",
            cid: 9999,
            object: 1
        }, {
            name: "short",
            label: "Too short",
            code: "1234"
        }, {
            name: "slow",
            label: "Too slow",
            code: "5601234567892",
            interval: SLOW_INTERVAL
        }];

        /**
         * The labels of the sources of the flags and of the settings of the
         * instance, by the sources retrieved from the server.
         */
        var SOURCES = {
            "setting": "Setting",
            "environment": "Environment",
            "default": "Default"
        };

        /**
         * The labels of the moments when the flags of the instance apply, by
         * the moments retrieved from the server.
         */
        var APPLIES = {
            now: "Now",
            login: "Next login",
            fiscal_year: "Fiscal year"
        };

        /**
         * The names of the values of the permissions of the session (allow,
         * validate and deny), by their values, used as the classes of the
         * permissions and, capitalized, as their labels.
         */
        var PERMISSION_VALUES = {
            10: "allow",
            20: "validate",
            30: "deny"
        };

        /**
         * The classes of the body of a phone (as set by the plugins of the
         * user agent and of the size of the window), the ones set when the
         * page tool forces the classes of a phone.
         */
        var PHONE_CLASSES = ["mobile", "device", "touch", "mobile-s"];

        /**
         * The classes of the body of the other devices (desktop and tablet),
         * removed when the page tool forces the classes of a phone.
         */
        var DEVICE_CLASSES = ["desktop", "tablet", "mouse", "desktop-s", "tablet-s"];

        /**
         * The default height of the dock of the bar, in pixels, the one used
         * until it's resized (and once it's reset by a double click).
         */
        var HEIGHT = 300;

        /**
         * The minimum height of the dock of the bar, in pixels, so that its
         * header and part of the panel of its tool are always shown.
         */
        var MINIMUM_HEIGHT = 160;

        /**
         * The maximum height of the dock of the bar, as a ratio of the height
         * of the window, so that part of the page is always shown.
         */
        var MAXIMUM_HEIGHT_RATIO = 0.8;

        /**
         * The gap between the dock of the bar and the notifications at the
         * bottom of the page that are raised above it, in pixels.
         */
        var NOTIFICATIONS_GAP = 16;

        // sets the jquery matched object and verifies if
        // at least one object as been matched, in case not
        // a single object has been matched returns immediately
        // as there's nothing remaining to be done
        var matchedObject = this;
        if (!matchedObject || matchedObject.length === 0) {
            return;
        }

        // retrieves the reference to the global elements
        // that are going to be used latter for the various
        // operations and event registration
        var _window = jQuery(window);
        var _document = jQuery(document);
        var _body = jQuery("body");

        // retrieves the logger of the plugin, ensuring that the default
        // logger is created with the format of the plugins (as the logger
        // of the plugins does), before the handler of the bar is added
        var logger = jQuery.uxlogger("udebug");

        /**
         * Retrieves the value stored under the provided key in the local
         * storage, ignoring the local storage in case it's not accessible.
         *
         * @param {String}
         *            key The key of the value to be retrieved.
         * @return {String} The value stored under the key, or an invalid
         *         value in case there's none.
         */
        var _get = function(key) {
            try {
                return window.localStorage && window.localStorage.getItem(key);
            } catch (exception) {
                return null;
            }
        };

        /**
         * Stores the provided value under the key in the local storage,
         * ignoring the local storage in case it's not accessible.
         *
         * @param {String}
         *            key The key of the value to be stored.
         * @param {String}
         *            value The value to be stored.
         */
        var _set = function(key, value) {
            try {
                window.localStorage && window.localStorage.setItem(key, value);
            } catch (exception) {
                // ignores the exception as the storage of the values of the
                // bar is a convenience of the browser (best effort)
            }
        };

        /**
         * Adds the provided record (time, level, name and message) to the
         * records of the logs kept in memory, dropping the oldest one once
         * the limit is reached, and notifies the bars about it.
         *
         * @param {Object}
         *            record The record to be added to the logs.
         */
        var _record = function(record) {
            var records = _window.data("udebug_records");
            records.push(record);
            records.length > MAXIMUM_RECORDS && records.shift();
            _body.triggerHandler("debug_record", [record]);
        };

        /**
         * Converts the provided value (an argument of a log record) into
         * the string that represents it in the message of the record.
         *
         * @param {Object}
         *            value The value to be converted into a string.
         * @return {String} The string that represents the value.
         */
        var _string = function(value) {
            if (typeof value === "string") {
                return value;
            }
            if (value instanceof Error) {
                return String(value);
            }
            try {
                return JSON.stringify(value);
            } catch (exception) {
                return String(value);
            }
        };

        /**
         * Pads the provided value with zeros at the left until it has the
         * provided length (eg: the segments of the omni codes).
         *
         * @param {Object}
         *            value The value to be padded.
         * @param {Integer}
         *            length The length of the padded value.
         * @return {String} The value padded with zeros.
         */
        var _pad = function(value, length) {
            var valueS = String(value);
            while (valueS.length < length) {
                valueS = "0" + valueS;
            }
            return valueS;
        };

        /**
         * Removes the value stored under the provided key in the local
         * storage, ignoring the local storage in case it's not accessible.
         *
         * @param {String}
         *            key The key of the value to be removed.
         */
        var _remove = function(key) {
            try {
                window.localStorage && window.localStorage.removeItem(key);
            } catch (exception) {
                // ignores the exception as the storage of the values of the
                // bar is a convenience of the browser (best effort)
            }
        };

        /**
         * Retrieves the keys of the local storage that start with one of the
         * provided prefixes, sorted, an empty list in case the local storage
         * is not accessible.
         *
         * @param {Array}
         *            prefixes The prefixes of the keys to be retrieved.
         * @return {Array} The keys of the local storage with the prefixes.
         */
        var _keys = function(prefixes) {
            var keys = [];
            try {
                var storage = window.localStorage;
                var count = storage ? storage.length : 0;
                for (var index = 0; index < count; index++) {
                    var key = storage.key(index);
                    for (var _index = 0; _index < prefixes.length; _index++) {
                        key.indexOf(prefixes[_index]) === 0 && keys.push(key);
                    }
                }
            } catch (exception) {
                return [];
            }
            keys.sort();
            return keys;
        };

        /**
         * Retrieves the URL of the provided path (relative to the mvc path, eg:
         * the documents of the presets), resolving its section with the alias
         * of the page, as the queries of the layout do.
         *
         * @param {String}
         *            path The path relative to the mvc path.
         * @return {String} The URL of the path.
         */
        var _url = function(path) {
            var mvcPath = _body.data("mvc_path") || "";
            var alias = _body.data("alias") || {};
            var parts = path.split("/");
            parts[0] = alias[parts[0]] || parts[0];
            return mvcPath + parts.join("/");
        };

        /**
         * Masks the provided value (eg: a key of a service), keeping only its
         * last four characters visible.
         *
         * @param {String}
         *            value The value to be masked.
         * @return {String} The masked value, an invalid value in case there's
         *         no value.
         */
        var _mask = function(value) {
            if (!value) {
                return null;
            }
            return "••••••••" + String(value).slice(-4);
        };

        /**
         * Renders the provided values in the provided list, replacing the
         * ones rendered before, each one with its name, its label (to be
         * localized), its value and, optionally, its source (to be localized)
         * and its state (eg: success, warning or error).
         *
         * @param {Element}
         *            list The list where the values are going to be rendered.
         * @param {Array}
         *            values The values to be rendered.
         */
        var _values = function(list, values) {
            list.empty();
            for (var index = 0; index < values.length; index++) {
                var value = values[index];
                var item = jQuery("<li class=\"debug-bar-value\">"
                    + "<span class=\"debug-bar-value-label\"></span>"
                    + "<span class=\"debug-bar-value-text\"></span>" + "</li>");
                var labelElement = jQuery(".debug-bar-value-label", item);
                var textElement = jQuery(".debug-bar-value-text", item);
                var isEmpty = value.value === null || value.value === undefined
                    || value.value === "";
                item.attr("data-name", value.name);
                value.state && item.addClass(value.state);
                labelElement.text(jQuery.uxlocale(value.label));
                textElement.text(isEmpty ? jQuery.uxlocale("None") : String(value.value));
                if (value.source && !isEmpty) {
                    var sourceElement = jQuery("<span class=\"debug-bar-value-source\"></span>");
                    sourceElement.text(" (" + jQuery.uxlocale(value.source) + ")");
                    textElement.append(sourceElement);
                }
                list.append(item);
            }
        };

        /**
         * Renders the provided names as chips in the provided list, replacing
         * the ones rendered before, or the provided message in case there's no
         * name to be rendered.
         *
         * @param {Element}
         *            list The list where the chips are going to be rendered.
         * @param {Array}
         *            names The names of the chips to be rendered.
         * @param {String}
         *            message The message (to be localized) shown in case there's
         *            no name to be rendered.
         * @return {Element} The chips that have been rendered.
         */
        var _chips = function(list, names, message) {
            list.empty();
            for (var index = 0; index < names.length; index++) {
                var item = jQuery("<li class=\"debug-bar-chip\"></li>");
                item.attr("data-name", names[index]);
                item.text(names[index]);
                list.append(item);
            }
            names.length === 0 && list.append("<li class=\"debug-bar-chips-empty\">"
                + jQuery.uxlocale(message) + "</li>");
            return jQuery(".debug-bar-chip", list);
        };

        // starts the variables that hold the presets of the instance, once
        // retrieved, and the callbacks waiting for them to be retrieved
        var presets = null;
        var presetsCallbacks = [];

        /**
         * Retrieves the presets of the instance (the codes to be scanned and
         * the documents to be printed), once for the bar, calling the provided
         * callback with them (an empty set of presets in case of failure).
         *
         * @param {Function}
         *            callback The function called with the presets.
         */
        var _presets = function(callback) {
            // in case the presets have already been retrieved calls the
            // callback with them immediately, otherwise queues the callback
            // and in case the presets are already being retrieved returns
            if (presets) {
                callback(presets);
                return;
            }
            var isPending = presetsCallbacks.length > 0;
            presetsCallbacks.push(callback);
            if (isPending) {
                return;
            }

            /**
             * Keeps the provided presets (as retrieved from the server) and
             * calls the callbacks queued with them.
             *
             * @param {Object}
             *            data The presets retrieved from the server.
             */
            var _done = function(data) {
                presets = {
                    scans: (data && data.scans) || [],
                    documents: (data && data.documents) || []
                };
                for (var index = 0; index < presetsCallbacks.length; index++) {
                    presetsCallbacks[index](presets);
                }
                presetsCallbacks = [];
            };

            jQuery.uquery({
                url: "omni_util/debug_presets.json",
                data: {},
                success: function(data) {
                    _done(data);
                },
                error: function(request, status, error) {
                    logger.warn("Presets retrieval failed:", request.status, error);
                    _done(null);
                }
            });
        };

        /**
         * Retrieves the time of the provided date as a string, with its hours,
         * minutes and seconds (eg: the time of the records of the logs).
         *
         * @param {Date}
         *            date The date to retrieve the time for.
         * @return {String} The time of the date as a string.
         */
        var _time = function(date) {
            return _pad(date.getHours(), 2) + ":" + _pad(date.getMinutes(), 2) + ":"
                + _pad(date.getSeconds(), 2);
        };

        // retrieves the value of the global registration of the capture
        // of the logs, as the records are kept for the window (so that the
        // records survive the bar being created again by the async navigation)
        // and then updates the value so that the capture is registered once
        var isRegistered = _window.data("udebug_global");
        _window.data("udebug_global", true);

        // in case the capture of the logs is not yet registered, adds a
        // handler to the default logger (the one the loggers of the plugins
        // propagate their records to) and registers for the errors of the
        // page, that are kept as records of the console
        if (!isRegistered) {
            _window.data("udebug_records", []);
            var handler = new Logging.Handler();
            handler.emit = function(record) {
                var parts = [_string(record.getMessage())];
                var args = record.getArgs();
                for (var index = 0; index < args.length; index++) {
                    parts.push(_string(args[index]));
                }
                _record({
                    time: record.created || new Date(),
                    level: String(record.getLevelString()).toLowerCase(),
                    name: record.getName(),
                    message: parts.join(" ")
                });
            };
            Logging.getLogger().addHandler(handler);

            _window.bind("error", function(event) {
                var original = event.originalEvent || event;
                _record({
                    time: new Date(),
                    level: "error",
                    name: "console",
                    message: original.message || String(original.error)
                });
            });

            _window.bind("unhandledrejection", function(event) {
                var original = event.originalEvent || event;
                var reason = original.reason;
                _record({
                    time: new Date(),
                    level: "error",
                    name: "console",
                    message: "Unhandled rejection: "
                        + (reason && reason.message ? reason.message : _string(reason))
                });
            });

            // registers for the events of the asynchronous navigation of the
            // pages so that the last one (its link, its duration and its events)
            // is kept for the page tool, notifying the bars about it
            _body.bind("async_start async_end pre_async do_async post_async", function(event) {
                var navigation = _window.data("udebug_navigation_start");
                if (event.type === "async_start") {
                    navigation = {
                        time: new Date().getTime(),
                        events: []
                    };
                    _window.data("udebug_navigation_start", navigation);
                }
                if (!navigation) {
                    return;
                }
                navigation.events.push(event.type);
                if (event.type !== "post_async") {
                    return;
                }
                _window.data("udebug_navigation", {
                    href: document.location.href,
                    duration: new Date().getTime() - navigation.time,
                    events: navigation.events
                });
                _window.data("udebug_navigation_start", null);
                _body.triggerHandler("debug_navigation");
            });
        }

        // retrieves the level of the logs of this browser (the one of the
        // local storage, then the one of the application) and the theme of
        // the bar, defaulting to the first one in case it's not valid
        var level = String(_get("uxf:log:level") || _body.data("log_level") || "warning")
            .toLowerCase();
        level = LEVELS.indexOf(level) === -1 ? "warning" : level;
        var theme = _get("omni:debug:theme");
        theme = THEMES.indexOf(theme) === -1 ? THEMES[0] : theme;

        // builds the header of the dock of the bar, with the tabs of its
        // tools, the counts of the errors and the warnings of the logs, the
        // select of the theme, the hint of the shortcut and the button that
        // closes the bar
        var header = jQuery("<div class=\"debug-bar-header\">"
            + "<ul class=\"debug-bar-tabs\"></ul>"
            + "<span class=\"debug-bar-count debug-bar-errors\">0</span>"
            + "<span class=\"debug-bar-count debug-bar-warnings\">0</span>"
            + "<label class=\"debug-bar-label\">" + jQuery.uxlocale("Theme") + "</label>"
            + "<span class=\"debug-bar-select-box\">"
            + "<select class=\"debug-bar-select debug-bar-theme\"></select>" + "</span>"
            + "<span class=\"debug-bar-shortcut\">Ctrl + Alt + D</span>"
            + "<span class=\"debug-bar-close\" title=\"" + jQuery.uxlocale("Close")
            + "\">&#215;</span>" + "</div>");
        var tools = jQuery("<div class=\"debug-bar-tools\"></div>");
        var dock = jQuery("<div class=\"debug-bar-dock\"></div>");
        dock.append(header);
        dock.append(tools);
        matchedObject.append(dock);

        // builds the handle of the resize of the dock, along its top edge,
        // that changes its height while dragged (reset by a double click)
        var resize = jQuery("<div class=\"debug-bar-resize\" title=\""
            + jQuery.uxlocale("Drag to resize, double click to reset") + "\"></div>");
        dock.append(resize);

        // builds the launcher of the bar, shown while the bar is closed, with
        // its badge, the counts of the errors and the warnings of the logs and
        // the arrow that hints that it opens the bar
        var launcher = jQuery("<div class=\"debug-bar-launcher\" title=\""
            + jQuery.uxlocale("Open the debug bar") + "\">"
            + "<span class=\"debug-bar-launcher-badge\">DEBUG</span>"
            + "<span class=\"debug-bar-count debug-bar-errors\">0</span>"
            + "<span class=\"debug-bar-count debug-bar-warnings\">0</span>"
            + "<span class=\"debug-bar-launcher-arrow\"></span>" + "</div>");
        matchedObject.append(launcher);

        // retrieves the references to the elements of the header (and of the
        // launcher) that are going to be used latter in the operations of the
        // bar, the counts being both the ones of the header and of the launcher
        var tabs = jQuery(".debug-bar-tabs", header);
        var errors = jQuery(".debug-bar-errors", matchedObject);
        var warnings = jQuery(".debug-bar-warnings", matchedObject);
        var themeSelect = jQuery(".debug-bar-theme", header);
        var close = jQuery(".debug-bar-close", header);

        // populates the select of the theme with the themes, with their
        // names localized and the current theme selected
        for (var index = 0; index < THEMES.length; index++) {
            themeSelect.append("<option value=\"" + THEMES[index] + "\">"
                + jQuery.uxlocale(THEME_NAMES[index]) + "</option>");
        }
        themeSelect.val(theme);
        matchedObject.addClass("theme-" + theme);

        // updates the bar with the level of the logs of this browser and with
        // the theme of the bar, the ones that the tools use (eg: the logs
        // filtering their records)
        matchedObject.data("level", level);
        matchedObject.data("theme", theme);

        /**
         * Builds the panel of the logs tool, the records of the logs of the
         * page (newest first) filtered by the level of this browser, by the
         * plugin that logged them and by the text of the filter (as the one
         * of the console of the developer tools of the browsers), with the
         * switch of the level and the button that clears the records.
         *
         * @param {Element}
         *            panel The panel of the tool to be built.
         */
        var _buildLogs = function(panel) {
            panel.addClass("debug-bar-tool-list");
            panel.append("<div class=\"debug-bar-toolbar\">"
                + "<label class=\"debug-bar-label\">" + jQuery.uxlocale("Level") + "</label>"
                + "<span class=\"debug-bar-select-box\">"
                + "<select class=\"debug-bar-select debug-bar-level\"></select>" + "</span>"
                + "<label class=\"debug-bar-label\">" + jQuery.uxlocale("Plugin") + "</label>"
                + "<span class=\"debug-bar-select-box\">"
                + "<select class=\"debug-bar-select debug-bar-plugin\">"
                + "<option value=\"all\">" + jQuery.uxlocale("All plugins") + "</option>"
                + "</select>" + "</span>"
                + "<input type=\"text\" class=\"debug-bar-input debug-bar-logs-filter\""
                + " autocomplete=\"off\" placeholder=\"" + jQuery.uxlocale("Filter") + "\""
                + " title=\"" + jQuery.uxlocale("Text, /regular expression/ or -text to exclude")
                + "\" />" + "<span class=\"debug-bar-summary\"></span>"
                + "<span class=\"debug-bar-button debug-bar-clear\">" + jQuery.uxlocale("Clear")
                + "</span>" + "</div>" + "<ul class=\"debug-bar-logs\"></ul>");

            // retrieves the references to the elements of the panel that are
            // going to be used in the rendering of the records
            var levelSelect = jQuery(".debug-bar-level", panel);
            var plugin = jQuery(".debug-bar-plugin", panel);
            var search = jQuery(".debug-bar-logs-filter", panel);
            var summary = jQuery(".debug-bar-summary", panel);
            var clear = jQuery(".debug-bar-clear", panel);
            var list = jQuery(".debug-bar-logs", panel);

            // populates the select of the level with the levels of the logs,
            // with their names localized and the current level selected
            for (var index = 0; index < LEVELS.length; index++) {
                var name = LEVELS[index].charAt(0).toUpperCase() + LEVELS[index].slice(1);
                levelSelect.append("<option value=\"" + LEVELS[index] + "\">"
                    + jQuery.uxlocale(name) + "</option>");
            }
            levelSelect.val(matchedObject.data("level"));

            /**
             * Parses the provided text of the filter into its terms, separated
             * by spaces, as the filter of the console of the developer tools of
             * the browsers does, each one a regular expression (ignoring the
             * case) that the text of a record must match, or must not match in
             * case it's negative (starting with a dash), the terms between
             * slashes being regular expressions (plain text in case they are
             * not valid ones) and the other ones plain text.
             *
             * @param {String}
             *            text The text of the filter to be parsed.
             * @return {Array} The terms of the filter, each one with its
             *         regular expression and if it's negative.
             */
            var _terms = function(text) {
                var terms = [];
                var parts = text.split(/\s+/);
                for (var index = 0; index < parts.length; index++) {
                    var part = parts[index];
                    var negative = part.length > 1 && part.charAt(0) === "-";
                    part = negative ? part.slice(1) : part;
                    if (!part) {
                        continue;
                    }
                    var regex = null;
                    var isRegex = part.length > 2 && part.charAt(0) === "/"
                        && part.charAt(part.length - 1) === "/";
                    try {
                        regex = isRegex ? new RegExp(part.slice(1, -1), "i") : null;
                    } catch (exception) {
                        regex = null;
                    }
                    var escaped = part.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&");
                    regex = regex || new RegExp(escaped, "i");
                    terms.push({
                        regex: regex,
                        negative: negative
                    });
                }
                return terms;
            };

            /**
             * Verifies if the provided text of a record (its level, plugin and
             * message) matches every one of the terms of the filter, the text
             * matching the positive terms and not matching the negative ones.
             *
             * @param {Array}
             *            terms The terms of the filter, as parsed.
             * @param {String}
             *            text The text of the record to be verified.
             * @return {Boolean} If the text matches every one of the terms.
             */
            var _matches = function(terms, text) {
                for (var index = 0; index < terms.length; index++) {
                    var term = terms[index];
                    if (term.regex.test(text) === term.negative) {
                        return false;
                    }
                }
                return true;
            };

            /**
             * Sets the provided text as the contents of the element, with the
             * parts of it matched by the positive terms of the filter
             * highlighted (as the console of the developer tools of the
             * browsers does), the text being kept as text, so that no markup
             * of it reaches the page.
             *
             * @param {Element}
             *            element The element whose contents are set.
             * @param {String}
             *            text The text to be set as the contents.
             * @param {Array}
             *            terms The terms of the filter, as parsed.
             */
            var _highlight = function(element, text, terms) {
                // collects the ranges of the text matched by the positive terms
                // of the filter, skipping the empty matches (eg: of a regular
                // expression that matches nothing) as they highlight nothing
                var ranges = [];
                for (var index = 0; index < terms.length; index++) {
                    if (terms[index].negative) {
                        continue;
                    }
                    var regex = new RegExp(terms[index].regex.source, "gi");
                    var match = regex.exec(text);
                    while (match) {
                        match[0].length === 0 && regex.lastIndex++;
                        match[0].length && ranges.push([match.index,
                            match.index + match[0].length]);
                        match = regex.exec(text);
                    }
                }

                // adds the text between the ranges (in their order) and the
                // text of each range highlighted, the overlapping ranges
                // continuing the highlight of the previous ones
                ranges.sort(function(first, second) {
                    return first[0] - second[0];
                });
                var position = 0;
                element.empty();
                for (var index = 0; index < ranges.length; index++) {
                    var start = Math.max(ranges[index][0], position);
                    var end = ranges[index][1];
                    if (end <= start) {
                        continue;
                    }
                    var mark = jQuery("<mark class=\"debug-bar-match\"></mark>");
                    mark.text(text.slice(start, end));
                    element.append(document.createTextNode(text.slice(position, start)));
                    element.append(mark);
                    position = end;
                }
                element.append(document.createTextNode(text.slice(position)));
            };

            /**
             * Renders the records of the logs in the list of the panel, the
             * newest first, keeping the ones at or above the level of the bar,
             * of the selected plugin and matching the text of the filter, and
             * updates the options of the select of the plugins with the plugins
             * of the records.
             */
            var _render = function() {
                var records = _window.data("udebug_records");
                var minimum = LEVELS.indexOf(matchedObject.data("level"));
                var selected = plugin.val();
                var terms = _terms(search.val());
                var names = [];
                var count = 0;
                list.empty();

                // iterates over the records from the newest one, collecting
                // the names of their plugins and adding the visible ones
                for (var index = records.length - 1; index >= 0; index--) {
                    var record = records[index];
                    var _level = record.level === "critical" ? "error" : record.level;
                    names.indexOf(record.name) === -1 && names.push(record.name);
                    if (LEVELS.indexOf(_level) < minimum) {
                        continue;
                    }
                    if (selected !== "all" && record.name !== selected) {
                        continue;
                    }
                    var text = record.level.toUpperCase() + " " + record.name + " "
                        + record.message;
                    if (!_matches(terms, text)) {
                        continue;
                    }
                    var item = jQuery("<li class=\"debug-bar-log " + _level + "\">"
                        + "<span class=\"debug-bar-log-time\"></span>"
                        + "<span class=\"debug-bar-log-level\"></span>"
                        + "<span class=\"debug-bar-log-name\"></span>"
                        + "<span class=\"debug-bar-log-message\"></span>" + "</li>");
                    var timeElement = jQuery(".debug-bar-log-time", item);
                    var levelElement = jQuery(".debug-bar-log-level", item);
                    var nameElement = jQuery(".debug-bar-log-name", item);
                    var messageElement = jQuery(".debug-bar-log-message", item);
                    timeElement.text(_time(record.time));
                    _highlight(levelElement, record.level.toUpperCase(), terms);
                    _highlight(nameElement, record.name, terms);
                    _highlight(messageElement, record.message, terms);
                    list.append(item);
                    count++;
                }

                // adds the message of no records in case no record is visible
                // and updates the summary with the counts of the records
                count === 0 && list.append("<li class=\"debug-bar-log-empty\">"
                    + jQuery.uxlocale("No records") + "</li>");
                summary.text(String.prototype.formatC.apply(
                    jQuery.uxlocale("%s of %s records, newest first"), [count, records.length]));

                // adds the plugins of the records that are not yet options of
                // the select of the plugins, in the order of their names
                names.sort();
                for (var index = 0; index < names.length; index++) {
                    var option = jQuery("option[value=\"" + names[index] + "\"]", plugin);
                    if (option.length) {
                        continue;
                    }
                    option = jQuery("<option></option>");
                    option.attr("value", names[index]);
                    option.text(names[index]);
                    plugin.append(option);
                }
            };

            // registers for the change of the level so that it's stored as
            // the level of the logs of this browser (as read by the logger of
            // the plugins) and set in the loggers already created, notifying
            // the other tools about it (eg: the session)
            levelSelect.change(function() {
                var _level = levelSelect.val();
                var value = Logging.LevelsMap[_level.toUpperCase()];
                _set("uxf:log:level", _level);
                for (var name in Logging.loggers) {
                    Logging.loggers[name].setLevel(value);
                }
                matchedObject.data("level", _level);
                matchedObject.triggerHandler("level", [_level]);
                logger.info("Log level changed:", _level);
            });

            // registers for the click in the clear button so that the records
            // of the logs are removed, notifying the bar about it (that
            // updates the counts of its header)
            clear.click(function() {
                var records = _window.data("udebug_records");
                records.splice(0, records.length);
                matchedObject.triggerHandler("clear");
            });

            // registers for the records, the level and the clear of the bar,
            // for the change of the plugin and for the keys of the filter so
            // that the records are rendered again, and renders the records
            // already kept
            matchedObject.bind("record level clear", _render);
            plugin.change(_render);
            search.keyup(_render);
            _render();
        };

        /**
         * Builds the panel of the notifications tool, that shows dummy
         * notifications of every kind, size and position, and panel ones.
         *
         * @param {Element}
         *            panel The panel of the tool to be built.
         */
        var _buildNotifications = function(panel) {
            panel.append("<div class=\"debug-bar-column debug-bar-notifications\">"
                + "<span class=\"debug-bar-title\">" + jQuery.uxlocale("Kind") + "</span>"
                + "<ul class=\"debug-bar-kinds\"></ul>" + "<div class=\"debug-bar-options\">"
                + "<label><input type=\"checkbox\" class=\"debug-bar-small\" /> "
                + jQuery.uxlocale("Small") + "</label>"
                + "<label><input type=\"checkbox\" class=\"debug-bar-top\" /> "
                + jQuery.uxlocale("At the top center") + "</label>"
                + "<label><input type=\"checkbox\" class=\"debug-bar-panel\" /> "
                + jQuery.uxlocale("As a panel notification (Pushi)") + "</label>" + "</div>"
                + "</div>" + "<div class=\"debug-bar-column debug-bar-wide\">"
                + "<span class=\"debug-bar-title\">" + jQuery.uxlocale("Title") + "</span>"
                + "<input type=\"text\" class=\"debug-bar-input debug-bar-notification-title\" />"
                + "<span class=\"debug-bar-title\">" + jQuery.uxlocale("Message") + "</span>"
                + "<input type=\"text\" class=\"debug-bar-input"
                + " debug-bar-notification-message\" />"
                + "<div class=\"debug-bar-actions\">"
                + "<span class=\"debug-bar-button debug-bar-dismiss\">"
                + jQuery.uxlocale("Dismiss all") + "</span>"
                + "<span class=\"debug-bar-button debug-bar-primary debug-bar-notify\">"
                + jQuery.uxlocale("Show notification") + "</span>" + "</div>" + "</div>");

            // retrieves the references to the elements of the panel that are
            // going to be used in the notifications
            var kinds = jQuery(".debug-bar-kinds", panel);
            var small = jQuery(".debug-bar-small", panel);
            var top = jQuery(".debug-bar-top", panel);
            var pushi = jQuery(".debug-bar-panel", panel);
            var title = jQuery(".debug-bar-notification-title", panel);
            var message = jQuery(".debug-bar-notification-message", panel);
            var dismiss = jQuery(".debug-bar-dismiss", panel);
            var notify = jQuery(".debug-bar-notify", panel);

            // adds the kinds of the notifications, each one with the title and
            // the message used as its example, the first one selected
            for (var index = 0; index < KINDS.length; index++) {
                var kind = KINDS[index];
                var item = jQuery("<li class=\"debug-bar-kind " + kind.name + "\" data-kind=\""
                    + kind.name + "\">" + jQuery.uxlocale(kind.label) + "</li>");
                kinds.append(item);
            }

            /**
             * Selects the kind with the provided name, filling the title and
             * the message with the ones of its example.
             *
             * @param {String}
             *            name The name of the kind to be selected.
             */
            var _pick = function(name) {
                var items = jQuery(".debug-bar-kind", kinds);
                var item = jQuery(".debug-bar-kind[data-kind=\"" + name + "\"]", kinds);
                items.removeClass("selected");
                item.addClass("selected");
                for (var index = 0; index < KINDS.length; index++) {
                    if (KINDS[index].name !== name) {
                        continue;
                    }
                    title.val(jQuery.uxlocale(KINDS[index].title));
                    message.val(jQuery.uxlocale(KINDS[index].message));
                }
            };

            // registers for the click in the kinds so that the kind is
            // selected with its example
            var items = jQuery(".debug-bar-kind", kinds);
            items.click(function() {
                var element = jQuery(this);
                _pick(element.attr("data-kind"));
            });

            // registers for the click in the notify button so that the
            // notification is shown, either in the page (with the selected
            // kind, size and position) or as a notification of the panel of
            // the notifications (as the test notification of the local
            // services, by the user of the session)
            notify.click(function() {
                var selected = jQuery(".debug-bar-kind.selected", kinds);
                var kind = selected.attr("data-kind");
                if (pushi.is(":checked")) {
                    var objectId = _body.data("object_id");
                    var representation = _body.data("representation");
                    var notifications = jQuery(".notifications-menu", _body);
                    notifications.triggerHandler("notification", [{
                        unique_id: "debug." + new Date().getTime(),
                        cid: USER_CID,
                        u_cid: USER_CID,
                        create_date: new Date().getTime() / 1000,
                        create_user: {
                            object_id: objectId,
                            representation: representation
                        },
                        entity: {
                            object_id: objectId
                        },
                        notification: {
                            message: message.val() + " {{%s}}",
                            arguments: [representation]
                        }
                    }, true]);
                    logger.info("Notification shown:", "panel");
                    return;
                }
                _body.uxnotification({
                    type: kind === "information" ? null : kind,
                    title: title.val(),
                    message: message.val(),
                    small: small.is(":checked"),
                    position: top.is(":checked") ? "top-center" : null
                });
                logger.info("Notification shown:", kind);
            });

            // registers for the click in the dismiss button so that the
            // notifications shown in the page are removed
            dismiss.click(function() {
                var shown = jQuery("> .notifications-stack > .notification", _body);
                shown.remove();
            });

            // selects the first kind, filling its example
            _pick(KINDS[0].name);
        };

        /**
         * Builds the panel of the scan tool, that types codes as a barcode
         * scanner does: the presets of the instance, the codes of the
         * entities of omni (by their class and object id), any code and the
         * edge cases of the scans, the presets and the entities being
         * retrieved once it's shown.
         *
         * @param {Element}
         *            panel The panel of the tool to be built.
         */
        var _buildScan = function(panel) {
            panel.append("<div class=\"debug-bar-column debug-bar-presets-column\">"
                + "<span class=\"debug-bar-title\">" + jQuery.uxlocale("From this instance")
                + "</span>" + "<ul class=\"debug-bar-presets\">"
                + "<li class=\"debug-bar-presets-empty\">"
                + jQuery.uxlocale("Loading") + "</li></ul>" + "</div>"
                + "<div class=\"debug-bar-column debug-bar-omni\">"
                + "<span class=\"debug-bar-title\">" + jQuery.uxlocale("Omni code") + "</span>"
                + "<div class=\"debug-bar-row\">" + "<div class=\"debug-bar-search\">"
                + "<input type=\"text\" class=\"debug-bar-input debug-bar-entity\""
                + " autocomplete=\"off\""
                + " placeholder=\"" + jQuery.uxlocale("Entity, eg: Product") + "\" />"
                + "<ul class=\"debug-bar-entities\"></ul>" + "</div>"
                + "<input type=\"text\" class=\"debug-bar-input debug-bar-object\""
                + " autocomplete=\"off\""
                + " placeholder=\"" + jQuery.uxlocale("Object id") + "\" />" + "</div>"
                + "<div class=\"debug-bar-preview\">"
                + "<span class=\"debug-bar-segment\">"
                + "<span class=\"debug-bar-preview-checksum\">0000</span>"
                + "<span class=\"debug-bar-caption\">" + jQuery.uxlocale("Checksum") + "</span>"
                + "</span>" + "<span class=\"debug-bar-segment\">"
                + "<span class=\"debug-bar-preview-version\">01</span>"
                + "<span class=\"debug-bar-caption\">" + jQuery.uxlocale("Version") + "</span>"
                + "</span>" + "<span class=\"debug-bar-segment\">"
                + "<span class=\"debug-bar-preview-cid\">0000</span>"
                + "<span class=\"debug-bar-caption\">CID</span>"
                + "</span>" + "<span class=\"debug-bar-segment\">"
                + "<span class=\"debug-bar-preview-object\">000000000000</span>"
                + "<span class=\"debug-bar-caption\">" + jQuery.uxlocale("Object id") + "</span>"
                + "</span>"
                + "</div>" + "<div class=\"debug-bar-actions\">"
                + "<span class=\"debug-bar-status debug-bar-omni-status\"></span>"
                + "<span class=\"debug-bar-button debug-bar-primary debug-bar-omni-scan"
                + " disabled\">"
                + jQuery.uxlocale("Type scan") + "</span>" + "</div>" + "</div>"
                + "<div class=\"debug-bar-column debug-bar-wide\">"
                + "<span class=\"debug-bar-title\">" + jQuery.uxlocale("Any code") + "</span>"
                + "<div class=\"debug-bar-row\">"
                + "<input type=\"text\" class=\"debug-bar-input debug-bar-code\""
                + " autocomplete=\"off\""
                + " placeholder=\"" + jQuery.uxlocale("eg: 5601234567892") + "\" />"
                + "<span class=\"debug-bar-button debug-bar-primary debug-bar-code-scan\">"
                + jQuery.uxlocale("Type scan") + "</span>" + "</div>"
                + "<span class=\"debug-bar-title\">" + jQuery.uxlocale("Recent") + "</span>"
                + "<ul class=\"debug-bar-recent\"></ul>"
                + "<span class=\"debug-bar-status debug-bar-typed\"></span>"
                + "<span class=\"debug-bar-title\">" + jQuery.uxlocale("Edge cases") + "</span>"
                + "<ul class=\"debug-bar-edges\"></ul>" + "</div>");

            // retrieves the references to the elements of the panel that are
            // going to be used in the scans
            var presets = jQuery(".debug-bar-presets", panel);
            var entity = jQuery(".debug-bar-entity", panel);
            var entities = jQuery(".debug-bar-entities", panel);
            var object = jQuery(".debug-bar-object", panel);
            var checksum = jQuery(".debug-bar-preview-checksum", panel);
            var version = jQuery(".debug-bar-preview-version", panel);
            var cid = jQuery(".debug-bar-preview-cid", panel);
            var objectPreview = jQuery(".debug-bar-preview-object", panel);
            var omniStatus = jQuery(".debug-bar-omni-status", panel);
            var omniScan = jQuery(".debug-bar-omni-scan", panel);
            var code = jQuery(".debug-bar-code", panel);
            var codeScan = jQuery(".debug-bar-code-scan", panel);
            var recent = jQuery(".debug-bar-recent", panel);
            var typed = jQuery(".debug-bar-typed", panel);
            var edges = jQuery(".debug-bar-edges", panel);

            // starts the variables that hold the classes of the entities (once
            // retrieved), the class of the picked entity and the code that it
            // builds, and the flag of a scan being typed
            var classes = [];
            var picked = null;
            var omniCode = null;
            var typing = false;

            /**
             * Retrieves the name of the provided class (as retrieved from the
             * server) to be shown, with the words of its name split and its
             * section, in case it has one.
             *
             * @param {Object}
             *            item The class, with its name and section.
             * @return {String} The name of the class to be shown.
             */
            var _name = function(item) {
                var name = item.name.replace(/([a-z])([A-Z])/g, "$1 $2");
                return item.section ? name + " (" + item.section + ")" : name;
            };

            /**
             * Types the provided code as a barcode scanner does, a key press
             * and release every 10 ms (or the provided interval) ending in the
             * enter key, on the document (where the scan detection listens),
             * with no field focused, keeping it as a recent code unless it's
             * an edge case.
             *
             * @param {String}
             *            value The code to be typed.
             * @param {Integer}
             *            interval The interval between the keys, in ms.
             * @param {Object}
             *            edge The edge case of the code, in case it's one.
             */
            var _type = function(value, interval, edge) {
                // in case there's no value or a scan is still being typed
                // returns immediately (one scan at a time)
                if (!value || typing) {
                    return;
                }

                // removes the focus from any field of the page, as a scan typed
                // with the cursor in a field is typed into it, and marks the
                // scan as being typed, keeping its start time
                var active = document.activeElement;
                active && active.blur && active.blur();
                typing = true;
                var start = new Date().getTime();
                var keys = value.split("");
                keys.push("\n");
                interval = interval || KEY_INTERVAL;

                /**
                 * Presses and releases the key of the character at the provided
                 * index, as a key of the US keyboard layout, scheduling the
                 * next one, and finishes the scan after the enter key.
                 *
                 * @param {Integer}
                 *            index The index of the character to be typed.
                 */
                var _key = function(index) {
                    var character = keys[index];
                    var spec = _spec(character);
                    var events = ["keydown", "keyup"];
                    for (var _index = 0; _index < events.length; _index++) {
                        var event = jQuery.Event(events[_index]);
                        event.key = spec.key;
                        event.code = spec.code;
                        event.keyCode = spec.keyCode;
                        event.which = spec.keyCode;
                        event.shiftKey = spec.shift;
                        _document.trigger(event);
                    }
                    if (index < keys.length - 1) {
                        setTimeout(function() {
                            _key(index + 1);
                        }, interval);
                        return;
                    }
                    var elapsed = new Date().getTime() - start;
                    typing = false;
                    typed.text(edge ? String.prototype.formatC.apply(
                        jQuery.uxlocale("Typed the edge case %s: %s (%s keys in %s ms)"),
                        [jQuery.uxlocale(edge.label), value, keys.length, elapsed])
                        : String.prototype.formatC.apply(
                            jQuery.uxlocale("Typed %s (%s keys in %s ms)"),
                            [value, keys.length, elapsed]));
                    logger.info("Scan typed with keys and interval:", keys.length, interval);
                    !edge && _remember(value);
                };
                _key(0);
            };

            /**
             * Retrieves the key (its value, physical code, key code and shift
             * state) of the provided character in the US keyboard layout, the
             * layout that the scan detection reads the scanners with.
             *
             * @param {String}
             *            character The character to retrieve the key for.
             * @return {Object} The key of the character.
             */
            var _spec = function(character) {
                if (character === "\n") {
                    return { key: "Enter", code: "Enter", keyCode: 13, shift: false };
                }
                if (/^[0-9]$/.test(character)) {
                    return { key: character, code: "Digit" + character,
                        keyCode: character.charCodeAt(0), shift: false };
                }
                if (/^[a-zA-Z]$/.test(character)) {
                    var upper = character.toUpperCase();
                    return { key: character, code: "Key" + upper, keyCode: upper.charCodeAt(0),
                        shift: character !== character.toLowerCase() };
                }
                var symbol = SYMBOLS[character];
                return symbol
                    ? { key: character, code: symbol[0], keyCode: symbol[1], shift: symbol[2] }
                    : { key: character, code: null, keyCode: character.charCodeAt(0),
                        shift: false };
            };

            /**
             * Keeps the provided code as the most recent one of the codes
             * typed (in the local storage), rendering the recent codes.
             *
             * @param {String}
             *            value The code to be kept.
             */
            var _remember = function(value) {
                var codes = _recent();
                var index = codes.indexOf(value);
                index !== -1 && codes.splice(index, 1);
                codes.unshift(value);
                codes = codes.slice(0, MAXIMUM_RECENT);
                _set("omni:debug:scan:recent", JSON.stringify(codes));
                _renderRecent();
            };

            /**
             * Retrieves the recent codes typed in this browser (from the
             * local storage), the most recent first.
             *
             * @return {Array} The recent codes typed.
             */
            var _recent = function() {
                try {
                    var codes = JSON.parse(_get("omni:debug:scan:recent") || "[]");
                    return codes instanceof Array ? codes : [];
                } catch (exception) {
                    return [];
                }
            };

            /**
             * Renders the recent codes typed as chips that type them again.
             */
            var _renderRecent = function() {
                var codes = _recent();
                recent.empty();
                for (var index = 0; index < codes.length; index++) {
                    var item = jQuery("<li class=\"debug-bar-recent-code\"></li>");
                    item.attr("data-code", codes[index]);
                    item.text(codes[index]);
                    recent.append(item);
                }
                var items = jQuery(".debug-bar-recent-code", recent);
                items.click(function() {
                    var element = jQuery(this);
                    _type(element.attr("data-code"));
                });
            };

            /**
             * Builds the code of the provided edge case, either its fixed code
             * or the omni code of its parts, with the valid checksum of its
             * parts unless it has a fixed one (an invalid checksum).
             *
             * @param {Object}
             *            edge The edge case to build the code for.
             * @return {String} The code of the edge case.
             */
            var _edge = function(edge) {
                if (edge.code) {
                    return edge.code;
                }
                var buffer = edge.version + _pad(edge.cid, 4) + _pad(edge.object, 12);
                return (edge.checksum || _pad(jQuery.uchecksum(buffer), 4)) + buffer;
            };

            /**
             * Renders the presets of the instance (as retrieved from the
             * server) as the rows that type them, or the message of no
             * presets in case there's none.
             *
             * @param {Array}
             *            items The presets of the instance.
             */
            var _renderPresets = function(items) {
                presets.empty();
                if (!items || items.length === 0) {
                    presets.append("<li class=\"debug-bar-presets-empty\">"
                        + jQuery.uxlocale("No presets on this instance") + "</li>");
                    return;
                }
                for (var index = 0; index < items.length; index++) {
                    var item = jQuery("<li class=\"debug-bar-preset\">"
                        + "<span class=\"debug-bar-preset-name\"></span>"
                        + "<span class=\"debug-bar-preset-kind\"></span>"
                        + "<span class=\"debug-bar-preset-code\"></span>" + "</li>");
                    var nameElement = jQuery(".debug-bar-preset-name", item);
                    var kindElement = jQuery(".debug-bar-preset-kind", item);
                    var codeElement = jQuery(".debug-bar-preset-code", item);
                    item.attr("data-code", items[index].code);
                    item.attr("data-kind", items[index].kind);
                    nameElement.text(items[index].name);
                    var kind = PRESET_KINDS[items[index].kind] || items[index].kind;
                    kindElement.text(jQuery.uxlocale(kind));
                    codeElement.text(items[index].code);
                    presets.append(item);
                }
                var rows = jQuery(".debug-bar-preset", presets);
                rows.click(function() {
                    var element = jQuery(this);
                    _type(element.attr("data-code"));
                });
            };

            /**
             * Renders the classes of the entities that match the text of the
             * entity field (by the start of the words of their names or by
             * their class identifier), the names starting with it first.
             */
            var _renderEntities = function() {
                var query = String(entity.val()).toLowerCase().replace(/^\s+|\s+$/g, "");
                var starting = [];
                var others = [];
                for (var index = 0; index < classes.length; index++) {
                    var name = _name(classes[index]).toLowerCase();
                    var words = name.replace(/[()]/g, "").split(" ");
                    var matches = !query || String(classes[index].cid) === query;
                    for (var _index = 0; _index < words.length && !matches; _index++) {
                        matches = words[_index].indexOf(query) === 0;
                    }
                    if (!matches) {
                        continue;
                    }
                    name.indexOf(query) === 0 ? starting.push(classes[index])
                        : others.push(classes[index]);
                }
                var items = starting.concat(others).slice(0, MAXIMUM_ENTITIES);
                entities.empty();
                for (var index = 0; index < items.length; index++) {
                    var item = jQuery("<li class=\"debug-bar-entity-item\">"
                        + "<span class=\"debug-bar-entity-name\"></span>"
                        + "<span class=\"debug-bar-entity-cid\"></span>" + "</li>");
                    var nameElement = jQuery(".debug-bar-entity-name", item);
                    var cidElement = jQuery(".debug-bar-entity-cid", item);
                    item.attr("data-cid", items[index].cid);
                    nameElement.text(_name(items[index]));
                    cidElement.text("CID " + items[index].cid);
                    entities.append(item);
                }
                items.length === 0 && entities.append("<li class=\"debug-bar-entity-empty\">"
                    + jQuery.uxlocale("No entity found") + "</li>");
                entities.addClass("open");

                // registers for the mouse down in the entities so that the field
                // keeps its focus (as the items of the drop fields do) and for
                // the click so that the entity is picked
                var rows = jQuery(".debug-bar-entity-item", entities);
                rows.mousedown(function(event) {
                    event.preventDefault();
                });
                rows.click(function() {
                    var element = jQuery(this);
                    var _cid = parseInt(element.attr("data-cid"), 10);
                    for (var index = 0; index < classes.length; index++) {
                        classes[index].cid === _cid && (picked = classes[index]);
                    }
                    entity.val(_name(picked));
                    entities.removeClass("open");
                    _build();
                });
            };

            /**
             * Builds the code of the picked entity and object id (the checksum,
             * the version, the class identifier and the object identifier),
             * updating its preview, its status and its scan button.
             */
            var _build = function() {
                var objectId = String(object.val()).replace(/^\s+|\s+$/g, "");
                var valid = /^[0-9]{1,12}$/.test(objectId);
                var buffer = picked && valid
                    ? "01" + _pad(picked.cid, 4) + _pad(objectId, 12)
                    : null;
                omniCode = buffer ? _pad(jQuery.uchecksum(buffer), 4) + buffer : null;
                checksum.text(omniCode ? omniCode.slice(0, 4) : "0000");
                version.text("01");
                cid.text(omniCode ? omniCode.slice(6, 10) : "0000");
                objectPreview.text(omniCode ? omniCode.slice(10) : "000000000000");
                omniStatus.text(omniCode ? _name(picked) + ", CID " + picked.cid + ", "
                    + jQuery.uxlocale("object") + " " + parseInt(objectId, 10)
                    : jQuery.uxlocale(picked ? "The object id is a number of up to 12 digits"
                        : "Pick an entity"));
                omniStatus.toggleClass("invalid", !omniCode);
                omniScan.toggleClass("disabled", !omniCode);
            };

            // registers for the typing in the entity field so that the picked
            // entity is unset and the matching entities shown, for its focus
            // so that they're shown and for its blur so that they're hidden
            entity.bind("keyup", function() {
                picked = null;
                _renderEntities();
                _build();
            });
            entity.focus(function() {
                _renderEntities();
            });
            entity.blur(function() {
                entities.removeClass("open");
            });

            // registers for the typing in the object field so that the code
            // is built again, and for the clicks in the scan buttons so that
            // the code of the entity or the typed code is typed as a scan
            object.bind("keyup", _build);
            omniScan.click(function() {
                omniCode && _type(omniCode);
            });
            codeScan.click(function() {
                _type(String(code.val()).replace(/^\s+|\s+$/g, ""));
            });

            // adds the edge cases of the scans as the chips that type them,
            // each one with the interval of its keys
            for (var index = 0; index < EDGE_CASES.length; index++) {
                var item = jQuery("<li class=\"debug-bar-edge\"></li>");
                item.attr("data-name", EDGE_CASES[index].name);
                item.attr("data-code", _edge(EDGE_CASES[index]));
                item.data("edge", EDGE_CASES[index]);
                item.text(jQuery.uxlocale(EDGE_CASES[index].label));
                edges.append(item);
            }
            var edgeItems = jQuery(".debug-bar-edge", edges);
            edgeItems.click(function() {
                var element = jQuery(this);
                var edge = element.data("edge");
                _type(element.attr("data-code"), edge.interval, edge);
            });

            // registers for the panel being shown so that the presets and the
            // classes of the entities are retrieved, once, the first time
            panel.bind("shown", function() {
                if (panel.data("loaded")) {
                    return;
                }
                panel.data("loaded", true);
                _presets(function(data) {
                    _renderPresets(data.scans);
                });
                jQuery.uquery({
                    url: "omni_util/class_ids.json",
                    data: {},
                    success: function(data) {
                        classes = data || [];
                        _build();
                    },
                    error: function(request, status, error) {
                        logger.warn("Classes retrieval failed:", request.status, error);
                    }
                });
            });

            // renders the recent codes and the initial (empty) code
            _renderRecent();
            _build();
        };

        /**
         * Builds the panel of the print tool, the gateway that the page prints
         * with (as resolved by the print plugin, from the settings of the
         * instance and the local storage of this browser) and the tests that
         * print the documents of the presets of the instance.
         *
         * @param {Element}
         *            panel The panel of the tool to be built.
         */
        var _buildPrint = function(panel) {
            panel.append("<div class=\"debug-bar-column debug-bar-half\">"
                + "<span class=\"debug-bar-title\">" + jQuery.uxlocale("Gateway of this page")
                + "</span>" + "<ul class=\"debug-bar-values debug-bar-gateway\"></ul>" + "</div>"
                + "<div class=\"debug-bar-column debug-bar-wide\">"
                + "<span class=\"debug-bar-title\">" + jQuery.uxlocale("Test") + "</span>"
                + "<div class=\"debug-bar-row\">"
                + "<span class=\"debug-bar-button debug-bar-primary debug-bar-print-receipt"
                + " disabled\">" + jQuery.uxlocale("Print a test receipt") + "</span>"
                + "<span class=\"debug-bar-button debug-bar-primary debug-bar-print-label"
                + " disabled\">" + jQuery.uxlocale("Print a test label") + "</span>" + "</div>"
                + "<span class=\"debug-bar-status debug-bar-print-status\"></span>"
                + "<span class=\"debug-bar-hint\">"
                + jQuery.uxlocale("The tests print a document of this instance through"
                    + " uxgprint, with the gateway above, as the documents of the pages do")
                + "</span>" + "</div>");

            // retrieves the references to the elements of the panel that are
            // going to be used in the printing of the documents
            var gatewayList = jQuery(".debug-bar-gateway", panel);
            var printReceipt = jQuery(".debug-bar-print-receipt", panel);
            var printLabel = jQuery(".debug-bar-print-label", panel);
            var printStatus = jQuery(".debug-bar-print-status", panel);

            // starts the variables that hold the documents of the presets to
            // be printed (once retrieved) and the elements that print them
            var receipt = null;
            var label = null;
            var receiptElement = null;
            var labelElement = null;

            /**
             * Resolves the gateway that the page prints with, as the print
             * plugin does, each value of the local storage of this browser
             * taking precedence over the one of the settings of the instance,
             * except for the printers, only used with the node they belong to,
             * and with the node and the printer of the labels taking precedence
             * over the general ones for the labels.
             *
             * @return {Object} The values of the gateway with their sources.
             */
            var _gateway = function() {
                var urlLocal = _get("uxf:gateway:base_url");
                var keyLocal = _get("uxf:gateway:key");
                var nodeLocal = _get("uxf:gateway:node:id");
                var printerLocal = _get("uxf:gateway:printer:id");
                var labelNodeLocal = _get("uxf:gateway:label:node:id");
                var labelPrinterLocal = _get("uxf:gateway:label:printer:id");
                var url = urlLocal || _body.data("colony_print_url") || "";
                var key = keyLocal || _body.data("colony_print_key") || "";
                var node = nodeLocal || _body.data("colony_print_node") || "";
                var printer = printerLocal || (nodeLocal ? ""
                    : _body.data("colony_print_printer")) || "";
                var labelNode = labelNodeLocal || (labelPrinterLocal && nodeLocal ? ""
                    : _body.data("colony_print_label_node")) || "";
                var labelPrinter = labelPrinterLocal
                    || (labelNodeLocal || (nodeLocal && !labelNode) ? ""
                        : _body.data("colony_print_label_printer")) || "";
                var nodeSource = nodeLocal ? "this browser" : "settings";
                var printerSource = printerLocal ? "this browser" : "settings";
                return {
                    url: url,
                    urlSource: urlLocal ? "this browser" : "settings",
                    key: key,
                    keySource: keyLocal ? "this browser" : "settings",
                    node: node,
                    nodeSource: nodeSource,
                    printer: printer,
                    printerSource: printerSource,
                    labelNode: labelNode || node,
                    labelNodeSource: labelNodeLocal ? "this browser" : labelNode ? "settings"
                        : nodeSource,
                    labelPrinter: labelPrinter || (labelNode ? "" : printer),
                    labelPrinterSource: labelPrinterLocal ? "this browser" : labelPrinter
                        ? "settings" : printerSource
                };
            };

            /**
             * Renders the values of the gateway that the page prints with, the
             * kind of the gateway (the cloud print, the plugin of the browser
             * or none) and the fallback of the receipt.
             */
            var _render = function() {
                var gateway = _gateway();
                var isCloud = gateway.url && gateway.key && gateway.node;
                var plugin = _document.uxg ? _document.uxg() : null;
                _values(gatewayList, [{
                    name: "gateway",
                    label: "Gateway",
                    value: isCloud ? "Colony Print" : plugin ? jQuery.uxlocale("Browser plugin")
                        : null,
                    state: isCloud || plugin ? "success" : "warning"
                }, {
                    name: "base_url",
                    label: "Base URL",
                    value: gateway.url,
                    source: gateway.urlSource
                }, {
                    name: "key",
                    label: "Key",
                    value: _mask(gateway.key),
                    source: gateway.keySource
                }, {
                    name: "node",
                    label: "Node",
                    value: gateway.node,
                    source: gateway.nodeSource
                }, {
                    name: "printer",
                    label: "Printer",
                    value: gateway.printer,
                    source: gateway.printerSource
                }, {
                    name: "label_node",
                    label: "Label node",
                    value: gateway.labelNode,
                    source: gateway.labelNodeSource
                }, {
                    name: "label_printer",
                    label: "Label printer",
                    value: gateway.labelPrinter,
                    source: gateway.labelPrinterSource
                }, {
                    name: "fallback",
                    label: "Fallback",
                    value: receipt && receipt.fallback ? jQuery.uxresolve(_url(receipt.fallback))
                        : null
                }]);
            };

            /**
             * Creates the (hidden) element that prints the provided document
             * of the presets through the print plugin, with the attributes of
             * the print links of the pages, with its fallback in case it has one.
             *
             * @param {Object}
             *            item The document of the presets to be printed.
             * @param {Boolean}
             *            isLabel If the document is a label (printed with the
             *            node and the printer of the labels).
             * @return {Element} The element that prints the document.
             */
            var _element = function(item, isLabel) {
                var element = jQuery("<span class=\"debug-bar-print-document\"></span>");
                element.attr("data-binie", _url(item.url));
                isLabel && element.attr("data-label", "1");
                item.fallback && element.attr("data-fallback", _url(item.fallback));
                item.fallback && element.attr("data-target", "_blank");
                panel.append(element);
                return element;
            };

            /**
             * Prints the provided document of the presets with its element and
             * shows where it has been sent to (the node and the printer of the
             * cloud print, the plugin of the browser or the fallback).
             *
             * @param {Object}
             *            item The document of the presets to be printed.
             * @param {Element}
             *            element The element that prints the document.
             * @param {Boolean}
             *            isLabel If the document is a label.
             */
            var _print = function(item, element, isLabel) {
                var gateway = _gateway();
                var node = isLabel ? gateway.labelNode : gateway.node;
                var printer = isLabel ? gateway.labelPrinter : gateway.printer;
                var isCloud = gateway.url && gateway.key && node;
                var plugin = _document.uxg ? _document.uxg() : null;
                element.uxgprint("print");
                printStatus.removeClass("warning");
                if (isCloud) {
                    printStatus.text(String.prototype.formatC.apply(
                        jQuery.uxlocale("Sent %s to %s (%s)"), [item.name,
                            printer || jQuery.uxlocale("the default printer"), node]));
                } else if (plugin) {
                    printStatus.text(String.prototype.formatC.apply(
                        jQuery.uxlocale("Sent %s to the browser plugin"), [item.name]));
                } else if (item.fallback) {
                    printStatus.text(String.prototype.formatC.apply(
                        jQuery.uxlocale("No gateway, opened the fallback of %s"), [item.name]));
                } else {
                    printStatus.addClass("warning");
                    printStatus.text(String.prototype.formatC.apply(
                        jQuery.uxlocale("No gateway nor fallback, %s was not printed"),
                        [item.name]));
                }
                logger.info("Test print of document:", item.url);
            };

            // registers for the clicks in the print buttons so that the
            // documents of the presets are printed (once retrieved)
            printReceipt.click(function() {
                receipt && _print(receipt, receiptElement, false);
            });
            printLabel.click(function() {
                label && _print(label, labelElement, true);
            });

            // registers for the panel being shown so that the gateway is
            // rendered again (it may have been changed in the local storage)
            // and the documents of the presets retrieved, the first time
            panel.bind("shown", function() {
                _render();
                if (panel.data("loaded")) {
                    return;
                }
                panel.data("loaded", true);
                _presets(function(data) {
                    for (var index = data.documents.length - 1; index >= 0; index--) {
                        var item = data.documents[index];
                        item.kind === "receipt" && (receipt = item);
                        item.kind === "label" && (label = item);
                    }
                    receipt && (receiptElement = _element(receipt, false));
                    label && (labelElement = _element(label, true));
                    printReceipt.toggleClass("disabled", !receipt);
                    printLabel.toggleClass("disabled", !label);
                    !receipt && !label && printStatus.text(
                        jQuery.uxlocale("No documents to print on this instance"));
                    _render();
                });
            });
        };

        /**
         * Builds the panel of the pushi tool, the connection of the panel of
         * the notifications to the pushi server (its state, server, key, socket
         * and channels) and the tests of the notifications sent by the server.
         *
         * @param {Element}
         *            panel The panel of the tool to be built.
         */
        var _buildPushi = function(panel) {
            panel.append("<div class=\"debug-bar-column debug-bar-half\">"
                + "<span class=\"debug-bar-title\">" + jQuery.uxlocale("Connection") + "</span>"
                + "<ul class=\"debug-bar-values debug-bar-pushi-values\"></ul>" + "</div>"
                + "<div class=\"debug-bar-column debug-bar-half\">"
                + "<span class=\"debug-bar-title\">" + jQuery.uxlocale("Channels") + "</span>"
                + "<ul class=\"debug-bar-chips debug-bar-channels\"></ul>" + "</div>"
                + "<div class=\"debug-bar-column debug-bar-wide\">"
                + "<span class=\"debug-bar-title\">" + jQuery.uxlocale("Test") + "</span>"
                + "<div class=\"debug-bar-row\">"
                + "<span class=\"debug-bar-button debug-bar-primary debug-bar-pushi-test\">"
                + jQuery.uxlocale("Send a test notification") + "</span>"
                + "<span class=\"debug-bar-button debug-bar-pushi-reconnect\">"
                + jQuery.uxlocale("Reconnect") + "</span>" + "</div>"
                + "<span class=\"debug-bar-status debug-bar-pushi-status\"></span>"
                + "<span class=\"debug-bar-hint\">"
                + jQuery.uxlocale("The test is sent by the server (as the test of the local"
                    + " services) and comes back through the socket to the notifications panel")
                + "</span>" + "</div>");

            // retrieves the references to the elements of the panel and to
            // the panel of the notifications, that holds the pushi connection
            var valuesList = jQuery(".debug-bar-pushi-values", panel);
            var channels = jQuery(".debug-bar-channels", panel);
            var pushiTest = jQuery(".debug-bar-pushi-test", panel);
            var pushiReconnect = jQuery(".debug-bar-pushi-reconnect", panel);
            var pushiStatus = jQuery(".debug-bar-pushi-status", panel);
            var notifications = jQuery(".notifications-menu", _body);

            /**
             * The names of the events of the pushi connection that change the
             * values rendered by the tool.
             */
            var PUSHI_EVENTS = ["connect", "disconnect", "subscribe", "unsubscribe"];

            // starts the variable that holds the pushi connection whose events
            // are registered, so that they're unregistered once destroyed
            var bound = null;

            /**
             * The handler of the events of the pushi connection, that renders
             * the values of the connection again.
             */
            var onPushi = function() {
                _render();
            };

            /**
             * Renders the values of the pushi connection of the panel of the
             * notifications and its subscribed channels, registering for its
             * events (once) so that they're rendered again on any change.
             */
            var _render = function() {
                var pushi = notifications.data("pushi") || null;
                var isConnected = pushi && pushi.state === "connected";
                _values(valuesList, [{
                    name: "state",
                    label: "State",
                    value: jQuery.uxlocale(!pushi ? "Not available" : isConnected ? "Connected"
                        : "Disconnected"),
                    state: isConnected ? "success" : "warning"
                }, {
                    name: "server",
                    label: "Server",
                    value: pushi && pushi.baseUrl
                }, {
                    name: "app_key",
                    label: "App key",
                    value: pushi && _mask(pushi.appKey)
                }, {
                    name: "socket",
                    label: "Socket",
                    value: pushi && pushi.socketId
                }]);
                var names = [];
                var _channels = (pushi && pushi.channels) || {};
                for (var name in _channels) {
                    _channels[name] && _channels[name].subscribed && names.push(name);
                }
                names.sort();
                _chips(channels, names, "No channel subscribed");
                pushiReconnect.toggleClass("disabled", !pushi);
                if (!pushi || bound) {
                    return;
                }
                bound = pushi;
                for (var index = 0; index < PUSHI_EVENTS.length; index++) {
                    pushi.bind(PUSHI_EVENTS[index], onPushi);
                }
            };

            // registers for the click in the test button so that the server
            // sends the test notification (as the test of the local services)
            // through pushi to the panel of the notifications
            pushiTest.click(function() {
                pushiStatus.removeClass("warning");
                pushiStatus.text(jQuery.uxlocale("Requesting the test notification"));
                jQuery.uquery({
                    type: "post",
                    url: "omni_adm/local_services/notify_test.json",
                    data: {},
                    success: function() {
                        pushiStatus.text(jQuery.uxlocale(
                            "Test notification requested, it comes back through the socket"));
                        logger.info("Test notification requested:", "notification.test");
                    },
                    error: function(request, status, error) {
                        pushiStatus.addClass("warning");
                        pushiStatus.text(String.prototype.formatC.apply(
                            jQuery.uxlocale("The test notification failed (%s)"),
                            [request.status]));
                        logger.warn("Test notification failed:", request.status, error);
                    }
                });
            });

            // registers for the click in the reconnect button so that the
            // pushi connection is closed and opened again (or opened in case
            // it's not connected)
            pushiReconnect.click(function() {
                var pushi = notifications.data("pushi");
                if (!pushi) {
                    return;
                }
                var _reconnected = function() {
                    pushiStatus.text(jQuery.uxlocale("Reconnected"));
                    _render();
                };
                pushiStatus.removeClass("warning");
                pushiStatus.text(jQuery.uxlocale("Reconnecting"));
                pushi.state === "connected" ? pushi.reopen(_reconnected)
                    : pushi.open(_reconnected);
                logger.info("Pushi reconnecting to:", pushi.baseUrl);
            });

            // registers for the panel being shown so that the values of the
            // connection are rendered again, and for the destruction of the
            // bar so that the events of the connection are unregistered
            panel.bind("shown", _render);
            matchedObject.bind("destroyed", function() {
                for (var index = 0; bound && index < PUSHI_EVENTS.length; index++) {
                    bound.unbind(PUSHI_EVENTS[index], onPushi);
                }
            });
        };

        /**
         * Builds the panel of the errors tool, that raises errors as real ones
         * would be (a javascript error, an unhandled rejection, a failed async
         * link and a server error) and shows the last error of the page.
         *
         * @param {Element}
         *            panel The panel of the tool to be built.
         */
        var _buildErrors = function(panel) {
            panel.append("<div class=\"debug-bar-column debug-bar-half\">"
                + "<ul class=\"debug-bar-error-actions\"></ul>" + "</div>"
                + "<div class=\"debug-bar-column debug-bar-wide\">"
                + "<span class=\"debug-bar-title\">" + jQuery.uxlocale("Last error") + "</span>"
                + "<span class=\"debug-bar-last-error\"></span>"
                + "<span class=\"debug-bar-hint\">"
                + jQuery.uxlocale("Each error is raised as a real one would be, so that the"
                    + " error notifications, the logs and the reporting of the errors are"
                    + " tested end to end")
                + "</span>" + "</div>");

            // retrieves the references to the elements of the panel that are
            // going to be used in the raising of the errors
            var actions = jQuery(".debug-bar-error-actions", panel);
            var lastError = jQuery(".debug-bar-last-error", panel);

            /**
             * The errors raised by the tool, each one with its name, its label
             * and hint (to be localized) and the function that raises it.
             */
            var ERRORS = [{
                name: "throw",
                label: "Throw a JavaScript error",
                hint: "An error of a handler, caught by the window",
                raise: function() {
                    setTimeout(function() {
                        throw new Error("Debug bar test error");
                    }, 0);
                }
            }, {
                name: "reject",
                label: "Reject a promise",
                hint: "A rejection that nothing handles",
                raise: function() {
                    window.Promise && window.Promise.reject(new Error("Debug bar test rejection"));
                }
            }, {
                name: "link",
                label: "Fail an async link",
                hint: "The asynchronous navigation to a missing page, then loaded",
                raise: function() {
                    jQuery.uxlocation(_url("omni_util/debug_missing"));
                }
            }, {
                name: "request",
                label: "Request a server error",
                hint: "A request answered with an error 500",
                raise: function() {
                    jQuery.uquery({
                        url: "omni_util/debug_error.json",
                        data: {},
                        error: function(request, status, error) {
                            logger.error("Request failed:", "omni_util/debug_error.json",
                                request.status, error);
                            _body.uxnotification({
                                type: "error",
                                title: jQuery.uxlocale("Server error"),
                                message: String.prototype.formatC.apply(jQuery.uxlocale(
                                    "There was an error processing the request (%s)"),
                                    [request.status])
                            });
                        }
                    });
                }
            }];

            // adds the errors to the list of actions, each one with its label
            // and its hint, raising the error on its click
            for (var index = 0; index < ERRORS.length; index++) {
                var item = jQuery("<li class=\"debug-bar-error-action\">"
                    + "<span class=\"debug-bar-error-label\"></span>"
                    + "<span class=\"debug-bar-error-hint\"></span>" + "</li>");
                var labelElement = jQuery(".debug-bar-error-label", item);
                var hintElement = jQuery(".debug-bar-error-hint", item);
                item.attr("data-name", ERRORS[index].name);
                item.data("error", ERRORS[index]);
                labelElement.text(jQuery.uxlocale(ERRORS[index].label));
                hintElement.text(jQuery.uxlocale(ERRORS[index].hint));
                actions.append(item);
            }
            var items = jQuery(".debug-bar-error-action", actions);
            items.click(function() {
                var element = jQuery(this);
                var error = element.data("error");
                logger.info("Error raised:", error.name);
                error.raise();
            });

            /**
             * Renders the last error of the page, the newest record of the logs
             * with the error level, or the message of no errors.
             */
            var _render = function() {
                var records = _window.data("udebug_records");
                for (var index = records.length - 1; index >= 0; index--) {
                    var record = records[index];
                    if (record.level !== "error" && record.level !== "critical") {
                        continue;
                    }
                    lastError.removeClass("empty");
                    lastError.text(_time(record.time) + " " + record.name + " "
                        + record.message);
                    return;
                }
                lastError.addClass("empty");
                lastError.text(jQuery.uxlocale("None in this page"));
            };

            // registers for the records and the clear of the bar so that the
            // last error is rendered again, and renders it
            matchedObject.bind("record clear", _render);
            _render();
        };

        /**
         * Builds the panel of the storage tool, the keys of omni and of uxf in
         * the local storage of this browser, each one removable.
         *
         * @param {Element}
         *            panel The panel of the tool to be built.
         */
        var _buildStorage = function(panel) {
            panel.addClass("debug-bar-tool-list");
            panel.append("<div class=\"debug-bar-toolbar\">"
                + "<span class=\"debug-bar-summary debug-bar-storage-summary\"></span>"
                + "<span class=\"debug-bar-button debug-bar-storage-omni\">"
                + jQuery.uxlocale("Clear Omni keys") + "</span>"
                + "<span class=\"debug-bar-button debug-bar-storage-all\">"
                + jQuery.uxlocale("Clear all") + "</span>" + "</div>"
                + "<ul class=\"debug-bar-storage\"></ul>");

            // retrieves the references to the elements of the panel that are
            // going to be used in the rendering of the keys
            var summary = jQuery(".debug-bar-storage-summary", panel);
            var clearOmni = jQuery(".debug-bar-storage-omni", panel);
            var clearAll = jQuery(".debug-bar-storage-all", panel);
            var list = jQuery(".debug-bar-storage", panel);

            /**
             * Renders the keys of omni and of uxf in the local storage with
             * their values and the buttons that remove them.
             */
            var _render = function() {
                var keys = _keys(["omni:", "uxf:"]);
                list.empty();
                for (var index = 0; index < keys.length; index++) {
                    var item = jQuery("<li class=\"debug-bar-storage-item\">"
                        + "<span class=\"debug-bar-storage-key\"></span>"
                        + "<span class=\"debug-bar-storage-value\"></span>"
                        + "<span class=\"debug-bar-storage-remove\">&#215;</span>" + "</li>");
                    var keyElement = jQuery(".debug-bar-storage-key", item);
                    var valueElement = jQuery(".debug-bar-storage-value", item);
                    var removeElement = jQuery(".debug-bar-storage-remove", item);
                    item.attr("data-key", keys[index]);
                    removeElement.attr("data-key", keys[index]);
                    keyElement.text(keys[index]);
                    valueElement.text(_get(keys[index]));
                    removeElement.attr("title", jQuery.uxlocale("Remove the key"));
                    list.append(item);
                }
                keys.length === 0 && list.append("<li class=\"debug-bar-storage-empty\">"
                    + jQuery.uxlocale("No keys of Omni or uxf in this browser") + "</li>");
                summary.text(String.prototype.formatC.apply(jQuery.uxlocale(
                    "%s keys of Omni and uxf in the local storage of this browser"),
                    [keys.length]));
                var removes = jQuery(".debug-bar-storage-remove", list);
                removes.click(function() {
                    var element = jQuery(this);
                    _remove(element.attr("data-key"));
                    _render();
                });
            };

            /**
             * Removes the keys of the local storage with the provided prefixes,
             * once confirmed by the user (as the preferences kept by the pages
             * in the browser are lost), rendering the keys again, nothing being
             * asked in case there's no key to be removed.
             *
             * @param {Array}
             *            prefixes The prefixes of the keys to be removed.
             * @param {String}
             *            message The message of the confirmation, formatted
             *            with the number of the keys to be removed.
             */
            var _clear = function(prefixes, message) {
                var keys = _keys(prefixes);
                if (keys.length === 0) {
                    return;
                }

                // asks for the confirmation of the removal, the keys being
                // removed only in the callback of the confirmation, as the
                // confirmation window returns before it's answered
                _body.uxconfirm(String.prototype.formatC.apply(jQuery.uxlocale(message),
                        [keys.length]) + "\\n"
                    + jQuery.uxlocale("The preferences kept by the pages in this browser are lost."),
                    function(result) {
                        if (!result) {
                            return;
                        }

                        for (var index = 0; index < keys.length; index++) {
                            _remove(keys[index]);
                        }
                        logger.info("Storage keys removed:", keys.length);
                        _render();
                    });
            };

            // registers for the clicks in the clear buttons so that the keys
            // of omni (or of both omni and uxf) are removed, once confirmed,
            // and for the panel being shown so that the keys are rendered again
            clearOmni.click(function() {
                _clear(["omni:"],
                    "Remove the %s keys of Omni from the local storage of this browser?");
            });
            clearAll.click(function() {
                _clear(["omni:", "uxf:"],
                    "Remove the %s keys of Omni and uxf from the local storage of this browser?");
            });
            panel.bind("shown", _render);
        };

        /**
         * Builds the panel of the page tool, the values of the page (its route,
         * paths, section and last async navigation), the classes of the body,
         * with a switch forcing the ones of a phone, and the timings of the
         * loading of the page.
         *
         * @param {Element}
         *            panel The panel of the tool to be built.
         */
        var _buildPage = function(panel) {
            panel.append("<div class=\"debug-bar-column debug-bar-half\">"
                + "<span class=\"debug-bar-title\">" + jQuery.uxlocale("Page") + "</span>"
                + "<ul class=\"debug-bar-values debug-bar-page-values\"></ul>" + "</div>"
                + "<div class=\"debug-bar-column debug-bar-half\">"
                + "<span class=\"debug-bar-title\">" + jQuery.uxlocale("Body classes")
                + "</span>" + "<ul class=\"debug-bar-chips debug-bar-classes\"></ul>"
                + "<label class=\"debug-bar-option\">"
                + "<input type=\"checkbox\" class=\"debug-bar-phone\" /> "
                + jQuery.uxlocale("Force the classes of a phone (mobile-s, touch)") + "</label>"
                + "</div>" + "<div class=\"debug-bar-column debug-bar-wide\">"
                + "<span class=\"debug-bar-title\">" + jQuery.uxlocale("Timings") + "</span>"
                + "<ul class=\"debug-bar-values debug-bar-timing-values\"></ul>" + "</div>");

            // retrieves the references to the elements of the panel that are
            // going to be used in the rendering of the page
            var pageList = jQuery(".debug-bar-page-values", panel);
            var classes = jQuery(".debug-bar-classes", panel);
            var phone = jQuery(".debug-bar-phone", panel);
            var timingList = jQuery(".debug-bar-timing-values", panel);

            // starts the variables that hold the classes of the body added and
            // removed while the classes of a phone are forced
            var added = [];
            var removed = [];

            /**
             * Retrieves the route of the provided URL, relative to the mvc path
             * of the page (eg: omni_pos/sales), or its path in case it's not
             * under the mvc path.
             *
             * @param {String}
             *            href The URL to retrieve the route for.
             * @return {String} The route of the URL.
             */
            var _route = function(href) {
                var base = jQuery.uxresolve(_body.data("mvc_path") || "");
                href = href.split("#")[0];
                return href.indexOf(base) === 0 ? href.slice(base.length) : href;
            };

            /**
             * Converts the provided duration (in milliseconds) into a string,
             * an invalid value in case there's no duration (eg: still loading).
             *
             * @param {Number}
             *            value The duration to be converted.
             * @return {String} The duration as a string.
             */
            var _duration = function(value) {
                return value > 0 ? Math.round(value) + " ms" : null;
            };

            /**
             * Renders the values of the page, the classes of the body and the
             * timings of the loading of the page (from the performance API).
             */
            var _render = function() {
                var navigation = _window.data("udebug_navigation");
                var section = jQuery(".meta > #section", _body);
                _values(pageList, [{
                    name: "route",
                    label: "Route",
                    value: _route(document.location.href)
                }, {
                    name: "base_path",
                    label: "Base path",
                    value: _body.data("base_path")
                }, {
                    name: "mvc_path",
                    label: "MVC path",
                    value: _body.data("mvc_path")
                }, {
                    name: "section",
                    label: "Section",
                    value: section.text()
                }, {
                    name: "navigation",
                    label: "Last navigation",
                    value: navigation ? String.prototype.formatC.apply(
                        jQuery.uxlocale("%s, %s ms (%s)"), [_route(navigation.href),
                            navigation.duration, navigation.events.join(", ")])
                        : jQuery.uxlocale("None, loaded in full")
                }]);

                var names = String(_body.attr("class") || "").split(/\s+/);
                for (var index = names.length - 1; index >= 0; index--) {
                    !names[index] && names.splice(index, 1);
                }
                var chips = _chips(classes, names, "No classes");
                chips.each(function() {
                    var element = jQuery(this);
                    var name = element.attr("data-name");
                    added.indexOf(name) !== -1 && element.addClass("forced");
                });

                var performance = window.performance || null;
                var entries = performance && performance.getEntriesByType
                    ? performance.getEntriesByType("navigation") : [];
                var resources = performance && performance.getEntriesByType
                    ? performance.getEntriesByType("resource") : [];
                var entry = entries.length ? entries[0] : null;
                var timing = (performance && performance.timing) || null;
                var start = timing ? timing.navigationStart : 0;
                var size = entry ? entry.transferSize || 0 : 0;
                for (var index = 0; index < resources.length; index++) {
                    size += resources[index].transferSize || 0;
                }
                _values(timingList, [{
                    name: "server",
                    label: "Server",
                    value: _duration(entry ? entry.responseStart - entry.requestStart
                        : timing ? timing.responseStart - timing.requestStart : 0)
                }, {
                    name: "ready",
                    label: "DOM ready",
                    value: _duration(entry ? entry.domContentLoadedEventEnd
                        : timing ? timing.domContentLoadedEventEnd - start : 0)
                }, {
                    name: "load",
                    label: "Load",
                    value: _duration(entry ? entry.loadEventEnd
                        : timing ? timing.loadEventEnd - start : 0)
                }, {
                    name: "requests",
                    label: "Requests",
                    value: String.prototype.formatC.apply(jQuery.uxlocale("%s, %s KB"),
                        [resources.length + 1, Math.round(size / 1024)])
                }]);
            };

            // registers for the change of the phone switch so that the classes
            // of a phone are forced in the body (removing the ones of the other
            // devices) or the original classes restored, until the size of the
            // window changes (when the classes of its size are set again)
            phone.change(function() {
                if (phone.is(":checked")) {
                    added = [];
                    removed = [];
                    for (var index = 0; index < PHONE_CLASSES.length; index++) {
                        var name = PHONE_CLASSES[index];
                        !_body.hasClass(name) && added.push(name);
                        _body.addClass(name);
                    }
                    for (var index = 0; index < DEVICE_CLASSES.length; index++) {
                        var name = DEVICE_CLASSES[index];
                        _body.hasClass(name) && removed.push(name);
                        _body.removeClass(name);
                    }
                    logger.info("Phone classes forced:", added.join(", "));
                } else {
                    for (var index = 0; index < added.length; index++) {
                        _body.removeClass(added[index]);
                    }
                    for (var index = 0; index < removed.length; index++) {
                        _body.addClass(removed[index]);
                    }
                    logger.info("Phone classes restored:", removed.join(", "));
                    added = [];
                    removed = [];
                }
                _render();
            });

            // registers for the asynchronous navigation of the page (kept by
            // the bar) and for the panel being shown so that the values are
            // rendered again, unregistering once the bar is destroyed
            var onNavigation = null;
            _body.bind("debug_navigation", onNavigation = function() {
                _render();
            });
            matchedObject.bind("destroyed", function() {
                _body.unbind("debug_navigation", onNavigation);
            });
            panel.bind("shown", _render);
        };

        /**
         * Builds the panel of the settings tool, the feature flags and the
         * global settings of the instance (as retrieved from the server, once
         * shown), filtered by their names or keys, marking the flags whose
         * value in the session differs from their value.
         *
         * @param {Element}
         *            panel The panel of the tool to be built.
         */
        var _buildSettings = function(panel) {
            panel.addClass("debug-bar-tool-list");
            panel.append("<div class=\"debug-bar-toolbar\">"
                + "<label class=\"debug-bar-label\">" + jQuery.uxlocale("Filter") + "</label>"
                + "<input type=\"text\" class=\"debug-bar-input debug-bar-settings-filter\""
                + " autocomplete=\"off\" placeholder=\"" + jQuery.uxlocale("Name or key")
                + "\" />" + "<span class=\"debug-bar-summary\">"
                + jQuery.uxlocale("The flags read by the pages apply at the next login, as the"
                    + " session keeps them")
                + "</span>" + "</div>" + "<div class=\"debug-bar-table-header\">"
                + "<span class=\"debug-bar-setting-name\">" + jQuery.uxlocale("Name") + "</span>"
                + "<span class=\"debug-bar-setting-key\">" + jQuery.uxlocale("Key") + "</span>"
                + "<span class=\"debug-bar-setting-value\">" + jQuery.uxlocale("Value")
                + "</span>" + "<span class=\"debug-bar-setting-source\">"
                + jQuery.uxlocale("Source") + "</span>"
                + "<span class=\"debug-bar-setting-applies\">" + jQuery.uxlocale("Applies")
                + "</span>" + "</div>" + "<ul class=\"debug-bar-settings\"></ul>");

            // retrieves the references to the elements of the panel that are
            // going to be used in the rendering of the settings
            var filter = jQuery(".debug-bar-settings-filter", panel);
            var list = jQuery(".debug-bar-settings", panel);

            // starts the variable that holds the flags and the settings of the
            // instance, once retrieved from the server
            var settings = null;

            /**
             * Renders the flags and the settings of the instance that match the
             * text of the filter (in their names or keys), the flags first.
             */
            var _render = function() {
                list.empty();
                if (!settings) {
                    list.append("<li class=\"debug-bar-settings-empty\">"
                        + jQuery.uxlocale("Loading") + "</li>");
                    return;
                }
                var query = String(filter.val()).toLowerCase().replace(/^\s+|\s+$/g, "");
                var flags = settings.flags || [];
                var _settings = settings.settings || [];
                var items = [];
                for (var index = 0; index < flags.length; index++) {
                    items.push([flags[index], "flag"]);
                }
                for (var index = 0; index < _settings.length; index++) {
                    items.push([_settings[index], "setting"]);
                }
                var count = 0;
                for (var index = 0; index < items.length; index++) {
                    var setting = items[index][0];
                    var kind = items[index][1];
                    var name = String(setting.name || "");
                    var key = String(setting.key || "");
                    var matches = !query || name.toLowerCase().indexOf(query) !== -1
                        || key.toLowerCase().indexOf(query) !== -1;
                    if (!matches) {
                        continue;
                    }

                    // builds the value of the setting (enabled or disabled for
                    // the flags) and, for the flags, the value of the session,
                    // that differs from the value until the next login
                    var isFlag = kind === "flag";
                    var session = isFlag && setting.session !== null
                        && setting.session !== undefined
                        ? setting.session === "1" || setting.session === "true" : null;
                    var differs = session !== null && session !== Boolean(setting.value);
                    var value = isFlag ? jQuery.uxlocale(setting.value ? "Enabled" : "Disabled")
                        : setting.value === null || setting.value === undefined
                            ? jQuery.uxlocale("Not set or hidden") : String(setting.value);

                    var item = jQuery("<li class=\"debug-bar-setting\">"
                        + "<span class=\"debug-bar-setting-name\"></span>"
                        + "<span class=\"debug-bar-setting-key\"></span>"
                        + "<span class=\"debug-bar-setting-value\"></span>"
                        + "<span class=\"debug-bar-setting-source\"></span>"
                        + "<span class=\"debug-bar-setting-applies\"></span>" + "</li>");
                    var nameElement = jQuery(".debug-bar-setting-name", item);
                    var keyElement = jQuery(".debug-bar-setting-key", item);
                    var valueElement = jQuery(".debug-bar-setting-value", item);
                    var sourceElement = jQuery(".debug-bar-setting-source", item);
                    var appliesElement = jQuery(".debug-bar-setting-applies", item);
                    item.attr("data-key", key);
                    item.attr("data-kind", kind);
                    differs && item.addClass("differs");
                    nameElement.text(name);
                    keyElement.text(key);
                    valueElement.text(value);
                    isFlag && valueElement.addClass(setting.value ? "enabled" : "disabled");
                    sourceElement.text(jQuery.uxlocale(SOURCES[setting.source]
                        || setting.source || ""));
                    appliesElement.text(jQuery.uxlocale(APPLIES[setting.applies]
                        || setting.applies || ""));
                    if (differs) {
                        var sessionElement = jQuery("<span class=\"debug-bar-setting-session\">"
                            + "</span>");
                        sessionElement.text(String.prototype.formatC.apply(
                            jQuery.uxlocale("%s in this session, until the next login"),
                            [jQuery.uxlocale(session ? "Enabled" : "Disabled")]));
                        valueElement.append(sessionElement);
                    }
                    list.append(item);
                    count++;
                }
                count === 0 && list.append("<li class=\"debug-bar-settings-empty\">"
                    + jQuery.uxlocale("No settings match the filter") + "</li>");
            };

            // registers for the typing in the filter so that the settings are
            // rendered again, and for the panel being shown so that the flags
            // and the settings are retrieved, the first time
            filter.bind("keyup", _render);
            panel.bind("shown", function() {
                if (panel.data("loaded")) {
                    return;
                }
                panel.data("loaded", true);
                jQuery.uquery({
                    url: "omni_util/debug_settings.json",
                    data: {},
                    success: function(data) {
                        settings = data || {};
                        _render();
                    },
                    error: function(request, status, error) {
                        logger.warn("Settings retrieval failed:", request.status, error);
                        settings = {};
                        _render();
                    }
                });
            });
            _render();
        };

        /**
         * Builds the panel of the permissions tool, the permissions of the
         * session (as retrieved from the server, once shown) as columns of the
         * segments of their keys (split by their dots), filtered by their keys
         * and opened with the mouse or the arrows of the keyboard, and the
         * check of a permission by its key.
         *
         * @param {Element}
         *            panel The panel of the tool to be built.
         */
        var _buildPermissions = function(panel) {
            panel.append("<div class=\"debug-bar-column debug-bar-wide\">"
                + "<div class=\"debug-bar-row debug-bar-permissions-header\">"
                + "<span class=\"debug-bar-title\">" + jQuery.uxlocale("User type") + "</span>"
                + "<span class=\"debug-bar-permissions-type\"></span>"
                + "<span class=\"debug-bar-permissions-count\"></span>"
                + "<input type=\"text\" class=\"debug-bar-input debug-bar-permissions-filter\""
                + " autocomplete=\"off\" placeholder=\""
                + jQuery.uxlocale("Filter, eg: sale") + "\" />" + "</div>"
                + "<div class=\"debug-bar-columns debug-bar-permissions\" tabindex=\"0\"></div>"
                + "</div>"
                + "<div class=\"debug-bar-column debug-bar-half\">"
                + "<span class=\"debug-bar-title\">" + jQuery.uxlocale("Check a permission")
                + "</span>" + "<div class=\"debug-bar-row\">"
                + "<input type=\"text\" class=\"debug-bar-input debug-bar-check\""
                + " autocomplete=\"off\" placeholder=\""
                + jQuery.uxlocale("eg: sale_transaction.show") + "\" />"
                + "<span class=\"debug-bar-button debug-bar-primary debug-bar-check-button\">"
                + jQuery.uxlocale("Check") + "</span>" + "</div>"
                + "<span class=\"debug-bar-status debug-bar-check-result\"></span>"
                + "<span class=\"debug-bar-hint\">"
                + jQuery.uxlocale("Answers why a user sees (or doesn't see) a page or an action:"
                    + " the key of its permission and the decision for the user type")
                + "</span>" + "<span class=\"debug-bar-hint\">"
                + jQuery.uxlocale("A click in a key (or the enter key) checks it here, and the"
                    + " arrows of the keyboard move in the columns")
                + "</span>" + "</div>");

            // retrieves the references to the elements of the panel that are
            // going to be used in the rendering of the permissions
            var type = jQuery(".debug-bar-permissions-type", panel);
            var count = jQuery(".debug-bar-permissions-count", panel);
            var filter = jQuery(".debug-bar-permissions-filter", panel);
            var list = jQuery(".debug-bar-permissions", panel);
            var check = jQuery(".debug-bar-check", panel);
            var checkButton = jQuery(".debug-bar-check-button", panel);
            var checkResult = jQuery(".debug-bar-check-result", panel);
            var userType = jQuery(".debug-bar-session > li[data-name=\"user_type\"]",
                matchedObject);

            // starts the variables that hold the permissions of the session,
            // once retrieved from the server, the tree of the segments of
            // their keys and the nodes of the segments opened in the columns
            var permissions = null;
            var root = null;
            var path = [];

            /**
             * Creates a node of the tree of the permissions, the one of the
             * segment with the provided name and path (the segments up to it
             * joined by dots), with no value nor children.
             *
             * @param {String}
             *            name The name of the segment of the node.
             * @param {String}
             *            nodePath The path of the node, its key.
             * @return {Object} The node that has been created.
             */
            var _node = function(name, nodePath) {
                return {
                    name: name,
                    path: nodePath,
                    value: null,
                    children: {},
                    list: [],
                    count: 0,
                    counts: {
                        allow: 0,
                        validate: 0,
                        deny: 0
                    }
                };
            };

            /**
             * Builds the tree of the segments of the keys of the provided
             * permissions (split by their dots), each node with the value of
             * its key (if it's the last segment of a key), its children sorted
             * by their names and the counts of the keys under it.
             *
             * @param {Array}
             *            items The permissions (keys and values) of the tree.
             * @return {Object} The root node of the tree.
             */
            var _tree = function(items) {
                // adds the nodes of the segments of each key (once), the
                // children being kept by their names prefixed, so that a
                // name of a property of the objects (eg: constructor) is
                // one more name, and the value to the node of its last one
                var tree = _node("", "");
                for (var index = 0; index < items.length; index++) {
                    var segments = String(items[index].key).split(".");
                    var node = tree;
                    for (var _index = 0; _index < segments.length; _index++) {
                        var name = "$" + segments[_index];
                        var child = node.children[name];
                        if (!child) {
                            child = _node(segments[_index], segments.slice(0, _index + 1).join("."));
                            node.children[name] = child;
                            node.list.push(child);
                        }
                        node = child;
                    }
                    node.value = PERMISSION_VALUES[items[index].value] || "allow";
                }

                // sorts the children of the nodes by their names and counts
                // the keys under each node by their values
                var _sort = function(node) {
                    node.list.sort(function(first, second) {
                        return first.name < second.name ? -1 : first.name > second.name ? 1 : 0;
                    });
                    node.count = node.value ? 1 : 0;
                    node.value && node.counts[node.value]++;
                    for (var index = 0; index < node.list.length; index++) {
                        var child = node.list[index];
                        _sort(child);
                        node.count += child.count;
                        for (var value in node.counts) {
                            node.counts[value] += child.counts[value];
                        }
                    }
                };
                _sort(tree);
                return tree;
            };

            /**
             * Retrieves the text of the filter of the permissions, in lower
             * case and with no spaces around it.
             *
             * @return {String} The text of the filter.
             */
            var _query = function() {
                return String(filter.val()).toLowerCase().replace(/^\s+|\s+$/g, "");
            };

            /**
             * Retrieves the paths of the nodes shown with the provided text of
             * the filter, the ones of the keys that contain it and of their
             * ancestors, each with the count of the keys under it that contain
             * it, an invalid value without a text (every node shown).
             *
             * @param {String}
             *            query The text of the filter.
             * @return {Object} The counts of the nodes shown by their paths.
             */
            var _visible = function(query) {
                if (!query) {
                    return null;
                }
                var visible = {};
                var _walk = function(node) {
                    var matches = node.value !== null
                        && node.path.toLowerCase().indexOf(query) !== -1 ? 1 : 0;
                    for (var index = 0; index < node.list.length; index++) {
                        matches += _walk(node.list[index]);
                    }
                    matches && (visible["$" + node.path] = matches);
                    return matches;
                };
                _walk(root);
                return visible;
            };

            /**
             * Retrieves the children of the provided node that are shown, the
             * ones in the provided paths (or every child without them).
             *
             * @param {Object}
             *            node The node whose children are retrieved.
             * @param {Object}
             *            visible The paths of the nodes shown, if any.
             * @return {Array} The children of the node that are shown.
             */
            var _children = function(node, visible) {
                var children = [];
                for (var index = 0; index < node.list.length; index++) {
                    var child = node.list[index];
                    (!visible || visible["$" + child.path]) && children.push(child);
                }
                return children;
            };

            /**
             * Sets the name of the segment of the provided node as the text of
             * the element, the parts of it matched by the text of the filter (in
             * the whole key, so that a text across the dots matches too) being
             * highlighted.
             *
             * @param {Element}
             *            element The element where the name is set.
             * @param {Object}
             *            node The node whose name is set.
             * @param {String}
             *            query The text of the filter.
             */
            var _segment = function(element, node, query) {
                var text = node.path;
                var lower = text.toLowerCase();
                var position = text.length - node.name.length;
                var index = query ? lower.indexOf(query) : -1;
                element.empty();
                while (index !== -1) {
                    var start = Math.max(index, position);
                    var end = index + query.length;
                    if (end > start) {
                        var mark = jQuery("<mark class=\"debug-bar-match\"></mark>");
                        mark.text(text.slice(start, end));
                        element.append(document.createTextNode(text.slice(position, start)));
                        element.append(mark);
                        position = end;
                    }
                    index = lower.indexOf(query, index + 1);
                }
                element.append(document.createTextNode(text.slice(position)));
            };

            /**
             * Creates the item of the provided node in the column of its level,
             * marked by its value (allow, validate or deny) and as opened or as
             * the active one (the last opened), with the count of the keys under
             * it in case it's a branch (it has children), the ones that match
             * the filter in case there's one.
             *
             * @param {Object}
             *            node The node of the item to be created.
             * @param {Integer}
             *            level The level of the column of the item.
             * @param {String}
             *            query The text of the filter.
             * @param {Object}
             *            visible The counts of the nodes shown, if any.
             * @return {Element} The item that has been created.
             */
            var _item = function(node, level, query, visible) {
                var item = jQuery("<li class=\"debug-bar-columns-item\"></li>");
                var name = jQuery("<span class=\"debug-bar-columns-name\"></span>");
                item.addClass(node.list.length ? "branch" : "leaf");
                node.value && item.addClass(node.value);
                path[level] === node && item.addClass(path.length === level + 1 ? "active"
                    : "selected");
                item.attr("data-path", node.path);
                item.attr("title", node.value ? node.path + " (" + jQuery.uxlocale(node.value
                    .charAt(0).toUpperCase() + node.value.slice(1)) + ")" : node.path);
                node.value && item.append("<span class=\"debug-bar-columns-dot\"></span>");
                _segment(name, node, query);
                item.append(name);
                node.list.length && item.append("<span class=\"debug-bar-columns-count\">"
                    + (visible ? visible["$" + node.path] : node.count) + "</span>"
                    + "<span class=\"debug-bar-columns-chevron\"></span>");
                item.click(function() {
                    _open(node, level);
                    node.value && check.val(node.path);
                    node.value && _check();
                });
                return item;
            };

            /**
             * Creates the detail of the active node (the last opened), its key,
             * its segments, its value (in case it's a key) and the counts of
             * the keys under it (in case it's a branch), or a hint in case no
             * node is opened.
             *
             * @return {Element} The detail that has been created.
             */
            var _detail = function() {
                var node = path[path.length - 1];
                var detail = jQuery("<div class=\"debug-bar-columns-detail\"></div>");
                if (!node) {
                    detail.append("<span class=\"debug-bar-hint\">"
                        + jQuery.uxlocale("Open a segment to see its keys") + "</span>");
                    return detail;
                }
                var key = jQuery("<span class=\"debug-bar-columns-key\"></span>");
                var segments = jQuery("<span class=\"debug-bar-columns-path\"></span>");
                key.text(node.path);
                segments.text(node.path.split(".").join(" › "));
                detail.append("<span class=\"debug-bar-title\">"
                    + jQuery.uxlocale(node.value ? "Permission" : "Branch") + "</span>");
                detail.append(key);
                detail.append(segments);
                node.value && detail.append("<span class=\"debug-bar-columns-value " + node.value
                    + "\">" + "<span class=\"debug-bar-columns-dot\"></span>"
                    + jQuery.uxlocale(node.value.charAt(0).toUpperCase() + node.value.slice(1))
                    + "</span>");
                if (!node.list.length) {
                    return detail;
                }
                var sums = jQuery("<span class=\"debug-bar-columns-sums\"></span>");
                sums.append("<span class=\"debug-bar-columns-sum\">"
                    + String.prototype.formatC.apply(jQuery.uxlocale("%s keys"), [node.count])
                    + "</span>");
                for (var value in node.counts) {
                    node.counts[value] && sums.append("<span class=\"debug-bar-columns-sum "
                        + value + "\" title=\"" + jQuery.uxlocale(value.charAt(0).toUpperCase()
                            + value.slice(1)) + "\">" + "<span class=\"debug-bar-columns-dot\">"
                        + "</span>" + node.counts[value] + "</span>");
                }
                detail.append(sums);
                return detail;
            };

            /**
             * Scrolls the column of the provided item (vertically) and the
             * columns (horizontally) so that the item and the last column are
             * in sight.
             *
             * @param {Element}
             *            item The item to be shown, if any.
             */
            var _reveal = function(item) {
                var columns = list[0];
                columns.scrollLeft = columns.scrollWidth;
                if (!item.length) {
                    return;
                }
                var column = item.parent()[0];
                var itemBox = item[0].getBoundingClientRect();
                var columnBox = column.getBoundingClientRect();
                itemBox.top < columnBox.top && (column.scrollTop -= columnBox.top - itemBox.top);
                itemBox.bottom > columnBox.bottom
                    && (column.scrollTop += itemBox.bottom - columnBox.bottom);
            };

            /**
             * Renders the permissions of the session whose keys match the text
             * of the filter, as a column of the first segments and a column of
             * the children of each opened segment, followed by the detail of
             * the active one, and the count of the permissions.
             */
            var _render = function() {
                // counts the permissions whose keys match the text of the filter
                // and shows the type of the user and the count of the permissions
                var query = _query();
                var items = permissions || [];
                var matches = 0;
                for (var index = 0; index < items.length; index++) {
                    String(items[index].key).toLowerCase().indexOf(query) !== -1 && matches++;
                }
                type.text(userType.text() || jQuery.uxlocale("Unknown"));
                count.text(query ? String.prototype.formatC.apply(
                    jQuery.uxlocale("%s of %s permissions"), [matches, items.length])
                    : String.prototype.formatC.apply(jQuery.uxlocale("%s permissions"),
                        [items.length]));

                // keeps the scroll of the columns, by the paths of their nodes,
                // so that a column of the same node keeps it once rendered again,
                // and starts the columns with the one of the first segments
                var scrolls = {};
                var columns = jQuery("> .debug-bar-columns-column", list);
                columns.each(function() {
                    var element = jQuery(this);
                    scrolls["$" + element.attr("data-path")] = this.scrollTop;
                });
                list.empty();
                if (!root) {
                    list.append("<ul class=\"debug-bar-columns-column\"><li"
                        + " class=\"debug-bar-columns-empty\">" + jQuery.uxlocale("Loading")
                        + "</li></ul>");
                    return;
                }

                // closes the opened segments that are no longer shown by the
                // filter (and the ones under them)
                var visible = _visible(query);
                for (var index = 0; index < path.length; index++) {
                    if (visible && !visible["$" + path[index].path]) {
                        path = path.slice(0, index);
                        break;
                    }
                }

                // renders the column of the children of each opened node, the
                // first one being the one of the root (the first segments), even
                // with no permissions, so that it says that none matches
                var node = root;
                for (var level = 0; node && (level === 0 || node.list.length); level++) {
                    var children = _children(node, visible);
                    var column = jQuery("<ul class=\"debug-bar-columns-column\"></ul>");
                    column.attr("data-path", node.path);
                    for (var index = 0; index < children.length; index++) {
                        column.append(_item(children[index], level, query, visible));
                    }
                    children.length === 0 && column.append("<li class=\"debug-bar-columns-empty\">"
                        + jQuery.uxlocale("No permissions match the filter") + "</li>");
                    list.append(column);
                    column[0].scrollTop = scrolls["$" + node.path] || 0;
                    node = path[level];
                }

                // renders the detail of the active node and shows it, the
                // active item in its column and the last column
                list.append(_detail());
                _reveal(jQuery(".debug-bar-columns-item.active", list));
            };

            /**
             * Opens the provided node in the column of the provided level, the
             * nodes opened in the columns after it being closed, rendering the
             * permissions again.
             *
             * @param {Object}
             *            node The node to be opened.
             * @param {Integer}
             *            level The level of the column of the node.
             */
            var _open = function(node, level) {
                path = path.slice(0, level).concat([node]);
                _render();
            };

            /**
             * Moves the active node with the provided key of the keyboard, as
             * in the columns of a file browser: the arrows up and down move in
             * the column of the active node, the arrow right opens its first
             * child, the arrow left goes back to its parent and enter checks
             * it (in case it's a key).
             *
             * @param {Integer}
             *            keyCode The code of the key that has been pressed.
             * @return {Boolean} If the key has been handled.
             */
            var _move = function(keyCode) {
                var level = Math.max(path.length - 1, 0);
                var node = path[level];
                var parent = level ? path[level - 1] : root;
                var siblings = _children(parent, _visible(_query()));
                var position = node ? siblings.indexOf(node) : -1;
                switch (keyCode) {
                    case 38:
                    case 40:
                        var next = keyCode === 40 ? position + 1 : position < 0
                            ? siblings.length - 1 : position - 1;
                        siblings[next] && _open(siblings[next], level);
                        return true;
                    case 39:
                        var children = node ? _children(node, _visible(_query())) : siblings;
                        children.length && _open(children[0], node ? level + 1 : level);
                        return true;
                    case 37:
                        path.length > 1 && _open(path[level - 1], level - 1);
                        return true;
                    case 13:
                        node && node.value && check.val(node.path);
                        node && node.value && _check();
                        return true;
                    default:
                        return false;
                }
            };

            /**
             * Checks the permission with the key of the check field in the
             * server, for the session, showing if it's allowed or denied.
             */
            var _check = function() {
                var key = String(check.val()).replace(/^\s+|\s+$/g, "");
                checkResult.removeClass("success");
                checkResult.removeClass("warning");
                if (!key) {
                    checkResult.text(jQuery.uxlocale("Type the key of a permission"));
                    return;
                }
                jQuery.uquery({
                    url: "omni_util/debug_permissions.json",
                    data: {
                        permission: key
                    },
                    success: function(data) {
                        var allowed = data && data.allowed;
                        checkResult.addClass(allowed ? "success" : "warning");
                        checkResult.text(String.prototype.formatC.apply(jQuery.uxlocale(allowed
                            ? "%s is allowed for the user type %s"
                            : "%s is denied for the user type %s"), [key,
                                userType.text() || jQuery.uxlocale("Unknown")]));
                        logger.info("Permission checked:", key, allowed);
                    },
                    error: function(request, status, error) {
                        checkResult.addClass("warning");
                        checkResult.text(String.prototype.formatC.apply(
                            jQuery.uxlocale("The check of the permission failed (%s)"),
                            [request.status]));
                        logger.warn("Permission check failed:", request.status, error);
                    }
                });
            };

            // registers for the typing in the filter so that the permissions
            // are rendered again, for the keys pressed in the columns so that
            // the active node is moved (their propagation stopped, as in the
            // fields of the bar, so that the page does not take them as its
            // own), for the check button and the enter key in the check field
            // so that the permission is checked, and for the panel being shown
            // so that the permissions are retrieved, once
            filter.bind("keyup", _render);
            list.bind("keydown", function(event) {
                event.stopPropagation();
                root && _move(event.keyCode) && event.preventDefault();
            });
            list.bind("keypress keyup", function(event) {
                event.stopPropagation();
            });
            checkButton.click(_check);
            check.bind("keyup", function(event) {
                event.keyCode === 13 && _check();
            });
            panel.bind("shown", function() {
                if (panel.data("loaded")) {
                    return;
                }
                panel.data("loaded", true);
                jQuery.uquery({
                    url: "omni_util/debug_permissions.json",
                    data: {},
                    success: function(data) {
                        permissions = (data && data.permissions) || [];
                        root = _tree(permissions);
                        _render();
                    },
                    error: function(request, status, error) {
                        logger.warn("Permissions retrieval failed:", request.status, error);
                        permissions = [];
                        root = _tree(permissions);
                        _render();
                    }
                });
            });
            _render();
        };

        /**
         * Builds the panel of the session tool, the values of the session of
         * the page (as rendered in the bar) and the ones of this browser (the
         * level of the logs, the silent notifications, the theme of the bar,
         * the screen, the pixel density and the language).
         *
         * @param {Element}
         *            panel The panel of the tool to be built.
         */
        var _buildSession = function(panel) {
            panel.append("<div class=\"debug-bar-column debug-bar-half\">"
                + "<span class=\"debug-bar-title\">" + jQuery.uxlocale("Session") + "</span>"
                + "<ul class=\"debug-bar-values debug-bar-session-values\"></ul>" + "</div>"
                + "<div class=\"debug-bar-column debug-bar-half\">"
                + "<span class=\"debug-bar-title\">" + jQuery.uxlocale("Browser") + "</span>"
                + "<ul class=\"debug-bar-values debug-bar-browser-values\"></ul>" + "</div>");
            var sessionList = jQuery(".debug-bar-session-values", panel);
            var browserList = jQuery(".debug-bar-browser-values", panel);
            var session = jQuery(".debug-bar-session > li", matchedObject);

            /**
             * Renders the values of the session, the ones rendered in the
             * bar, and the ones of this browser.
             */
            var _render = function() {
                var values = [];
                session.each(function() {
                    var element = jQuery(this);
                    var name = element.attr("data-name");
                    var label = SESSION_LABELS[name]
                        || name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, " ");
                    values.push({
                        name: name,
                        label: label,
                        value: element.text()
                    });
                });
                _values(sessionList, values);

                var sounds = _body.data("notification_sounds") || {};
                var level = matchedObject.data("level");
                var theme = matchedObject.data("theme");
                var device = _body.attr("data-device") || "desktop";
                _values(browserList, [{
                    name: "log_level",
                    label: "Log level",
                    value: jQuery.uxlocale(level.charAt(0).toUpperCase() + level.slice(1))
                }, {
                    name: "silent_notifications",
                    label: "Silent notifications",
                    value: jQuery.uxlocale(jQuery.isEmptyObject(sounds) ? "Yes" : "No")
                }, {
                    name: "theme",
                    label: "Theme",
                    value: jQuery.uxlocale(THEME_NAMES[THEMES.indexOf(theme)] || THEME_NAMES[0])
                }, {
                    name: "screen",
                    label: "Screen",
                    value: _window.width() + " × " + _window.height() + ", "
                        + jQuery.uxlocale(device.charAt(0).toUpperCase() + device.slice(1))
                }, {
                    name: "pixel_density",
                    label: "Pixel density",
                    value: (window.devicePixelRatio || 1) + "x"
                }, {
                    name: "language",
                    label: "Language",
                    value: navigator.language || navigator.userLanguage
                }]);
            };

            // registers for the level and the theme of the bar and for the
            // panel being shown so that the values are rendered again, and
            // renders them
            matchedObject.bind("level theme", _render);
            panel.bind("shown", _render);
            _render();
        };

        /**
         * The tools of the bar, in the order of their tabs, each one with its
         * name, its title (to be localized) and the function that builds its
         * panel, a new tool being added to the bar as a new entry of the list.
         */
        var TOOLS = [{
            name: "logs",
            title: "Logs",
            build: _buildLogs
        }, {
            name: "notifications",
            title: "Notifications",
            build: _buildNotifications
        }, {
            name: "scan",
            title: "Scan",
            build: _buildScan
        }, {
            name: "print",
            title: "Print",
            build: _buildPrint
        }, {
            name: "pushi",
            title: "Pushi",
            build: _buildPushi
        }, {
            name: "errors",
            title: "Errors",
            build: _buildErrors
        }, {
            name: "storage",
            title: "Storage",
            build: _buildStorage
        }, {
            name: "page",
            title: "Page",
            build: _buildPage
        }, {
            name: "settings",
            title: "Settings",
            build: _buildSettings
        }, {
            name: "permissions",
            title: "Permissions",
            build: _buildPermissions
        }, {
            name: "session",
            title: "Session",
            build: _buildSession
        }];

        // iterates over the tools of the bar, in their order, to create the
        // tab and the panel of each of them, letting the tool build its panel
        for (var index = 0; index < TOOLS.length; index++) {
            var tool = TOOLS[index];
            var tab = jQuery("<li class=\"debug-bar-tab\" data-name=\"" + tool.name + "\">"
                + jQuery.uxlocale(tool.title) + "<span class=\"debug-bar-tab-count\"></span>"
                + "</li>");
            var panel = jQuery("<div class=\"debug-bar-tool\" data-name=\"" + tool.name
                + "\"></div>");
            tabs.append(tab);
            tools.append(panel);
            tool.build(panel);
        }

        // stops the propagation of the keys typed into the fields of the
        // bar, so that the page (eg: the shortcuts of the pos and the scan
        // detection) does not take the typing of the bar as its own
        var fields = jQuery("input, select", matchedObject);
        fields.bind("keydown keypress keyup", function(event) {
            event.stopPropagation();
        });

        /**
         * Updates the counts of the errors and of the warnings of the header
         * and of the launcher of the bar and the count of the records in the
         * tab of the logs, from the records of the logs.
         */
        var _count = function() {
            var records = _window.data("udebug_records");
            var errorCount = 0;
            var warningCount = 0;
            for (var index = 0; index < records.length; index++) {
                var _level = records[index].level;
                errorCount += _level === "error" || _level === "critical" ? 1 : 0;
                warningCount += _level === "warning" ? 1 : 0;
            }
            var logsCount = jQuery(".debug-bar-tab[data-name=\"logs\"] > .debug-bar-tab-count",
                tabs);
            errors.text(String(errorCount));
            warnings.text(String(warningCount));
            logsCount.text(records.length ? String(records.length) : "");
        };

        /**
         * Selects the tool with the provided name, showing its panel and
         * marking its tab, defaulting to the first tool in case there's no
         * tool with the name, and notifies the panel that it's shown.
         *
         * @param {String}
         *            name The name of the tool to be selected.
         */
        var _select = function(name) {
            var tab = jQuery(".debug-bar-tab[data-name=\"" + name + "\"]", tabs);
            tab = tab.length ? tab : jQuery(".debug-bar-tab:first", tabs);
            name = tab.attr("data-name");
            var panel = jQuery(".debug-bar-tool[data-name=\"" + name + "\"]", tools);
            var others = jQuery(".debug-bar-tool", tools);
            var tabsAll = jQuery(".debug-bar-tab", tabs);
            tabsAll.removeClass("selected");
            others.removeClass("selected");
            tab.addClass("selected");
            panel.addClass("selected");
            _set("omni:debug:tool", name);
            panel.triggerHandler("shown");
        };

        /**
         * Raises the notifications at the bottom left of the page above the
         * dock of the bar while it's open (lowering them once it's closed),
         * creating their stack as the notifications do in case it doesn't
         * exist yet, so that the ones shown later are raised too.
         */
        var _raise = function() {
            var isOpen = matchedObject.hasClass("open");
            var stack = jQuery("> .notifications-stack.bottom-left", _body);
            if (stack.length === 0 && isOpen) {
                stack = jQuery("<div class=\"notifications-stack\"></div>");
                stack.addClass("bottom-left");
                _body.append(stack);
            }
            var height = matchedObject.data("height");
            stack.css("bottom", isOpen ? height + NOTIFICATIONS_GAP + "px" : "");
        };

        /**
         * Leaves room at the end of the page as tall as the dock of the bar
         * while it's open (removing it once it's closed), the element of the
         * bar (after the footer, with no height of its own) taking the height
         * of the dock, so that the whole page may be scrolled above it, as
         * the developer tools of the browser docked at the bottom do.
         */
        var _room = function() {
            var isOpen = matchedObject.hasClass("open");
            var height = dock.outerHeight();
            matchedObject.css("height", isOpen ? height + "px" : "");
            _place();
        };

        /**
         * Places the windows shown and the panels of the chat again, in the
         * part of the page above the dock of the bar while it's open (in the
         * whole window otherwise), as when the window is resized.
         */
        var _place = function() {
            var elements = jQuery(".window.visible, .chat-panel");
            elements.each(function(index, element) {
                var _element = jQuery(this);
                _element.triggerHandler("layout");
            });
        };

        /**
         * Centers the window that has just been centered in the window of the
         * browser (as the handler of its centered event) in the part of the
         * page above the dock of the bar while it's open, as the room left at
         * the end of the page is not part of the visible page.
         */
        var _center = function() {
            var element = jQuery(this);
            var isOpen = matchedObject.hasClass("open");
            if (!isOpen) {
                return;
            }
            var height = dock.outerHeight();
            var top = (_window.height() - height - element.outerHeight(true)) / 2;
            element.css("top", Math.max(top, 0) + "px");
        };

        /**
         * Sets the height of the dock of the bar, in whole pixels, bounded
         * by its minimum height and by its maximum one for the height of the
         * window, with the notifications at the bottom of the page raised
         * above it and the room at the end of the page following it.
         *
         * @param {Number}
         *            height The height of the dock to be set, in pixels.
         */
        var _height = function(height) {
            var maximum = Math.floor(_window.height() * MAXIMUM_HEIGHT_RATIO);
            height = Math.round(Math.max(Math.min(height, maximum), MINIMUM_HEIGHT));
            dock.css("height", height + "px");
            matchedObject.data("height", height);
            _raise();
            _room();
        };

        /**
         * Shows the bar, marking the body, raising the notifications at the
         * bottom above it and leaving room for it at the end of the page,
         * with the last tool selected.
         */
        var _show = function() {
            matchedObject.addClass("open");
            _body.addClass("debug-bar-open");
            _raise();
            _room();
            _set("omni:debug:open", "1");
            _select(_get("omni:debug:tool"));
        };

        /**
         * Hides the bar, unmarking the body, lowering the notifications at
         * the bottom and removing its room at the end of the page.
         */
        var _hide = function() {
            matchedObject.removeClass("open");
            _body.removeClass("debug-bar-open");
            _raise();
            _room();
            _set("omni:debug:open", "0");
        };

        // registers for the click in the tabs so that the tool of the tab
        // is selected, its panel being shown
        var tabsAll = jQuery(".debug-bar-tab", tabs);
        tabsAll.click(function() {
            var element = jQuery(this);
            _select(element.attr("data-name"));
        });

        // registers for the change of the theme so that it's applied to the
        // bar and stored in the local storage of the browser
        themeSelect.change(function() {
            var _theme = themeSelect.val();
            for (var index = 0; index < THEMES.length; index++) {
                matchedObject.removeClass("theme-" + THEMES[index]);
            }
            matchedObject.addClass("theme-" + _theme);
            matchedObject.data("theme", _theme);
            matchedObject.triggerHandler("theme", [_theme]);
            _set("omni:debug:theme", _theme);
        });

        // registers for the clear of the records of the logs (by the logs
        // tool) so that the counts of the header are updated
        matchedObject.bind("clear", function() {
            _count();
        });

        // registers for the click in the close button so that the bar is
        // hidden (shown again by the shortcut or the launcher), and for the
        // click in the launcher so that the bar is shown
        close.click(function() {
            _hide();
        });
        launcher.click(function() {
            _show();
        });

        // registers for the press in the handle of the resize so that the
        // height of the dock follows the pointer (growing upwards) until it's
        // released, the height being kept in the local storage of the browser,
        // and for the double click in it so that the default height is set
        resize.mousedown(function(event) {
            var start = event.clientY;
            var startHeight = matchedObject.data("height");
            var onMove = null;
            var onUp = null;
            event.preventDefault();
            _body.addClass("debug-bar-resizing");
            _document.bind("mousemove", onMove = function(event) {
                _height(startHeight + start - event.clientY);
            });
            _document.bind("mouseup", onUp = function() {
                _document.unbind("mousemove", onMove);
                _document.unbind("mouseup", onUp);
                _body.removeClass("debug-bar-resizing");
                _set("omni:debug:height", String(matchedObject.data("height")));
            });
        });
        resize.dblclick(function() {
            _height(HEIGHT);
            _remove("omni:debug:height");
        });

        // starts the variables that are going to store the handlers of the
        // records of the logs, of the keys of the document, of the resize
        // of the window and of the apply of new contents, so that they are
        // unregistered once the bar is destroyed (eg: its contents replaced
        // by the async navigation)
        var onRecord = null;
        var onKeyDown = null;
        var onResize = null;
        var onApplied = null;

        // registers for the records of the logs so that the counts of the
        // header are updated and the tools notified about the record
        _body.bind("debug_record", onRecord = function(event, record) {
            _count();
            matchedObject.triggerHandler("record", [record]);
        });

        // registers for the key down in the document so that the shortcut
        // of the bar (ctrl + alt + d) shows or hides it
        _document.bind("keydown", onKeyDown = function(event) {
            var isShortcut = event.ctrlKey && event.altKey && event.keyCode === 68;
            if (!isShortcut) {
                return;
            }
            event.preventDefault();
            matchedObject.hasClass("open") ? _hide() : _show();
        });

        // registers for the resize of the window so that the height of the
        // dock is bounded again by the (new) height of the window
        _window.bind("resize", onResize = function() {
            _height(matchedObject.data("height"));
        });

        // registers for the centering of the windows of the page, and of the
        // ones of the contents applied later (eg: the windows of a page of the
        // async navigation), so that they're centered in the part of the page
        // above the dock while it's open
        var windows = jQuery(".window");
        windows.bind("centered", _center);
        _body.bind("applied", onApplied = function(event, base) {
            var windows = jQuery(".window", base);
            windows.bind("centered", _center);
        });

        matchedObject.bind("destroyed", function() {
            var stack = jQuery("> .notifications-stack.bottom-left", _body);
            var windows = jQuery(".window");
            _body.unbind("debug_record", onRecord);
            _document.unbind("keydown", onKeyDown);
            _window.unbind("resize", onResize);
            _body.unbind("applied", onApplied);
            windows.unbind("centered", _center);
            _body.removeClass("debug-bar-open");
            stack.css("bottom", "");
            matchedObject.css("height", "");
            _place();
        });

        // sets the height of the dock, the one kept in the local storage of
        // the browser (bounded by the height of the window) or the default
        _height(parseInt(_get("omni:debug:height"), 10) || HEIGHT);

        // updates the counts of the header from the records already kept
        // and shows the bar in case it was left open in this browser
        _count();
        _get("omni:debug:open") === "1" && _show();

        // returns the object
        return this;
    };
})(jQuery);

(function(jQuery) {
    jQuery.fn.ueureka = function(options) {
        /**
         * The minimum number of options (results) of the eureka for the
         * phones, where they're listed as wide as the screen, under its
         * search bar, with room for more of them.
         */
        var MOBILE_NUMBER_OPTIONS = 6;

        // sets the jquery matched object
        var matchedObject = this;

        // in case the matched object is not defined
        // or in case it's an empty list must return
        // immediately initialization is not meant to
        // be run (corruption may occur)
        if (!matchedObject || matchedObject.length === 0) {
            return;
        }

        // retrieves the reference to the top level
        // body element that is going to be used in some
        // of the operations associated with eureka
        var _body = jQuery("body");

        // retrieves the complete set of overlay panels associated
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
            if (eventKeyCode === 27 || eventKeyCode === key) {
                return;
            }

            // stops the event propagation in order to avoid
            // unwanted global behavior coming  from this key press
            event.stopPropagation();
            event.stopImmediatePropagation();
        });

        // starts the variable that is going to store the handler of the
        // shown event of the overlay panel, so that it's unregistered once
        // the eureka is destroyed (eg: its contents replaced by the async
        // navigation), as the overlay panel is kept between the visits
        var onShown = null;

        // registers for the shown event in the overlay panel associated
        // with the eureka element so that various element of the eureka
        // are restored to the unset original values
        overlayPanel.bind("shown", onShown = function() {
            // retrieves the current element and the associated text field
            // and then runs the reset operation to restore it to the original
            // value as expected by the specification
            var element = jQuery(this);
            var textField = jQuery(".text-field", element);
            textField.uxreset();

            // retrieves the eureka of the overlay panel and resets it, so that
            // the results of an earlier show are not reused (with the number
            // of options of that show) when the same value is typed again
            var eureka = jQuery(".eureka", element);
            eureka.uxreset();

            // retrieves the number of options defined in the template of the
            // eureka, converting it into an integer and verifying that the
            // "generated" integer is valid, otherwise the number of options
            // of the drop field is kept
            var numberOptions = eureka.attr("data-number_options");
            var numberOptionsInt = parseInt(numberOptions);
            if (isNaN(numberOptionsInt)) {
                return;
            }

            // raises the number of options to the mobile number of options
            // in the phones (where the results are listed as wide as the
            // screen) and then updates the number of options of the drop
            // field of the eureka, on every show (eg: a phone turned)
            var isMobile = _body.hasClass("mobile-s");
            if (isMobile) {
                numberOptionsInt = Math.max(numberOptionsInt, MOBILE_NUMBER_OPTIONS);
            }
            eureka.data("number_options", numberOptionsInt);
        });

        // registers for the (new) item event to change
        // the item inserting new attributes in it
        matchedObject.bind("item", function(event, item) {
            // retrieves the base path, the mvc path and the class
            // id url map for the current page
            var basePath = _body.data("base_path");
            var mvcPath = _body.data("mvc_path");
            var classIdUrl = _body.data("class_id_url");

            // defaults the kind of the item to the record and its group
            // to none, as the template only replaces the attributes that
            // the item has (the records have none of them when the pages
            // are not requested), the group being shown only in the first
            // item of each kind
            var kind = item["kind"] || "record";
            var group = item["group"] || "";
            item["kind"] = kind;
            item["group"] = group;
            item["group_extra"] = item["group_extra"] || "";
            item["group_status"] = group ? "enabled" : "disabled";

            // in case the item is a page its link is its (concrete) url
            // under the mvc path and its picture is the icon of its section,
            // from the common images of the entities
            if (kind === "page") {
                var iconPath = basePath + "common/images/entities/" + item["icon"];
                item["link"] = mvcPath + item["url"];
                item["image"] = iconPath + "_24.png";
                item["image_2x"] = iconPath + "_50.png";
                return;
            }

            // retrieves the various attribute values from the
            // item to be used in the link construction
            var objectId = item["object_id"];
            var cid = item["cid"];

            // constructs the url using the base mvc path and
            // appending the url to the requested class
            var baseUrl = mvcPath + classIdUrl[cid];

            // creates the final link value and updates the
            // item with it and with the ones of its picture
            var link = baseUrl + objectId;
            item["link"] = link;
            item["image"] = link + "/image?size=50&mtime=" + item["mtime"];
            item["image_2x"] = link + "/image?size=128&mtime=" + item["mtime"];
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

        // starts the variable that is going to store the handler of the
        // post async event of the body, so that its own handler is the one
        // unregistered once the eureka is destroyed (and not the one of
        // another plugin, as the chat registers one as well)
        var onPostAsync = null;

        // registers for the post async event so that the overlay panel associated
        // with the eureka structure is properly hidden and does not remains displayed
        // in the current screen, otherwise garbage would be left (ux problems)
        matchedObject.length > 0 && _body.bind("post_async", onPostAsync = function() {
            var overlayPanel = matchedObject.parents(".overlay-panel");
            overlayPanel.triggerHandler("hide");
        });
        matchedObject.bind("destroyed", function() {
            _body.unbind("post_async", onPostAsync);
            overlayPanel.unbind("shown", onShown);
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

            // registers the lightbox for the shown event so that the
            // buttons are properly animated according to their dimensions
            // and visibility (required for compatibility issues)
            lightbox.bind("shown", function() {
                buttons.uxanimation();
            });

            // registers the lightbox for the hidden event so that the
            // buttons are properly animated according to their dimensions
            // and visibility (required for compatibility issues)
            lightbox.bind("hidden", function() {
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
        if (!matchedObject || matchedObject.length === 0) {
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

        // sends the configuration (the class id URL map) to the service worker
        // so that it's able to resolve the target URL of the Web Push
        // notifications the same way it's done for the local (in page) ones,
        // the operation is wrapped in a try/catch and runs on each page load so
        // that the configuration is kept up to date, note that the
        // registrations are used (instead of the ready promise) as the service
        // worker is registered under a scope that does not control the page and
        // so the ready promise would never resolve
        try {
            "serviceWorker" in navigator
                && navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for (var index = 0; index < registrations.length; index++) {
                        var active = registrations[index].active;
                        active && active.postMessage({
                            type: "config",
                            class_id_url: _body.data("class_id_url")
                        });
                    }
                });
        } catch (exception) {
            // ignores the exception as the configuration send is best effort
        }

        // adds the various inner elements of the notifications
        // container to the notification activator icon
        var link = jQuery("<div class=\"button menu-button menu-link notifications\"></div>")
        var container = jQuery("<div class=\"menu-contents notifications-container\">"
            + "<ul class=\"notifications-list\"></ul>" + "</div>");
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

            // retrieves the references to both the menu link associated
            // with the notifications container and to the list that
            // contains the notifications
            var link = jQuery(".menu-link", _element);
            var contents = jQuery(".menu-contents", _element);
            var list = jQuery(".notifications-list", _element);

            // retrieves the url value to be used for the chat
            // communication, and then creates the full absolute ur
            // from the base url and the communication suffix
            var url = _element.attr("data-url");
            var absoluteUrl = jQuery.uxresolve(url + "/pushi.json");

            // retrieves the name of the currently signed in user
            // from the body element, to be used for the current panel
            var username = _body.data("username");
            _element.data("username", username);

            // retrieves the (base) url and the app key values to be used
            // for the establishment of the pushi connection, then uses them
            // as the various arguments for the construction of the proxy object
            var url = _element.attr("data-url");
            var key = _element.attr("data-key");
            var pushi = new Pushi(key, {
                baseUrl: url,
                authEndpoint: absoluteUrl
            });

            // updates the current element with the reference to the pushi
            // element so that it may be re-used for retrieval latter
            _element.data("pushi", pushi);

            // registers for the notification event in the element so
            // that a new notification element is created
            _element.bind("notification", function(event, data, isNew) {
                // retrieves the current element
                var _element = jQuery(this);

                // verifies that the notification data contains the minimum
                // required structure (entity, create user and notification),
                // returning immediately otherwise so that a malformed or
                // legacy notification does not break the rendering pipeline
                if (!data || !data.entity || !data.create_user
                    || !data.notification) {
                    return;
                }

                // retrieves the mvc and base paths and the class id url
                // map for the current page
                var mvcPath = _body.data("mvc_path");
                var basePath = _body.data("base_path");
                var classIdUrl = _body.data("class_id_url");

                // creates a new date object and uses it to retrieve
                // the current timestamp as defined in utf for unix
                var date = new Date();
                var current = date.getTime();

                // unpacks both the object id and the CID (class ID)
                // from the current data structure
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

                // extracts the message value from the base notification structure
                // and then retrieves the arguments from it also, then runs the
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
                var imageUrl = urlU + "/image?size=64";
                var imageUrlSet = urlU + "/image?size=128 2x";
                var userName = data.create_user.representation;
                var time = diffS;

                // "calulates" the path to the logo url using the retrieved
                // base path as the reference for it
                var logoUrl = basePath + "common/images/logos/front-door-not-large.png";

                // adds a new notification item to the list of
                // notifications, this notification should have
                // the pre-defined username and time as defined
                // in the received data
                var notification = jQuery("<li class=\"button\" data-link=\"" + url + "\">"
                    + "<img class=\"entity-picture\" src=\"" + imageUrl + "\" srcset=\""
                    + imageUrlSet + "\">" + "<div class=\"contents\">"
                    + "<p class=\"title\">" + userName + "</p>"
                    + "<p class=\"subject\"></p>"
                    + "</div>" + "<div class=\"time\">" + time + "</div>"
                    + "<div class=\"break\"></div>" + "</li>");
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

                // verifies if the desktop notifications are available and if
                // they are shown, which requires the permission of the user
                var hasNotifications = typeof(Notification) !== "undefined";
                var hasDesktop = hasNotifications && Notification.permission === "granted";

                // in case the current notification is new creates
                // a new notification box for the current notification
                // so that the user gets an immediate visual effect, with
                // no sound in case the page is hidden (eg: another tab) and
                // the desktop notification is shown, as that is the one that
                // sounds then
                isNew && _body.uxnotification({
                    "title": userName,
                    "message": message,
                    "link": jQuery.uxresolve(url),
                    "timeout": 15000,
                    "silent": document.hidden && hasDesktop
                });

                // in case this is a new notification creates a desktop
                // notification and registers the appropriate handlers to
                // it so that the target page opens on click and the notification
                // hides after a certain amount of time, note that if there's
                // not enough permissions the show is disabled, and that it has
                // no sound while the page is visible, as the notification box
                // is the one that sounds then
                if (hasNotifications && isNew) {
                    var _notification = new Notification(userName, {
                        dir: "auto",
                        icon: jQuery.uxresolve(logoUrl),
                        lang: "en",
                        body: messageT,
                        tag: uniqueId,
                        silent: !document.hidden
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
                if (itemsSize === 0) {
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
                    if (!data || !data.entity || !data.notification) {
                        return;
                    }

                    // retrieves the reference to the subject element from the
                    // element so that it gets updated with the new locale string
                    var subject = jQuery(".subject", _element);

                    // retrieves the reference to the time element of the
                    // current element in iteration, this is the value that
                    // is going to be update with the new string value
                    var time = jQuery(".time", _element);

                    // extracts the message value from the base notification structure
                    // and then retrieves the arguments from it also, then runs the
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
                if (username === _username) {
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
            // closed and not left over as garbage, the binding is wrapped
            // in a try/catch so that it fails gracefully in case the event
            // is blocked by the browser (eg: permissions policy)
            try {
                !isRegistered && _window.bind("beforeunload", function() {
                    var _notification = _body.data("_notification");
                    _notification && _notification.close();
                });
            } catch (exception) {
                // ignores the exception as the binding is best effort
            }

            // registers for the unload event in the window
            // element so that any pending native notification is
            // closed and not left over as garbage, the binding is wrapped
            // in a try/catch so that it fails gracefully in case the event
            // is blocked by the browser (eg: permissions policy)
            try {
                !isRegistered && _window.bind("unload", function() {
                    var _notification = _body.data("_notification");
                    _notification && _notification.close();
                });
            } catch (exception) {
                // ignores the exception as the binding is best effort
            }

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

                // subscribes to the personal channel for the user, this channel
                // should contain notification related information
                this.subscribe("personal-" + username);
            });

            // registers for the subscribe event to be able to create the previously
            // existing events from the stored (logged) ones
            pushi.bind("subscribe", function(event, channel, data) {
                // verifies if the current channel type is personal and in
                // case it's not returns immediately (nothing to be done)
                var isPersonal = channel.startsWith("personal-");
                if (!isPersonal) {
                    return;
                }

                // extracts the list of events from the provided data and
                // the iterates over them to create the various notifications
                // in the opposite order of arrival (correct order)
                var events = data.events || [];
                var length = events.length > MAXIMUM_NOTIFICATIONS ? MAXIMUM_NOTIFICATIONS
                    : events.length;
                for (var index = length - 1; index >= 0; index--) {
                    var event = events[index];
                    if (!event || !event.data) {
                        continue;
                    }
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
                var isString = typeof data === "string";
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
    jQuery.fn.usearch = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // in case the matched object is not defined
        // or in case it's an empty list must return
        // immediately initialization is not meant to
        // be run (corruption may occur)
        if (!matchedObject || matchedObject.length === 0) {
            return;
        }

        // retrieves the reference to the top level body element
        // and the overlay panel of the eureka, that is page-wide
        // and so retrieved from the body, as the windows are
        var _body = jQuery("body");
        var overlayPanel = jQuery(".overlay-search", _body);

        // retrieves the button of the search menu and registers
        // for the click on it to show the overlay panel of the
        // eureka, as its (ctrl) key shows it
        var button = jQuery(".menu-button", matchedObject);
        button.click(function() {
            overlayPanel.triggerHandler("show");
        });

        // starts the variables that are going to store the handlers of
        // the shown and hidden events of the overlay panel, so that they
        // are unregistered once the search menu is destroyed
        var onShown = null;
        var onHidden = null;

        // registers for the shown and hidden events of the overlay panel
        // so that the search menu is marked as active while the eureka is
        // visible, whether it was shown by the button or by the key
        overlayPanel.bind("shown", onShown = function() {
            matchedObject.addClass("active");
        });
        overlayPanel.bind("hidden", onHidden = function() {
            matchedObject.removeClass("active");
        });
        matchedObject.bind("destroyed", function() {
            overlayPanel.unbind("shown", onShown);
            overlayPanel.unbind("hidden", onHidden);
        });
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
            if (linksList.length === 0) {
                return;
            }

            // retrieves the complete set of children of the
            // current links list in case at least one exists
            // continues the loop nothing to be done
            var links = linksList.children();
            if (links.length !== 0) {
                return;
            }

            // hides the current side element as there are no
            // links under its links list
            _element.hide();
        });
    };
})(jQuery);

(function(jQuery) {
    jQuery.fn.usidebaropen = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // retrieves the reference to the body element
        var _body = jQuery("body");

        // checks if the side bar open value is already
        // registered in the body and sets the variable as
        // true to avoid further registrations
        var isRegistered = _body.data("sidebar_open");
        _body.data("sidebar_open", true);

        // registers for the click in the sidebar open so that it's possible
        // to ensure side right visibility
        matchedObject.click(function(event) {
            _body.triggerHandler("hide_modal");
            _body.addClass("side-right-visible");
        });

        // registers for the global hide modal event
        // so that the side panels are properly hidden
        !isRegistered && _body.bind("hide_modal", function() {
            _body.removeClass("side-right-visible");
            _body.removeClass("side-left-visible");
        });
    };
})(jQuery);

(function(jQuery) {
    jQuery.fn.usidebaroverlay = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // retrieves the reference to the body element
        var _body = jQuery("body");

        // registers for the click in the sidebar overlay so that it's possible
        // to hide side left and right visibility
        matchedObject.click(function(event) {
            _body.removeClass("side-left-visible");
            _body.removeClass("side-right-visible");
            event.preventDefault();
            event.stopPropagation();
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
        // immediately initialization is not meant to
        // be run (corruption may occur)
        if (!matchedObject || matchedObject.length === 0) {
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
                var item = jQuery("<li class=\"" + value + "\">" + "<span class=\"key\">" + valueL
                    + "</span>" + "<span class=\"value\"></span>"
                    + "<div class=\"sidebar-clear\"></div>" + "</li>");
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
                // gather the amount value that is going to be
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

        // retrieves the reference to the body element
        var _body = jQuery("body");

        // retrieves the reference associated with the various content
        // related elements to be used in the toggle operation
        var contentBar = jQuery(".content-bar", matchedObject);
        var contentMargin = jQuery(".content-margin", matchedObject);

        // registers for the click on the top bar so that the side panels
        // are hiden on each of the clicks
        contentBar.click(function(event) {
            _body.removeClass("side-left-visible");
            _body.removeClass("side-right-visible");
        });

        // retrieves the reference to the handle associated with the
        // top bar and registers it for the click event to toggle the
        // visibility of the top bar
        var handle = jQuery(".top-bar-handle", matchedObject);
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

        // registers for the click in the header logo so that it's possible
        // to toggle side left visibility in the mobile layout
        var headerLogo = jQuery(".top-bar-logo .header-logo", matchedObject);
        headerLogo.click(function(event) {
            var isMobile = _body.hasClass("mobile-s");
            if (!isMobile) {
                return;
            }

            if (_body.hasClass("side-left-visible")) {
                _body.removeClass("side-left-visible");
            } else {
                _body.triggerHandler("hide_modal");
                _body.addClass("side-left-visible");
            }

            _body.removeClass("side-right-visible");

            event.preventDefault();
            event.stopPropagation();
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
        if (!matchedObject || matchedObject.length === 0) {
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
        if (extension === ".prt") {
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
        options.length === 0 && linkOptions.hide() && iconOptions.hide();

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
            reverse = newOrder !== currentOrder ? true : !reverse;
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
                var isNumber = typeof first === "number";
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
            if (page === 0) {
                previous.uxdisable();
            } else {
                previous.uxenable();
            }

            // in cae the current page is the last one the next
            // button must be disabled otherwise it's enabled
            if (page === limit) {
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
            if (page === 0) {
                return;
            }
            page--;
            matchedObject.data("page", page);
            update(matchedObject, options)
        };

        var increment = function(matchedObject, options) {
            var page = matchedObject.data("page");
            var limit = matchedObject.data("limit");
            if (page === limit) {
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
        var DRAW_POINT = true;

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

        // values for the highlight of the point under the pointer and
        // for the box that describes its value, the radius of the touch
        // being larger as a finger is less precise than a pointer and the
        // mouse events that follow a touch (emulated) being ignored
        var POINT_RADIUS = 12;
        var TOUCH_RADIUS = 24;
        var TOUCH_TIMEOUT = 1000;
        var POINT_BOX_COLOR = "#ffffff";
        var POINT_BOX_BORDER_COLOR = "#d9d9d9";
        var POINT_VALUE_FONT_SIZE = 12;
        var POINT_BOX_MARGIN = 8;
        var POINT_BOX_OFFSET = 14;

        // the number of times (and the interval between them) that the
        // drawing of a chart with no size (yet) is retried
        var DRAW_RETRIES = 10;
        var DRAW_RETRY_TIMEOUT = 150;

        // the function that converts the value of a point into the
        // string that describes it in the box of the point
        var FORMAT_VALUE = function(value) {
            return String(value);
        };

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
        options = jQuery.extend(defaults, options);

        // sets the jquery matched object
        var matchedObject = this;

        // retrieves the logger of the chart, used to report the
        // drawings that could not be performed
        var logger = jQuery.uxlogger("uchart");

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
            context.line(marginLeft + verticalLabelWidth, marginTop + verticalAxisSize, marginLeft
                + verticalLabelWidth + horizontalAxisSize + 1, marginTop + verticalAxisSize);

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
                var value = currentValue / Math.pow(10, unit * 3);
                valueS = value.toString();
                valueS = valueS.slice(0, 3);
                valueS = valueS[valueS.length - 1] === "." ? valueS.slice(0,
                    valueS.length - 1) : valueS;
                valueS = valueS + " " + unitS;

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

            // retrieves the data values and the labels of the points (the
            // horizontal ones in case the points have none of their own)
            var dataValues = data["values"];
            var pointLabels = data["pointLabels"] || data["horizontalLabels"] || [];

            // retrieves the chart colors length
            var chartColorsLength = chartColors.length;

            // starts the list of points of the chart, that is going
            // to be used to find the point under the pointer
            var points = [];

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

                    // adds the point to the points of the chart, with its
                    // position, so that it may be found by the pointer
                    points.push({
                        key: key,
                        index: index,
                        value: currentValue,
                        label: pointLabels[index],
                        color: currentColor,
                        x: currentX,
                        y: currentY
                    });

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

            // sets the points in the chart, so that the point
            // under the pointer may be found latter
            matchedObject.data("points", points);

            // refreshes the point under the pointer with the one of the new
            // points (same key and index), as its position and value may have
            // changed (eg: a resize or new values), unsetting it in case the
            // new points no longer have it
            var current = matchedObject.data("point");
            if (current) {
                var refreshed = null;
                for (var index = 0; index < points.length; index++) {
                    var point = points[index];
                    if (point.key !== current.key || point.index !== current.index) {
                        continue;
                    }
                    refreshed = point;
                    break;
                }
                matchedObject.data("point", refreshed);
                matchedObject.css("cursor", refreshed ? "pointer" : "");
            }
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
            var drawAuxiliaryAxis = options["drawAuxiliaryAxis"] ? options["drawAuxiliaryAxis"]
                : DRAW_AUXILIARY_AXIS;
            var drawLabels = options["drawLabels"] ? options["drawLabels"] : DRAW_LABELS;
            var drawLines = options["drawLines"] ? options["drawLines"] : DRAW_LINES;
            var drawLabelBox = options["drawLabelBox"] ? options["drawLabelBox"] : DRAW_LABEL_BOX;
            var drawPoint = options["drawPoint"] ? options["drawPoint"] : DRAW_POINT;

            // sets the ui values
            var labelFontName = options["labelFontName"] ? options["labelFontName"] : LABEL_FONT_NAME;
            var labelFontSize = options["labelFontSize"] ? options["labelFontSize"] : LABEL_FONT_SIZE;
            var labelFontRealSize = options["labelFontRealSize"] ? options["labelFontRealSize"]
                : LABEL_FONT_REAL_SIZE;
            var baseColor = options["baseColor"] ? options["baseColor"] : BASE_COLOR;
            var labelColor = options["labelColor"] ? options["labelColor"] : LABEL_COLOR;
            var axisColor = options["axisColor"] ? options["axisColor"] : AXIS_COLOR;
            var auxiliaryAxisColor = options["auxiliaryAxisColor"] ? options["auxiliaryAxisColor"]
                : AUXILIARY_AXIS_COLOR;
            var valueCircleColor = options["valueCircleColor"] ? options["valueCircleColor"]
                : VALUE_CIRCLE_COLOR;
            var backgroundCircleColor = options["backgroundCircleColor"] ? options["backgroundCircleColor"]
                : BACKGROUND_CIRCLE_COLOR;
            var backgroundBoxColor = options["backgroundBoxColor"] ? options["backgroundBoxColor"]
                : BACKGROUND_BOX_COLOR;
            var chartColors = options["chartColors"] ? options["chartColors"] : CHART_COLORS;
            var formatValue = options["formatValue"] ? options["formatValue"] : FORMAT_VALUE;

            // sets the number of steps
            var verticalSteps = options["verticalSteps"] ? options["verticalSteps"] : VERTICAL_STEPS;
            var horizontalSteps = options["horizontalSteps"] ? options["horizontalSteps"]
                : HORIZONTAL_STEPS;

            // sets the maximum and minimum values and calculates
            // the range value
            var maximumValue = options["maximumValue"] ? Math.ceil(options["maximumValue"] / verticalSteps)
                * verticalSteps : MAXIMUM_VALUE;
            var minimumValue = options["minimumValue"] ? options["minimumValue"] : MINIMUM_VALUE;
            var rangeValue = maximumValue - minimumValue;

            // the increment in each step value to be used
            var stepValue = Math.round(rangeValue / verticalSteps);

            // retrieves the horizontal and vertical label width
            // and height values
            var horizontalLabelHeight = options["horizontalLabelHeight"] ? options["horizontalLabelHeight"]
                : HORIZONTAL_LABEL_HEIGHT;
            var verticalLabelWidth = options["verticalLabelWidth"] ? options["verticalLabelWidth"]
                : VERTICAL_LABEL_WIDTH;

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
            var boxMarginHorizontal = options["boxMarginHorizontal"] ? options["boxMarginHorizontal"]
                : BOX_MARGIN_HORIZONTAL;
            var boxMarginVertical = options["boxMarginVertical"] ? options["boxMarginVertical"]
                : BOX_MARGIN_VERTICAL;
            var boxHorizontalOffset = options["boxHorizontalOffset"] ? options["boxHorizontalOffset"]
                : BOX_HORIZONTAL_OFFSET;
            var boxVerticalOffset = options["boxVerticalOffset"] ? options["boxVerticalOffset"]
                : BOX_VERTICAL_OFFSET;

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
            options["drawPoint"] = drawPoint;
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
            options["formatValue"] = formatValue;
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
            var boxX = marginLeft + verticalLabelWidth + horizontalAxisSize - boxWidth
                - boxHorizontalOffset;
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

        var drawPoint = function(matchedObject, options) {
            // retrieves the options values
            var context = options["context"];
            var labelFontName = options["labelFontName"];
            var labelFontSize = options["labelFontSize"];
            var labelFontRealSize = options["labelFontRealSize"];
            var baseColor = options["baseColor"];
            var labelColor = options["labelColor"];
            var valueCircleColor = options["valueCircleColor"];
            var formatValue = options["formatValue"];
            var chartWidth = options["width"];

            // retrieves the point under the pointer, in case there's
            // none there's nothing to be drawn
            var point = matchedObject.data("point");
            if (!point) {
                return;
            }

            // draws a light halo around the point so that it stands
            // out from the other points of the chart
            context.fillStyle = "rgba(0, 0, 0, 0.08)";
            context.beginPath();
            context.arc(point.x, point.y, POINT_RADIUS, 0, Math.PI * 2, true);
            context.fill();
            context.closePath();

            // draws a bigger version of the (outer, color and inner)
            // circles of the point over the halo
            context.fillStyle = valueCircleColor;
            context.beginPath();
            context.arc(point.x, point.y, 8, 0, Math.PI * 2, true);
            context.fill();
            context.closePath();
            context.fillStyle = point.color;
            context.beginPath();
            context.arc(point.x, point.y, 7, 0, Math.PI * 2, true);
            context.fill();
            context.closePath();
            context.fillStyle = valueCircleColor;
            context.beginPath();
            context.arc(point.x, point.y, 3, 0, Math.PI * 2, true);
            context.fill();
            context.closePath();

            // formats the value of the point and builds its label, with
            // the label of the point followed by the key of its line
            var value = formatValue(point.value);
            var label = point.label ? point.label + " · " + point.key : point.key;

            // measures both the value and the label so that the box
            // is sized to the largest of them
            context.font = "bold " + POINT_VALUE_FONT_SIZE + "px " + labelFontName;
            var valueWidth = context.measureText(value).width;
            context.font = labelFontSize + "px " + labelFontName;
            var labelWidth = context.measureText(label).width;
            var boxWidth = Math.max(valueWidth, labelWidth) + (2 * POINT_BOX_MARGIN);
            var boxHeight = POINT_VALUE_FONT_SIZE + labelFontRealSize + (2 * POINT_BOX_MARGIN) + 4;

            // positions the box centered above the point (below it in
            // case there's no space above) and inside of the chart
            var boxX = Math.max(Math.min(point.x - (boxWidth / 2), chartWidth - boxWidth - 1), 1);
            var boxY = point.y - POINT_BOX_OFFSET - boxHeight;
            boxY = boxY < 1 ? point.y + POINT_BOX_OFFSET : boxY;

            // draws the box with a light shadow and a border, with the
            // color of the line of the point at its top
            context.save();
            context.shadowColor = "rgba(0, 0, 0, 0.12)";
            context.shadowBlur = 6;
            context.shadowOffsetY = 2;
            context.fillStyle = POINT_BOX_COLOR;
            context.beginPath();
            context.roundRectangle(boxX, boxY, boxWidth, boxHeight, 4);
            context.fill();
            context.closePath();
            context.restore();
            context.lineWidth = 1;
            context.strokeStyle = POINT_BOX_BORDER_COLOR;
            context.beginPath();
            context.roundRectangle(boxX, boxY, boxWidth, boxHeight, 4);
            context.stroke();
            context.closePath();
            context.fillStyle = point.color;
            context.fillRect(boxX + 2, boxY, boxWidth - 4, 3);

            // draws both the value and the label of the point centered
            // in the box, the value standing out from the label
            context.fillStyle = labelColor;
            context.font = "bold " + POINT_VALUE_FONT_SIZE + "px " + labelFontName;
            context.fillText(value, boxX + ((boxWidth - valueWidth) / 2),
                boxY + POINT_BOX_MARGIN + POINT_VALUE_FONT_SIZE);
            context.fillStyle = baseColor;
            context.font = labelFontSize + "px " + labelFontName;
            context.fillText(label, boxX + ((boxWidth - labelWidth) / 2),
                boxY + POINT_BOX_MARGIN + POINT_VALUE_FONT_SIZE + 4 + labelFontRealSize);
        };

        var findPoint = function(matchedObject, x, y, radius) {
            // retrieves the points of the chart, set by its last drawing
            var points = matchedObject.data("points") || [];

            // iterates over the points of the chart to find the one that
            // is the nearest to the provided position (within the radius),
            // the first one prevailing over the ones at the same distance
            var nearest = null;
            var nearestDistance = radius;
            for (var index = 0; index < points.length; index++) {
                var point = points[index];
                var distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
                if (distance > radius) {
                    continue;
                }
                if (nearest && distance >= nearestDistance) {
                    continue;
                }
                nearest = point;
                nearestDistance = distance;
            }

            // returns the nearest point, null in case there's
            // no point within the radius of the position
            return nearest;
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

            // retrieve the reference to the "parent" window
            // object to be used in this operation
            var _window = jQuery(window);

            // retrieves the chart element reference as the
            // first element of the chart selection
            var chartElement = chart.get(0);

            // in case there is no chart element to draw in
            // must avoid corrupt drawing, returns immediately
            if (!chartElement) {
                // returns immediately to avoid possible
                // problems in the drawing process
                return;
            }

            // sets the drawing in the chart so that the handlers (that are
            // registered only once) and the retries of the drawing always
            // redraw the chart with its latest options
            matchedObject.data("draw", draw);

            // registers for the resize and page show operations, and for
            // the restore of the canvas, so that in case no invalidation is
            // performed then a redraw is triggered (the canvas may have been
            // cleared meanwhile), the handler is registered only once and
            // unregistered once the chart is destroyed
            var onResize = matchedObject.data("on_resize");
            if (!onResize) {
                onResize = function() {
                    var sizes = {
                        width: _window.width(),
                        height: _window.height()
                    };

                    setTimeout(function() {
                        if (_window.width() !== sizes.width) {
                            return;
                        }
                        if (_window.height() !== sizes.height) {
                            return;
                        }

                        matchedObject.data("draw")();
                    }, 150);
                };
                _window.bind("resize pageshow", onResize);
                matchedObject.bind("contextrestored", onResize);
                matchedObject.bind("destroyed", function() {
                    var onResize = matchedObject.data("on_resize");
                    _window.unbind("resize pageshow", onResize);
                    matchedObject.data("on_resize", null);
                });
                matchedObject.data("on_resize", onResize);
            }

            // registers for the mouse move and the touch start events in
            // the chart so that the point under the pointer is highlighted
            // with its value, and for the mouse leave event so that the
            // highlight is removed, the handlers are registered only once
            var onPoint = matchedObject.data("on_point");
            if (!onPoint) {
                onPoint = function(event) {
                    // retrieves the position of the pointer (or of the touch)
                    // relative to the chart, the space of its points
                    var originalEvent = event.originalEvent || {};
                    var touches = originalEvent.touches;
                    var position = touches && touches.length ? touches[0] : event;
                    var offset = matchedObject.offset();

                    // ignores the mouse events that follow a touch, as they're
                    // emulated by the browser from the touch and would remove
                    // the highlight found with the (larger) radius of the touch
                    var time = new Date().getTime();
                    var touched = matchedObject.data("touched") || 0;
                    if (!touches && time - touched < TOUCH_TIMEOUT) {
                        return;
                    }
                    touches && matchedObject.data("touched", time);
                    var x = position.pageX - offset.left;
                    var y = position.pageY - offset.top;

                    // finds the point under the pointer (with a larger radius
                    // for a touch) and in case it's not the one that is
                    // highlighted updates the highlight, redrawing the chart
                    var radius = touches ? TOUCH_RADIUS : POINT_RADIUS;
                    var point = findPoint(matchedObject, x, y, radius);
                    var current = matchedObject.data("point");
                    var isSame = point && current && point.key === current.key
                        && point.index === current.index;
                    if (isSame || (!point && !current)) {
                        return;
                    }
                    matchedObject.data("point", point);
                    matchedObject.css("cursor", point ? "pointer" : "");
                    matchedObject.data("draw")();
                };
                matchedObject.bind("mousemove touchstart", onPoint);
                matchedObject.bind("mouseleave", function() {
                    // ignores the mouse leave that follows a touch, as it's
                    // emulated by the browser from the touch (the pointer
                    // returning to the mouse) and would remove the highlight
                    var time = new Date().getTime();
                    var touched = matchedObject.data("touched") || 0;
                    if (time - touched < TOUCH_TIMEOUT) {
                        return;
                    }
                    if (!matchedObject.data("point")) {
                        return;
                    }
                    matchedObject.data("point", null);
                    matchedObject.css("cursor", "");
                    matchedObject.data("draw")();
                });
                matchedObject.data("on_point", onPoint);
            }

            // retrieves the chart size, using the traditional
            // dimensions retrieval strategy
            var chartWidth = matchedObject.width();
            var chartHeight = matchedObject.height();

            // in case the chart has no size (eg: not yet attached to the
            // document) drawing it would empty the canvas, so the drawing
            // is retried latter, for a limited number of times and with
            // at most one retry pending (whatever triggers the drawing)
            if (!chartWidth || !chartHeight) {
                var retries = matchedObject.data("retries") || 0;
                var isPending = matchedObject.data("retry_pending");
                if (retries < DRAW_RETRIES && !isPending) {
                    matchedObject.data("retries", retries + 1);
                    matchedObject.data("retry_pending", true);
                    setTimeout(function() {
                        matchedObject.data("retry_pending", false);
                        matchedObject.data("draw")();
                    }, DRAW_RETRY_TIMEOUT);
                }
                logger.warn("Chart not drawn with size:", chartWidth, chartHeight);
                return;
            }
            matchedObject.data("retries", 0);

            // retrieves the chart element context
            var context = chartElement.getContext("2d");

            // in case the current environment is a "retina" one
            // (high density display) then an extra scale operation
            // is performed to provide crisp graphics, the density is
            // read in every drawing (it changes with the screen) and
            // the canvas is sized for it, which also clears it
            var isRetina = window.devicePixelRatio > 1;
            var ratio = isRetina ? 2 : 1;
            chartElement.width = chartWidth * ratio;
            chartElement.height = chartHeight * ratio;
            context.scale(ratio, ratio);

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
            var _drawPoint = options["drawPoint"];

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

            // draws the point under the pointer (if any) with its value
            _drawPoint && drawPoint(matchedObject, options);
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
