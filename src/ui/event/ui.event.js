(function () {
    var Popcorn = window.Popcorn;

    if( ! Popcorn )
        return;

    Popcorn.plugin( "event" , {
        _setup: function( options ) {
        },

        start: function( event, options ){
            var eventObject = Popcorn.createEvent('Event');
            eventObject.initEvent(options.type, true, true);
            eventObject.data = options;
            return this.media.dispatchEvent(eventObject);
        },

        end: function( event, options ){
        },

        _teardown: function( options ) {
        }
    });

})();
