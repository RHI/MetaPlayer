
(function () {

    var $ = jQuery;

    MetaPlayer.script = {

        url : function (filename) {
            // returns the first matching script tag
            var match;
            var re = RegExp( filename );
            $('script').each( function (i, el){
                var src =  $(el).attr('src');
                if( src && src.match(re) ){
                    match = src;
                    return false;
                }
            });
            return match;
        },

        /**
         * Returns the directory of a specified script if found,
         * or of metaplayer.js if not.
         * @param filename
         */
        base : function (filename) {
            var src, base;
            if( filename )
                src = this.url(filename) || '';
            if( ! src )
                src = this.url('metaplayer(-complete)?(\.min)?\.js');
            if( src )
                return  src.substr(0, src.lastIndexOf('/') + 1);
        },

        query : function (filter) {
            var query = {};
            var regex = RegExp(filter);
            var search = location.search && location.search.substr(1).split("&");
            $.each(search, function (i, pair) {
                var parts = pair && pair.split("=") || [];
                var key = parts[0];

                if( ! key )
                    return;

                // namespacing by prefix
                if( filter ) {
                    if( ! key.match(regex) )
                        return;
                    else
                        key = key.replace( regex, '');
                }

                // unescaping
                var val = parts[1] || '';
                val = decodeURIComponent(val.replace(/\+/g, " ") );

                // casting
                if( val == "" )
                    val = null;
                else if( val.match(/^\d+$/) )
                    val = parseInt( val );
                else if( val.match(/^true|false$/) )
                    val = (val === "true");

                query[ key ] = val
            });
            return query;
        },

        camelCase : function (str) {
            return str.replace(/[\s_\-]+([A-Za-z0-9])?([A-Za-z0-9]*)/g, function(str, p1, p2) { return p1.toUpperCase() + p2.toLowerCase() } )
        },

        objectPath : function (obj, key, val, depth) {
            if( depth == null)
                depth = 0;
            var i =  key.indexOf(".");
            if( i == -1 ) {
                if( val !== undefined )
                    obj[key] = val;
                return obj[key];
            }
            var name = key.slice(0,i);
            var remain = key.slice(i+1);
            if( key !== undefined && ! (obj[name] instanceof Object) )
                obj[name] = {};
            return MetaPlayer.script.objectPath(obj[name], remain, val, depth + 1)
        },

        parseSrtTime : function (str) {
            var m = str.match(/^(?:(\d+):)?(\d\d):(\d\d)[\.,](\d\d\d)$/);
            if( ! m ) {
                return null;
            }
            if( ! m[1] )
                m[1] = 0
            return ( parseInt(m[1], 10) * 3600) + ( parseInt(m[2], 10) * 60)+ parseInt(m[3], 10) + (parseInt(m[4], 10) *.001);
        }
    }

})();
