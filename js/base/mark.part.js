(function(jQuery) {
    jQuery.fn.umark = function(options) {
        // sets the jquery matched object (the field
        // to be marked in its editable table)
        var matchedObject = this;

        // retrieves the table body of the field and removes the marks
        // of its other fields (if any), as only one field is marked
        var tableBody = matchedObject.parents("tbody");
        var cells = jQuery("td", tableBody);
        var fields = jQuery(".text-field", tableBody).not(matchedObject);
        cells.removeClass("next-horizontal");
        cells.removeClass("next-vertical");
        fields.removeClass("active");

        // marks the field as the active one (without focusing it, so that
        // the next scan is a scan and not typed into the field)
        matchedObject.addClass("active");

        // retrieves the cell and the row of the field and the
        // equivalent cell of the next visible row
        var cell = matchedObject.parents("td");
        var row = matchedObject.parents("tr");
        var rowCells = jQuery("td:not(.hidden)", row);
        var nextRow = row.nextAll("tr:not(.hidden)").first();
        var cellIndex = rowCells.index(cell);
        var nextRowCell = jQuery("td:not(.hidden):eq(" + cellIndex + ")", nextRow);

        // adds the next horizontal and next vertical classes to the
        // next cell and to the next row equivalent cell, as done by
        // the editable tables for the focused fields, so that every
        // border of the field is highlighted
        var nextCell = cell.next();
        nextCell.addClass("next-horizontal");
        nextRowCell.addClass("next-vertical");

        // returns the object
        return this;
    };
})(jQuery);
