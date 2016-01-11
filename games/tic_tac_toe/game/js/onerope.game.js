var onerope = window.parent.onerope;

//RESET THE GAME
onerope.game = {};

onerope.game = {
    players : {},
    started : false,
    max_players : 2,
    turn : false,

    init : function() {
        console.log('');
        console.log('FUNCTION: onerope.game.init');

        //stop the joining table animation
        onerope.tables.stop_join_table_animation();

        //turn off game listeners
        onerope.game_controller.listeners_off();

        //turn on game listeners
        onerope.game_controller.listeners_on();
    },

    initial_player_status : function(snapshot) {
        console.log('');
        console.log('FUNCTION: onerope.game.initial_player_status');

        //console.log('checking player status');

        //object containing players at the table
        var players = snapshot.val();
        console.log('players: ', players);

        //loop through each player at the table
        _.each(players, function(value, key, list) {
            var player_slot = key;
            onerope.game.players[player_slot] = player.status;
        });

        onerope.game_controller.set_player_status('ready');
    },

    changed_player_status : function(snapshot) {
        console.log('');
        console.log('FUNCTION: onerope.game.changed_player_status');

        var player = snapshot.val();
        var player_slot = snapshot.key();
        console.log('player: ', player);
        console.log('player slot: ', player_slot);

        onerope.game.players[player_slot] = player.status;

/*
        if ( !onerope.game.started && onerope_game.total_players === onerope_game.max_players ) {
            console.log('room is full');
            onerope_game.start_the_game();
        }
*/

    },

    start_the_game : function() {
        console.log('');
        console.log('FUNCTION: onerope.game.start_the_game');

        // onerope_game.status_message('player1 vs. player2');

        // onerope_game.started = true;

        // onerope_game.countdown_screen();

        // console.log('starting the game');
    },
};
