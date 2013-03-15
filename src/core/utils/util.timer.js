
(function () {
    var $ = jQuery;

    var Timer = function (delay, count) {
        if( ! (this instanceof Timer ) )
            return new Timer(delay, count);

        var self = this;
        MetaPlayer.dispatcher(this);
        this.delay = delay;
        this.count = count || -1;
        this._counted = 0;
        this._onTimeout = function () {
            self._counted++;
            self.dispatcher.dispatch('time', {
                count : self._counted,
                remain : self.count - self._counted
            });
            if( self.count > 0 && self.count < self._counted + 1 ){
                self.reset();
                self.dispatcher.dispatch('complete');
            }
        };
    };

    MetaPlayer.timer = Timer;

    Timer.prototype = {
        reset : function () {
            this._counted = 0;
            this.stop();
        },

        stop : function () {
            clearInterval(this._interval);
            this._interval = null;
            this.running = null;

        },

        toggle : function () {
            if( this.running )
                this.stop();
            else
                this.start()

        },

        start : function () {
            if( this._interval )
                return;
            this.running = (new Date()).getTime();
            this._interval = setInterval(this._onTimeout, this.delay );
        }
    };


})();
