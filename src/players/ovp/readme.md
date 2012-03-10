Open Video Player Plugin
=====================
About
--------------


Quick Start
--------------

Open Video Player initialization:

    # Using "adopt" - deprecated because it works only on HTML5 video.
    # Using "render" - MPF OVP plugin uses only render method.
    # Using "renderfeed" - not using because this should be handled by mrss feed plugin.
    
    # In ovp player, you can pass two config objects in the init method and render method
    # But in MPF ovp plugin, it has to be combined like below, but it's same argument objects that you can pass on.
    
    var config = {
        //"strategy" : {"order":["HTML5","Flash","Silverlight"]},
        "strategy" : {"order":["Flash","HTML5","Silverlight"]},
        'controls': {'src_img':'http://lshin.ramp.com/mp3/external/ovp/images/pixel.png'},
        'players' : {
            "Flash":{
                "src":"../../../../external/ovp/ovp.swf",
                "minver":"9",
                "controls":false,
                "plugins":[]
            },
            "Silverlight":{
                "src":"../../../../external/ovp/ovp.xap",
                "minver":"4.0",
                "controls":false,
                "plugins":[]
            },
            "HTML5":{"minver":"0","controls":false}
        },
        'ovpConfig' : {
            'sources' : [
                {'src':'http://lshin.ramp.com/videos/trailer.mp4','type':'video/mp4'},
                {'src':'http://lshin.ramp.com/videos/trailer.ogv', 'type':'video/ogg'}
            ],
            'posterimg':'http://media.w3.org/2010/05/sintel/poster.png',
            'width' : '100%',
            'height' : '100%',
            'id': 'video'
        }
    };

    var player = MetaPlayer("#target").ovp(config).controls().load();
