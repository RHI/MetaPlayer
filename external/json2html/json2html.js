( function () {
    var $ = jQuery;

    var Dump = function (target, o) {
        $(target).empty();
        Dump.dump(target, o);

        $(target).find('.block').mouseover( function (e) {
            $(target).addClass("knockback");
            $(target).find('.hover').removeClass('hover');
            $(e.target).parent(".block").addClass("hover");
        });

        $(target).find('.block').mouseout( function () {
            $(target).removeClass("knockback");
            $(this).removeClass("hover");
        });
    };

    window.json2html = Dump;

    Dump.dump = function (target, o) {
        if( o instanceof Array )
            Dump.array(target, o);
        else if( o instanceof Object )
            Dump.object(target, o);
        else
            Dump.scalar(target, o);
    };

    Dump.array = function (target, arr) {

        $("<span></span>").text("Array").addClass("type").appendTo(target);

        $("<div></div>").text("[").addClass("marker").appendTo(target);

        var block = $("<div></div>").addClass("block").appendTo(target);

        for(var i = 0; i< arr.length; i++ ) {
            Dump.label(block, i);
            Dump.dump(block, arr[i] );
        }
        $("<div></div>").text("]").addClass("marker clear").appendTo(target);
    };

    Dump.object = function (target, obj) {

        $("<span></span>").text("Object").addClass("type").appendTo(target);

        $("<div></div>").text("{").addClass("marker").appendTo(target);

        var block = $("<div></div>").addClass("block").appendTo(target);

        var label;
        for( var k in obj) {
            Dump.label(block, k);
            Dump.dump(block, obj[k] );
        }

        $("<div></div>").text("}").addClass("marker clear").appendTo(target);
    };

    Dump.scalar = function (target, s) {
        if( s == null )
            s = typeof s;

        $("<div></div>").addClass("scalar").text(s).appendTo(target);
    };

    Dump.label = function (target, s) {
        $("<div></div>").addClass("label").text(s).appendTo(target);
        $("<div></div>").addClass("separator").text(":").appendTo(target);
    };

})()
