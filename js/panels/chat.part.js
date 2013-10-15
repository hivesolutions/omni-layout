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
                                    object_id : objectId,
                                    focus : true
                                });
                    });
        };

        var dataProcessor = function(data) {
            // parses the data retrieving the json
            // then unpacks the various attributes from it
            var isString = typeof data == "string";
            var jsonData = isString ? jQuery.parseJSON(data) : data;
            var type = jsonData["type"];

            // switches over the type of data that was received
            // handling the different data types accordingly
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
            var name = sender == username ? "me" : representation;

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
                        message : message
                    });
            panel.triggerHandler("blink", [title]);

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
                    var buddyList = jQuery("> .buddy-list", _element);

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
                    var absolueUrl = jQuery.uxresolve(url + "/pushi");

                    // retrieves the app key value to be used for the establishement
                    // of the pushi connection, then uses it as the first argument
                    // in the construction of the proxy object
                    var key = _element.attr("data-key");
                    var pushi = new Pushi(key, {
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
                            });

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

                                // clears the current budy list so that it can get populated
                                // with the "new" members that are part of the presence channel
                                // these are considered to be the new subscriptions
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

                    pushi.bind("message", function(event, data, channel) {
                                dataProcessor(data);
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

                    // retrieves the reference to the current pushi object
                    // and triggers the registration for the global and
                    // presence status channels (this is a re-registration)
                    var pushi = element.data("pushi");
                    pushi.invalidate("global");
                    pushi.invalidate("presence-status");
                    pushi.subscribe("global");
                    pushi.subscribe("presence-status");
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
            placePanels(panels);
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
        var focus = options["focus"];

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
        chatPanel.data("owner", owner);
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
                    var textArea = jQuery(".chat-message > .text-area", element);
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
                    var textArea = jQuery(".chat-message > .text-area", element);
                    textArea.uxdisable();

                    // triggers the unblick event because a disabled panel
                    // is not able to blink (no interaction)
                    element.triggerHandler("unblink");
                });

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

        // regiters for the blink event so that the blink operation
        // may be triggered by the blink event
        chatPanel.bind("blink", function(event, message) {
                    // retrieves the reference to the current element, that is
                    // going to be used in the blink operation
                    var element = jQuery(this);

                    // retrieves the current text area and checks if it
                    // is currently focsued in case it is returns immediately
                    // as it's not possible to blick a focused panel
                    var textArea = jQuery(".chat-message > .text-area", element);
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
                    // the delte chat event to redraw the other panels
                    chatPanel.remove();
                    matchedObject.triggerHandler("delete_chat", []);
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

        // registers for the focus on the text area so that the
        // blink operation may be canceled
        textArea.focus(function() {
                    var element = jQuery(this);
                    var chatPanel = element.parents(".chat-panel");
                    chatPanel.triggerHandler("unblink");
                });

        // registers for the click event on the contents as this
        // click will also disable the blinking
        contents.click(function() {
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
                    var channel = channelNames.join("_");

                    // adds a new chat line to the chat panel with
                    // the contents of the text area
                    chatPanel.uchatline({
                                name : "me",
                                message : textArea.val()
                            });

                    // creates the envelope structure containing
                    // the data of the target user and the message
                    // extraceterd from the current text area
                    var data = JSON.stringify({
                                type : "message",
                                sender : username,
                                receiver : userId,
                                message : textArea.val()
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

        // schedules the a focus operation in the text area
        // for the next tick in the event loop
        focus && setTimeout(function() {
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

    /**
     * The regular expression to be used in the matching of url expression to be
     * substituted with link based elements.
     */
    var URL_REGEX = new RegExp(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig);

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
        var admSection = alias["omni_web_adm"] || "omni_web_adm";

        // retrieves the current attributes to be used
        // for the filling of the line
        var name = options["name"] || matchedObject.data("name");
        var objectId = options["object_id"] || matchedObject.data("object_id");
        var message = options["message"];

        // treates the message so that any newline character found
        // is replaces by the break line tag (html correspondent)
        message = message.replace("\n", "<br/>");

        // runs the regex based replacement in the values so that
        // the correct component is displayed in the chat line
        message = message.replace(URL_REGEX,
                "<a href=\"$1\" target=\"_blank\" class=\"link link-blue\">$1</a>");

        // retrieves the correct object id for the current message owner
        // and uses it to create the image url of the user that
        // created the current chat line
        objectId = name == "me" ? _body.data("object_id") : objectId;
        var imageUrl = mvcPath + admSection + "/users/" + objectId
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
