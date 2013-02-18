(function(jQuery) {
    jQuery.fn.uconfigurations = function(options) {
        // sets the jquery matched object
        var matchedObject = this;

        // retrieves the various serializes (meta) elements
        //from the contents and parses the ones that are meant
        // to be parsed (using json)
        var mvcPath = jQuery("#mvc-path", matchedObject).html();
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
        matchedObject.data("mvc_path", mvcPath);
        matchedObject.data("object_id", objectId);
        matchedObject.data("username", username);
        matchedObject.data("representation", representation);
        matchedObject.data("definitions", definitions);
        matchedObject.data("alias", alias);
        matchedObject.data("sections", sections);
        matchedObject.data("class_id_url", classIdUrl);
    };
})(jQuery);
