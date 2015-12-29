// ==== JOIN TABLE ==== //
$('.tables').on('click', '.table', function() {
    var table_id = $(this).attr('data-table-id');
    //console.log('table id: ', table_id);

    onerope.tables.join_table(table_id);
});

$( document ).ready(function() {
    onerope.tables.get_table_info();
});
