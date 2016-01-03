var onerope = {
    game: 'tictactoe'
};

var onerope_ref = new Firebase("https://onerope.firebaseio.com/" + onerope.game);
var table_ref = onerope_ref.child('tables');

onerope.tables = {
    table : null,
    player : null,
    max_players : 2,
    loading_animation : null,

    get_table_info : function() {
        // console.log('get table info');

        //loop through each table in the room
        table_ref.on('child_added', function(snapshot, prevChildKey) {
            // console.log(' ');

            // console.log('adding table: ', snapshot.key());
            //adding table: table01

            onerope.tables.check_availability( snapshot );
            //answers number of players at the table

            // console.log(' ');
        });

        table_ref.on('child_changed', function(snapshot) {
            // console.log('table changed');
            onerope.tables.check_availability( snapshot );
        });

    },

    check_availability : function( snapshot ) {
        // console.log('checking table');

        //js object of one specific table
        var table = snapshot.val();

        //string name of table
        var table_name = snapshot.key();

        //object containing players at the table
        var players = table.players;

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
        // console.log(table_name + ' has ' + total_players + ' players');

        var $table = $('.table[data-table-id=' + table_name + ']');

        var player_data = {
            player1 : players.player1,
            player2 : players.player1
        };

        $table.data('players', player_data);

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

        onerope.tables.set_total_players( $table, total_players );
    },

    join_table : function(table_id) {
        // console.log('joining table');
        // console.log('table id: ', table_id);

        var player_number;

        var player_ref = table_ref.child(table_id).child('players');
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
        clearTimeout(onerope.tables.loading_animation);
        $('.loading').hide();
    },

    set_total_players : function( $table, total_players ) {
        $table.find('.table_player_status').html( total_players + '/' + onerope.tables.max_players);
    },

    load_game: function() {
        console.log('loading game');
        $('body').append('<iframe class="game_room" src="game/"></iframe>');
    },

    add_listeners: function() {
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
    }

};

$( document ).ready(function() {
    onerope.tables.get_table_info();

    onerope.tables.add_listeners();
});
