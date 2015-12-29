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

$( document ).ready(function() {
    onerope.tables.get_table_info();
});
