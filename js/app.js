let card = document.getElementsByClassName('card');
// Spread operator (new in ES6) allows iterable to expand where 0+ arguments are expected
let cards = [...card];
console.log(cards);

// getElementsByClassName method returns HTMLCollection (or a NodeList for some older browsers https://www.w3schools.com/js/js_htmldom_nodelist.asp), an array-like object on which you can use Array.prototype methods. Added [0] to get the first element matched
let deck = document.getElementsByClassName('card-deck')[0];
let moves = 0;
// Class moves controls what's displayed in the score panel
let counter = document.querySelector('.moves');
// Const cannot be used here in order for star rating to be reset when startGame() is called
let stars = document.querySelectorAll('.fa-star');
let matchingCard = document.getElementsByClassName('matching');
let closeIcon = document.querySelector('.close');
// Using getElementsByClassName instead of querySelector here (there's only one class to select) because querySelector is non-live, i.e., it doesn't reflect DOM manipulation. When the user wins the game, a class ("show") is added to the element with class modal, which is set to visible in CSS, so getElementsByClassName is needed (otherwise the modal remains hidden when the game has been won)
let modal = document.getElementsByClassName('modal')[0];
let openedCards = [];
let second = 0, minute = 0, hour = 0;
let timer = document.querySelector('.timer');
let interval;
const restartButton = document.querySelector('.restart');
const modalPlayAgainButton = document.querySelector('.play-again');

// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
  }

// Shuffles cards upon page load
document.body.onload = startGame();

// Calls startGame() function with user clicks restart icon
restartButton.addEventListener('click', startGame);

// Calls reset() function (hides modal and restarts game) with user clicks "play again" button in modal
modalPlayAgainButton.addEventListener('click', reset);

function startGame() {
  // Shuffles deck
  cards = shuffle(cards);
  // Loops through shuffled cards, adds each to the deck (an array-like object, since it is defined with getElementsByClassName), and removes any existing classes from each card
  for (let i = 0; i < cards.length; i++) {
  cards.forEach(i => deck.appendChild(i));
    // Class 'open' changes the card color and triggers an animation, while 'show' (when applied to a card; in other cases it is applied to the modal) displays the Font Awesome icon
    cards[i].classList.remove('show', 'open', 'matching', 'disabled');
  }
  openedCards = [];
  // Resets number of moves
  moves = 0;
  counter.innerHTML = moves;
  // Resets star rating
  for (let i = 0; i < stars.length; i++) {
    stars[i].style.color = '#ffd700';
    // When function moveCounter() is called, stars is set to display: none after a certain number of moves. (visibility: collapse was original method used to hide stars, but this prevented proper centering of stars in modal)
    stars[i].style.display = 'inline';
  }
  // Resets timer
  let second = 0;
  let minute = 0;
  let hour = 0;
  let timer = document.querySelector('.timer');
  timer.innerHTML = '0 mins 0 secs';
  // Window method that stops setInterval() Window method from executing "myTimer" function every 1 second
  clearInterval(interval);
}

// When called, function toggles open and show classes to display cards. Class 'open' changes the card color and triggers an animation, while 'show' (when applied to a card; in other cases it is applied to the modal) displays the Font Awesome icon
let displayCard = function() {
  this.classList.toggle('open');
  this.classList.toggle('show');
  this.classList.toggle('disabled');
};

// Adds flipped cards to openedCards array, calls the counter function if two have been flipped, and checks if cards are a match or not
function cardOpen() {
  openedCards.push(this);
  let len = openedCards.length;
  // Once a card has been opened, starts timer if no moves have been made already (moves is set to one only after two cards have been flipped)
  if (len == 1 && moves == 0) {
    second = 0;
    minute = 0;
    hour = 0;
    startTimer();
  } else if (len === 2) {
    moveCounter();
    if (openedCards[0].type === openedCards[1].type) {
      matching();
    } else {
      notMatching();
    }
  }
}

// When cards match, adds/removes relevant classes and clears the two cards' arrays
function matching() {
  openedCards[0].classList.add('matching', 'disabled');
  openedCards[1].classList.add('matching', 'disabled');
  openedCards[0].classList.remove('show', 'open');
  openedCards[1].classList.remove('show', 'open');
  openedCards = [];
}

// When cards don't match, adds class "not-matching" to both and calls disable() function (to disable flipping of other cards). After half a second, removes "not-matching" class, calls enable() function (to make flipping cards possible again), and clears the two cards' arrays
function notMatching() {
  openedCards[0].classList.add('not-matching');
  openedCards[1].classList.add('not-matching');
  disable();
  setTimeout(function() {
    openedCards[0].classList.remove('show', 'open', 'not-matching');
    openedCards[1].classList.remove('show', 'open', 'not-matching');
    enable();
    openedCards = [];
  }, 500);
}

// Disables all cards temporarily (while two cards are flipped)
function disable() {
  cards.forEach(card => card.classList.add('disabled'));
}

// Enables flipping of cards, disables matching cards
function enable() {
  Array.prototype.filter.call(cards, function(card) {
    card.classList.remove('disabled');
    for (let i = 0; i < matchingCard.length; i++) {
      matchingCard[i].classList.add('disabled');
    }
  });
}

// Updates move counter
function moveCounter() {
  // Increases "moves" by one
  moves++;
  counter.innerHTML = moves;
  // Sets star rating based on number of moves. (Note: using display: none for removed stars instead of visibility: collapse, because with visibility: collapse, row is centered as if stars are still present)
  if (moves > 8 && moves < 12) {
    for (i = 0; i < 3; i++) {
      if (i > 1) {
        stars[i].style.display = 'none';
      }
    }
  }
  else if (moves > 13) {
    for (i = 0; i < 3; i++) {
      if (i > 0) {
        stars[i].style.display = 'none';
      }
    }
  }
}

// Game timer
function startTimer() {
  interval = setInterval(function() {
    timer.innerHTML = minute + ' mins ' + second + ' secs';
    second++;
    if (second == 60) {
      minute++;
      second = 0;
    }
    if (minute == 60) {
      hour++;
      minute = 0;
    }
  }, 1000);
}

// Congratulates player when all cards match and shows modal, moves, time and rating
function congratulations() {
  if (matchingCard.length == 16) {
    // Window method that stops setInterval() Window method from executing "myTimer" function every 1 second
    clearInterval(interval);
    let finalTime = timer.innerHTML;

    // Shows congratulations modal
    modal.classList.add('show');

    let starRating = document.querySelector('.stars').innerHTML;

    // Shows number of moves made, time, and rating on modal
    document.getElementsByClassName('final-moves')[0].innerHTML = moves;
    document.getElementsByClassName('star-rating')[0].innerHTML = starRating;
    document.getElementsByClassName('total-time')[0].innerHTML = finalTime;

    // Adds event listener for modal's close button
    closeModal();
  }
}

// Closes modal upon clicking its close icon
function closeModal() {
  closeIcon.addEventListener('click', function(e) {
    modal.classList.remove('show');
    startGame();
  });
}

// Called when user hits "play again" button
function reset() {
  modal.classList.remove('show');
  startGame();
}

// Adds event listeners to each card
for (let i = 0; i < cards.length; i++) {
  card = cards[i];
  card.addEventListener('click', displayCard);
  card.addEventListener('click', cardOpen);
  card.addEventListener('click', congratulations);
}
