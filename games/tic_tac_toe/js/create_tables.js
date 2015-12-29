console.log('connected to firebase');

var game = 'tictactoe';
var onerope_ref = new Firebase('https://onerope.firebaseio.com/' + game);
var table_ref = onerope_ref.child('tables');

var table_data = {
};

for (var i = 1; i<11; i++ ) {

    var table_number;

    if ( i < 10 ) {
        table_number = '0' + i;
    }
    else {
        table_number = i;
    }

    var table_name = 'table' + table_number;

    table_data[table_name] = {
        players : {
            player1: false,
            player2: false
        }
    };
}

table_ref.set(table_data);
