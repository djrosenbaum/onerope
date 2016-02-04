var onerope = window.parent.onerope;

//RESET THE GAME
onerope.game = {};

onerope.game = {

    init : function() {
        console.log('\n FUNCTION: onerope.game.init');

        onerope.game.players = {};
        onerope.game.round = {};
        onerope.game.started = false;
        //onerope.game.max_players = 2;

        //stop the joining table animation
        onerope.tables.stop_join_table_animation();

        //turn off game listeners
        onerope.game_controller.listeners_off();

        //turn on game listeners
        onerope.game_controller.listeners_on();
    },

    get_round : function(callback) {
        console.log('\n FUNCTION: onerope.game.get_round');

        var round;
        var player_turn;

        onerope.game_controller.game_ref.child('round').once('value', function(snapshot) {
            if ( !snapshot.exists() ) {
                //if snapshot does not exist, new game, round 1
                round = 1;
                player_turn = onerope.tables.player_slot;
                onerope.game.set_round( round, player_turn, callback );
            }
            else {
                round = snapshot.round;
                player_turn = snapshot.player_turn;
                onerope.game.round.interval = round;
                onerope.game.round.player_turn = player_turn;
                callback();
            }
        });
    },

    set_round : function( round, player_turn, callback ) {
        console.log('\n FUNCTION: onerope.game.set_round');

        onerope.game.round.interval = round;
        onerope.game.round.player_turn = player_turn;

        var round_data = {
            round: round,
            player_turn: player_turn
        };

        onerope.game_controller.game_ref.child('round').update(round_data, function() {
            callback();
        });
    },

    initial_player_status : function(snapshot) {
        console.log('\n FUNCTION: onerope.game.initial_player_status');

        //console.log('checking player status');

        //object containing players at the table
        var players = snapshot.val();
        console.log('players: ', players);

        //loop through each player at the table
        _.each(players, function(value, key, list) {
            var player_slot = key;
            var player = value;
            onerope.game.players[player_slot] = player['status'];

            onerope.game[onerope.game_name].update_player(player_slot, player);
        });

        onerope.game_controller.set_player_status('ready');
    },

    changed_player_status : function(snapshot) {
        console.log('\n FUNCTION: onerope.game.changed_player_status');

        var player = snapshot.val();
        var player_slot = snapshot.key();
        console.log('player: ', player);
        console.log('player slot: ', player_slot);

        onerope.game.players[player_slot] = player.status;

        onerope.game[onerope.game_name].update_player(player_slot, player);

        if ( player.status === 'disconnected' ) {
            onerope.game[onerope.game_name].player_disconnected(player_slot, player);
            return;
        }

        if ( !onerope.game.started && onerope.game.max_players_ready() ) {
            //room is ready to play

            //remove game id
            onerope.game_controller.table_ref.update({game_id: ''});

            //start the countdown to start the game
            onerope.game[onerope.game_name].start_the_countdown();
        }
    },

    max_players_ready : function() {
        console.log('\n FUNCTION: onerope.game.max_players_ready');

        var total_players_ready = 0;

        //loop through each player at the table and check their readiness status
        _.each(onerope.game.players, function(value, key, list) {
            var player_slot = key;
            var player_status = value;

            if ( player_status === 'ready' ) {
                total_players_ready++;
            }
        });

        if ( total_players_ready === onerope.game.max_players ) {
            return true;
        }
    },

    set_secret_word : function(secret_word, callback) {
        console.log('\n FUNCTION: onerope.game.set_secret_word');

        onerope.game_controller.game_ref.child('round').update({secret_word: secret_word}, function() {
            callback();
        });
    },

    update : function(snapshot) {
        console.log('\n FUNCTION: onerope.game.update');

        onerope.game[onerope.game_name].update(snapshot);
    }
};
