$( ".tile._" ).on( "touchstart click", function() {
    $(this).removeClass('_').addClass('o');
});

$( window ).on('resize orientationchange', function() {
    set_game_dimensions();
});

function set_game_dimensions() {
    var window_height = $(window).innerHeight();
    var window_width = $(window).innerWidth();
    var total_span;
    var tile_size;
    var game_board_width;

    if ( window_height < window_width ) {
        total_span = window_height;
    }
    else {
        total_span = window_width;
    }

    tile_size = get_tile_size(total_span);
    set_tile_size(tile_size);

    set_game_position( window_height );
}

function get_tile_size( total_span ) {
    return Math.floor( total_span / 3 ) - 16;
}

function set_tile_size( tile_size ) {
    $('.tile').css({
        width: tile_size + 'px',
        height: tile_size + 'px'
    });
}

function set_game_position( window_height ) {
    var game_board_height = $('.game_board').height();
    var vertical_top_position = (window_height - game_board_height) / 2;

    $('.game_board').css({
        marginTop: vertical_top_position + 'px'
    });
}


function init() {
    set_game_dimensions();
}

init();
