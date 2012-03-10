(function () {

    MetaPlayer.format = {
        seconds : function (time) {
            var zpad = function (val, len) {
                var r = String(val);
                while( r.length < len ) {
                    r = "0" + r;
                }
                return r;
            };
            var hr = Math.floor(time / 3600);
            var min = Math.floor( (time %  3600) / 60);
            var sec = Math.floor(time % 60);
            var parts = [
                zpad(min, 2),
                zpad(sec, 2)
            ];
            if( hr )
                parts.unshift(hr);
            return parts.join(":");
        },

        replace : function (template, dict) {
            return template.replace( /\{\{(\w+)\}\}/g,
                function(str, match) {
                    var ret;
                    if( dict[match] instanceof Function ){
                        ret = dict[match](dict);
                    }
                    else if( dict[match] != null ){
                        ret = dict[match]
                    }
                    else {
                        return "{!!!" + match + "!!!}"
                    }
                    return MetaPlayer.format.replace( ret.toString(), dict )
                });
        }
    };

})();

