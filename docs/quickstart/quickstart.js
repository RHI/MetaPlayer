$(function () {

    prettyPrint();

    // make the table of contents
    $('.header').each( function (i, val) {
        var el = $(val);
        if( ! el.attr('id')  )
            return;
        $("<a></a>")
            .attr('href', '#' + el.attr('id'))
            .text( el.text() )
            .toggleClass("toc-subsection", !! el.parent('.subsection').length )
            .appendTo('.toc-list');
    });

    $('img').each( function (i, val) {
        var img = $(val);
        $('<a target="__new"></a>')
            .insertAfter(img)
            .append(img)
            .attr("href", img.attr('src') );
    })

});