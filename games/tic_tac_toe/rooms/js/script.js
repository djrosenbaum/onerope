//create new room button
$('.create_new_room').on('click', create_room_handler);

function create_room_handler() {
    //get value from input box
    var room_name = $('input.room_name').val();
    console.log('create room: ', room_name);

    //create room and add to list
    onerope.rooms.create_room(room_name);
}


$( document ).ready(function() {
    onerope.rooms.add_player();
    onerope.rooms.get_rooms();
});
