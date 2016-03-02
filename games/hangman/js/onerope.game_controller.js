onerope.game_controller = {

    init : function() {
        console.groupCollapsed('onerope.game_controller.init');

        console.log('store reference to ', onerope.tables.table);
        onerope.game_controller.table_ref = onerope.ref.child('games').child(onerope.tables.table);

        console.log('you are player slot: ', onerope.tables.player_slot);

        //TODO: check if only player at table, and no game in progress
        console.log('TODO: check if only player at table');

        console.groupEnd();

        if ( onerope.tables.player_slot === 'player1' ) {
            console.log('player1 and no other players at table');
            console.log('set new game');
            onerope.game_controller.set_new_game();
        }
        else {
            console.log('other players at table');
            console.log('get new game');
            onerope.game_controller.get_new_game();
        }
    },

    set_new_game : function() {
        console.groupCollapsed('onerope.game_controller.set_new_game');
        // console.log('\n FUNCTION: onerope.game_controller.set_new_game');

        //push unique id to games, add unique id to games table
        console.log('store reference to the game');
        onerope.game_controller.game_ref = onerope.game_controller.table_ref.child('game').push();

        //set the game id
        console.log('store unique game id');
        onerope.game_controller.table_ref.update({game_id: onerope.game_controller.game_ref.key()}, function() {
            //set player info
            //TODO why set a player name here?
            console.log('set player name');
            onerope.game_controller.set_player_name(onerope.player.player_name, function() {
                //load the game                
                console.log('load game');
                console.groupEnd('onerope.game_controller.set_new_game');

                onerope.game_controller.load_game();
            });
        });
    },

    get_new_game : function() {
        console.log('\n FUNCTION: onerope.game_controller.get_new_game');

        onerope.game_controller.table_ref.child('game_id').once('value', function(data) {
            var game_id = data.val();
            console.log('game id: ', game_id);

            //if a player clicks on play again
            if ( !game_id ) {
                //push unique id to games, add unique id to games table
                onerope.game_controller.game_ref = onerope.game_controller.table_ref.child('game').push();

                //set the game id
                onerope.game_controller.table_ref.update({game_id: onerope.game_controller.game_ref.key()});
            }
            else {
                onerope.game_controller.game_ref = onerope.game_controller.table_ref.child('game').child(game_id);
            }

            //set player info
            onerope.game_controller.set_player_name('guest', function() {
                //join the game
                onerope.game_controller.load_game();
            });

        });

    },

    load_game: function() {
        console.log('\n FUNCTION: onerope.game_controller.load_game');

        $('iframe.game_room').remove();
        $('body').append('<iframe class="game_room" src="game/"></iframe>');
    },

    set_player_name : function(player_name, callback) {
        console.log('\n FUNCTION: onerope.game_controller.set_player_name');

        onerope.game_controller.game_ref.child('players').child( onerope.tables.player_slot ).update( {name: player_name}, function() {
            console.log('callback - onerope.game_controller.set_player_name');
            callback();
        });
    },

    set_player_status : function(status, callback) {
        console.log('\n FUNCTION: onerope.game_controller.set_player_status');

        onerope.game_controller.game_ref.child('players').child( onerope.tables.player_slot ).update( {status: status}, function() {
            onerope.game_controller.game_ref.child('players').child( onerope.tables.player_slot ).onDisconnect().update({status: 'disconnected'}, function() {
                console.log('callback - onerope.game_controller.set_player_status');
                callback();
            });
        });
    },

    listeners_on : function(callback) {
        console.log('\n FUNCTION: onerope.game_controller.listeners_on');

        //PREVENT STARTING GAME UNTIL ALL LISTENERS ARE ON

        // ==== INITIAL PLAYERS ==== //
        function initial_players_on() {
            console.log('initial_players_on');
            onerope.game_controller.game_ref.child('players').once('value', function(snapshot) {
                console.log('ON INITIAL PLAYERS');
                onerope.game.initial_player_status(snapshot, function() {
                    console.log('initial player status set');
                    player_change_on();
                });
            });
        }

        // ==== ON PLAYER CHANGE ==== //
        function player_change_on() {
            console.log('player_change_on');
            onerope.game_controller.game_ref.child('players').on('child_changed', function(snapshot) {
                console.log('ON PLAYER CHANGE');
                onerope.game.changed_player_status(snapshot);
            });
            game_message_on();
        }

        // ==== GAME MESSAGE ==== //
        function game_message_on() {
            console.log('game_message_on');
            onerope.game_controller.game_ref.child('game').on('child_added', function(snapshot) {
                console.log('ON GAME MESSAGE');
                onerope.game.update(snapshot);
            });
            callback();
        }

        initial_players_on();

    },

    listeners_off : function() {
        onerope.game_controller.game_ref.off();
    },

    disconnect : function() {
        onerope.game_controller.listeners_off();
        onerope.tables.ref.child(onerope.tables.table).child('players').child(onerope.tables.player_slot).set(false, function() {
            onerope.tables.joining = false;
        });
    },

    return_to_tables : function() {
        console.log('\n FUNCTION: onerope.game_controller.return_to_tables');

        $('iframe.game_room').fadeOut('slow', function() {
            $('iframe.game_room').remove();
            $('.page_wrapper').fadeIn('fast');
        });
    }

};
