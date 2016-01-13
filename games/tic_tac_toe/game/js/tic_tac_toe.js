var onerope = window.parent.onerope;

//an array that holds the current state of the tic tac toe board
var board_state;

//set to either player 1 or player 2
var player_turn = false;

//send tictactoe reference up to parent
var tictactoe = {

    start_the_countdown : function() {
        console.log('');
        console.log('FUNCTION: tictactoe.start_the_countdown');

        $('.overlay[data-overlay="countdown"]').show();
        var seconds = 3;
        var timer;
        var countdown_text = $('.overlay[data-overlay="countdown"] .countdown_timer');

        function countdown() {
            countdown_text.text(seconds);

            if ( seconds <= 0 ) {
                console.log('start the game');
                start_the_game();
                return;
            }

            timer = setTimeout(function() {
                seconds--;
                countdown();
            }, 1000);
        }
        countdown();
    },

    set_status_message : function(message) {
        $('.game_status').text(message);
    }

};
onerope.game.tictactoe = tictactoe;

//start the game after countdown reaches 0
function start_the_game() {
    console.log('');
    console.log('FUNCTION: start_the_game');

    onerope.game.started = true;

    player_turn = 'player1';

    set_turn_status();

    $('.overlay[data-overlay="countdown"]').fadeOut('fast');

    init();
}

function set_turn_status() {
    if ( onerope.tables.player_slot === 'player1' ) {
        tictactoe.set_status_message('Your turn Player 1');
    }
    else {
        tictactoe.set_status_message('Player1\'s turn');
    }
}

//input number of rows and columns, and returns of an array with that number of rows and columns
function generate_new_board(total_rows, total_columns) {
    var grid = [];
    var row;

    for ( var i=0; i<total_rows; i++ ) {
        row = new Array(total_columns);
        grid.push(row);
    }

    return grid;
}

//returns an x or an o depending on player slot
function player_type() {
    if ( onerope.tables.player_slot === 'player1' ) {
        return 'x';
    }
    else if ( onerope.tables.player_slot === 'player2' ) {
        return 'o';
    }
}


function add_listeners() {
    $( '.game_board' ).on( 'click', '.tile._', function() {

        if ( onerope.game.turn !== player ) {
            return;
        }

        onerope.game.turn = false;

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

    $('.play_again').on('click', function() {
        console.log('reset the game');
        reset_the_game();
        $('.play_again').hide();
    });

    $( window ).on('resize orientationchange', function() {
        set_game_dimensions();
    });
}

//responsive game board to set game dimensions based on screen size
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

    function get_tile_size( total_span ) {
        return Math.floor( total_span / 3 ) - 16;
    }

    function set_tile_size( tile_size ) {
        $('.tile').css({
            width: tile_size + 'px',
            height: tile_size + 'px'
        });
    }
}

function check_for_winner( player_turn ) {
    // console.log(board_state);

    var total_rows = board_state.length;
    var total_columns = board_state[0].length;

    check_columns();
    check_rows();
    check_diagonal_left();
    check_diagonal_right();

    //CHECK COLUMNS
    function check_columns() {
        // console.log('checking columns');
        for ( var column=0; column<total_columns; column++ ) {
            // console.log('checking column ', column);
            var column_array = [];
            var coordinate_array = [];
            for ( var row=0; row<total_rows; row++) {
                column_array.push( board_state[row][column] );
                coordinate_array.push( row + ',' + column );
            }
            tile_check(column_array, coordinate_array);
        }
    }

    //CHECK ROWS
    function check_rows() {
        // console.log('checking rows');
        for ( var row=0; row<total_rows; row++ ) {
            // console.log('checking row ', row);
            var row_array = [];
            var coordinate_array = [];
            for ( var column=0; column<total_columns; column++) {
                row_array.push( board_state[row][column] );
                coordinate_array.push( row + ',' + column );
            }
            tile_check(row_array, coordinate_array);
        }
    }

    //CHECK DIAGONALS
    function check_diagonal_left() {
        // console.log('checking diagonal left');
        var diagonal_array = [];
        var coordinate_array = [];
        for ( var row=0; row<total_rows; row++ ) {
            var column = row;
            diagonal_array.push( board_state[row][column] );
            coordinate_array.push( row + ',' + column );
        }
        tile_check(diagonal_array, coordinate_array);
    }

    function check_diagonal_right() {
        // console.log('checking diagonal right');
        var diagonal_array = [];
        var coordinate_array = [];
        var column = total_columns - 1;
        for ( var row=0; row<total_rows; row++ ) {
            diagonal_array.push( board_state[row][column] );
            coordinate_array.push( row + ',' + column );
            column--;
        }
        tile_check(diagonal_array, coordinate_array);
    }

    function tile_check(tile_array, coordinate_array) {
        var consecutive = 0;
        var match = '';
        var winner = 3;

        _.each( tile_array, function(element, index, list) {
            // console.log('element: ', element);
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
            // console.log('consecutive: ', consecutive);
            if ( consecutive === winner) {
                we_have_a_winner(coordinate_array, player_turn);
            }
        });
    }

}

function we_have_a_winner(coordinate_array, player_turn) {
    console.log(player_turn + ' has won the game');
    console.log('winning array: ', coordinate_array);

    //no more moves
    onerope_game.turn = false;

    $('.tile').css('opacity', 0.4);

    _.each( coordinate_array, function(element, index, list) {

        var grid_coordinate = element.split(',');

        var row_coordinate = parseInt(grid_coordinate[0], 10);
        var column_coordinate = parseInt(grid_coordinate[1], 10);

        var row = $('.row:nth-child(' + (row_coordinate + 1) + ')');
        var tile = row.find( $('.tile:nth-child(' + (column_coordinate + 1) + ')') );

        tile.css('opacity', 1);

    });

    onerope_game.status_message(player_turn + ' has won the game');

    //remove the game board
    game_ref.remove( function(error) {
        if (error) {
            console.log('Synchronization failed');
        }
        else {
            console.log('Synchronization succeeded');
        }
    });

    $('.play_again').show();

    //remove the players
    onerope_game.total_players = 0;
}

/*
onerope_game.update = function( snapshot ) {
    // console.log('player selected a tile', snapshot.val());
    // console.log('key: ', snapshot.key());
    // console.log('snapshot: ', snapshot.val());

    var update = snapshot.val();
    var player_turn = update.player;
    var grid_coordinate = update.grid_coordinate.split(',');

    // console.log('player turn: ', player_turn);
    // console.log('grid coordinate: ', grid_coordinate);

    var row_coordinate = parseInt(grid_coordinate[0], 10);
    var column_coordinate = parseInt(grid_coordinate[1], 10);

    //update the board state array
    // console.log('updating board state: ', row_coordinate + ',' + column_coordinate);
    board_state[row_coordinate][column_coordinate] = player_type(player_turn);

    var row = $('.row:nth-child(' + (row_coordinate + 1) + ')');
    var tile = row.find( $('.tile:nth-child(' + (column_coordinate + 1) + ')') );

    // console.log('tile: ', tile);
    // console.log('player type: ', player_type( player_turn ));

    tile.removeClass('_').addClass( player_type( player_turn ) );

    check_for_winner(player_turn);

    if ( player_turn === 'player1' ) {
        onerope_game.turn = 'player2';
    }
    else if ( player_turn === 'player2' ) {
        onerope_game.turn = 'player1';
    }
};
*/

/*
function reset_the_game() {

    board_state = generate_new_board(3,3);

    $('.game_board').html(new_game_board);

    onerope_game.init();

    game_ref.child('players').child(player).update({status: 'ready'});

}
*/

function init() {
    console.log('');
    console.log('FUNCTION: tictactoe.init');

    board_state = generate_new_board(3,3);

    set_game_dimensions();

    add_listeners();
}

$(document).ready(function() {

    console.log('tic tac toe loaded');

    onerope.game.init();

});
