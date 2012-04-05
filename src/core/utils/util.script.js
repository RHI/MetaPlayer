
(function () {

    var $ = jQuery;

    Ramp.script = {

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
        }

    }

})();
