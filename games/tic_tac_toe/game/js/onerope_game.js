var table = window.parent.onerope.tables.table;
var player = window.parent.onerope.tables.player;
var game_ref = window.parent.onerope_ref.child('games').child(table);
var player_name = 'guest';

console.log('game loaded');
console.log('you are player: ', player);
console.log('you are sitting at table: ', table);

if ( player === 'player1' ) {

    game_ref.set({
        players : {
            player1: {
                name: player_name
            }
        },
        game : {
            name : 'tictactoe'
        }
    });
}
else if ( player === 'player2' ) {
    game_ref.child('players').child('player2').update({name: player_name});
}

var onerope_game = {

    started : false,
    max_players : 2,
    turn : false,
    total_players : 0,

    game_listeners : function() {
        // ==== PLAYERS ==== //
        game_ref.child('players').once('value', function(snapshot) {
            console.log('checking player status');
            onerope_game.initial_player_status(snapshot);
        });

        game_ref.child('players').on('child_changed', function(snapshot) {
            //console.log('gameroom changed snapshot: ', snapshot.val());
            onerope_game.changed_player_status(snapshot);
        });

        // ==== GAME ==== //
        game_ref.child('game').child('board').on('child_added', function(snapshot) {
            //console.log('gameroom changed snapshot: ', snapshot.val());
            onerope_game.update(snapshot);
        });

    },

    check_status : function(snapshot) {
        console.log('checking status');

        var status = snapshot.val();

        if ( status === 'waiting' ) {
            return;
        }
        else if ( status === 'ready' ) {
            onerope_game.start_the_game(snapshot);
        }
    },

    initial_player_status : function(snapshot) {

        //console.log('checking player status');

        //object containing players at the table
        var players = snapshot.val();
        console.log('players: ', players);

        var total_players = 0;

        //console.log('player 1: ', players.player1);
        //console.log('player 2: ', players.player2);

        //loop through each player at the table, incrementing total players
        _.each(players, function(value, key, list) {
            console.log('each player value: ', value);
            if ( value.status === 'ready' ) {
                onerope_game.total_players += 1;
            }
        });
        console.log('total players: ', onerope_game.total_players);

        if ( !onerope_game.started && onerope_game.total_players === onerope_game.max_players ) {
            console.log('room is full');
            onerope_game.start_the_game();
        }
    },

    changed_player_status : function(snapshot) {
        var player = snapshot.val();

        if ( player.status === 'ready' ) {
            onerope_game.total_players += 1;
        }
        console.log('total players: ', onerope_game.total_players);

        if ( !onerope_game.started && onerope_game.total_players === onerope_game.max_players ) {
            console.log('room is full');
            onerope_game.start_the_game();
        }
    },

    start_the_game : function() {
        $('.game_status').text('player1 vs. player2');

        onerope_game.started = true;

        onerope_game.countdown_screen();

        console.log('starting the game');
    },

    countdown_screen : function() {
        $('.overlay').show();
        var seconds = 10;
        var timer;
        var countdown_text = $('.overlay .countdown_timer');

        function countdown() {
            countdown_text.text(seconds);

            if ( seconds <= 0 ) {
                console.log('start the game');
                onerope_game.ready_to_start_the_game();
                return;
            }

            timer = setTimeout(function() {
                seconds--;
                countdown();
            }, 1000);
        }

        countdown();
    },

    ready_to_start_the_game : function() {
        $('.overlay').fadeOut('fast');

        onerope_game.turn = 'player1';
    }

};
