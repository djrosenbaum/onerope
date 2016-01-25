console.log('connected to firebase');

var game = 'hangman';
var onerope_ref = new Firebase('https://onerope.firebaseio.com/' + game);
var table_ref = onerope_ref.child('tables');

var total_tables = 5;
var players_per_table = 7;

var table_data = {};

for (var i=1; i<=total_tables; i++ ) {

    var table_number;

    if ( i < 10 ) {
        table_number = '0' + i;
    }
    else {
        table_number = i;
    }

    var table_name = 'table' + table_number;

    table_data[table_name] = {
        players : {}
    };

    for (var j=1; j<=players_per_table; j++ ) {
        var player_slot = 'player' + j;
        table_data[table_name]['players'][player_slot] = false;
    }
}

console.log(table_data);

onerope_ref.remove();
table_ref.set(table_data);
