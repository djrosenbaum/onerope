console.log('game loaded');
console.log('you are player: ', onerope.tables.player_slot);
console.log('you are sitting at table: ', onerope.tables.table);

var onerope = window.parent.onerope;

var player = window.parent.onerope.tables.player_slot;

var game_ref = window.parent.onerope.ref.child('games').child(table);


onerope.game_controller = {

    ref : onerope.ref.child('games').child(onerope.tables.table),
    total_players : 0,
    round: 0,

    init : function() {
        console.log('');
        console.log('FUNCTION: onerope_game.init');

        onerope_game.started = false;
        onerope_game.max_players = 2;
        onerope_game.turn = false;

        game_ref.child('players').child( onerope.tables.player_slot ).update( {name: onerope.tables.player_name} );
    },

    game_listeners : function() {
        // ==== PLAYERS ==== //
        onerope.game.ref.child('players').once('value', function(snapshot) {
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

        //reset the game if you are the only initial player
        if ( onerope_game.total_players === 1 ) {
            onerope_game.reset_game();
        }

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
        onerope_game.status_message('player1 vs. player2');

        onerope_game.started = true;

        onerope_game.countdown_screen();

        console.log('starting the game');
    },

    countdown_screen : function() {
        $('.overlay').show();
        var seconds = 1;
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
    },

    status_message : function(message) {
        $('.game_status').text(message);
    },

    reset_game : function() {
        game_ref.child('game').set({});
    }

};
