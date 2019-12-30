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
        var options = jQuery.extend(defaults, options);

        // sets the jquery matched object
        var matchedObject = this;

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
            context.line(marginLeft + verticalLabelWidth, marginTop + verticalAxisSize, marginLeft +
                verticalLabelWidth + horizontalAxisSize + 1, marginTop + verticalAxisSize);

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
                valueS = value.toString().slice(0, 3) + " " + unitS;

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

            // retrieves the data values
            var dataValues = data["values"];

            // retrieves the chart colors length
            var chartColorsLength = chartColors.length;

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
            var drawAuxiliaryAxis = options["drawAuxiliaryAxis"] ? options["drawAuxiliaryAxis"] :
                DRAW_AUXILIARY_AXIS;
            var drawLabels = options["drawLabels"] ? options["drawLabels"] : DRAW_LABELS;
            var drawLines = options["drawLines"] ? options["drawLines"] : DRAW_LINES;
            var drawLabelBox = options["drawLabelBox"] ? options["drawLabelBox"] : DRAW_LABEL_BOX;

            // sets the ui values
            var labelFontName = options["labelFontName"] ? options["labelFontName"] : LABEL_FONT_NAME;
            var labelFontSize = options["labelFontSize"] ? options["labelFontSize"] : LABEL_FONT_SIZE;
            var labelFontRealSize = options["labelFontRealSize"] ? options["labelFontRealSize"] :
                LABEL_FONT_REAL_SIZE;
            var baseColor = options["baseColor"] ? options["baseColor"] : BASE_COLOR;
            var labelColor = options["labelColor"] ? options["labelColor"] : LABEL_COLOR;
            var axisColor = options["axisColor"] ? options["axisColor"] : AXIS_COLOR;
            var auxiliaryAxisColor = options["auxiliaryAxisColor"] ? options["auxiliaryAxisColor"] :
                AUXILIARY_AXIS_COLOR;
            var valueCircleColor = options["valueCircleColor"] ? options["valueCircleColor"] :
                VALUE_CIRCLE_COLOR;
            var backgroundCircleColor = options["backgroundCircleColor"] ? options["backgroundCircleColor"] :
                BACKGROUND_CIRCLE_COLOR;
            var backgroundBoxColor = options["backgroundBoxColor"] ? options["backgroundBoxColor"] :
                BACKGROUND_BOX_COLOR;
            var chartColors = options["chartColors"] ? options["chartColors"] : CHART_COLORS;

            // sets the number of steps
            var verticalSteps = options["verticalSteps"] ? options["verticalSteps"] : VERTICAL_STEPS;
            var horizontalSteps = options["horizontalSteps"] ? options["horizontalSteps"] :
                HORIZONTAL_STEPS;

            // sets the maximum and minimum values and calculates
            // the range value
            var maximumValue = options["maximumValue"] ? Math.ceil(options["maximumValue"] / verticalSteps) *
                verticalSteps : MAXIMUM_VALUE;
            var minimumValue = options["minimumValue"] ? options["minimumValue"] : MINIMUM_VALUE;
            var rangeValue = maximumValue - minimumValue;

            // the increment in each step value to be used
            var stepValue = Math.round(rangeValue / verticalSteps);

            // retrieves the horizontal and vertical label width
            // and height values
            var horizontalLabelHeight = options["horizontalLabelHeight"] ? options["horizontalLabelHeight"] :
                HORIZONTAL_LABEL_HEIGHT;
            var verticalLabelWidth = options["verticalLabelWidth"] ? options["verticalLabelWidth"] :
                VERTICAL_LABEL_WIDTH;

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
            var boxMarginHorizontal = options["boxMarginHorizontal"] ? options["boxMarginHorizontal"] :
                BOX_MARGIN_HORIZONTAL;
            var boxMarginVertical = options["boxMarginVertical"] ? options["boxMarginVertical"] :
                BOX_MARGIN_VERTICAL;
            var boxHorizontalOffset = options["boxHorizontalOffset"] ? options["boxHorizontalOffset"] :
                BOX_HORIZONTAL_OFFSET;
            var boxVerticalOffset = options["boxVerticalOffset"] ? options["boxVerticalOffset"] :
                BOX_VERTICAL_OFFSET;

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
            var boxX = marginLeft + verticalLabelWidth + horizontalAxisSize - boxWidth -
                boxHorizontalOffset;
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

            // retrieve the reference to the "parent" boyd
            // object to be used in this operation
            var _body = jQuery("body");

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

            // retrieves the chart size
            var chartWidth = chartElement.width;
            var chartHeight = chartElement.height;

            // retrieves the chart element context
            var context = chartElement.getContext("2d");

            // in case the current environment is a "retina" one
            // (high density display) then an extra scale operation
            // is performed to provide crisp graphics
            var isRetina = _body.hasClass("retina-s");
            if (isRetina) {
                chartElement.width = chartWidth * 2;
                chartElement.height = chartHeight * 2;
                chartElement.style.width = String(chartWidth) + "px";
                chartElement.style.height = String(chartElement) + "px";
                context.scale(2, 2)
            }

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
