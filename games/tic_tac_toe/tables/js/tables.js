console.log('connected to firebase');
var onerope_ref = new Firebase("https://onerope.firebaseio.com/" + onerope.game);
var table_ref = onerope_ref.child('tables');

onerope.tables = {

    max_players : 2,

    get_table_info : function() {
        console.log('get table info');

        table_ref.on("child_added", function(snapshot, prevChildKey) {
            console.log('adding table: ', snapshot.key());
            onerope.tables.check_table( snapshot );
        });

        table_ref.on('child_changed', function(snapshot) {
            console.log('table changed');
            onerope.tables.update_table( snapshot );
        });
    },

    check_table : function( snapshot ) {
        console.log('checking table');

        var table = snapshot.val();
        var table_name = snapshot.key();

        //console.log('player 1: ', table.player1);
        //console.log('player 2: ', table.player2);

        if ( table.player1 && table.player2 ) {
            console.log( table_name + ' is full' );
        }
        else if ( table.player1 || table.player2 ) {
            console.log( table_name + 'is available');
        }
        else {
            console.log( table_name + 'is empty');
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
