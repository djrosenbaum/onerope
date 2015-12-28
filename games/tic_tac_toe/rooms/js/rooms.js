console.log('connected to firebase');
var onerope_ref = new Firebase("https://onerope.firebaseio.com/" + onerope.game);

onerope.rooms = {

    list : [],

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

    create_room : function(room_name) {
        var room_data = {
            room_name: room_name
        };

        var room_ref = onerope_ref.child('rooms');

        var post_ref = room_ref.push(room_data);

        // Set Room ID
        var room_id = post_ref.key();

        // Remove Room when player disconnects
        room_ref.child(room_id).onDisconnect().remove();

        //after creating the room, enter the room
        onerope.rooms.enter_room(room_id);
    },

    get_rooms : function() {
        var rooms = onerope_ref.child('rooms');

        // Retrieve new posts as they are added to our database
        rooms.on("child_added", function(snapshot, prevChildKey) {
            console.log('room added');
            onerope.rooms.add_room(snapshot);
        });

        // Get the data on a post that has been removed
        rooms.on("child_removed", function(snapshot) {
            onerope.rooms.remove_room(snapshot);
            console.log('room removed');
        });
    },

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

    enter_room : function(room_id) {
        console.log('entering room');

        var player_data = {
            player_name: 'guest'
        };

        //Add Room to Member object
        var member_ref = onerope_ref.child('members');
        member_ref.child(room_id).push(player_data);

        $('.page_wrapper').addClass('game_in_session');
        $('body').append('<iframe class="game_room" src="../"></iframe>');
    }
};
