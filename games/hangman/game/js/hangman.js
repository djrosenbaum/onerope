console.log('hangman v4');

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
}

player_name_listeners_on();
