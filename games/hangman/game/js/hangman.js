var onerope = window.parent.onerope;

var hangman = {
    players : {},
    listeners_on : false,
    name_set : false,
    secret_word : null,
    stats : 0,
    round_started : false
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
var hangman_text = $('.hangman_text');
var first_letter = false; //user name initially set to guest, allows for first letter pressed to reset user name

// ==== SETTING THE PLAYER NAME SCREEN ==== //

function enter_screen_player_name() {
    console.log('\n FUNCTION: enter_screen_player_name');

    set_screen('player_name');

    generate_hangman_text('guest');

    player_name_listeners_on();

    game_message.text('Enter Your Player Name');
    set_game_status('Player Name');
}

function exit_screen_player_name() {
    console.log('\n FUNCTION: exit_screen_player_name');

    player_name_listeners_off();

    set_player_name(function() {
        $.when( $('.hangman_text, .word_controls').fadeOut('fast') ).then(function() {
            console.log('upper zone faded out');
            empty_hangman_text();
            detect_player_role();
        });
    });
}

//turn on the player name listeners
function player_name_listeners_on() {
    console.log('\n FUNCTION: player_name_listeners_on');

    hangman.listeners_on = true;

    letters.on('click', function () {
        if ( !first_letter ) {
            first_letter = true;
            empty_hangman_text();
        }

        var letter = $(this).text();
        console.log('letter: ', letter);

        hangman_text.append(
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
        empty_hangman_text();
    });

    $('.submit').on('click', function() {
        exit_screen_player_name();
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

function set_player_name(callback) {
    console.log('\n FUNCTION: set_player_name');

    var player_name_array = [];

    $('.hangman_text .letter').each(function( index ) {
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

        callback();
    });
}



// ==== SETTING THE WORD FOR THE ROUND ==== //
function enter_screen_setting_word() {
    console.log('\n FUNCTION: enter_screen_setting_word');

    set_screen('setting_word');

    hangman.player_role = 'setter';

    set_word_listeners_on();

    game_message.text('Your Turn To Enter A Word');
    set_game_status('Set Secret Word');

    $('.word_controls').fadeIn('slow');
}

function exit_screen_setting_word() {
    console.log('\n FUNCTION: exit_screen_setting_word');

    set_word_listeners_off();

    set_secret_word();

    //SET GAME MESSAGE HERE

    $.when( $('.hangman_text, .alphabet, .word_controls').fadeOut('fast') ).then(function() {
        console.log('set word stuff faded out');
        empty_hangman_text();
        game_message.text('');
        set_game_status('');
        $('.game_wrapper').slideUp('slow');
    });
}

function set_word_listeners_on() {
    console.log('\n FUNCTION: set_word_listeners_on');

    letters.on('click', function () {

        var letter = $(this).text();
        console.log('letter: ', letter);

        hangman_text.append(
            '<div class="letter_underline">' +
                '<div class="letter">' + letter + '</div>' +
            '</div>'
        );

        resize_word_layout();
    });

    $('.clear').on('click', function() {
        empty_hangman_text();
    });

    $('.submit').on('click', function() {
        exit_screen_setting_word();
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

    $('.hangman_text .letter').each(function( index ) {
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

// ==== GUESSING THE WORD SCREEN ==== //
function enter_screen_guessing_a_word() {
    console.log('\n FUNCTION: enter_screen_guessing_a_word');

    set_screen('guessing_word');

    hangman.player_role = 'guesser';

    $('.game_wrapper').data('screen','guessing');

    $('.execution_stand').fadeIn('slow');

    game_message.text('');
    set_game_status('Waiting For Word...');

    game_over_listener_on();

    if ( !hangman.round_started ) {
        start_round();
    }
}

function exit_screen_guessing_a_word() {

}

function guess_word_listeners_on() {
    console.log('\n FUNCTION: guess_word_listeners_on');

    letters.on('click', function () {

        var letter = $(this).text();
        console.log('letter: ', letter);

        if ( !$(this).hasClass('selected') ) {
            guess_word_listeners_off();
            $(this).addClass('selected');
            check_letter(letter);
        }
    });
}

function guess_word_listeners_off() {
    console.log('\n FUNCTION: guess_word_listeners_off');

    letters.off('click');
}

function game_over_listener_on() {
    $('.game_wrapper').on('game_over', game_over);
}

function game_over_listener_off() {
    $('.game_wrapper').off('game_over');
}

function check_letter(letter) {
    console.log('\n FUNCTION: check_letter');

    if ( $('.letter_underline .letter[data-letter="' + letter + '"]').length ) {
        $('.letter_underline .letter[data-letter="' + letter + '"]').removeClass('invisible');
        check_for_winner();
    }
    else {
        show_body_part();
    }

}

function check_for_winner() {
    console.log('\n FUNCTION: check_for_winner');

    if ( $('.letter_underline .letter.invisible').length ) {
        console.log('not a winner');
        guess_word_listeners_on();
    }
    else {
        console.log('we have a winner');
        announce_winner();
    }
}

function announce_winner() {
    console.log('\n FUNCTION: announce_winner');

    //this function should broadcast that a player successfully guessed the word. Good Job!
}

function reveal_word_to_guess() {
    console.log('\n FUNCTION: reveal_word_to_guess');

    $('.letter.invisible').removeClass('invisible').addClass('missed');
}

function show_body_part() {
    //if there are still hangman body parts to show
    if ( $('.execution_stand .body_part.invisible').length ) {
        //show the next body part
        $('.execution_stand .body_part.invisible').first().removeClass('invisible');
        //increase the mistakes
        hangman.stats += 1;
        //update the leaderboard
        onerope.game.set_player_score(hangman.stats, function() {
            //allow next letter to get selected
            console.log('update player score');

            if ( hangman.stats === 6 ) {
                //GAME OVER
                console.log('game over');
                $('.game_wrapper').trigger('game_over');
            }
            else {
                guess_word_listeners_on();
            }

        });
    }
    else {
        //GAME OVER
        console.log('game over');
        $('.game_wrapper').trigger('game_over');
    }
}

function game_over() {
    reveal_word_to_guess();
}



function layout_letters() {
    console.log('\n FUNCTION: layout_letters');

    var word = hangman.secret_word;

    for ( var i=0; i<word.length; i++ ) {

        if ( word[i] === ' ' ) {
            hangman_text.append(
                '<div class="letter_space"></div>'
            );
        }
        else {
            hangman_text.append(
                '<div class="letter_underline">' +
                    '<div class="letter invisible" data-letter="' + word[i] + '">' + word[i] + '</div>' +
                '</div>'
            );
        }

    }

    resize_word_layout();
    guess_word_listeners_on();
    set_game_status('Guess a Letter');
}

// ==== MESSAGE HANDLER ==== //
hangman.update = function(snapshot) {
    console.log('\n FUNCTION: hangman.update');

    console.log( snapshot.key() );
    console.log( snapshot.val() );

    var update = snapshot.val();

    if ( update.secret_word ) {
        hangman.secret_word = update.secret_word;
        if ( $('.game_wrapper').attr('data-screen') === "guessing_word" ) {
            start_round();
        }
    }
    else if ( update.score ) {
        var player_slot = update.score.player_slot;
        var player_score = update.score.player_score;

        console.log('player slot: ', player_slot);
        console.log('player score: ', player_score);

        update_score(player_slot, player_score);
    }
};

function update_score(player_slot, player_score) {
    console.log('\n FUNCTION: udpate_score');

    $('.leaderboard .players .player[data-player-slot="' + player_slot + '"] .stat').text(player_score + '/6');

    if ( player_score.toString() === '6' ) {
        $('.leaderboard .players .player[data-player-slot="' + player_slot + '"]').addClass('game_over');
    }
}

// ==== GENERAL GAME FUNCTIONS ==== //

function start_round() {
    console.log('\n FUNCTION: start_round');

    hangman.round_started = true;

    //SECRET WORD SET
    if ( hangman.player_role === 'guesser' ) {
        layout_letters();
    }
}

function generate_hangman_text(word) {
    console.log('\n FUNCTION: generate_hangman_text');

    empty_hangman_text();

    for ( var i=0; i<word.length; i++ ) {
        hangman_text.append(
            '<div class="letter_underline">' +
                '<div class="letter">' + word[i] + '</div>' +
            '</div>'
        );
    }

    resize_word_layout();
}

function empty_hangman_text() {
    hangman_text.empty();

    reset_word_layout();

    hangman_text.show();
}

function set_game_status(status_message) {
    $('.game_status').text(status_message);
}

function resize_word_layout() {
    var left_position = parseInt( $('.hangman_text').css('left'), 10 );
    var total_letters = $('.hangman_text > div').length;
    var letter_width = 45;
    var right_padding = 50;
    var total_width = left_position + (total_letters * letter_width) + right_padding;
    hangman_text.css('width', (total_letters * letter_width) + 'px');
    $('.horizontal_spacer').css('width', total_width + 'px');
}

function reset_word_layout() {
    hangman_text.css('width', '');
    $('.horizontal_spacer').css('width', '');
}


// ==== PLAYER ROLE ==== //

function detect_player_role() {
    console.log('\n FUNCTION: detect_player_role');

    if ( onerope.game.round.player_turn === onerope.tables.player_slot ) {
        enter_screen_setting_word();
    }
    else {
        enter_screen_guessing_a_word();
    }
}

// ==== SET SCREEN ==== //
function set_screen(screen_name) {
    $('.game_wrapper').attr('data-screen', screen_name);
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

    onerope.game.init(function() {
        hangman.init();
    });

});


//ANIMATED SCROLLING FOR AFTER USER GUESSES A LETTER
// $('#scrollable').animate({
//     scrollLeft: 300},
// 500);
