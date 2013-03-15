

(function ($) {

	var defaults = {
		cssPrefix: "mp-countdown"
	};

	var elements = {
		timerClass: 'mp-countdown-timer',
		progressClass: 'mp-countdown-progress'
	};

	var Countdown = function ( target, player, options) {

		if ( ! (this instanceof Countdown) ) {
			return new Countdown(target, player, options);
		}

		this.player = player;
		this.target = $(target);

		this.config = $.extend(true, {}, defaults, options);

		this.timePassed = 0;

		this.dispatcher = MetaPlayer.dispatcher ( player.video );
		this.dispatcher.attach(this);

		this.createMarkup();

		this.addListeners();

	};

	Countdown.instances = {};
	Countdown._count = 0;

	MetaPlayer.Countdown = Countdown;

	MetaPlayer.addPlugin("countdown", function(target, options) {
		this.countdown = Countdown(target, this, options);
	});

	Countdown.prototype = {
		createMarkup : function() {
			var t = $(this.target);
			var container = $("<div></div>").addClass(this.config.cssPrefix).appendTo(t);
			var html = '<div class="' +elements.timerClass +' ui-progress-bar ui-container"><div class="ui-progress" style="width: 0%"><span class="ui-label"></span></div></div><div class="' +elements.progressClass +'"></div>';
			container.append(html);

		},
		
		addListeners : function() {
			this.player.metadata.listen(MetaPlayer.MetaData.DATA, this.onTags, this);
			this.dispatcher.listen("timeupdate", this.onTimeUpdate, this);
			this.dispatcher.listen("trackchange", function() { console.debug('countdown: trackchange'); });
		},

		onTimeUpdate : function(e) {
			var annotations = this.player.controls.annotations;
			var aLength = annotations.length;
			var video = this.player.video;
			var currentTime = video.currentTime;
			var currentAnnotation;

			// this can be optimized by assuming you're within the appropriate interval, once entered,
			// and only checking on seeked event.
			for (var i = 0; i < aLength; i++) {
				if (currentTime <= annotations[i].start) {
					currentAnnotation = annotations[i];
					break;
				}
			}

			if (this.currentAnnotation && this.currentAnnotation == currentAnnotation) {
				this.renderProgress();
			}
			else {
				this.currentAnnotation = currentAnnotation;
				this.startTime = this.currentAnnotation.start;
				
				this.renderProgress(0);
			}

			

		},

		onTags : function(e) {

		},

		renderProgress : function(val) {
			var intervalTime = this.currentAnnotation.start - this.player.video.currentTime;
			var percentage;
			if (val === 0) {
				percentage = 0;
			}
			else {
				percentage = intervalTime.toFixed(0);
			}
			$('.ui-label').text(percentage);
			$('.' +this.config.cssPrefix +' .ui-progress').width(percentage +'%');
		}
	};

})(jQuery);