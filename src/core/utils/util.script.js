
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

        base : function (filename) {

            if( ! filename )
                filename = 'metaplayer(-complete)?(\.min)?\.js';

            var src = this.url(filename) || '';
            return src.substr(0, src.lastIndexOf('/') + 1);
        }

    }

})();
