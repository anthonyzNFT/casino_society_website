const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function createDeck() {
    const deck = [];
    SUITS.forEach(suit => {
        RANKS.forEach(rank => {
            deck.push({
                suit,
                rank,
                faceUp: false,
                id: `${suit}-${rank}-${Math.random().toString(36).substr(2, 9)}`
            });
        });
    });
    return deck;
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function dealInitialTableau(deck) {
    const tableau = Array(7).fill().map(() => []);
    let index = 0;
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j <= i; j++) {
            tableau[i].push(deck[index]);
            if (j === i) tableau[i][j].faceUp = true;
            index++;
        }
    }
    return { tableau, remainingDeck: deck.slice(index) };
}

export { createDeck, shuffleDeck, dealInitialTableau };
