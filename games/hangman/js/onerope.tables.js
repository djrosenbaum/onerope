// ==== ONEROPE.TABLES ==== //
onerope.tables = {
    ref: onerope.ref.child('tables'), //tables firebase ref
    table_name: null, // string 'table_01'
    player_slot: null, // string 'player1'
    max_players: 10,
    loading_animation: null, // setting timeout or clearing timeout
    joining: false, // flag to prevent clicking multiple times on a table

    //temp variables for each table
    total_players: 0,

    get_table_info : function() {
        console.groupCollapsed('onerope.tables.get_table_info');

        console.log('fetching table data from firebase');
        onerope.tables.ref.once('value', function(snapshot) {

            onerope.tables.check_tables(snapshot);

            console.groupEnd('onerope.tables.get_table_info');

            //after finished checking tables, add listeners
            onerope.tables.add_listeners();
        });
    },

    check_tables : function(snapshot) {
        //console.log('\n FUNCTION: onerope.tables.check_tables');

        //store the tables object
        var tables = snapshot.val();
        console.log('tables: ', tables);

        //loop through each table
        _.each(tables, function(value, key, list) {
            // console.log('');
            // console.log('key: ', key);
            // console.log('value: ', value);

            onerope.tables.check_table(value, key);
        });
    },

    check_table : function(table, table_name) {
        // console.log('\n FUNCTION: onerope.tables.check_table');

        console.log('\n');
        console.groupCollapsed('checking table: ', table_name);

        var players = table.players;
        console.log('players: ', players);

        //reset total players
        onerope.tables.total_players = 0;

        //loop through each player
        _.each(players, function(value, key, list) {
            // console.log('');
            // console.log('key: ', key);
            // console.log('value: ', value);
            onerope.tables.check_player(value, key);
        });
        console.groupEnd('checking table: ', table_name);

        onerope.tables.set_table_info(table_name);
    },

    check_player : function(value, key) {
        //console.log('\n FUNCTION: onerope.tables.check_player');

        var player_slot = key;
        console.log('\nplayer slot: ', player_slot);

        var player_status = value;
        console.log('player status: ', player_status);

        var player_data = {};
        player_data[key] = true;

        if ( player_status ) {
            onerope.tables.total_players++;
        }
    },

    set_table_info : function(table_name) {
        //console.log('\n FUNCTION: onerope.tables.set_table_info');

        console.groupCollapsed('set table: ', table_name);
        var $table = $('.table[data-table-name=' + table_name + ']');

        onerope.tables.set_table_availability($table);

        onerope.tables.set_total_players($table);
        console.groupEnd('set table: ', table_name);
    },

    set_table_availability : function($table) {
        console.log('\n FUNCTION: onerope.tables.set_table_availability');

        var total_players = onerope.tables.total_players;
        console.log('total players: ', total_players);

        //conditional to determine the availability of the table
        if ( total_players === onerope.tables.max_players ) {
            //table is full
            $table.attr('data-availability','full');
            console.log('table full');
        }
        else if ( total_players === 0 ) {
            //table is empty
            $table.attr('data-availability','not_full');
            console.log('table empty');
        }
        else if ( total_players < onerope.tables.max_players ) {
            //table is not empty and not full
            $table.attr('data-availability','not_full');
            console.log('not full');
        }
    },

    set_total_players : function( $table ) {
        console.log('\n FUNCTION: onerope.tables.set_total_players');

        var total_players = onerope.tables.total_players;
        console.log(total_players + '/' + onerope.tables.max_players);

        //console.log('$table: ', $table);

        $table.find('.table_player_status').html( total_players + '/' + onerope.tables.max_players);
        console.log(' ');
    },

    join_table : function(table_name) {
        console.log('\n FUNCTION: onerope.tables.join_table');

        console.log('table name: ', table_name);

        var player_ref = onerope.tables.ref.child(table_name).child('players');

        onerope.tables.get_player_slot(player_ref, function() {

            onerope.tables.start_join_table_animation();

            var player_data = {};
            player_data[onerope.tables.player_slot] = true;

            onerope.tables.table = table_name;

            //Add Player to Table
            player_ref.update(player_data, function() {
                // Remove Player from members when player disconnects
                player_ref.child(onerope.tables.player_slot).onDisconnect().set(false, function() {
                    //Initialize Game Controller
                    onerope.game_controller.init();
                });
            });

        });

    },

    get_player_slot : function(player_ref, callback) {
        console.log('\n FUNCTION: onerope.tables.get_player_slot');

        var player_slot;

        player_ref.once('value', function(snapshot) {

            var players = snapshot.val();
            console.log('players at table: ', players);

            _.some(players, function(value, key, list) {
                if ( !value ) {
                    player_slot = key;
                    return true;
                }
            });

            //if no player slot available, show an alert if the room is full
            if ( !player_slot ) {
                alert('room full');
            }
            else {
                onerope.tables.player_slot = player_slot;
                callback();
            }
        });
    },

    start_join_table_animation: function() {
        console.log('\n FUNCTION: onerope.tables.start_join_table_animation');

        //hide tables container to prevent clicking multiple rooms
        $('.page_wrapper').fadeOut('fast');
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

    stop_join_table_animation: function() {
        console.log('\n FUNCTION: onerope.tables.stop_join_table_animation');

        clearTimeout(onerope.tables.loading_animation);
        $('.loading').hide();
    },

    // load_game: function() {
    //     console.log('');
    //     console.log('FUNCTION: onerope.tables.load_game');

    //     //$('body').append('<iframe class="game_room" src="game/"></iframe>');
    // },

    add_listeners: function() {
        console.groupCollapsed('onerope.tables.add_listeners');
        //console.log('\n FUNCTION: onerope.tables.add_listeners');

        // ==== JOIN TABLE ==== //
        console.log('adding table click listener');
        $('.tables').on('click', '.table', function() {

            var table_name = $(this).attr('data-table-name');
            console.log('clicked table: ', table_name);

            if (onerope.tables.joining) {
                return;
            }

            if ( $(this).data('availability') === 'full' ) {
                console.log('room is full');
                onerope.tables.joining = false;
                return;
            }

            onerope.tables.joining = true;

            onerope.tables.join_table(table_name);
        });

        console.log('adding listener when players at table changes');
        onerope.tables.ref.on('child_changed', function(snapshot) {
            console.log('onerope.tables.ref.on child_changed');

            var table = snapshot.val();
            var table_name = snapshot.key();

            onerope.tables.check_table(table, table_name);
        });
        console.groupEnd('onerope.tables.add_listeners');
    }

};
