//create new room button
$('.create_new_room').on('click', function() {
    //get value from input box
    var room_name = $('input.room_name').val();
    console.log('create room: ', room_name);

    if ( room_name_is_valid(room_name) ) {
        //create room and add to list
        onerope.rooms.create_room(room_name);
    }
});

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

$( document ).ready(function() {
    onerope.rooms.add_player();
    onerope.rooms.get_rooms();
});
