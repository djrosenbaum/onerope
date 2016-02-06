var onerope = window.parent.onerope;

var hangman = {
    players : {},
    listeners_on : false,
    name_set : false
};

onerope.game.hangman = hangman;

// ==== PLAYER MANAGEMENT ==== //
hangman.update_player = function( player_slot, player ) {
    console.log('\n FUNCTION: hangman.update_player');

    hangman.players[player_slot] = hangman.players[player_slot] || {};
    hangman.players[player_slot]['name'] = player['name'];

    var player_name = player['name'];

    console.log('player slot:', player_slot);
    console.log('player name:', player_name);

    if ( $('.leaderboard .players .player[data-player-slot="' + player_slot + '"]').length > 0 ) {
        console.log('player exists in the dom');
        $('.leaderboard .players .player[data-player-slot="' + player_slot + '"] .name').text(player_name);
    }
    else {
        console.log('player does not yet exist in the dom');
        $('.leaderboard .players').append(
            '<div class="player" data-player-slot="' + player_slot + '">' +
                '<div class="name">' + player_name + '</div>' +
                '<div class="stat">0/6</div>' +
            '</div>'
        );
    }
};

hangman.remove_player = function( player_slot ) {
    console.log('\n FUNCTION: hangman.remove_player');

    $('.leaderboard .players .player[data-player-slot="' + player_slot + '"]').remove();
};

hangman.player_disconnected = function( player_slot, player ) {
    console.log('\n FUNCTION: hangman.player_disconnected');

    hangman.remove_player( player_slot );
    delete hangman.players[player_slot];
};

// ==== GLOBAL VARS ==== //
var letters = $('.alphabet .letter'); //selects all letters
var game_message = $('.game_message div');
var first_letter = false; //user name initially set to guest, allows for first letter pressed to reset user name

// ==== SETTING THE PLAYER NAME SCREEN ==== //

function enter_screen_player_name() {
    player_name_listeners_on();

    game_message.text('Enter Your Player Name');
}

function exit_screen_player_name() {
    player_name_listeners_off();
}

//turn on the player name listeners
function player_name_listeners_on() {
    hangman.listeners_on = true;

    letters.on('click', function () {
        if ( !first_letter ) {
            first_letter = true;
            $('.hangman_inner_wrapper .name_wrapper').empty();
        }

        var letter = $(this).text();
        console.log('letter: ', letter);

        $('.hangman_inner_wrapper .name_wrapper').append(
            '<div class="letter_underline">' +
                '<div class="letter">' + letter + '</div>' +
            '</div>'
        );
    });

    letters.on('touchstart', function() {
        letters.removeClass('active_letter');
        $(this).addClass('active_letter');
    });

    letters.on('touchend', function() {
        letters.removeClass('active_letter');
    });

    $('.clear').on('click', function() {
        first_letter = true;
        $('.hangman_inner_wrapper .name_wrapper').empty();
    });

    $('.submit').on('click', function() {

        exit_screen_player_name();

        set_player_name();

        //SET GAME MESSAGE HERE

        $.when( $('.name_wrapper, .word_controls').fadeOut('fast') ).then(function() {
            console.log('upper zone faded out');
        });


    });
}

function player_name_listeners_off() {
    console.log('\n FUNCTION: player_name_listeners_off');

    //remove clear click listeners
    $('.clear').off('click');

    //remove submit listener
    $('.submit').off('click');

    letters.off('click');
}

function set_player_name() {
    console.log('\n FUNCTION: set_player_name');

    var player_name_array = [];

    $('.name_wrapper .letter').each(function( index ) {
        var letter = $(this).text();
        player_name_array.push(letter);
    });

    console.log('player_name_array:', player_name_array);

    var player_name = player_name_array.join('');
    console.log('player name: ', player_name);

    if ( player_name.length === 0 ) {
        player_name = 'guest';
    }
    else if ( player_name.length > 20 ) {
        player_name = player_name.substring(0, 20);
    }

    onerope.game_controller.set_player_name(player_name, function() {
        console.log('player name set');
        hangman.name_set = true;

        //detect player type here
        detect_player_type();
    });
}



// ==== SETTING THE WORD FOR THE ROUND ==== //
function enter_screen_setting_a_word() {
    set_word_listeners_on();

    game_message.text('Your Turn To Enter A Word');

    $('.word_controls').fadeIn('slow');
}

function set_word_listeners_on() {
    console.log('\n FUNCTION: set_word_listeners_on');

    letters.on('click', function () {

        var letter = $(this).text();
        console.log('letter: ', letter);

        $('.hangman_inner_wrapper .set_word_wrapper').append(
            '<div class="letter_underline">' +
                '<div class="letter">' + letter + '</div>' +
            '</div>'
        );
    });

    $('.clear').on('click', function() {
        $('.hangman_inner_wrapper .set_word_wrapper').empty();
    });

    $('.submit').on('click', function() {

        //turn off the listeners from name selection
        set_word_listeners_off();

        set_secret_word();

        //SET GAME MESSAGE HERE

        $.when( $('.name_wrapper, .word_controls').fadeOut('fast') ).then(function() {
            console.log('upper zone faded out');
        });


    });
}

function set_word_listeners_off() {
    console.log('\n FUNCTION: set_word_listeners_off');

    $('.clear').off('click');
    $('.submit').off('click');

    letters.off('click');
}

function set_secret_word() {
    console.log('\n FUNCTION: set_secret_word');

    var secret_word_array = [];

    $('.set_word_wrapper .letter').each(function( index ) {
        var letter = $(this).text();
        secret_word_array.push(letter);
    });

    console.log('secret_word_array:', secret_word_array);

    var secret_word = secret_word_array.join('');
    console.log('secret word: ', secret_word);

    onerope.game.set_secret_word(secret_word, function() {
        console.log('secret word set');

        //ready to start the game
        onerope.game.start_round(secret_word, start_round);
    });
}

function start_round(secret_word) {
    console.log('start the round');
}

// ==== GUESSING THE WORD SCREEN ==== //
function enter_screen_guessing_a_word() {

}

function guess_word_listeners_on() {

    $('word_to_guess').on('word_ready', function() {
        console.log('word is ready to guess');
    });

}

// ==== MESSAGE HANDLER ==== //
hangman.update = function(snapshot) {
    console.log('update the game');

    console.log( snapshot.key() );
    console.log( snapshot.val() );

    var update = snapshot.val();

    if ( update.secret_word ) {
        //SECRET WORD SET
        console.log('secret word was set');
    }
};


// ==== PLAYER ROLE ==== //

function detect_player_type() {
    console.log('\n FUNCTION: detect player type');

    if ( onerope.game.round.player_turn === onerope.tables.player_slot ) {
        enter_screen_setting_a_word();
    }
    else {
        enter_screen_guessing_a_word();
    }
}

function guessing_a_word() {
    console.log('guessing a word');

    guess_word_listeners_on();

    $('.execution_stand').fadeIn('slow');
}


// ==== INIT ==== //
hangman.init = function() {
    console.log('\n FUNCTION: hangman.init');

    onerope.game.get_round(function() {
        if ( !hangman.name_set ) {
            enter_screen_player_name();
        }
        else {
            //start another round
        }
    });
};

$(document).ready(function() {

    console.log('hangman loaded');

    onerope.game.init();

    hangman.init();

});


//ANIMATED SCROLLING FOR AFTER USER GUESSES A LETTER
// $('#scrollable').animate({
//     scrollLeft: 300},
// 500);
