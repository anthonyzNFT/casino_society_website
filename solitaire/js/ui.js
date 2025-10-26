import { SUIT_SYMBOLS } from './deck.js';

const COLORS = {
    GOLD: '#E6D39E',
    BLACK: '#141414',
    RED: '#C8102E',
    WHITE: '#FFFFFF',
    GRADIENT_START: '#141414',
    GRADIENT_END: '#332B1A'
};

let canvas, ctx, cardWidth = 80, cardHeight = 120, scale = 1;

function initUI() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const maxWidth = Math.min(window.innerWidth, 800);
    canvas.width = maxWidth * dpr;
    canvas.height = (maxWidth / 4 * 3) * dpr;
    scale = maxWidth / 800;
    ctx.scale(scale * dpr, scale * dpr);
    cardWidth = 80 * scale;
    cardHeight = 120 * scale;
}

function renderBoard(state, selectedCards) {
    ctx.fillStyle = COLORS.BLACK;
    ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);
    const offsetX = (canvas.width / scale - 800) / 2;
    const offsetY = (canvas.height / scale - 600) / 2;

    state.foundations.forEach((pile, i) => {
        drawCardSlot(20 + i * 100 + offsetX, 20 + offsetY, SUIT_SYMBOLS[state.suits[i]]);
        pile.forEach((card, j) => drawCard(card, 20 + i * 100 + offsetX, 20 + offsetY));
    });

    drawCardSlot(20 + offsetX, 100 + offsetY, 'Stock');
    drawCardSlot(120 + offsetX, 100 + offsetY, 'Waste');
    state.tableau.forEach((pile, i) => {
        pile.forEach((card, j) => {
            drawCard(card, 20 + i * 100 + offsetX, 250 + j * 20 + offsetY);
        });
        if (!pile.length) drawCardSlot(20 + i * 100 + offsetX, 250 + offsetY);
    });

    state.waste.forEach((card, i) => {
        if (i === state.waste.length - 1) drawCard(card, 120 + offsetX, 100 + offsetY);
    });

    if (state.stock.length) drawCard(state.stock[state.stock.length - 1], 20 + offsetX, 100 + offsetY, true);

    if (state.showSettings) drawSettings(300 + offsetX, 200 + offsetY);
    if (state.showTutorial) drawTutorial(300 + offsetX, 200 + offsetY);

    if (selectedCards) {
        selectedCards.cards.forEach((card, i) => {
            drawCard(card, selectedCards.pos.x - selectedCards.offset.x + i * 20, selectedCards.pos.y - selectedCards.offset.y + i * 20);
        });
    }
}

function drawCard(card, x, y, isBack = false) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, cardWidth / scale, cardHeight / scale);
    ctx.fillStyle = isBack ? COLORS.GRADIENT_START : COLORS.WHITE;
    ctx.fill();
    ctx.strokeStyle = COLORS.BLACK;
    ctx.lineWidth = 2;
    ctx.stroke();
    if (!isBack && card.faceUp) {
        ctx.fillStyle = card.suit === 'hearts' || card.suit === 'diamonds' ? COLORS.RED : COLORS.BLACK;
        ctx.font = `${20 * scale}px Arial`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`${card.rank}${SUIT_SYMBOLS[card.suit]}`, x + 5, y + 5);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`${card.rank}${SUIT_SYMBOLS[card.suit]}`, x + cardWidth / scale - 5, y + cardHeight / scale - 5);
    }
    ctx.restore();
}

function drawCardSlot(x, y, label = '') {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, cardWidth / scale, cardHeight / scale);
    ctx.strokeStyle = COLORS.GOLD;
    ctx.lineWidth = 2;
    ctx.stroke();
    if (label) {
        ctx.fillStyle = COLORS.GOLD;
        ctx.font = `${16 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x + cardWidth / scale / 2, y + cardHeight / scale / 2);
    }
    ctx.restore();
}

function drawSettings(x, y) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, 200, 200);
    ctx.fillStyle = COLORS.BLACK;
    ctx.fill();
    ctx.strokeStyle = COLORS.GOLD;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = COLORS.GOLD;
    ctx.font = `${16 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Settings', x + 100, y + 20);
    ctx.fillText('Draw: One', x + 100, y + 60);
    ctx.fillText('Timed: Off', x + 100, y + 100);
    ctx.fillText('Hints: On', x + 100, y + 140);
    ctx.fillText('Close', x + 100, y + 180);
    ctx.restore();
}

function drawTutorial(x, y) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, 200, 200);
    ctx.fillStyle = COLORS.BLACK;
    ctx.fill();
    ctx.strokeStyle = COLORS.GOLD;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = COLORS.GOLD;
    ctx.font = `${16 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Tutorial', x + 100, y + 20);
    ctx.fillText('Click stock to draw', x + 100, y + 60);
    ctx.fillText('Drag cards to move', x + 100, y + 100);
    ctx.fillText('Build foundations', x + 100, y + 140);
    ctx.fillText('Close', x + 100, y + 180);
    ctx.restore();
}

export { initUI, renderBoard, resizeCanvas, cardWidth, cardHeight, scale };
