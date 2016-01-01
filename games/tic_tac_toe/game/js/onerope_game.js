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

var onerope_game = {

    started : false,
    max_players : 2,
    turn : false,

    game_listeners : function() {
        //initial
        game_ref.on('child_added', function(snapshot) {

            console.log('gameroom added snapshot: ', snapshot.val());

            if ( !onerope_game.started && snapshot.key() === 'players' ) {
                onerope_game.check_player_status(snapshot);
            }

        });

        game_ref.on('child_changed', function(snapshot) {
            console.log('gameroom changed snapshot: ', snapshot.val());

            if ( !onerope_game.started && snapshot.key() === 'players' ) {
                onerope_game.check_player_status(snapshot);
            }
            else if ( !onerope_game.started && snapshot.val() === 'ready' ) {
                onerope_game.start_the_game(snapshot);
            }

        });

    },

    check_player_status : function(snapshot) {

        console.log('checking player status');

        //object containing players at the table
        var players = snapshot.val();
        console.log('players: ', players);

        var total_players = 0;

        //total number of players at the table

        //console.log('player 1: ', players.player1);
        //console.log('player 2: ', players.player2);

        //loop through each player at the table, incrementing total players
        _.each(players, function(value, key, list) {
            console.log('each player value: ', value);
            if ( value ) {
                total_players += 1;
            }
        });
        console.log('total players: ', total_players);

        if ( total_players === onerope_game.max_players ) {
            game_ref.update({status: 'ready'});
        }
    },

    start_the_game : function(snapshot) {
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
