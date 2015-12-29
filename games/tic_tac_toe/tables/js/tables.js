console.log('connected to firebase');
var onerope_ref = new Firebase("https://onerope.firebaseio.com/" + onerope.game);
var table_ref = onerope_ref.child('tables');

onerope.tables = {

    max_players : 2,

    get_table_info : function() {
        console.log('get table info');

        //loop through each table in the room
        table_ref.on("child_added", function(snapshot, prevChildKey) {
            console.log(' ');

            console.log('adding table: ', snapshot.key());
            //adding table: table01

            onerope.tables.check_availability( snapshot );
            //answers number of players at the table

            console.log(' ');
        });

/*
        table_ref.on('child_changed', function(snapshot) {
            console.log('table changed');
            onerope.tables.update_table( snapshot );
        });
*/

    },

    check_availability : function( snapshot ) {
        console.log('checking table');

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
        console.log(table_name + ' has ' + total_players + ' players');

        //conditional to determine the availability of the table
        if ( total_players === onerope.tables.max_players ) {
            //table is full
            $('.table[data-table-id=' + table_name + ']').attr('data-availability','full');
        }
        else if ( total_players === 0 ) {
            //table is empty
            $('.table[data-table-id=' + table_name + ']').attr('data-availability','not_full');
        }
        else if ( total_players < onerope.tables.max_players ) {
            //table is not empty and not full
            $('.table[data-table-id=' + table_name + ']').attr('data-availability','not_full');
        }
    },

    join_table : function(table_id) {
        console.log('joining table');
        console.log('table id: ', table_id);

        var player_data = {
            player_name: 'guest'
        };

        //Add Player to Table
        var table_ref = onerope_ref.child('tables');
        var post_ref = member_ref.child(table_id).push(player_data);

        // Set Player ID
        onerope.player.user_id = post_ref.key();

        // Remove Player from members when player disconnects
        member_ref.child(table_id).child(onerope.player.user_id).onDisconnect().remove();

/*
        $('.page_wrapper').addClass('game_in_session');
        $('body').append('<iframe class="game_room" src="../"></iframe>');
*/
    }

/*
    add_player : function() {
        var player_data = {
            time_connected: Firebase.ServerValue.TIMESTAMP,
        };

        var player_ref = onerope_ref.child('players');

        // Generate a reference to new player and add some data using push()
        var post_ref = player_ref.push(player_data);

        // Set Player ID
        onerope.player.user_id = post_ref.key();

        // Remove User when player disconnects
        player_ref.child(onerope.player.user_id).onDisconnect().remove();
    },
*/

/*
    create_room : function(room_name) {
        var room_data = {
            room_name: room_name
        };

        var room_ref = onerope_ref.child('rooms');

        var post_ref = room_ref.push(room_data);

        // Set Room ID
        var room_id = post_ref.key();

        // Remove Room when player disconnects
        // room_ref.child(room_id).onDisconnect().remove();

        //after creating the room, enter the room
        onerope.rooms.enter_room(room_id);
    },
*/

/*
    add_room : function(snapshot) {
        console.log('add room to list of rooms');
        //console.log('key: ', snapshot.key());
        console.log('snapshot: ', snapshot.val());

        var room_list = snapshot.val();
        onerope.rooms.list.push({
            room_id: snapshot.key(),
            room_name: room_list.room_name
        });

        onerope.rooms.list = _.sortBy(onerope.rooms.list, 'room_name');

        $('.rooms').empty();

        _.each(onerope.rooms.list, function(element, index, list) {
            console.log('element: ', element);
            console.log('element id: ', element.room_id);
            $('.rooms').append('<div class="room" data-room_id=' + element.room_id + '>' + element.room_name + '</div>');
        });
    },
*/
/*
    remove_room : function(snapshot) {
        console.log('remove room from list of rooms');
        console.log('key: ', snapshot.key());
        console.log('snapshot: ', snapshot.val());

        onerope.rooms.list = _.filter(onerope.rooms.list, function(room) {
            console.log('room id: ', room.room_id);
            if ( room.room_id === snapshot.key() ) {
                return false;
            }
            else {
                return true;
            }
        });

        onerope.rooms.list = _.sortBy(onerope.rooms.list, 'room_name');

        $('.rooms').empty();

        _.each(onerope.rooms.list, function(element, index, list) {
            $('.rooms').append('<div class="room" data-room_id=' + element.room_id + '>' + element.room_name + '</div>');
        });
    },
*/
};
