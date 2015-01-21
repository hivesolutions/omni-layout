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
            var item = jQuery("<li class=\"budy-" + status
                    + "\" data-user_id=\"" + username + "\" data-object_id=\""
                    + objectId + "\">" + representation + "</li>");

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
                                    owner : matchedObject,
                                    name : name,
                                    user_id : userId,
                                    object_id : objectId,
                                    focus : true
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
                case "message" :
                    messageProcessor(jsonData, mid, timestamp);
                    break;

                case "status" :
                    statusProcessor(jsonData);
                    break;

                default :
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
                            owner : matchedObject,
                            name : representation,
                            user_id : owner,
                            object_id : objectId
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
                        name : name,
                        message : message,
                        mid : mid,
                        timestamp : timestamp
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
                case "offline" :
                    var item = jQuery(".buddy-list > li[data-user_id="
                                    + _username + "]", matchedObject)
                    item.remove();

                    // retrieves the complete set of panels and tries
                    // to find the one for the user to be logged out
                    // and in case it exists disables it
                    var panels = matchedObject.data("panels") || {};
                    var panel = panels[representation];
                    panel && panel.triggerHandler("disable");

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
                                baseUrl : url,
                                authEndpoint : absolueUrl
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
                                        type : "status",
                                        status : "online",
                                        object_id : member.object_id,
                                        username : member.username,
                                        representation : member.representation
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
                                    type : "status",
                                    status : "online",
                                    object_id : member.object_id,
                                    username : member.username,
                                    representation : member.representation
                                };
                                dataProcessor(envelope);
                            });

                    pushi.bind("member_removed",
                            function(event, channel, member) {
                                var envelope = {
                                    type : "status",
                                    status : "offline",
                                    object_id : member.object_id,
                                    username : member.username,
                                    representation : member.representation
                                };
                                dataProcessor(envelope);
                            });

                    // saves the current pushi object reference for
                    // latter usage, in the current instance
                    _element.data("pushi", pushi);

                    // retrieves the value of the sound ti be played (the
                    // url to the sound to be played)
                    var sound = _element.attr("data-sound");
                    var audio = jQuery("<audio src=\"" + sound
                            + "\" preload=\"none\"></audio>");

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
                    element.append("<div class=\"loading\">" + signinS
                            + "<br /><b>" + username + "</b></div>");
                    element.append("<div class=\"disconnected\">"
                            + disconnectedS + "<br /><b>" + retryingS
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
                                    baseUrl : url,
                                    authEndpoint : pushi.options.authEndpoint
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
        matchedObject.length > 0
                && _body.bind("pre_async", onPreAsync = function() {
                            matchedObject.triggerHandler("push");
                        });
        matchedObject.bind("destroyed", function() {
                    _body.unbind("pre_async", onPreAsync);
                });

        // enables the post async event listening to be able to
        // restore the state of the chat element back to the original
        // values before the async operation, note that this registration
        // is reverted when the chat panel is removed from dom
        matchedObject.length > 0
                && _body.bind("post_async", onPostAsync = function() {
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
        chatPanel = jQuery("<div class=\"chat-panel budy-available\">"
                + "<div class=\"chat-header\">"
                + name
                + "<div class=\"chat-buttons\">"
                + "<div class=\"chat-button chat-settings\"></div>"
                + "<div class=\"chat-button chat-close\"></div>"
                + "</div>"
                + "</div>"
                + "<div class=\"chat-contents\"></div>"
                + "<div class=\"chat-message\">"
                + "<textarea type=\"text\" class=\"text-area\"></textarea>"
                + "<textarea type=\"text\" class=\"text-area hidden\"></textarea>"
                + "</div>" + "</div>");
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
            maxScrollHeight = currentScroll + contentsHeight
                    - MINIMUM_CONTENT_HEIGHT;
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
            // current peer channelt this would populate the chat initialy
            var pushi = owner.data("pushi");
            pushi.latest("peer-status:" + channel, skip, count,
                    function(channel, data) {
                        // retrieves the reference to the events sequence from the
                        // provided data object, this value will be percolated (from reverse)
                        // to be able to create the initial chat lines
                        var events = data.events;
                        for (var index = events.length - 1; index >= 0; index--) {
                            var event = events[index];
                            var mid = event.mid;
                            var timestamp = event.timestamp;
                            var _data = event.data.data;
                            var struct = _data
                                    ? jQuery.parseJSON(_data)
                                    : _data;
                            chatPanel.uchatline({
                                        name : struct.sender == username
                                                ? "me"
                                                : name,
                                        message : struct.message,
                                        mid : mid,
                                        timestamp : timestamp,
                                        target : target
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
                        borderBottom = borderBottom
                                || element.css("border-bottom-width");
                        var borderWidth = parseInt(borderBottom);
                        borderWidth = borderWidth || 0;

                        // retrieves the height of both the contents and
                        // message areas and then calculates the final
                        // offset from their height values and a possible
                        // extra border value from the chat panels
                        var contentsHeight = contents.outerHeight(true);
                        var messageHeight = message.outerHeight(true);
                        var offset = contentsHeight + messageHeight
                                + borderWidth;

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
                        scrollTop : scrollTop
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
                    var keyValue = event.keyCode
                            ? event.keyCode
                            : event.charCode ? event.charCode : event.which;

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

                    // adds a new chat line to the chat panel with
                    // the contents of the text area
                    chatPanel.uchatline({
                                name : "me",
                                message : message
                            });

                    // creates the envelope structure containing
                    // the data of the target user and the message
                    // extraceterd from the current text area
                    var data = JSON.stringify({
                                type : "message",
                                sender : username,
                                receiver : userId,
                                message : message
                            });

                    // retrieves the current pushi object reference and
                    // uses it to send a message to the peer channel
                    // associated with the pair
                    var pushi = owner.data("pushi");
                    pushi.sendChannel("message", data, "peer-status:" + channel);

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
            scrollHeight = scrollHeight > maxScrollHeight
                    ? maxScrollHeight
                    : scrollHeight;

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
        var imageUrl = mvcPath + admSection + "/users/" + objectId
                + "/image?size=32";

        // retrieves the complete set of paragraphs from the current chat
        // panel and then runs a reverse iteration in them trying to
        // find the best matching paragraph for the current line, the
        // first that contains a lower timestamp than the provided one
        var paragraphs = jQuery("> .chat-paragraph", contents);
        var paragraph = null;
        for (var index = paragraphs.length - 1; index >= 0; index--) {
            var _paragraph = jQuery(paragraphs[index]);
            var _name = _paragraph.data("name");
            var _timestamp = _paragraph.data("timestamp");
            var isSection = _timestamp <= timestamp;
            var isBuble = _name == name
                    && Math.abs(timestamp - _timestamp) <= 60;
            if (!isSection && !isBuble) {
                continue;
            }
            paragraph = _paragraph;
            break;
        }

        // retrieves the name (identifier) of the current (last)
        // paragraph to be used and the timestamp of the same
        // item to measure the "time gap between both"
        var _name = paragraph ? paragraph.data("name") : null;
        var _timestamp = paragraph ? paragraph.data("timestamp") : 0;

        // in case the name for the author of the line is different
        // from the current name or the time gap between messages
        // is greater than expected a new paragraph must be created
        if (name != _name || Math.abs(timestamp - _timestamp) > 60) {
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
                        date : date,
                        format : "%d/%m %H:%M"
                    });
            var dayString = _body.uxtimestamp("format", {
                        date : date,
                        format : "%d %B %Y"
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
            paragraph = jQuery("<div class=\"chat-paragraph\">"
                    + "<div class=\"chat-name\">" + nameLocale + "</div>"
                    + "<div class=\"chat-time\">" + timeString + "</div>"
                    + "</div>");
            paragraph.css("background-image", "url(" + imageUrl + ")");
            paragraph.css("background-repeat", "no-repeat");
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
        chatLine.data("timestamp", timestamp);

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
        var lastLine = jQuery(".chat-line:first", paragraph);
        var lastTimestamp = paragraph.data("timestamp");
        paragraph.data("timestamp", timestamp);

        // verifies if there's a target area for the scroll result, meaning
        // that the scroll of the chat contents should be restored to the
        // upper position of that same provided target, to be able to restore
        // the scroll position the fix scroll function is created
        if (target) {
            target = jQuery(target);
            var targetMargin = parseInt(target.css("margin-top"));
            targetMargin = isNaN(targetMargin) ? 0 : targetMargin;
            var settings = {
                offset : targetMargin * -1
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
    var IMAGE_REGEX = new RegExp(/(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*\.(png|jpg|jpeg|gif)[-A-Z0-9+&@#\/%?=~_|!:,.;]*)/ig);

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
            extras += "<a href=\"" + result + "\" target=\"_blank\">"
                    + "<img src=\"" + result + "\"/>" + "</a>";
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
            extras += "<iframe height=\"200\""
                    + " src=\"//www.youtube.com/embed/" + youtubeId
                    + "?controls=0\"" + " frameborder=\"0\"></iframe>";
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
