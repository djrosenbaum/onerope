var table = window.parent.onerope.tables.table;
var player = window.parent.onerope.tables.player;
var game_ref = window.parent.onerope_ref.child('games').child(table);
var game_data = {};
var player_name = 'guest';

console.log('game loaded');
console.log('you are player: ', player);
console.log('you are sitting at table: ', table);

if ( player === 'player1' ) {

    game_data[table] = {
        status : 'waiting',
        players : {
            player1: player_name,
            player2: false
        },
        messages : {}
    };

    game_ref.set( { status:'waiting' } );
}

function player_type() {
    if ( player === 'player1' ) {
        return 'x';
    }
        return 'o';
}

$( ".tile._" ).on( "click", function() {
    $(this).removeClass('_').addClass( player_type() );
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

$(document).ready(function() {

    //stop the joining table animation
    window.parent.onerope.tables.stop_loading_animation();

    init();

});
