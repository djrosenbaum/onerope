// Variables
var board_state = generate_new_board(3,3);

function generate_new_board(total_rows, total_columns) {
    var grid = [];
    var row;

    for ( var i=0; i<total_rows; i++ ) {
        row = new Array(total_columns);
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

function check_for_winner() {
    console.log(board_state);

    var total_rows = board_state.length;
    var total_columns = board_state[0].length;

    check_columns();
    check_rows();
    check_diagonal_left();
    check_diagonal_right();

    //CHECK COLUMNS
    function check_columns() {
        console.log('checking columns');
        for ( var column=0; column<total_columns; column++ ) {
            console.log('checking column ', column);
            var column_array = [];
            for ( var row=0; row<total_rows; row++) {
                column_array.push( board_state[row][column] );
            }
            if ( tile_check(column_array) ) {
                alert('winner column');
            }
        }
    }

    //CHECK ROWS
    function check_rows() {
        console.log('checking rows');
        for ( var row=0; row<total_rows; row++ ) {
            console.log('checking row ', row);
            var row_array = [];
            for ( var column=0; column<total_columns; column++) {
                row_array.push( board_state[row][column] );
            }
            if ( tile_check(row_array) ) {
                alert('winner row');
            }
        }
    }

    //CHECK DIAGONALS
    function check_diagonal_left() {
        console.log('checking diagonal left');
        var diagonal_array = [];
        for ( var row=0; row<total_rows; row++ ) {
            diagonal_array.push( board_state[row][row] );
        }
        if ( tile_check(diagonal_array) ) {
            alert('winner diagonal left to right');
        }
    }

    function check_diagonal_right() {
        console.log('checking diagonal right');
        var diagonal_array = [];
        var column = total_columns - 1;
        for ( var row=0; row<total_rows; row++ ) {
            diagonal_array.push( board_state[row][column] );
            column--;
        }
        if ( tile_check(diagonal_array) ) {
            alert('winner diagonal right to left');
        }
    }

    function tile_check(tile_array) {
        var consecutive = 0;
        var match = '';
        var winner = 3;

        _.each( tile_array, function(element, index, list) {
            console.log('element: ', element);
            if ( !element ) {
                consecutive = 0;
                match = '';
                return;
            }
            else if ( element && index === 0 ) {
                match = element;
                consecutive++;
            }
            else if ( element && index > 0 ) {
                if ( match === element ) {
                    consecutive++;
                }
                else {
                    match = element;
                    consecutive = 1;
                }
            }
            console.log('consecutive: ', consecutive);
            if ( consecutive === winner) {
                console.log('winning array');
            }
        });
    }

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

    //update the board state array
    console.log('updating board state: ', row_coordinate + ',' + column_coordinate);
    board_state[row_coordinate][column_coordinate] = player_type(player_turn);

    var row = $('.row:nth-child(' + (row_coordinate + 1) + ')');
    var tile = row.find( $('.tile:nth-child(' + (column_coordinate + 1) + ')') );

    console.log('tile: ', tile);
    console.log('player type: ', player_type( player_turn ));

    tile.removeClass('_').addClass( player_type( player_turn ) );

    check_for_winner();

    if ( player_turn === 'player1' ) {
        onerope_game.turn = 'player2';
    }
    else if ( player_turn === 'player2' ) {
        onerope_game.turn = 'player1';
    }
};
