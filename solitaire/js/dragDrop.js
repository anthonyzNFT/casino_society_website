import { canPlaceOnFoundation, canPlaceOnTableau } from './gameLogic.js';
import { renderBoard, cardWidth, cardHeight, scale } from './ui.js';
import { saveGame } from './storage.js';
import { updateScore, updateMoves } from './utils.js';

let selectedCards = null;
let dragOffset = { x: 0, y: 0 };

function initDragDrop(state, updateState) {
    const canvas = document.getElementById('gameCanvas');
    canvas.addEventListener('mousedown', (e) => handleMouseDown(e, state, updateState));
    canvas.addEventListener('mousemove', (e) => handleMouseMove(e, state));
    canvas.addEventListener('mouseup', (e) => handleMouseUp(e, state, updateState));
    canvas.addEventListener('touchstart', (e) => handleTouchStart(e, state, updateState));
    canvas.addEventListener('touchmove', (e) => handleTouchMove(e, state));
    canvas.addEventListener('touchend', (e) => handleTouchEnd(e, state, updateState));
    canvas.addEventListener('dblclick', (e) => handleDoubleClick(e, state, updateState));
    document.addEventListener('keydown', (e) => handleKeydown(e, state, updateState));
}

function isInBounds(pos, x, y, w, h) {
    return pos.x >= x && pos.x <= x + w && pos.y >= y && pos.y <= y + h;
}

function handleMouseDown(e, state, updateState) {
    const rect = canvas.getBoundingClientRect();
    const pos = { x: (e.clientX - rect.left) / scale, y: (e.clientY - rect.top) / scale };
    handleClick(pos, state, updateState);
}

function handleMouseMove(e, state) {
    if (!selectedCards) return;
    const rect = canvas.getBoundingClientRect();
    selectedCards.pos = { x: (e.clientX - rect.left) / scale, y: (e.clientY - rect.top) / scale };
    renderBoard(state, selectedCards);
}

function handleMouseUp(e, state, updateState) {
    if (!selectedCards) return;
    const rect = canvas.getBoundingClientRect();
    const pos = { x: (e.clientX - rect.left) / scale, y: (e.clientY - rect.top) / scale };
    handleDrop(pos, state, updateState);
    selectedCards = null;
    renderBoard(state);
}

function handleTouchStart(e, state, updateState) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const pos = { x: (e.touches[0].clientX - rect.left) / scale, y: (e.touches[0].clientY - rect.top) / scale };
    handleClick(pos, state, updateState);
}

function handleTouchMove(e, state) {
    e.preventDefault();
    if (!selectedCards) return;
    const rect = canvas.getBoundingClientRect();
    selectedCards.pos = { x: (e.touches[0].clientX - rect.left) / scale, y: (e.touches[0].clientY - rect.top) / scale };
    renderBoard(state, selectedCards);
}

function handleTouchEnd(e, state, updateState) {
    e.preventDefault();
    if (!selectedCards) return;
    const rect = canvas.getBoundingClientRect();
    const pos = { x: (e.changedTouches[0].clientX - rect.left) / scale, y: (e.changedTouches[0].clientY - rect.top) / scale };
    handleDrop(pos, state, updateState);
    selectedCards = null;
    renderBoard(state);
}

function handleDoubleClick(e, state, updateState) {
    const rect = canvas.getBoundingClientRect();
    const pos = { x: (e.clientX - rect.left) / scale, y: (e.clientY - rect.top) / scale };
    const offsetX = (canvas.width / scale - 800) / 2;
    const offsetY = (canvas.height / scale - 600) / 2;

    if (state.waste.length && isInBounds(pos, 120 + offsetX, 100 + offsetY, cardWidth / scale, cardHeight / scale)) {
        const card = state.waste[state.waste.length - 1];
        for (let i = 0; i < 4; i++) {
            if (canPlaceOnFoundation(card, state.foundations[i])) {
                updateState({
                    ...state,
                    waste: state.waste.slice(0, -1),
                    foundations: state.foundations.map((pile, j) => j === i ? [...pile, card] : pile),
                    moves: [...state.moves, { type: 'move', from: { pileType: 'waste', pileIndex: 0, cardIndex: state.waste.length - 1, cards: [card] }, to: { pileType: 'foundation', pileIndex: i, cardIndex: state.foundations[i].length, cards: [card] } }],
                    score: state.score + 10,
                    redoStack: []
                });
                document.getElementById('aria-announcer').textContent = `Moved ${card.rank} of ${card.suit} to foundation ${i + 1}`;
                return;
            }
        }
    }

    for (let i = 0; i < 7; i++) {
        const pile = state.tableau[i];
        if (pile.length && pile[pile.length - 1].faceUp && isInBounds(pos, 20 + i * 100 + offsetX, 250 + (pile.length - 1) * 20 + offsetY, cardWidth / scale, cardHeight / scale)) {
            const card = pile[pile.length - 1];
            for (let j = 0; j < 4; j++) {
                if (canPlaceOnFoundation(card, state.foundations[j])) {
                    updateState({
                        ...state,
                        tableau: state.tableau.map((p, k) => k === i ? p.slice(0, -1) : p),
                        foundations: state.foundations.map((pile, k) => k === j ? [...pile, card] : pile),
                        moves: [...state.moves, { type: 'move', from: { pileType: 'tableau', pileIndex: i, cardIndex: pile.length - 1, cards: [card] }, to: { pileType: 'foundation', pileIndex: j, cardIndex: state.foundations[j].length, cards: [card] } }],
                        score: state.score + 10,
                        redoStack: []
                    });
                    document.getElementById('aria-announcer').textContent = `Moved ${card.rank} of ${card.suit} to foundation ${j + 1}`;
                    return;
                }
            }
        }
    }
}

function handleClick(pos, state, updateState) {
    const offsetX = (canvas.width / scale - 800) / 2;
    const offsetY = (canvas.height / scale - 600) / 2;

    if (state.showSettings && isInBounds(pos, 300 + offsetX, 200 + offsetY, 200, 200)) {
        if (isInBounds(pos, 300 + offsetX, 240 + offsetY, 200, 40)) {
            updateState({ ...state, drawMode: state.drawMode === 1 ? 3 : 1 });
            document.getElementById('aria-announcer').textContent = `Draw mode set to ${state.drawMode === 1 ? 'Three' : 'One'}`;
        }
        if (isInBounds(pos, 300 + offsetX, 280 + offsetY, 200, 40)) {
            updateState({ ...state, timed: !state.timed, startTime: Date.now() });
            document.getElementById('aria-announcer').textContent = `Timed mode ${state.timed ? 'enabled' : 'disabled'}`;
        }
        if (isInBounds(pos,
