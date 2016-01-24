console.log('hangman v4');

//ANIMATED SCROLLING FOR AFTER USER GUESSES A LETTER
// $('#scrollable').animate({
//     scrollLeft: 300},
// 500);

var current_screen = 'enter_name';
var first_letter = false;

$('.alphabet .letter').on('click', function () {
    if ( current_screen === 'enter_name'  ) {

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
    }
});
