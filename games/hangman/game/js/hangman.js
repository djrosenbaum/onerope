var onerope = window.parent.onerope;

var hangman = {
    players : {},
    listeners_on : false,
    name_set : false,
    player_role : null,
    secret_word : null,
    stats : 0,
    round_started : false,
    winner : false,
    current_round : null
};

onerope.game.hangman = hangman;

hangman.reset = function() {
    console.log('hangman.reset');
    hangman.secret_word = null;
    hangman.round_started = false;
    hangman.winner = false;
    hangman.stats = 0;
    hangman.player_role = null;
};

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
    console.groupCollapsed('FUNCTION: enter_screen_player_name');

    set_screen('player_name');

    console.log('show the backspace button');
    $('.alphabet .backspace').show();

    generate_hangman_text('guest');

    player_name_listeners_on();

    game_message.text('Enter Your Player Name');
    set_game_status('Player Name');

    console.groupEnd('FUNCTION: enter_screen_player_name');
}

function exit_screen_player_name() {
    console.groupCollapsed('FUNCTION: exit_screen_player_name');

    console.log('hiding backspace button');
    $('.alphabet .backspace').hide();

    player_name_listeners_off();

    set_player_name(function() {
        $.when( $('.hangman_text, .word_controls').fadeOut('fast') ).then(function() {
            console.log('upper zone faded out');
            empty_hangman_text();
            detect_player_role();
        });
    });

    console.groupEnd('FUNCTION: exit_screen_player_name');
}

//turn on the player name listeners
function player_name_listeners_on() {
    console.groupCollapsed('FUNCTION: player_name_listeners_on');

    hangman.listeners_on = true;

    console.log('On click letters listener');
    letters.on('click', function () {

        if ( !first_letter ) {
            first_letter = true;
            empty_hangman_text();
        }

        if ( $(this).hasClass('space') ) {
            hangman_text.append(
                '<div class="letter_space">' +
                    '<div class="letter"> </div>' +
                '</div>'
            );
        }
        else if ( $(this).hasClass('backspace') ) {
            hangman_text.find('> div').last().remove();
        }
        else {
            var letter = $(this).text();
            console.log('letter: ', letter);

            hangman_text.append(
                '<div class="letter_underline">' +
                    '<div class="letter">' + letter + '</div>' +
                '</div>'
            );
        }
    });

    console.log('On touchstart letters listener');
    letters.on('touchstart', function() {
        letters.removeClass('active_letter');
        $(this).addClass('active_letter');
    });

    console.log('On touchend letters listener');
    letters.on('touchend', function() {
        letters.removeClass('active_letter');
    });

    console.log('On click submit player name');
    $('.submit').on('click', function() {
        exit_screen_player_name();
    });

    console.groupEnd('\n FUNCTION: player_name_listeners_on');
}

function player_name_listeners_off() {
    console.log('\n FUNCTION: player_name_listeners_off');

    //remove submit listener
    console.log('submit button listener off');
    $('.submit').off('click');

    console.log('letters listener off');
    letters.off('click');
}

//set player name
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

    $('.alphabet .backspace').show();
    $('.alphabet .space').show();

    set_word_listeners_on();

    game_message.text('Your Turn To Enter A Word');
    set_game_status('Set Secret Word');

    $('.word_controls').fadeIn('slow');
}

function exit_screen_setting_word() {
    console.log('\n FUNCTION: exit_screen_setting_word');

    set_word_listeners_off();

    $('.alphabet .backspace').hide();
    $('.alphabet .space').hide();

    set_secret_word();

    //SET GAME MESSAGE HERE

    $.when( $('.hangman_text, .alphabet, .word_controls').fadeOut('fast') ).then(function() {
        console.log('set word stuff faded out');
        empty_hangman_text();
        game_message.text('');
        set_game_status('');
        //$('.game_wrapper').slideUp('slow');
    });
}

function set_word_listeners_on() {
    console.log('\n FUNCTION: set_word_listeners_on');

    letters.on('click', function () {

        if ( $(this).hasClass('space') ) {
            hangman_text.append(
                '<div class="letter_space">' +
                    '<div class="letter"> </div>' +
                '</div>'
            );
        }
        else if ( $(this).hasClass('backspace') ) {
            hangman_text.find('> div').last().remove();
        }
        else {
            var letter = $(this).text();
            console.log('letter: ', letter);

            hangman_text.append(
                '<div class="letter_underline">' +
                    '<div class="letter">' + letter + '</div>' +
                '</div>'
            );
        }

        resize_word_layout();
    });

    $('.submit').on('click', function() {
        exit_screen_setting_word();
    });
}

function set_word_listeners_off() {
    console.log('\n FUNCTION: set_word_listeners_off');

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

    if ( !hangman.round_started && hangman.secret_word ) {
        start_round();
    }
}

function exit_screen_guessing_a_word() {
    console.groupCollapsed('exit_screen_guessing_a_word');

    guess_word_listeners_off();

    enter_screen_game_over();

    console.groupEnd('exit_screen_guessing_a_word');
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
    console.log('FUNCTION: guess_word_listeners_off');

    console.log('removing letter click listener');
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

        hangman.winner = true;

        onerope.game.set_player_score('winner', function() {
            console.log('winner announced');
        });

        $('.game_wrapper').trigger('game_over');
    }
}

function reveal_word_to_guess() {
    console.log('FUNCTION: reveal_word_to_guess');

    console.log('show all missed letters');
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
    console.log('FUNCTION: game over');

    if ( hangman.player_role === 'guesser' && hangman.winner ) {

        exit_screen_guessing_a_word();

    }

    else if ( hangman.player_role === 'guesser' && !hangman.winner ) {

        reveal_word_to_guess();

        exit_screen_guessing_a_word();
    }
}

// ==== GAME OVER SCREEN ==== //
function enter_screen_game_over() {
    console.groupCollapsed('enter_screen_game_over');

    set_screen('game_over');

    hangman.player_role = '';

    $('.game_wrapper').data('screen','game over');

    game_message.text('');

    if ( hangman.winner ) {
        set_game_status('You Won!');
    }
    else {
        set_game_status('Game Over');
    }

    $('.play_again').show();

    $('.game_wrapper').on('click', '.play_again', function() {
        console.log('clicked play again');
        play_again();
    });
    
    console.groupEnd('enter_screen_game_over');
}

function play_again() {
    console.log('play again');

    //RESET THE GAME
    hangman.reset();

    //INIT HANGMAN
    hangman.init();
}


// ==== HELPER FUNCTIONS ==== //
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

    if ( player_score === 'winner' ) {
        $('.leaderboard .players .player[data-player-slot="' + player_slot + '"]').addClass('winner');
        return;
    }

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
    console.log('\n FUNCTION: generate_hangman_text ', word);

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
    console.log('empty hangman text');

    hangman_text.empty();

    reset_word_layout();

    hangman_text.show();
}

function set_game_status(status_message) {
    console.log('set_game_status: ', status_message);

    $('.game_status').text(status_message);
}

function resize_word_layout() {
    console.log('resize_word_layout');
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

    //TODO THIS LOGIC NEEDS SOME WORK
    if ( onerope.game.round.player_turn === onerope.tables.player_slot ) {
        enter_screen_setting_word();
    }
    else {
        enter_screen_guessing_a_word();
    }
}

// ==== SET SCREEN ==== //
function set_screen(screen_name) {
    console.log('FUNCTION: set_screen ', screen_name);
    $('.game_wrapper').attr('data-screen', screen_name);
}

function get_screen() {
    return $('.game_wrapper').attr('data-screen');
}

// ==== INIT ==== //
hangman.init = function() {
    console.groupCollapsed('FUNCTION: hangman.init');

    onerope.game.get_round(function() {

        //[TODO] MIGHT NEED MORE LOGIC HERE IF NEW PLAYER JOINS
        if ( !hangman.name_set ) {
            console.log('storing hangman.current_round');
            hangman.current_round = onerope.game.round.interval;

            enter_screen_player_name();
        }
        else {
            //start another round
            var round = hangman.current_round++;

            if ( onerope.game.round.interval === hangman.current_round ) {
                //you are the first player to hit play again
                var player_turn = onerope.tables.player_slot;

                onerope.game.set_round( round, player_turn, function() {
                    console.log('round set');
                    enter_screen_setting_word();
                });
            }
            else {
                //you are not the first player to hit play again
                enter_screen_guessing_a_word();
            }

        }
    });

    console.groupEnd('FUNCTION: hangman.init');
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
