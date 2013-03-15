(function () {
    var $ = jQuery;
    var Popcorn = window.Popcorn;

    if( ! Popcorn )
        return;

    Popcorn.plugin( "script" , {
        _setup: function( options ) {
        },

        start: function( event, options ){
            if( options.code.match(/^\s*<script/) ) {
                $('head').append(options.code);
                return;
            }
            try {
                window.eval(options.code);
            }
            catch(e){}
        },

        end: function( event, options ){
        },

        _teardown: function( options ) {
        }
    });
})();
