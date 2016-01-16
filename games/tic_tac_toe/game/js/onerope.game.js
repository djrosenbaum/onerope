var onerope = window.parent.onerope;

//RESET THE GAME
onerope.game = {};

onerope.game = {
    players : {},
    started : false,
    max_players : 2,

    init : function() {
        console.log('\n FUNCTION: onerope.game.init');

        //stop the joining table animation
        onerope.tables.stop_join_table_animation();

        //turn off game listeners
        onerope.game_controller.listeners_off();

        //turn on game listeners
        onerope.game_controller.listeners_on();
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
            onerope.game.players[player_slot] = player.status;
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

        if ( !onerope.game.started && onerope.game.max_players_ready() ) {
            //room is ready to play
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

    update : function(snapshot) {
        console.log('\n FUNCTION: onerope.game.update');

        onerope.game[onerope.game_name].update(snapshot);
    }
};
