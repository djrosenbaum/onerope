var table = window.parent.onerope.tables.table;
var player = window.parent.onerope.tables.player;
var game_ref = window.parent.onerope_ref.child('games').child(table);
var player_name = 'guest';

console.log('game loaded');
console.log('you are player: ', player);
console.log('you are sitting at table: ', table);

if ( player === 'player1' ) {

    game_ref.set({
        status : 'waiting',
        players : {
            player1: player_name,
            player2: false
        },
        messages : {}
    });
}
else if ( player === 'player2' ) {
    game_ref.child('players').update({player2: player_name});
}

var game = {

    started : false,
    max_players : 2,

    game_listeners : function() {
        //initial
        game_ref.once('value', function(snapshot) {
            console.log('gameroom once snapshot: ', snapshot.val());
            game.check_player_status(snapshot);
        });

        game_ref.on('child_changed', function(snapshot) {
            console.log('gameroom changed snapshot: ', snapshot.val());
            if ( !game.started ) {
                game.check_player_status(snapshot);
            }
        });

    },

    check_player_status : function(snapshot) {
        if ( game.started ) {
            return;
        }

        console.log('checking player status');
        var game_room = snapshot.val();

        //object containing players at the table
        var players = game_room.players;

        //total number of players at the table
        var total_players = 0;

        //console.log('player 1: ', players.player1);
        //console.log('player 2: ', players.player2);

        //loop through each player at the table, incrementing total players
        _.each(players, function(value, key, list) {
            if ( value ) {
                total_players += 1;
            }
        });
        console.log('total players: ', total_players);

        if ( total_players === game.max_players ) {
            game.start_the_game(snapshot);
        }
    },

    start_the_game : function(snapshot) {
        $('.game_status').text('player1 vs. player2');

        game.started = true;

        game.countdown_screen();

        console.log('starting the game');
    }

};

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

    game.game_listeners();
}

$(document).ready(function() {

    //stop the joining table animation
    window.parent.onerope.tables.stop_loading_animation();

    init();

});
