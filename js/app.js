let card = document.getElementsByClassName('card');
// Spread operator (new in ES6) allows iterable to expand where 0+ arguments are expected
let cards = [...card];
console.log(cards);

// getElementsByClassName method returns HTMLCollection (or a NodeList for some older browsers https://www.w3schools.com/js/js_htmldom_nodelist.asp), an array-like object on which you can use Array.prototype methods. Added [0] to get the first element matched. TODO: replace card-deck with card and change "deck" to "card"? Would make more sense?
let deck = document.getElementsByClassName('card-deck')[0];
let moves = 0;
let counter = document.querySelector('.moves');
const stars = document.querySelectorAll('.fa-star');
let matchingCard = document.getElementsByClassName('matching');
let starsList = document.querySelectorAll('.stars li');
let closeIcon = document.querySelector('.close');
// TODO: Find out why this is needed in vanilla JS. If there's only one class with this name, why do I need to select the first one?
let modal = document.getElementsByClassName('modal')[0];
let openedCards = [];
let second = 0, minute = 0, hour = 0;
let timer = document.querySelector('.timer');
let interval;

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

function startGame() {
  // Shuffles deck
  cards = shuffle(cards);
  // Removes any existing classes from each card
  for (let i = 0; i < cards.length; i++) {
    deck.innerHTML = '';
    [].forEach.call(cards, function(item) {
      deck.appendChild(item);
    });
    cards[i].classList.remove('show', 'open', 'matching', 'disabled');
  }
  // Resets number of moves
  moves = 0;
  counter.innerHTML = moves;
  // Resets star rating
  for (let i = 0; i < stars.length; i++) {
    stars[i].style.color = '#ffd700';
    stars[i].style.visibility = 'visible';
  }
  // Resets timer
  let second = 0;
  let minute = 0;
  let hour = 0;
  let timer = document.querySelector('.timer');
  timer.innerHTML = '0 mins 0 secs';
  clearInterval(interval);
}

// Toggles open and show classes to display cards
let displayCard = function() {
  this.classList.toggle('open');
  this.classList.toggle('show');
  this.classList.toggle('disabled');
};

// Adds flipped cards to openedCards array, calls the counter function if two have been flipped, and checks if cards are a match or not
function cardOpen() {
  openedCards.push(this);
  let len = openedCards.length;
  if (len === 2) {
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
  Array.prototype.filter.call(cards, function(card) {
    card.classList.add('disabled');
  });
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

// Counts player's moves
function moveCounter() {
  // Increases "moves" by one
  moves++;
  counter.innerHTML = moves;
  // Starts timer after first move (meaning two cards have been flipped)
  // TODO: timer only starts after clicking second card; start after clicking first one
  if (moves == 1) {
    second = 0;
    minute = 0;
    hour = 0;
    startTimer();
  }
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

// TODO: fix bug: if you make one move and hit restart, then click one card, a second card (without an icon on it) is flipped. 
