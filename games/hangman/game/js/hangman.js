var onerope = window.parent.onerope;

//ANIMATED SCROLLING FOR AFTER USER GUESSES A LETTER
// $('#scrollable').animate({
//     scrollLeft: 300},
// 500);

//ENTERING USER NAME
var first_letter = false;
var letters = $('.alphabet .letter');

function player_name_listeners_on() {
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

    $('.name_buttons .clear').on('click', function() {
        first_letter = true;
        $('.hangman_inner_wrapper .name_wrapper').empty();
    });

    $('.name_buttons .submit').on('click', function() {

        //remove clear click listeners
        $('.name_buttons .clear').off('click');

        //remove submit listener
        $('.name_buttons .submit').off('click');

        $.when( $('.name_cta, .name_wrapper, .name_buttons').fadeOut('fast') ).then(function() {
            console.log('stuff faded out');
            $('.execution_stand').fadeIn('slow');
        });

        set_player_name();

    });
}

function set_player_name() {
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

    onerope.game_controller.set_player_name(player_name);
}

player_name_listeners_on();
