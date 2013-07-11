// Hive Omni ERP
// Copyright (C) 2008-2012 Hive Solutions Lda.
//
// This file is part of Hive Omni ERP.
//
// Hive Omni ERP is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Hive Omni ERP is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Hive Omni ERP. If not, see <http://www.gnu.org/licenses/>.

// __author__    = João Magalhães <joamag@hive.pt>
// __version__   = 1.0.0
// __revision__  = $LastChangedRevision$
// __date__      = $LastChangedDate$
// __copyright__ = Copyright (c) 2008-2012 Hive Solutions Lda.
// __license__   = GNU General Public License (GPL), Version 3

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

        // retrieves the menu elements for the the current
        // structure and applies the menu logic on it
        var menu = jQuery(".menu")
        menu.umenu();

        // retrieves the chat elements for the the current
        // structure and applies the chat logic on it
        var chat = jQuery(".chat", matchedObject)
        chat.uchat();

        // retrieves the eureka as the eureka and
        // then starts the eureka logic on it
        var eureka = jQuery(".eureka", matchedObject);
        eureka.ueureka();

        // retrieves the report as the report and
        // then starts the report logic on it
        var report = jQuery(".report", matchedObject);
        report.ureport();
    };
})(jQuery);

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
                    isValid && jQuery.ulinkasync(href, true, uuid);
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
        updateWindow(base);
        updateHeaderImage(base);
        updateSecondLeft(base);
        updateMenu(base);
        updateNotification(base);
        updateContent(base);
        updateFooter(base);
        updateNavigationList(base);
        updateChat(base);
        updateSidebarRight(base);
        updateOverlaySearch(base);
        updateMeta(base);
    };

    var updateSimple = function(base, body) {
        updateBody(body);
        updateIcon(base);
        updateResources(base);
        updateLocale(base);
        updateWindow(base);
        updateHeaderImage(base);
        updateSecondLeft(base);
        updateMenu(base);
        updateNotification(base);
        updateContentFull(base);
        updateFooter(base);
        updateOverlaySearch(base);
        updateMeta(base);
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
        var _head = jQuery("head");
        var _body = jQuery("body");

        var section = jQuery("#section", base);
        var basePath = jQuery("#base-path", base);
        var section_ = jQuery(".meta > #section");

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

    var updateNotification = function(base) {
        var container = jQuery(".header-notifications-container");
        var notifications = jQuery(".header-notification", base);
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
        var content = base.filter(".content-wrapper");
        var content_ = jQuery("body > .content-wrapper");
        var contentClass = content.attr("class")
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

    var updateChat = function(base) {
        var chat = jQuery(".sidebar-left > .chat", base);
        var chat_ = jQuery(".sidebar-left > .chat");
        var exists = chat_.length > 0;

        if (exists) {
            var url = chat.attr("data-url");
            chat_.attr("data-url", url);
        } else {
            var sideLeft = jQuery(".sidebar-left");
            sideLeft.append(chat);
            chat.uchat();
        }
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

(function(jQuery) {
    /**
     * The regular expression that is going to be used for the verification of
     * the same host policy, required for the async based links.
     */
    var HOST_REGEX = new RegExp(location.host);

    jQuery.ulinkasync = function(href, verify, uuid) {
        // retrievs the reference to the body element to be used
        // for async verification
        var _body = jQuery("body");

        // retrieves the value of the async flag for the current body
        // element in case the value is not set returns immediately
        // with a not processed value (not meant to be handled async)
        var async = _body.data("async");
        if (!async) {
            return false;
        }

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
                            jQuery.uxlocation(hrefR);
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

                        // retrieves the body element and uses it to trigger the data
                        // event indicating that new panel data is available and that
                        // the current layout must be updated (async fashion)
                        var _body = jQuery("body");
                        _body.triggerHandler("data",
                                [data, href, uuid, !verify]);
                    },
                    error : function() {
                        document.location = href;
                    }
                });

        // returns valid as the link execution has been started
        // with success (async request sent)
        return true;
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
        var definitions_s = jQuery("#definitions", matchedObject).html();
        var alias_s = jQuery("#alias", matchedObject).html();
        var definitions = jQuery.parseJSON(definitions_s) || {};
        var alias = jQuery.parseJSON(alias_s) || {};
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
            var value = filter.length == 3
                    ? String(filter[2])
                    : String(filter[1]);
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
                    type : type,
                    url : url,
                    data : data,
                    complete : complete,
                    success : success,
                    error : error
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

        return matchedObject;
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
                                        classIdInt, objectIdInt]);
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
        _document.bind("scan_error", function(event, value) {
                });

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
    jQuery.fn.uchat = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // retrieves the reference to the "global" window
        // object to be used for calculus
        var _window = jQuery(window);

        var placePanels = function(panels) {
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

                // retrieves the panel height and width from the
                // current (chat) panel in iteration
                var panelHeight = panel.outerHeight(true);
                var panelWidth = panel.outerWidth(true);

                // "calculates" the top and left positions for the
                // panel from the panel dimensions and the current
                // visible window dimensions
                var chatTop = windowHeight - panelHeight;
                var chatLeft = windowWidth - panelWidth - extraMargin;

                // sets the top and left positions of the panel, by
                // setting their respective css attributes
                panel.css("top", chatTop + "px");
                panel.css("left", chatLeft + "px");

                // updates the "extra" margin value, using the chat
                // width and the padding value
                extraMargin += panelWidth + 8;
            }
        };

        var updateStatus = function(matchedObject) {
            // retrieves the "global" reference to the body element
            // to be used for the communication
            var _body = jQuery("body");

            // retrieves the url value to be used for the chat
            // communication
            var username = _body.data("username");
            var url = matchedObject.attr("data-url");
            jQuery.ajax({
                        type : "get",
                        url : url + "/chat/status.json",
                        success : function(data) {
                            for (var _username in data) {
                                if (_username == username) {
                                    continue;
                                }

                                var userS = data[_username];
                                userS["username"] = _username;
                                createItem(matchedObject, userS);
                            }

                            matchedObject.data("user_status", data);
                        }
                    });
        };

        var createItem = function(matchedObject, data) {
            // retrieves the budy list for the current
            // chat instance for which the item is going
            // to be added
            var budyList = jQuery(".buddy-list", matchedObject);

            // unpacks the data structure into the various
            // component of the user, in order to be able to
            // construct the list item representing it
            var status = data["status"];
            var objectId = data["object_id"];
            var username = data["username"];
            var representation = data["representation"];

            // creates the list item (budy item) used to represent
            // the user and adds it to the buddy list
            var item = jQuery("<li class=\"budy-" + status
                    + "\" data-user_id=\"" + username + "\" data-object_id=\""
                    + objectId + "\">" + representation + "</li>")
            budyList.append(item);

            // registers for the click event on the item so that
            // a new chat panel is created for the the item in
            // case it's required
            item.click(function() {
                        var element = jQuery(this);
                        var name = element.html();
                        var userId = element.attr("data-user_id");
                        var objectId = element.attr("data-object_id");

                        matchedObject.uchatpanel({
                                    owner : matchedObject,
                                    name : name,
                                    user_id : userId,
                                    object_id : objectId
                                });
                    });
        };

        var dataProcessor = function(data) {
            // parses the data retrieving the json
            // then unpacks the various attributes from it
            var jsonData = jQuery.parseJSON(data);
            var type = jsonData["type"];

            switch (type) {
                case "message" :
                    messageProcessor(jsonData);
                    break;

                case "status" :
                    statusProcessor(jsonData);
                    break;

                default :
                    break;
            }
        };

        var messageProcessor = function(envelope) {
            // retrieves the main attributes from the
            // message to be used in the processing
            var message = envelope["message"];
            var sender = envelope["sender"];

            // tries to retrieve the panel associated with the
            // sender in case no panel is found creates a new
            // one to display the initial message
            var panel = jQuery(".chat-panel[data-user_id=" + sender + "]",
                    matchedObject);
            if (panel.length == 0) {
                var userStatus = matchedObject.data("user_status");
                var userS = userStatus[sender];

                var objectId = userS["object_id"];
                var representation = userS["representation"];

                panel = matchedObject.uchatpanel({
                            owner : matchedObject,
                            name : representation,
                            user_id : sender,
                            object_id : objectId
                        });
            }

            panel.trigger("restore");
            panel.uchatline({
                        message : message
                    });

            // retrieves the reference to the audio object
            // of the current object and plays it
            var audio = jQuery("> audio", matchedObject);
            audio[0].play();
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

            // in case the current status update refers the current
            // users, must return immediately
            if (username == _username) {
                return;
            }

            // updates the user structure information so that
            // it contains the latest version of the information
            // provided by the server data source
            var userStatus = matchedObject.data("user_status");
            var userS = userStatus[_username] || {};
            userS["status"] = status;
            userS["object_id"] = objectId;
            userS["username"] = _username;
            userS["representation"] = representation;
            userStatus[_username] = userS;

            switch (status) {
                case "offline" :
                    var item = jQuery(".buddy-list > li[data-user_id="
                                    + _username + "]", matchedObject)
                    item.remove();
                    break;

                default :
                    var item = jQuery(".buddy-list > li[data-user_id="
                                    + _username + "]", matchedObject)
                    if (item.length == 0) {
                        createItem(matchedObject, envelope);
                    }
                    item.removeClass("budy-online");
                    item.removeClass("budy-busy");
                    item.removeClass("budy-unavailable");
                    item.addClass("budy-" + status);
                    break;
            }
        };

        // iterateas over each of the matched object to add the sound
        // element to be used in notification
        matchedObject.each(function(index, element) {
            // retrieves the reference to the current element in
            // iteration
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

            // retrieves the url value to be used for the chat
            // communication, and then creates the full absolute ur
            // from the base url and the communication suffix
            var url = _element.attr("data-url");
            var absolueUrl = jQuery.uxresolve(url + "/communication");

            // starts the communication infra-structure with a
            // simple timeout and the default callback operations
            _element.communication("default", {
                        url : absolueUrl,
                        channels : ["chat/" + username],
                        timeout : 500,
                        callbacks : [dataProcessor]
                    });

            // registers for the communication connected event so
            // that the user is notified about the new connection
            _element.bind("stream_connected", function() {
                    });

            // registers for the communication disconnected event so
            // that the user is notified about the closing of the connection
            _element.bind("stream_disconnected", function() {
                _body.uxinfo(
                        "The server communication has been disconnected.\\n"
                                + "Please contact your system administrator using [geral@hive.pt].",
                        "Warning", "warning");
            });

            // registers for the communication error event so
            // that the user is notified about the error
            _element.bind("stream_error", function() {
                _body.uxinfo(
                        "There was an error communicating with the server.\\n"
                                + "Please contact your system administrator using [geral@hive.pt].",
                        "Warning", "warning");
            });

            // retrieves the value of the sound ti be played (the
            // url to the sound to be played)
            var sound = _element.attr("data-sound");
            var audio = jQuery("<audio src=\"" + sound
                    + "\" preload=\"none\"></audio>");

            // adds the audio element to the matched object
            matchedObject.append(audio);

            // updates the status information for the current
            // element this should run a remote query to retrieve
            // the most up to date information on all "buddies"
            updateStatus(_element);
        });

        // registers for the event triggered when a new chat
        // is reqeusted this shoud create a new chat panel
        matchedObject.bind("new_chat", function() {
                    var panels = matchedObject.data("panels") || {};
                    placePanels(panels);
                });

        // registers for the event triggered when a chat is
        // meant to be removed from the current system this
        // should remove the associated panel
        matchedObject.bind("delete_chat", function() {
                    var panels = matchedObject.data("panels") || {};
                    placePanels(panels);
                });

        _window.resize(function() {
                    var panels = matchedObject.data("panels") || {};
                    placePanels(panels);
                });
    };
})(jQuery);

(function(jQuery) {
    jQuery.fn.uchatpanel = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // retrives the various options to be used in the
        // creation of the chat panel
        var owner = options["owner"];
        var name = options["name"];
        var userId = options["user_id"];
        var objectId = options["object_id"];
        var ownerId = options["owner_id"];

        // retrieves the current map containin the panels
        // indexed by their "key name" and default to a new
        // map in case it does not exists then tries to retrieve
        // the chat panel with the current name and in case it
        // already exists returns immediately
        var panels = matchedObject.data("panels") || {};
        var chatPanel = panels[name];
        if (chatPanel) {
            return;
        }

        // creates the chat panel structure containing the "typical"
        // header, contents and message structure then appends the
        // structure to the matched object (chat area) and applues the
        // intializers to the structure and sets the name in it
        chatPanel = jQuery("<div class=\"chat-panel budy-available\">"
                + "<div class=\"chat-header\">" + name
                + "<div class=\"chat-buttons\">"
                + "<div class=\"chat-button chat-settings\"></div>"
                + "<div class=\"chat-button chat-close\"></div>" + "</div>"
                + "</div>" + "<div class=\"chat-contents\"></div>"
                + "<div class=\"chat-message\">"
                + "<textarea type=\"text\" class=\"text-area\"></textarea>"
                + "</div>" + "</div>");
        matchedObject.append(chatPanel);
        chatPanel.uxapply();
        chatPanel.attr("data-user_id", userId);
        chatPanel.data("name", name);
        chatPanel.data("user_id", userId);
        chatPanel.data("object_id", objectId);
        chatPanel.data("owner_id", ownerId);

        // retrieves the various components (structures) from the chat pane
        // in order to be used in the operations
        var header = jQuery(".chat-header", chatPanel);
        var contents = jQuery(".chat-contents", chatPanel);
        var message = jQuery(".chat-message", chatPanel);
        var buttonClose = jQuery(".chat-close", chatPanel);
        var buttonMinimize = jQuery(".chat-minimize", chatPanel);
        var textArea = jQuery(".chat-message > .text-area", chatPanel);

        // binds the chat panel to the minimize operation in order
        // to be able to minimize the contents of it
        chatPanel.bind("minimize", function() {
                    // retrieves the reference to the current element
                    // to be used in the minimize operation
                    var element = jQuery(this);

                    // hides the contents and the message parts of
                    // the current chat panel
                    contents.hide();
                    message.hide();

                    // triggers the layout event (reposition the window)
                    // and sets the current element as minimized
                    element.triggerHandler("layout", []);
                    element.data("minimized", true);
                });

        // binds the chat panel to the restore operation in order
        // to be able to "restore" the contents of it
        chatPanel.bind("restore", function() {
                    // retrieves the reference to the current element
                    // to be used in the restore operation
                    var element = jQuery(this);

                    // shows the contents and the message parts of
                    // the current chat panel and schedules the focus
                    // on the text area for the next tick
                    contents.show();
                    message.show();
                    setTimeout(function() {
                                textArea.focus();
                            });

                    // triggers the layout event (reposition the window)
                    // and sets the current element as maximized
                    element.triggerHandler("layout", []);
                    element.data("minimized", false);
                });

        // binds the chat panel to the layout operation in order
        // to be able to "draw" the contents of it correctly
        chatPanel.bind("layout", function() {
                    // retrieves the reference to the current element
                    // to be used in the layout operation
                    var element = jQuery(this);

                    // retrieves the reference to the "global" window
                    // element to be used in the positioning
                    var _window = jQuery(window);

                    // retrieves the height of both the window and the
                    // panel and uses both values to calculate the top
                    // position for the panel
                    var windowHeight = _window.height();
                    var panelHeight = element.outerHeight(true);
                    var panelTop = windowHeight - panelHeight;

                    // sets the top position of the element as the "calculated"
                    // value for the panel top
                    element.css("top", panelTop + "px");
                });

        // registers for the click event in the close button to
        // trigger the removal of the chat panel
        buttonClose.click(function(event) {
                    // retrieves the list of panels from the chat controllers
                    // and removes the current panel from it
                    var panels = matchedObject.data("panels") || {};
                    delete panels[name];

                    // removes the contents of the chat panel and triggers
                    // the delte chat event to redraw the other panels
                    chatPanel.remove();
                    matchedObject.triggerHandler("delete_chat", []);

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

        // registers for the key down event in the text area
        // to detect enter key press and send the current text
        textArea.keydown(function(event) {
                    // retrieves the key value for the current event
                    // to be used to condition changes
                    var keyValue = event.keyCode
                            ? event.keyCode
                            : event.charCode ? event.charCode : event.which;

                    // in case the current key to be pressed is an
                    // enter key must submit the data
                    if (keyValue != 13) {
                        return;
                    }

                    // adds a new chat line to the chat panel with
                    // the contents of the text area
                    chatPanel.uchatline({
                                name : "me",
                                message : textArea.val()
                            });

                    // uses the communication channel to send the
                    // chat data to the other end
                    owner.communication("data", {
                                data : JSON.stringify({
                                            type : "chat",
                                            receiver : userId,
                                            message : textArea.val()
                                        })
                            });

                    // unsets the value from the text area, this should
                    // be considered a clenaup operation
                    textArea.val("");

                    // prevents the default operations for the event
                    // and stops the propagation of it to the top layers
                    event.preventDefault();
                    event.stopPropagation();
                });

        // schedules the a focus operation in the text area
        // for the next tick in the event loop
        setTimeout(function() {
                    textArea.focus();
                });

        // sets the chat panel in the panels sequence
        // and updates it in the matched objec
        panels[name] = chatPanel;
        matchedObject.data("panels", panels)

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

        // retrieves the current attributes to be used
        // for the filling of the line
        var name = options["name"] || matchedObject.data("name");
        var objectId = options["object_id"] || matchedObject.data("object_id");
        var message = options["message"];

        // treates the message so that any newline character found
        // is replaces by the break line tag (html correspondent)
        message = message.replace("\n", "<br/>");

        //var exp = /(\b(https?|ftp|file):\/\/(www.)?youtube.com[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;;

        //message += "<iframe class=\"youtube-player\" type=\"text/html\" src=\"http://www.youtube.com/embed/W-Q7RMpINVo\" frameborder=\"0\" allowFullScreen></iframe>"

        var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        message = message.replace(exp,
                "<a href=\"$1\" target=\"_blank\" class=\"link link-blue\">$1</a>");

        var _body = jQuery("body");
        var mvcPath = _body.data("mvc_path");

        objectId = name == "me" ? _body.data("object_id") : objectId;
        var imageUrl = mvcPath + "omni_web_adm/users/" + objectId
                + "/image?size=32";

        // retrieves the chat contents for the matched object (chat panel)
        // and then retrieves the reference to the last paragraph
        var contents = jQuery(".chat-contents", matchedObject);
        var paragraph = jQuery("> .chat-paragraph:last", contents);

        // retrieves the name (identifier) of the current (last)
        // paragraph to be used
        var _name = paragraph.data("name");

        // in case the name for the author of the line is different
        // from the current name a new paragraph must be created
        if (name != _name) {
            // in case the current paragraph to be created is not the
            // first one a separator element must be created and added
            // to the contents section
            var separator = jQuery("<div class=\"chat-separator\"></div>");
            paragraph.length > 0 && contents.append(separator);

            // creates a new paragraph element associated witht the current
            // name and adds it to the contents element
            paragraph = jQuery("<div class=\"chat-paragraph\"></div>");
            paragraph.css("background-image", "url(" + imageUrl + ")");
            paragraph.css("background-repeat", "no-repeat");
            paragraph.data("name", name);
            contents.append(paragraph);
        }

        // creates the proper perfix checking if this a first line from
        // a paragraph or if it's an existing one
        var prefix = name != _name ? "<strong>" + name + ": </strong>" : "";

        // adds a new chat line to the current paragraph with the message
        // contents of the requested line, then applies the proper styling
        // to the new line to be created so that the various links and other
        // dynamic content is correctly handled
        var chatLine = jQuery("<div class=\"chat-line\">" + prefix + message
                + "</div>");
        paragraph.append(chatLine);
        chatLine.uxapply();

        // retrieves the scroll height of the contents section and used the
        // value to scroll the contents to the bottom position
        var scrollHeight = contents[0].scrollHeight;
        contents.scrollTop(scrollHeight);
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
        // body element
        var _body = jQuery("body");

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
                    var eventKeyCode = event.keyCode
                            ? event.keyCode
                            : event.which;
                    if (eventKeyCode == 27 || eventKeyCode == key) {
                        return;
                    }

                    // stops the event propagation in order to avoid
                    // unwanted global behavior coming  from this key press
                    event.stopPropagation();
                    event.stopImmediatePropagation();
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
                        contentBar.hide();
                        contentBar.css("overflow", "hidden");

                        contentMargin.css("height", "8px");
                        slider.css("margin-top", "0px");
                        element.removeClass("up");
                    } else {
                        contentBar.show();
                        contentBar.css("overflow", "visible");

                        contentMargin.css("height", "60px");
                        slider.css("margin-top", "52px");
                        element.addClass("up");
                    }
                });

        return matchedObject;
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
            return
        }

        // retievs the currently set search parameters present
        // in the url string (from the window object)
        var search = window.location.search;
        var pathname = window.location.pathname;
        var pathname_l = pathname.length;

        // retrieves the extension from the path name and in case
        // the current extension refers a print document the print
        // report attribute is set
        var extension = pathname.slice(pathname_l - 4, pathname_l);
        if (extension == ".prt") {
            matchedObject.attr("data-print", 1);
        }

        // retrieves the various element that componse the
        // current report contents
        var buttons = jQuery(".report-header > .buttons", matchedObject);
        var links = jQuery("> a", buttons);
        var location = jQuery(".report-location", matchedObject);
        var more = jQuery(".report-more", matchedObject);
        var previous = jQuery(".previous", more);
        var next = jQuery(".next", more);

        // updates the report location contents with the unset
        // value set, indicating that no page information is available
        location.html("-");

        // disables both the previous and the next buttons
        // to while no actions are available, on the next
        // update operation their status will be updated
        previous.uxdisable();
        next.uxdisable();

        // iterates over all the present links to update their
        // link values to match the arguments of the current request
        links.each(function(index, element) {
                    var _element = jQuery(this);
                    var href = _element.attr("href");
                    _element.attr("href", href + search);
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

            // shows the print dialog window to start the print
            // procedure
            window.print();
        }

        // registers for the key down event on the document in order
        // to provide easy of use shortcut for navigation
        _document.keydown(function(event) {
                    // sets the report as the matched object, provides
                    // a compatability layer
                    var report = matchedObject;

                    // retrieves the key value
                    var keyValue = event.keyCode
                            ? event.keyCode
                            : event.charCode ? event.charCode : event.which;

                    // switches over the key value
                    switch (keyValue) {
                        // in case it's one of the next keys
                        // (the right arrow or the 'j')
                        case 39 :
                        case 74 :
                            increment(report, options);

                            // breaks the switch
                            break;

                        // in case it's one of the previous keys
                        // (the left arrow or the 'k')
                        case 37 :
                        case 75 :
                            decrement(report, options);

                            // breaks the switch
                            break;

                        // in case it's default
                        default :
                            // breaks the switch
                            break;
                    }
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
            // the report to be used
            var count = matchedObject.data("count");
            var page = matchedObject.data("page");
            var limit = matchedObject.data("limit");
            var items = matchedObject.data("items");

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

            // iterates over all the item in the set to be presented
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

            location.html(String(page + 1) + " / " + String(limit + 1))
        };

        var limits = function(matchedObject, options) {
            var items = matchedObject.data("items");
            var count = matchedObject.data("count");
            var limit = items.length / count;
            limit = parseInt(limit);

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
            dataSource.uxdataquery({}, function(validItems, moreItems) {
                        matchedObject.data("items", validItems);
                        limits(matchedObject, options);
                        update(matchedObject, options);
                    });
        };

        load(matchedObject, options);
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
