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

jQuery(document).ready(function() {
            // retrieves the body
            var _body = jQuery("body");

            // retrieves the filters
            var filter = jQuery(".filter");

            // applies the ui component to the body
            _body.uxapply();

            // FAZER UM PLUGIN PARA SUBSTITUI ESTE CHAMADO TOGGLE VISIBLE
            jQuery(".filter-button").click(function() {
                        // retrieves the element
                        var element = jQuery(this);

                        // retrieves the filter and the filter options
                        var filter = element.parents(".filter");
                        var filterOptions = jQuery(".filter-options", filter);

                        // checks if the filter options is visible
                        var filterOptionsVisible = filterOptions.is(":visible");

                        if (filterOptionsVisible) {
                            filterOptions.hide();
                            element.removeClass("selected");
                        } else {
                            filterOptions.show();
                            element.addClass("selected");
                        }
                    });

            // TODO: Remove this and generalize this concepts
            jQuery(".menu").bind("show", function() {
                        // tenho de apagar o que est actualmente e mostrar o outro
                        // ou fazer push para a stack para depois fazer pop
                        var element = jQuery(this);

                        jQuery(".switch-panel").hide();
                        jQuery(".account-panel").show();

                        // repositions the menu (link)
                        element.uxmenulink("reposition");
                    });

            // TODO: Remove this and generalize this concepts
            jQuery(".switch").click(function() {
                        // tenho de apagar o que est actualmente e mostrar o outro
                        // ou fazer push para a stack para depois fazer pop
                        var element = jQuery(this);
                        var menu = element.parents(".menu");

                        jQuery(".account-panel").hide();
                        jQuery(".switch-panel").show();

                        // repositions the menu (link)
                        menu.uxmenulink("reposition");
                    });

            // TODO: Remove this and generalize this concepts
            jQuery(".back").click(function() {
                        // tenho de apagar o que est actualmente e mostrar o outro
                        // ou fazer push para a stack para depois fazer pop
                        var element = jQuery(this);
                        var menu = element.parents(".menu");

                        jQuery(".account-panel").show();
                        jQuery(".switch-panel").hide();

                        // repositions the menu (link)
                        menu.uxmenulink("reposition");
                    });

            // @TODO: had to add this to manipulate windows (better with ux?)
            jQuery(".window-paypal-api-service .button-cancel").click(
                    function() {
                        jQuery(".window-paypal-api-service").uxwindow("hide");
                    });

            jQuery(".window-paypal-api-service .button-confirm").click(
                    function() {
                        jQuery(".window-paypal-api-service .form").submit();
                        jQuery(".window-paypal-api-service").uxwindow("hide");
                    });

            jQuery(".paypal-api-service-authorize-button").click(function() {
                        jQuery(".window-paypal-api-service").uxwindow("show");
                    });

            jQuery(".window-easypay-api-service .button-cancel").click(
                    function() {
                        jQuery(".window-easypay-api-service").uxwindow("hide");
                    });

            jQuery(".window-easypay-api-service .button-confirm").click(
                    function() {
                        jQuery(".window-easypay-api-service .form").submit();
                        jQuery(".window-easypay-api-service").uxwindow("hide");
                    });

            jQuery(".easypay-api-service-authorize-button").click(function() {
                        jQuery(".window-easypay-api-service").uxwindow("show");
                    });

            // retrieves the urrent body element and then applies
            // the uscope plugins to it
            var _body = jQuery("body");
            _body.uapply();
        });

(function($) {
    jQuery.fn.uapply = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // applies the configurations to the matched object
        // (global configurations)
        matchedObject.uconfigurations();

        // starts the scan plugin system in the matched object
        // (this is going to be a global scan)
        matchedObject.uscan();
    };
})(jQuery);

(function($) {
    jQuery.fn.uconfigurations = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // retrieves the various serializes (meta) elements
        //from the contents and parses the ones that are meant
        // to be parsed (using json)
        var mvcPath = jQuery("#mvc-path", matchedObject).html();
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
        matchedObject.data("mvc_path", mvcPath);
        matchedObject.data("definitions", definitions);
        matchedObject.data("alias", alias);
        matchedObject.data("sections", sections);
        matchedObject.data("class_id_url", classIdUrl);
    };
})(jQuery);

(function($) {
    jQuery.fn.uscan = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // retrieves the reference to the top level
        // document and body elements
        var _document = jQuery(document);
        var _body = jQuery("body");

        // registers for the scan event in the document
        // to be able to react to it
        _document.bind("scan", function(event, value) {
                    // retrieves the mvc path and the class id url
                    // map for the current page
                    var mvcPath = _body.data("mvc_path");
                    var classIdUrl = _body.data("class_id_url");

                    // retrieves the version of the barcode then
                    // retrieves the class of the object that is
                    // represented by the barcode and then retrieves
                    // the identifier of the object
                    var version = value.slice(0, 2);
                    var classId = value.slice(2, 6);
                    var objectId = value.slice(6);

                    // converts the class identifier into an integer
                    // to be used in the resolution
                    var classIdInt = parseInt(classId);

                    // constructs the url using the base mvc path and
                    // appending the url to the requested class
                    var baseUrl = mvcPath + classIdUrl[classIdInt];

                    // replaces the left padded zeros in the object
                    // id to contruct the final object id, then uses
                    // it to redirect the user agent to the show page
                    objectId = objectId.replace(/^0+|\s+$/g, "");
                    document.location = baseUrl + objectId;
                });

        // registers for the scan erro event in the document
        // to be able to react to it
        _document.bind("scan_error", function(event, value) {
                });
    };
})(jQuery);
