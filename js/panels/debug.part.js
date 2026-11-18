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
            version: "Version",
            environment: "Environment",
            run_mode: "Run mode",
            module: "Module"
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
                _record({
                    time: new Date(),
                    level: "error",
                    name: "console",
                    message: "Unhandled rejection: " + _string(original.reason)
                });
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

        // builds the header of the bar, with its badge, the tabs of its
        // tools, the counts of the errors and the warnings of the logs, the
        // select of the theme, the hint of the shortcut and the button that
        // closes the bar
        var header = jQuery("<div class=\"debug-bar-header\">"
            + "<span class=\"debug-bar-badge\">DEBUG</span>"
            + "<ul class=\"debug-bar-tabs\"></ul>"
            + "<span class=\"debug-bar-count debug-bar-errors\">0</span>"
            + "<span class=\"debug-bar-count debug-bar-warnings\">0</span>"
            + "<label class=\"debug-bar-label\">" + jQuery.uxlocale("Theme") + "</label>"
            + "<select class=\"debug-bar-select debug-bar-theme\"></select>"
            + "<span class=\"debug-bar-shortcut\">Ctrl + Alt + D</span>"
            + "<span class=\"debug-bar-close\" title=\"" + jQuery.uxlocale("Close")
            + "\">&#215;</span>" + "</div>");
        var tools = jQuery("<div class=\"debug-bar-tools\"></div>");
        matchedObject.append(header);
        matchedObject.append(tools);

        // retrieves the references to the elements of the header that are
        // going to be used latter in the operations of the bar
        var tabs = jQuery(".debug-bar-tabs", header);
        var errors = jQuery(".debug-bar-errors", header);
        var warnings = jQuery(".debug-bar-warnings", header);
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

        // updates the bar with the level of the logs of this browser, the
        // one that the tools use (eg: the logs filtering their records)
        matchedObject.data("level", level);

        /**
         * Builds the panel of the logs tool, the records of the logs of the
         * page (newest first) filtered by the level of this browser and by
         * the plugin that logged them, with the switch of the level and the
         * button that clears the records.
         *
         * @param {Element}
         *            panel The panel of the tool to be built.
         */
        var _buildLogs = function(panel) {
            panel.append("<div class=\"debug-bar-toolbar\">"
                + "<label class=\"debug-bar-label\">" + jQuery.uxlocale("Level") + "</label>"
                + "<select class=\"debug-bar-select debug-bar-level\"></select>"
                + "<label class=\"debug-bar-label\">" + jQuery.uxlocale("Plugin") + "</label>"
                + "<select class=\"debug-bar-select debug-bar-plugin\">"
                + "<option value=\"all\">" + jQuery.uxlocale("All plugins") + "</option>"
                + "</select>" + "<span class=\"debug-bar-summary\"></span>"
                + "<span class=\"debug-bar-button debug-bar-clear\">" + jQuery.uxlocale("Clear")
                + "</span>" + "</div>" + "<ul class=\"debug-bar-logs\"></ul>");

            // retrieves the references to the elements of the panel that are
            // going to be used in the rendering of the records
            var levelSelect = jQuery(".debug-bar-level", panel);
            var plugin = jQuery(".debug-bar-plugin", panel);
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
             * Renders the records of the logs in the list of the panel, the
             * newest first, keeping the ones at or above the level of the bar
             * and of the selected plugin, and updates the options of the
             * select of the plugins with the plugins of the records.
             */
            var _render = function() {
                var records = _window.data("udebug_records");
                var minimum = LEVELS.indexOf(matchedObject.data("level"));
                var selected = plugin.val();
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
                    var time = record.time;
                    var hours = _pad(time.getHours(), 2);
                    var minutes = _pad(time.getMinutes(), 2);
                    var seconds = _pad(time.getSeconds(), 2);
                    var item = jQuery("<li class=\"debug-bar-log " + _level + "\">"
                        + "<span class=\"debug-bar-log-time\"></span>"
                        + "<span class=\"debug-bar-log-level\"></span>"
                        + "<span class=\"debug-bar-log-name\"></span>"
                        + "<span class=\"debug-bar-log-message\"></span>" + "</li>");
                    var timeElement = jQuery(".debug-bar-log-time", item);
                    var levelElement = jQuery(".debug-bar-log-level", item);
                    var nameElement = jQuery(".debug-bar-log-name", item);
                    var messageElement = jQuery(".debug-bar-log-message", item);
                    timeElement.text(hours + ":" + minutes + ":" + seconds);
                    levelElement.text(record.level.toUpperCase());
                    nameElement.text(record.name);
                    messageElement.text(record.message);
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

            // registers for the records, the level and the clear of the bar
            // and for the change of the plugin so that the records are
            // rendered again, and renders the records already kept
            matchedObject.bind("record level clear", _render);
            plugin.change(_render);
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
         * entities of omni (by their class and object id) and any code,
         * the presets and the entities being retrieved once it's shown.
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
                + "<span class=\"debug-bar-hint\">"
                + jQuery.uxlocale(
                    "Each code is typed as a scanner does, a key every 10 ms ending in Enter")
                + "</span>" + "</div>");

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
             * and release every 10 ms ending in the enter key, on the document
             * (where the scan detection listens), with no field focused.
             *
             * @param {String}
             *            value The code to be typed.
             */
            var _type = function(value) {
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
                        }, 10);
                        return;
                    }
                    var elapsed = new Date().getTime() - start;
                    typing = false;
                    typed.text(String.prototype.formatC.apply(
                        jQuery.uxlocale("Typed %s (%s keys in %s ms)"),
                        [value, keys.length, elapsed]));
                    logger.info("Scan typed with keys:", keys.length);
                    _remember(value);
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

            // registers for the panel being shown so that the presets and the
            // classes of the entities are retrieved, once, the first time
            panel.bind("shown", function() {
                if (panel.data("loaded")) {
                    return;
                }
                panel.data("loaded", true);
                jQuery.uquery({
                    url: "omni_util/debug_presets.json",
                    data: {},
                    success: function(data) {
                        _renderPresets(data);
                    },
                    error: function(request, status, error) {
                        logger.warn("Presets retrieval failed:", request.status, error);
                        _renderPresets([]);
                    }
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
         * Builds the panel of the session tool, the values of the session of
         * the page (as rendered in the bar) plus the level of the logs of this
         * browser and whether the notifications are silent.
         *
         * @param {Element}
         *            panel The panel of the tool to be built.
         */
        var _buildSession = function(panel) {
            panel.append("<ul class=\"debug-bar-session-list\"></ul>");
            var list = jQuery(".debug-bar-session-list", panel);
            var session = jQuery(".debug-bar-session > li", matchedObject);

            /**
             * Renders the values of the session, the ones rendered in the
             * bar followed by the ones of this browser.
             */
            var _render = function() {
                list.empty();
                var values = [];
                session.each(function() {
                    var element = jQuery(this);
                    var name = element.attr("data-name");
                    var label = SESSION_LABELS[name]
                        || name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, " ");
                    values.push([jQuery.uxlocale(label), element.text()]);
                });
                var sounds = _body.data("notification_sounds") || {};
                values.push([jQuery.uxlocale("Log level"), jQuery.uxlocale(
                    matchedObject.data("level").charAt(0).toUpperCase()
                        + matchedObject.data("level").slice(1))]);
                values.push([jQuery.uxlocale("Silent notifications"),
                    jQuery.uxlocale(jQuery.isEmptyObject(sounds) ? "Yes" : "No")]);
                for (var index = 0; index < values.length; index++) {
                    var item = jQuery("<li class=\"debug-bar-session-item\">"
                        + "<span class=\"debug-bar-session-key\"></span>"
                        + "<span class=\"debug-bar-session-value\"></span>" + "</li>");
                    var keyElement = jQuery(".debug-bar-session-key", item);
                    var valueElement = jQuery(".debug-bar-session-value", item);
                    keyElement.text(values[index][0]);
                    valueElement.text(values[index][1]);
                    list.append(item);
                }
            };

            // registers for the level of the bar so that the values are
            // rendered again, and renders them
            matchedObject.bind("level", _render);
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
            name: "session",
            title: "Session",
            build: _buildSession
        }];

        // iterates over the tools of the bar, in their order, to create the
        // tab and the panel of each of them, letting the tool build its panel
        for (var index = 0; index < TOOLS.length; index++) {
            var tool = TOOLS[index];
            var tab = jQuery("<li class=\"debug-bar-tab\" data-name=\"" + tool.name + "\">"
                + jQuery.uxlocale(tool.title) + "</li>");
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
         * Updates the counts of the errors and of the warnings of the
         * header of the bar from the records of the logs.
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
            errors.text(String(errorCount));
            warnings.text(String(warningCount));
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
         * Shows the bar, marking the body so that the notifications at the
         * bottom are raised above it, with the last tool selected.
         */
        var _show = function() {
            matchedObject.addClass("open");
            _body.addClass("debug-bar-open");
            _set("omni:debug:open", "1");
            _select(_get("omni:debug:tool"));
        };

        /**
         * Hides the bar, unmarking the body.
         */
        var _hide = function() {
            matchedObject.removeClass("open");
            _body.removeClass("debug-bar-open");
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
            _set("omni:debug:theme", _theme);
        });

        // registers for the clear of the records of the logs (by the logs
        // tool) so that the counts of the header are updated
        matchedObject.bind("clear", function() {
            _count();
        });

        // registers for the click in the close button so that the bar is
        // hidden (shown again by the shortcut)
        close.click(function() {
            _hide();
        });

        // starts the variables that are going to store the handlers of the
        // records of the logs and of the keys of the document, so that they
        // are unregistered once the bar is destroyed (eg: its contents
        // replaced by the async navigation)
        var onRecord = null;
        var onKeyDown = null;

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

        matchedObject.bind("destroyed", function() {
            _body.unbind("debug_record", onRecord);
            _document.unbind("keydown", onKeyDown);
            _body.removeClass("debug-bar-open");
        });

        // updates the counts of the header from the records already kept
        // and shows the bar in case it was left open in this browser
        _count();
        _get("omni:debug:open") === "1" && _show();

        // returns the object
        return this;
    };
})(jQuery);
