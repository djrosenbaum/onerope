// Variables
var boardState = generate_new_board();

function generate_new_board(total_rows, total_columns) {
    var grid = [];
    var row = new Array(total_columns);

    for ( var i=0; i<total_rows; i++ ) {
        grid.push(row);
    }

    return grid;
}

function player_type() {
    if ( player === 'player1' ) {
        return 'x';
    }
    else if ( player === 'player2' ) {
        return 'o';
    }
}

$( ".tile._" ).on( "click", function() {
    if ( onerope_game.turn !== player ) {
        return;
    }

    var row = $(this).parent().index();
    var column = $(this).index();
    // console.log('row: ', row );
    // console.log('column: ', column );

    var grid_coordinate = row + ',' + column;

    game_ref.child('game').child('board').push(
        {
            player: player,
            select:grid_coordinate
        }
    );
    //$(this).removeClass('_').addClass( player_type() );
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

    onerope_game.game_listeners();
}

$(document).ready(function() {

    //stop the joining table animation
    window.parent.onerope.tables.stop_loading_animation();

    init();

});

onerope_game.update_game = function( snapshot ) {
    console.log('game board changed', snapshot.val());
};
