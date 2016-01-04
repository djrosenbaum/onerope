var onerope = {
    game: 'tictactoe',
};
onerope.ref = new Firebase("https://onerope.firebaseio.com/" + onerope.game);
console.log('connected to Firebase');

onerope.tables = {
    ref : onerope.ref.child('tables'),
    table : null,
    player : null,
    max_players : 2,
    loading_animation : null,

    //temp variables for each table
    total_players : 0,
    table_players : [],

    get_table_info : function() {
        console.log('');
        console.log('FUNCTION: onerope.tables.get_table_info');

        //loop through each table in the room
        onerope.tables.ref.once('value', function(snapshot) {
            onerope.tables.check_tables(snapshot);

            //after finished checking tables, add listeners
            onerope.tables.add_listeners();
        });

        onerope.tables.ref.on('child_changed', function(snapshot) {
            console.log('table changed');
            var value = snapshot.val();
            var key = snapshot.key();
            onerope.tables.check_table( value, key );
        });
    },

    check_tables : function(snapshot) {
        console.log('');
        console.log('FUNCTION: onerope.tables.check_tables');

        //store the tables object
        var tables = snapshot.val();
        console.log(tables);
        console.log('');

        //loop through each table
        _.each(tables, function(value, key, list) {
            // console.log('');
            // console.log('key: ', key);
            // console.log('value: ', value);

            onerope.tables.check_table(value, key);
        });
    },

    check_table : function(value, key) {
        console.log('');
        console.log('FUNCTION: onerope.tables.check_table');

        var table = value;
        var table_name = key;

        console.log('checking table: ', table_name);
        console.log(table);

        var players = table.players;
        console.log('players: ', players);

        //reset total players
        onerope.tables.total_players = 0;
        //reset table players
        onerope.tables.table_players = [];

        //loop through each player
        _.each(players, function(value, key, list) {
            // console.log('');
            // console.log('key: ', key);
            // console.log('value: ', value);
            onerope.tables.check_player(value, key);
        });

        onerope.tables.set_table_info(table_name);
    },

    check_player : function(value, key) {
        console.log('');
        console.log('FUNCTION: onerope.tables.check_player');

        var player_slot = key;
        console.log('player slot: ', player_slot);

        var player_name = value;
        console.log('player name: ', player_name);

        var player_data = {};
        player_data[key] = player_name;
        onerope.tables.table_players.push(player_data);

        if ( player_name ) {
            onerope.tables.total_players++;
        }
    },

    set_table_info : function(table_name) {
        console.log('');
        console.log('FUNCTION: onerope.tables.set_table_info');

        console.log('table name: ', table_name);
        var $table = $('.table[data-table-id=' + table_name + ']');

        console.log('table data: ', onerope.tables.table_players);
        $table.data('players', onerope.tables.table_players);

        onerope.tables.set_table_availability($table);

        onerope.tables.set_total_players($table);
    },

    set_table_availability : function($table) {
        console.log('');
        console.log('FUNCTION: onerope.tables.set_table_availability');

        var total_players = onerope.tables.total_players;

        //conditional to determine the availability of the table
        if ( total_players === onerope.tables.max_players ) {
            //table is full
            $table.attr('data-availability','full');
        }
        else if ( total_players === 0 ) {
            //table is empty
            $table.attr('data-availability','not_full');
        }
        else if ( total_players < onerope.tables.max_players ) {
            //table is not empty and not full
            $table.attr('data-availability','not_full');
        }
    },

    set_total_players : function( $table ) {
        console.log('');
        console.log('FUNCTION: onerope.tables.set_total_players');

        var total_players = onerope.tables.total_players;

        $table.find('.table_player_status').html( total_players + '/' + onerope.tables.max_players);
        console.log(' ');
    },

    join_table : function(table_id) {
        console.log('');
        console.log('FUNCTION: onerope.tables.join_table');
        // console.log('joining table');
        // console.log('table id: ', table_id);

        var player_number;

        var player_ref = onerope.tables.ref.child(table_id).child('players');
        player_ref.once("value", function(data) {
            var players = data.val();
            // console.log('players at table: ', players);

            _.some(players, function(value, key, list) {
                if ( !value ) {
                    player_number = key;
                    return true;
                }
            });
        });

        // console.log('player number: ', player_number);

        //show an alert if the room is full
        if ( !player_number ) {
            alert('room full');
            return;
        }

        onerope.tables.table = table_id;
        onerope.tables.player = player_number;

        var player_data = {};
        player_data[player_number] = 'guest';

        //Add Player to Table
        player_ref.update(player_data);

        // Set Player ID
        //onerope.player.user_id = post_ref.key();

        // Remove Player from members when player disconnects
        player_ref.child(player_number).onDisconnect().set(false);

        onerope.tables.load_game();
    },

    loading_table: function() {
        console.log('');
        console.log('FUNCTION: onerope.tables.loading_table');
        //hide tables container to prevent clicking multiple rooms
        $('.tables').fadeOut('fast');

        $('.loading').fadeIn('slow');

        var current_frame = 1;
        var total_frames = 10;
        var grow = true;
        var dots;

        function animate_loader() {
            onerope.tables.loading_animation = setTimeout(function() {
                if ( current_frame === 1 ) {
                    $('.loading .dots').append('.');
                    current_frame++;
                    grow = true;
                }
                else if ( current_frame < total_frames && grow  ) {
                    $('.loading .dots').append('.');
                    current_frame++;
                }
                else if ( current_frame < total_frames && !grow ) {
                    dots = $('.loading .dots').text();
                    $('.loading .dots').text( dots.slice(0,-1) );
                    current_frame--;
                }
                else {
                    dots = $('.loading .dots').text();
                    $('.loading .dots').text( dots.slice(0,-1) );
                    current_frame--;
                    grow = false;
                }
                animate_loader();
            }, 100);
        }

        animate_loader();

    },

    stop_loading_animation: function() {
        console.log('');
        console.log('FUNCTION: onerope.tables.stop_loading_animation');
        clearTimeout(onerope.tables.loading_animation);
        $('.loading').hide();
    },

    load_game: function() {
        console.log('');
        console.log('FUNCTION: onerope.tables.load_game');
        $('body').append('<iframe class="game_room" src="game/"></iframe>');
    },

    add_listeners: function() {
        console.log('');
        console.log('FUNCTION: onerope.tables.add_listeners');
        // ==== JOIN TABLE ==== //
        $('.tables').on('click', '.table', function() {
            if ( $(this).data('availability') === 'full' ) {
                //console.log('room is full');
                return;
            }

            var table_id = $(this).attr('data-table-id');
            //console.log('table id: ', table_id);

            onerope.tables.loading_table();

            onerope.tables.join_table(table_id);
        });
        console.log('finished adding listeners');
    }

};

$( document ).ready(function() {
    onerope.tables.get_table_info();
});
