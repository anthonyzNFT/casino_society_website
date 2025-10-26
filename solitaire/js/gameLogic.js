import { RANKS } from './deck.js';

function canPlaceOnFoundation(card, foundation) {
    if (!card.faceUp) return false;
    if (!foundation.length) return card.rank === 'A';
    const topCard = foundation[foundation.length - 1];
    return card.suit === topCard.suit && RANKS.indexOf(card.rank) === RANKS.indexOf(topCard.rank) + 1;
}

function canPlaceOnTableau(card, pile) {
    if (!card.faceUp) return false;
    if (!pile.length) return card.rank === 'K';
    const topCard = pile[pile.length - 1];
    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
    const isTopRed = topCard.suit === 'hearts' || topCard.suit === 'diamonds';
    return isRed !== isTopRed && RANKS.indexOf(card.rank) === RANKS.indexOf(topCard.rank) - 1;
}

function isGameWinnable(tableau, waste, foundations) {
    const allFaceUp = tableau.every(pile => pile.every(card => card.faceUp));
    if (!allFaceUp) return false;
    const cards = [...tableau.flat(), ...waste];
    return cards.every(card => {
        for (let i = 0; i < 4; i++) {
            if (canPlaceOnFoundation(card, foundations[i])) return true;
        }
        for (let i = 0; i < 7; i++) {
            if (canPlaceOnTableau(card, tableau[i])) return true;
        }
        return false;
    });
}

function checkWin(foundations) {
    return foundations.every(pile => pile.length === 13);
}

function autoComplete(tableau, waste, foundations) {
    const moves = [];
    while (isGameWinnable(tableau, waste, foundations)) {
        let moved = false;
        for (let i = 0; i < 7; i++) {
            const pile = tableau[i];
            if (pile.length && pile[pile.length - 1].faceUp) {
                const card = pile[pile.length - 1];
                for (let j = 0; j < 4; j++) {
                    if (canPlaceOnFoundation(card, foundations[j])) {
                        moves.push({ type: 'move', from: { pileType: 'tableau', pileIndex: i, cardIndex: pile.length - 1, cards: [card] }, to: { pileType: 'foundation', pileIndex: j, cardIndex: foundations[j].length, cards: [card] } });
                        foundations[j].push(pile.pop());
                        moved = true;
                        break;
                    }
                }
            }
        }
        if (waste.length && waste[waste.length - 1].faceUp) {
            const card = waste[waste.length - 1];
            for (let j = 0; j < 4; j++) {
                if (canPlaceOnFoundation(card, foundations[j])) {
                    moves.push({ type: 'move', from: { pileType: 'waste', pileIndex: 0, cardIndex: waste.length - 1, cards: [card] }, to: { pileType: 'foundation', pileIndex: j, cardIndex: foundations[j].length, cards: [card] } });
                    foundations[j].push(waste.pop());
                    moved = true;
                    break;
                }
            }
        }
        if (!moved) break;
    }
    return moves;
}

function getHint(tableau, waste, foundations) {
    for (let i = 0; i < waste.length; i++) {
        if (!waste[i].faceUp) continue;
        for (let j = 0; j < 4; j++) {
            if (canPlaceOnFoundation(waste[i], foundations[j])) {
                return `Move ${waste[i].rank} of ${waste[i].suit} to foundation ${j + 1}`;
            }
        }
        for (let j = 0; j < 7; j++) {
            if (canPlaceOnTableau(waste[i], tableau[j])) {
                return `Move ${waste[i].rank} of ${waste[i].suit} to tableau ${j + 1}`;
            }
        }
    }
    for (let i = 0; i < 7; i++) {
        for (let k = 0; k < tableau[i].length; k++) {
            if (!tableau[i][k].faceUp) continue;
            for (let j = 0; j < 4; j++) {
                if (canPlaceOnFoundation(tableau[i][k], foundations[j])) {
                    return `Move ${tableau[i][k].rank} of ${tableau[i][k].suit} from tableau ${i + 1} to foundation ${j + 1}`;
                }
            }
            for (let j = 0; j < 7; j++) {
                if (i !== j && canPlaceOnTableau(tableau[i][k], tableau[j])) {
                    return `Move ${tableau[i][k].rank} of ${tableau[i][k].suit} from tableau ${i + 1} to tableau ${j + 1}`;
                }
            }
        }
    }
    return 'No moves available';
}

export { canPlaceOnFoundation, canPlaceOnTableau, isGameWinnable, checkWin, autoComplete, getHint };
