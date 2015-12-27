// ==== ROOM NAME INPUT ==== //
$('input.room_name').on('input', function() {
    var room_name = $(this).val();
    var valid_room_name = '';

    for ( var i=0; i<room_name.length; i++ ) {
        if ( /[a-zA-Z]/.test( room_name[i] ) ) {
            valid_room_name += room_name[i];
        }
    }

    if ( room_name !== valid_room_name ) {
        $('input.room_name').val(valid_room_name);
    }
});

function room_name_is_valid(room_name) {
    if ( room_name.length < 1 ) {
        return false;
    }
    return true;
}

// ==== CREATE NEW ROOM BUTTON ==== //
$('.create_new_room').on('click', function() {
    //get value from input box
    var room_name = $('input.room_name').val();

    if ( room_name_is_valid(room_name) ) {
        //create room and add to list
        console.log('create room: ', room_name);
        onerope.rooms.create_room(room_name);
    }
});

// ==== JOIN ROOM ==== //
$('.rooms').on('click', '.room', function() {
    var room_id = $(this).attr('data-room_id');
    //console.log('room id: ', room_id);

    onerope.rooms.enter_room(room_id);
});

$( document ).ready(function() {
    onerope.rooms.add_player();
    onerope.rooms.get_rooms();
});
