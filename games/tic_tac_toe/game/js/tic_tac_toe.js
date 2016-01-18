var onerope = window.parent.onerope;

//an array that holds the current state of the tic tac toe board
var board_state;

//set to either player 1 or player 2
var player_turn = false;

var player_slot = onerope.tables.player_slot;

//send tictactoe reference up to parent
var tictactoe = {

    start_the_countdown : function() {
        console.log('\n FUNCTION: tictactoe.start_the_countdown');
        init();

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
        console.log('\n FUNCTION: tictactoe.set_status_countdown');
        $('.game_status').text(message);
    },

};
onerope.game.tictactoe = tictactoe;

//start the game after countdown reaches 0
function start_the_game() {
    console.log('\n FUNCTION: start_the_game');

    $('.overlay[data-overlay="countdown"]').fadeOut('fast');
}

function set_turn_status() {
    console.log('\n FUNCTION: set_turn_status');

    if ( player_slot === player_turn ) {
        tictactoe.set_status_message('Your turn');
    }
    else {
        tictactoe.set_status_message('Waiting for opponent to make a move');
    }
}

//input number of rows and columns, and returns of an array with that number of rows and columns
function generate_new_board(total_rows, total_columns) {
    console.log('\n FUNCTION: generate_new_board');

    var grid = [];
    var row;

    for ( var i=0; i<total_rows; i++ ) {
        row = new Array(total_columns);
        grid.push(row);
    }

    return grid;
}

//returns an x or an o depending on player slot
function player_type(player) {
    console.log('\n FUNCTION: player_type');

    if ( player === 'player1' ) {
        return 'x';
    }
    else if ( player === 'player2' ) {
        return 'o';
    }
}


function add_listeners() {
    console.log('\n FUNCTION: add_listeners');

    $( '.game_board' ).on( 'click', '.tile._', function() {

        if ( player_slot !== player_turn ) {
            return;
        }

        player_turn = false;

        var row = $(this).parent().index();
        var column = $(this).index();
        // console.log('row: ', row );
        // console.log('column: ', column );

        var grid_coordinate = row + ',' + column;

        onerope.game_controller.game_ref.child('game').push(
            {
                player: player_slot,
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
    console.log('\n FUNCTION: set_game_dimensions');

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
    console.log('\n FUNCTION: check_for_winner');
    // console.log(board_state);

    var total_rows = board_state.length;
    var total_columns = board_state[0].length;

    check_columns();
    check_rows();
    check_diagonal_left();
    check_diagonal_right();
    check_for_tie();

    //CHECK COLUMNS
    function check_columns() {
        console.log('\n FUNCTION: check_columns');
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
        console.log('\n FUNCTION: check_rows');
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
        console.log('\n FUNCTION: check_diagonal_left');
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
        console.log('\n FUNCTION: check_diagonal_right');
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

    function check_for_tie() {
        console.log('\n FUNCTION: check_for_tie');
        if ( $('.tile._').length === 0 && !tictactoe.game_winner ) {
            we_have_a_tie();
        }
    }

    function tile_check(tile_array, coordinate_array) {
        console.log('\n FUNCTION: tile_check');
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
    console.log('\n FUNCTION: we_have_a_winner');

    tictactoe.game_winner = player_turn;

    console.log('winning array: ', coordinate_array);

    $('.tile').css('opacity', 0.4);

    _.each( coordinate_array, function(element, index, list) {

        var grid_coordinate = element.split(',');

        var row_coordinate = parseInt(grid_coordinate[0], 10);
        var column_coordinate = parseInt(grid_coordinate[1], 10);

        var row = $('.row:nth-child(' + (row_coordinate + 1) + ')');
        var tile = row.find( $('.tile:nth-child(' + (column_coordinate + 1) + ')') );

        tile.css('opacity', 1);

    });

    tictactoe.set_status_message(player_turn + ' has won the game');

    //no more moves
    player_turn = false;

    $('.play_again').show();
}

function we_have_a_tie() {
    console.log('\n FUNCTION: we_have_a_tie');

    tictactoe.set_status_message('tie game, no winner');

    $('.tile').css('opacity', 0.4);

    player_turn = false;

    $('.play_again').show();
}

tictactoe.update = function( snapshot ) {
    console.log('\n FUNCTION: onerope.game.tictactoe.update');
    console.log('snapshot: ', snapshot.val());

    var update = snapshot.val();
    var player = update.player;
    var grid_coordinate = update.grid_coordinate.split(',');

    // console.log('player: ', player);
    // console.log('grid coordinate: ', grid_coordinate);

    var row_coordinate = parseInt(grid_coordinate[0], 10);
    var column_coordinate = parseInt(grid_coordinate[1], 10);

    //update the board state array
    // console.log('updating board state: ', row_coordinate + ',' + column_coordinate);
    board_state[row_coordinate][column_coordinate] = player_type(player);

    var row = $('.row:nth-child(' + (row_coordinate + 1) + ')');
    var tile = row.find( $('.tile:nth-child(' + (column_coordinate + 1) + ')') );

    tile.removeClass('_').addClass( player_type( player ) );

    check_for_winner(player);

    if ( tictactoe.game_winner ) {
        return;
    }

    if ( player === 'player1' ) {
        player_turn = 'player2';
    }
    else if ( player === 'player2' ) {
        player_turn = 'player1';
    }

    set_turn_status();
};

function init() {
    console.log('\n FUNCTION: tictactoe.init');

    board_state = generate_new_board(3,3);

    set_game_dimensions();

    add_listeners();

    onerope.game.started = true;

    player_turn = 'player1';

    set_turn_status();
}

$(document).ready(function() {

    console.log('tic tac toe loaded');

    onerope.game.init();

});
