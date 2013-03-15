(function () {

    var $ = jQuery;

    MetaPlayer.format = {

        zpad : function (val, len) {
            var r = String(val);
            while( r.length < len ) {
                r = "0" + r;
            }
            return r;
        },
        seconds : function (time, options) {
            var defaults = {
                minutes : true,
                seconds : true,
                hours   : false // auto
            };
            var config = $.extend({}, defaults, options);

            var zpad = MetaPlayer.format.zpad;

            var hr = Math.floor(time / 3600);
            var min = Math.floor( (time %  3600) / 60);
            var sec = Math.floor(time % 60);
            var parts = [];

            if( config.seconds || min || hr )
                parts.unshift( zpad(sec, 2) );
            else if( sec > 0)
                parts.unshift(sec);

            if( config.minutes || hr )
                parts.unshift( zpad(min, 2) );
            else if( min > 0)
                parts.unshift(min);

            if( config.hours )
                parts.unshift( zpad(hr, config.hours) );
            else if(  hr > 0)
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

