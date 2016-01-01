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

function player_type( player ) {
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

    onerope_game.turn = false;

    var row = $(this).parent().index();
    var column = $(this).index();
    // console.log('row: ', row );
    // console.log('column: ', column );

    var grid_coordinate = row + ',' + column;

    game_ref.child('game').child('board').push(
        {
            player: player,
            grid_coordinate:grid_coordinate
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

    //after listeners are added, player is ready
    game_ref.child('players').child(player).update({status: 'ready'});
}

$(document).ready(function() {

    //stop the joining table animation
    window.parent.onerope.tables.stop_loading_animation();

    init();

});

onerope_game.update = function( snapshot ) {
    console.log('player selected a tile', snapshot.val());
    console.log('key: ', snapshot.key());
    console.log('snapshot: ', snapshot.val());

    var update = snapshot.val();
    var player_turn = update.player;
    var grid_coordinate = update.grid_coordinate.split(',');

    console.log('player turn: ', player_turn);
    console.log('grid coordinate: ', grid_coordinate);

    var row_coordinate = parseInt(grid_coordinate[0], 10);
    var column_coordinate = parseInt(grid_coordinate[1], 10);

    var row = $('.row:nth-child(' + (row_coordinate + 1) + ')');
    var tile = row.find( $('.tile:nth-child(' + (column_coordinate + 1) + ')') );

    console.log('tile: ', tile);
    console.log('player type: ', player_type( player_turn ));

    tile.removeClass('_').addClass( player_type( player_turn ) );

    if ( player_turn === 'player1' ) {
        onerope_game.turn = 'player2';
    }
    else if ( player_turn === 'player2' ) {
        onerope_game.turn = 'player1';
    }
};
