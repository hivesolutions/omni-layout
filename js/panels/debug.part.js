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
         * Sets the height of the dock of the bar, in whole pixels, bounded
         * by its minimum height and by its maximum one for the height of the
         * window, with the notifications at the bottom of the page raised
         * above it.
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
        };

        /**
         * Shows the bar, marking the body and raising the notifications at
         * the bottom above it, with the last tool selected.
         */
        var _show = function() {
            matchedObject.addClass("open");
            _body.addClass("debug-bar-open");
            _raise();
            _set("omni:debug:open", "1");
            _select(_get("omni:debug:tool"));
        };

        /**
         * Hides the bar, unmarking the body and lowering the notifications
         * at the bottom.
         */
        var _hide = function() {
            matchedObject.removeClass("open");
            _body.removeClass("debug-bar-open");
            _raise();
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
        // records of the logs, of the keys of the document and of the resize
        // of the window, so that they are unregistered once the bar is
        // destroyed (eg: its contents replaced by the async navigation)
        var onRecord = null;
        var onKeyDown = null;
        var onResize = null;

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

        // registers for the end of the async navigation so that the body is
        // marked again while the bar is open (as the update of the page sets
        // the classes of the body of the next page, without the marker),
        // unregistering once the bar is destroyed
        var onPostAsync = null;
        _body.bind("post_async", onPostAsync = function() {
            var isOpen = matchedObject.hasClass("open");
            isOpen && _body.addClass("debug-bar-open");
        });
        matchedObject.bind("destroyed", function() {
            _body.unbind("post_async", onPostAsync);
        });

        // registers for the resize of the window so that the height of the
        // dock is bounded again by the (new) height of the window
        _window.bind("resize", onResize = function() {
            _height(matchedObject.data("height"));
        });

        matchedObject.bind("destroyed", function() {
            var stack = jQuery("> .notifications-stack.bottom-left", _body);
            _body.unbind("debug_record", onRecord);
            _document.unbind("keydown", onKeyDown);
            _window.unbind("resize", onResize);
            _body.removeClass("debug-bar-open");
            stack.css("bottom", "");
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
