(function(jQuery) {
    jQuery.uchecksum = function(buffer, modulus, salt) {
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
})(jQuery);
