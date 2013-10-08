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

            // tries to retrieve the panel associated with the
            // sender in case no panel is found creates a new
            // one to display the initial message
            var panel = jQuery(".chat-panel[data-user_id=" + owner + "]",
                    matchedObject);
            if (panel.length == 0) {
                // retrieves both the object id and the representation from the
                // user structure and uses them to create a new chat panel for
                // the corresponding user conversation
                var objectId = userS["object_id"];
                var representation = userS["representation"];
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

            // triggers the restore event to show up the panel
            // and then adds a chat line to the panel containing
            // the message that was just received
            panel.trigger("restore");
            panel.uchatline({
                        name : name,
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
                    // or to be able to register for the channels
                    pushi.bind("connect", function(event) {
                                this.subscribe("global");
                                this.subscribe("presence-status");
                            });

                    pushi.bind("subscribe", function(event, channel, data) {
                                if (channel != "presence-status") {
                                    return;
                                }

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
                    matchedObject.append(audio);
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
                    var panels = matchedObject.data("panels") || {};
                    panels.remove();
                    matchedObject.data("panels", {})

                    // retrieves the reference to the current pushi object
                    // and triggers the registration for the global and
                    // presence status channels (this is a re-registration)
                    var pushi = element.data("pushi");
                    pushi.subscribe("global");
                    pushi.subscribe("presence-status");
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
