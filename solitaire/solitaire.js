/**
 * Casino Society Solitaire
 * Complete Klondike Solitaire implementation
 */

// Game Constants
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUIT_SYMBOLS = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
const COLORS = {
    GOLD: '#E6D39E',
    BLACK: '#141414',
    RED: '#C8102E',
    WHITE: '#FFFFFF',
    CARD_BACK: '#1a4d2e',
    GREEN: '#0a3d1a'
};

// Game State
let canvas, ctx;
let gameState = {
    deck: [],
    tableau: Array(7).fill().map(() => []),
    foundations: Array(4).fill().map(() => []),
    stock: [],
    waste: [],
    score: 0,
    moves: 0,
    startTime: 0,
    drawMode: 1,
    timed: false,
    hintsEnabled: true,
    animationsEnabled: true,
    moveHistory: [],
    redoStack: []
};

// Statistics
let stats = {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    bestStreak: 0,
    bestScore: 0
};

// Drag State
let dragState = null;

// Canvas Dimensions
let cardSize = { width: 110, height: 158 };
let scale = 1;
let layoutPositions = {};

// Timer
let timerInterval = null;

// Initialize Game
function init() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas not found');
        return;
    }
    
    ctx = canvas.getContext('2d');
    
    loadStats();
    loadSettings();
    resizeCanvas();
    newGame();
    
    // Event Listeners
    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('dblclick', handleDoubleClick);
    
    // Button Listeners
    document.getElementById('newGame').addEventListener('click', newGame);
    document.getElementById('undo').addEventListener('click', undo);
    document.getElementById('redo').addEventListener('click', redo);
    document.getElementById('hint').addEventListener('click', showHint);
    document.getElementById('autoComplete').addEventListener('click', autoComplete);
    document.getElementById('settings').addEventListener('click', () => openModal('settingsModal'));
    document.getElementById('stats').addEventListener('click', () => {
        updateStatsDisplay();
        openModal('statsModal');
    });
    
    // Modal Listeners
    document.getElementById('closeSettings').addEventListener('click', () => closeModal('settingsModal'));
    document.getElementById('closeStats').addEventListener('click', () => closeModal('statsModal'));
    document.getElementById('playAgain').addEventListener('click', () => {
        closeModal('winModal');
        newGame();
    });
    
    // Settings Toggle Listeners
    document.getElementById('drawToggle').addEventListener('click', toggleDrawMode);
    document.getElementById('timedToggle').addEventListener('click', toggleTimed);
    document.getElementById('hintsToggle').addEventListener('click', toggleHints);
    document.getElementById('animToggle').addEventListener('click', toggleAnimations);
    document.getElementById('resetStats').addEventListener('click', resetStats);
}

// Canvas Resize - BETTER SPACE USAGE
function resizeCanvas() {
    const container = canvas.parentElement;
    const maxWidth = Math.min(container.clientWidth - 16, 1400);
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = maxWidth * dpr;
    canvas.height = (maxWidth * 0.75) * dpr;
    
    canvas.style.width = maxWidth + 'px';
    canvas.style.height = (maxWidth * 0.75) + 'px';
    
    scale = maxWidth / 1100;
    cardSize.width = 110 * scale;
    cardSize.height = 158 * scale;
    
    ctx.scale(dpr, dpr);
    calculateLayout();
    render();
}

// Calculate Card Positions - PROPER SOLITAIRE LAYOUT
function calculateLayout() {
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    const padding = 8 * scale;
    const cardSpacing = cardSize.width + padding;
    
    // Total width for 7 columns
    const totalWidth = cardSpacing * 7 - padding;
    const startX = (w - totalWidth) / 2;
    
    // PROPER LAYOUT: Stock/Waste on left, Foundations on right, same row
    const topRowY = 12 * scale;
    const tableauY = topRowY + cardSize.height + 20 * scale;
    
    layoutPositions = {
        // Stock and waste on LEFT side
        stockX: startX,
        wasteX: startX + cardSpacing,
        
        // Foundations on RIGHT side (4 piles)
        foundationStartX: startX + cardSpacing * 3,
        
        topRowY: topRowY,
        tableauY: tableauY,
        tableauStartX: startX,
        cardSpacing: cardSpacing,
        padding: padding,
        canvasWidth: w,
        canvasHeight: h
    };
}

// Create and Shuffle Deck
function createDeck() {
    const deck = [];
    SUITS.forEach(suit => {
        RANKS.forEach(rank => {
            deck.push({
                suit: suit,
                rank: rank,
                faceUp: false,
                id: `${suit}-${rank}-${Date.now()}-${Math.random()}`
            });
        });
    });
    return shuffleDeck(deck);
}

function shuffleDeck(deck) {
    const arr = [...deck];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// New Game
function newGame() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    stats.gamesPlayed++;
    saveStats();
    
    const deck = createDeck();
    
    // Preserve settings but reset game
    const savedDrawMode = gameState.drawMode;
    const savedTimed = gameState.timed;
    const savedHints = gameState.hintsEnabled;
    const savedAnims = gameState.animationsEnabled;
    
    gameState = {
        deck: [],
        tableau: Array(7).fill().map(() => []),
        foundations: Array(4).fill().map(() => []),
        stock: [],
        waste: [],
        score: 0,
        moves: 0,
        startTime: Date.now(),
        drawMode: savedDrawMode,
        timed: savedTimed,
        hintsEnabled: savedHints,
        animationsEnabled: savedAnims,
        moveHistory: [],
        redoStack: []
    };
    
    // Deal tableau
    let index = 0;
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j <= i; j++) {
            const card = deck[index++];
            card.faceUp = (j === i);
            gameState.tableau[i].push(card);
        }
    }
    
    gameState.stock = deck.slice(index);
    
    updateUI();
    render();
    showMessage('');
    
    if (gameState.timed) {
        timerInterval = setInterval(updateTimer, 1000);
    }
}

// Render Game Board - NEW LAYOUT
function render() {
    const w = layoutPositions.canvasWidth;
    const h = layoutPositions.canvasHeight;
    
    // Clear canvas
    ctx.fillStyle = COLORS.GREEN;
    ctx.fillRect(0, 0, w, h);
    
    // Draw stock (LEFT SIDE)
    drawCardSlot(layoutPositions.stockX, layoutPositions.topRowY, '');
    if (gameState.stock.length > 0) {
        drawCardBack(layoutPositions.stockX, layoutPositions.topRowY);
        // Stock count
        ctx.fillStyle = COLORS.WHITE;
        ctx.font = `bold ${11 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(gameState.stock.length, layoutPositions.stockX + cardSize.width / 2, layoutPositions.topRowY + cardSize.height + 12 * scale);
    } else if (gameState.waste.length > 0) {
        // Show recycle icon
        ctx.fillStyle = COLORS.GOLD;
        ctx.font = `${20 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('↻', layoutPositions.stockX + cardSize.width / 2, layoutPositions.topRowY + cardSize.height / 2);
    }
    
    // Draw waste (next to stock)
    drawCardSlot(layoutPositions.wasteX, layoutPositions.topRowY, '');
    
    // Draw waste cards based on draw mode
    if (gameState.waste.length > 0) {
        if (gameState.drawMode === 3 && gameState.waste.length >= 2) {
            // Show last 3 cards offset
            const cardsToShow = Math.min(3, gameState.waste.length);
            for (let i = 0; i < cardsToShow; i++) {
                const cardIndex = gameState.waste.length - cardsToShow + i;
                const card = gameState.waste[cardIndex];
                const offsetX = i * (20 * scale);
                drawCard(card, layoutPositions.wasteX + offsetX, layoutPositions.topRowY);
            }
        } else {
            // Show just the top card
            const card = gameState.waste[gameState.waste.length - 1];
            drawCard(card, layoutPositions.wasteX, layoutPositions.topRowY);
        }
    }
    
    // Draw foundations (RIGHT SIDE)
    for (let i = 0; i < 4; i++) {
        const x = layoutPositions.foundationStartX + i * layoutPositions.cardSpacing;
        const y = layoutPositions.topRowY;
        
        drawCardSlot(x, y, SUIT_SYMBOLS[SUITS[i]]);
        
        if (gameState.foundations[i].length > 0) {
            const card = gameState.foundations[i][gameState.foundations[i].length - 1];
            drawCard(card, x, y);
        }
    }
    
    // Draw tableau (all 7 columns)
    for (let i = 0; i < 7; i++) {
        const x = layoutPositions.tableauStartX + i * layoutPositions.cardSpacing;
        const pile = gameState.tableau[i];
        
        if (pile.length === 0) {
            drawCardSlot(x, layoutPositions.tableauY, '');
        } else {
            pile.forEach((card, j) => {
                const y = layoutPositions.tableauY + j * (28 * scale);
                
                // Skip if dragging
                if (dragState && dragState.from.type === 'tableau' && 
                    dragState.from.pile === i && dragState.from.index <= j) {
                    return;
                }
                
                drawCard(card, x, y);
            });
        }
    }
    
    // Draw dragging cards
    if (dragState) {
        dragState.cards.forEach((card, i) => {
            const offsetY = i * (28 * scale);
            const x = dragState.x - dragState.offsetX;
            const y = dragState.y - dragState.offsetY + offsetY;
            drawCard(card, x, y, true);
        });
    }
}

// Draw Card
function drawCard(card, x, y, isDragging = false) {
    ctx.save();
    
    // Shadow for dragging
    if (isDragging) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
    }
    
    // Card background
    ctx.fillStyle = COLORS.WHITE;
    ctx.fillRect(x, y, cardSize.width, cardSize.height);
    
    // Card border
    ctx.strokeStyle = COLORS.BLACK;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, cardSize.width, cardSize.height);
    
    if (card.faceUp) {
        const color = (card.suit === 'hearts' || card.suit === 'diamonds') ? COLORS.RED : COLORS.BLACK;
        ctx.fillStyle = color;
        
        // Top left corner
        ctx.font = `bold ${16 * scale}px Arial`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(card.rank, x + 5 * scale, y + 5 * scale);
        ctx.fillText(SUIT_SYMBOLS[card.suit], x + 5 * scale, y + 20 * scale);
        
        // Bottom right corner (rotated)
        ctx.save();
        ctx.translate(x + cardSize.width - 5 * scale, y + cardSize.height - 5 * scale);
        ctx.rotate(Math.PI);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(card.rank, 0, 0);
        ctx.fillText(SUIT_SYMBOLS[card.suit], 0, 15 * scale);
        ctx.restore();
        
        // Center symbol
        ctx.font = `${32 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(SUIT_SYMBOLS[card.suit], x + cardSize.width / 2, y + cardSize.height / 2);
    } else {
        // Face down card
        ctx.fillStyle = COLORS.CARD_BACK;
        ctx.fillRect(x + 3, y + 3, cardSize.width - 6, cardSize.height - 6);
        
        // Pattern
        ctx.strokeStyle = COLORS.GOLD;
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
            const inset = 8 + i * 4;
            ctx.strokeRect(x + inset, y + inset, cardSize.width - inset * 2, cardSize.height - inset * 2);
        }
    }
    
    ctx.restore();
}

// Draw Card Back
function drawCardBack(x, y) {
    ctx.save();
    ctx.fillStyle = COLORS.CARD_BACK;
    ctx.fillRect(x, y, cardSize.width, cardSize.height);
    ctx.strokeStyle = COLORS.GOLD;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, cardSize.width, cardSize.height);
    
    for (let i = 0; i < 3; i++) {
        const inset = 8 + i * 4;
        ctx.strokeRect(x + inset, y + inset, cardSize.width - inset * 2, cardSize.height - inset * 2);
    }
    ctx.restore();
}

// Draw Card Slot
function drawCardSlot(x, y, label = '') {
    ctx.save();
    ctx.strokeStyle = COLORS.GOLD;
    ctx.lineWidth = 2;
    ctx.setLineDash([5 * scale, 5 * scale]);
    ctx.strokeRect(x, y, cardSize.width, cardSize.height);
    ctx.setLineDash([]);
    
    if (label) {
        ctx.fillStyle = COLORS.GOLD;
        ctx.font = `${20 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x + cardSize.width / 2, y + cardSize.height / 2);
    }
    ctx.restore();
}

// Mouse/Touch Event Handlers
function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handlePointerDown(x, y);
}

function handleMouseMove(e) {
    if (!dragState) return;
    const rect = canvas.getBoundingClientRect();
    dragState.x = e.clientX - rect.left;
    dragState.y = e.clientY - rect.top;
    render();
}

function handleMouseUp(e) {
    if (!dragState) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handlePointerUp(x, y);
}

function handleTouchStart(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    handlePointerDown(x, y);
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!dragState) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    dragState.x = touch.clientX - rect.left;
    dragState.y = touch.clientY - rect.top;
    render();
}

function handleTouchEnd(e) {
    e.preventDefault();
    if (!dragState) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.changedTouches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    handlePointerUp(x, y);
}

function handleDoubleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const clicked = getCardAt(x, y);
    
    if (!clicked) return;
    
    let card = null;
    let fromType = null;
    let fromPile = null;
    let fromIndex = null;
    
    if (clicked.type === 'waste' && gameState.waste.length > 0) {
        card = gameState.waste[gameState.waste.length - 1];
        fromType = 'waste';
        fromPile = 0;
        fromIndex = gameState.waste.length - 1;
    } else if (clicked.type === 'tableau') {
        const pile = gameState.tableau[clicked.pile];
        if (pile.length > 0 && pile[pile.length - 1].faceUp) {
            card = pile[pile.length - 1];
            fromType = 'tableau';
            fromPile = clicked.pile;
            fromIndex = pile.length - 1;
        }
    }
    
    if (card && card.faceUp) {
        for (let i = 0; i < 4; i++) {
            if (canPlaceOnFoundation(card, gameState.foundations[i])) {
                moveCard(fromType, fromPile, fromIndex, 'foundation', i, 1);
                return;
            }
        }
    }
}

// Get Card at Position - UPDATED FOR NEW LAYOUT
function getCardAt(x, y) {
    // Check stock
    if (isInBounds(x, y, layoutPositions.stockX, layoutPositions.topRowY, cardSize.width, cardSize.height)) {
        if (gameState.stock.length > 0) {
            return { type: 'stock' };
        }
        if (gameState.stock.length === 0 && gameState.waste.length > 0) {
            return { type: 'recycle' };
        }
    }
    
    // Check waste
    if (isInBounds(x, y, layoutPositions.wasteX, layoutPositions.topRowY, cardSize.width, cardSize.height)) {
        if (gameState.waste.length > 0) {
            return { type: 'waste', pile: 0, index: gameState.waste.length - 1 };
        }
    }
    
    // Check foundations
    for (let i = 0; i < 4; i++) {
        const fx = layoutPositions.foundationStartX + i * layoutPositions.cardSpacing;
        if (isInBounds(x, y, fx, layoutPositions.topRowY, cardSize.width, cardSize.height)) {
            return { type: 'foundation', pile: i };
        }
    }
    
    // Check tableau (bottom to top for better selection)
    for (let i = 0; i < 7; i++) {
        const pile = gameState.tableau[i];
        const pileX = layoutPositions.tableauStartX + i * layoutPositions.cardSpacing;
        
        for (let j = pile.length - 1; j >= 0; j--) {
            const cardY = layoutPositions.tableauY + j * (28 * scale);
            if (isInBounds(x, y, pileX, cardY, cardSize.width, cardSize.height)) {
                return { type: 'tableau', pile: i, index: j };
            }
        }
    }
    
    return null;
}

// Get Drop Target - UPDATED FOR NEW LAYOUT
function getDropTarget(x, y) {
    // Check foundations
    for (let i = 0; i < 4; i++) {
        const fx = layoutPositions.foundationStartX + i * layoutPositions.cardSpacing;
        if (isInBounds(x, y, fx, layoutPositions.topRowY, cardSize.width, cardSize.height)) {
            return { type: 'foundation', pile: i };
        }
    }
    
    // Check tableau
    for (let i = 0; i < 7; i++) {
        const tx = layoutPositions.tableauStartX + i * layoutPositions.cardSpacing;
        const pile = gameState.tableau[i];
        const maxY = pile.length > 0 ? 
            layoutPositions.tableauY + pile.length * (28 * scale) + cardSize.height : 
            layoutPositions.tableauY + cardSize.height;
        
        if (isInBounds(x, y, tx, layoutPositions.tableauY, cardSize.width, maxY - layoutPositions.tableauY)) {
            return { type: 'tableau', pile: i };
        }
    }
    
    return null;
}

function isInBounds(x, y, bx, by, bw, bh) {
    return x >= bx && x <= bx + bw && y >= by && y <= by + bh;
}

// Pointer Down Handler
function handlePointerDown(x, y) {
    const clicked = getCardAt(x, y);
    
    if (!clicked) return;
    
    if (clicked.type === 'stock') {
        drawFromStock();
        return;
    }
    
    if (clicked.type === 'recycle') {
        recycleWaste();
        return;
    }
    
    if (clicked.type === 'waste') {
        const card = gameState.waste[gameState.waste.length - 1];
        if (card.faceUp) {
            dragState = {
                from: clicked,
                cards: [card],
                x: x,
                y: y,
                offsetX: x - layoutPositions.wasteX,
                offsetY: y - layoutPositions.topRowY
            };
            render();
        }
        return;
    }
    
    if (clicked.type === 'tableau') {
        const pile = gameState.tableau[clicked.pile];
        const card = pile[clicked.index];
        
        if (card.faceUp) {
            const cards = pile.slice(clicked.index);
            const pileX = layoutPositions.tableauStartX + clicked.pile * layoutPositions.cardSpacing;
            const cardY = layoutPositions.tableauY + clicked.index * (28 * scale);
            
            dragState = {
                from: clicked,
                cards: cards,
                x: x,
                y: y,
                offsetX: x - pileX,
                offsetY: y - cardY
            };
            render();
        }
    }
}

// Pointer Up Handler
function handlePointerUp(x, y) {
    if (!dragState) return;
    
    const target = getDropTarget(x, y);
    
    if (target) {
        const card = dragState.cards[0];
        const canMove = target.type === 'foundation' ? 
            canPlaceOnFoundation(card, gameState.foundations[target.pile]) :
            canPlaceOnTableau(card, gameState.tableau[target.pile]);
        
        if (canMove && (target.type !== 'tableau' || dragState.cards.length === 1 || isValidSequence(dragState.cards))) {
            if (target.type === 'foundation' && dragState.cards.length === 1) {
                moveCard(dragState.from.type, dragState.from.pile, dragState.from.index, 'foundation', target.pile, 1);
            } else if (target.type === 'tableau') {
                moveCard(dragState.from.type, dragState.from.pile, dragState.from.index, 'tableau', target.pile, dragState.cards.length);
            }
        }
    }
    
    dragState = null;
    render();
}

// Draw from Stock - FIXED DRAW 3 MODE
function drawFromStock() {
    if (gameState.stock.length === 0) return;
    
    const move = {
        type: 'draw',
        cards: [],
        drawCount: gameState.drawMode,
        oldScore: gameState.score
    };
    
    // Draw the specified number of cards
    const cardsToDraw = Math.min(gameState.drawMode, gameState.stock.length);
    
    for (let i = 0; i < cardsToDraw; i++) {
        const card = gameState.stock.pop();
        card.faceUp = true;
        gameState.waste.push(card);
        move.cards.push(card);
    }
    
    // Scoring: -1 per card in draw-1, -3 total in draw-3
    if (gameState.drawMode === 1) {
        gameState.score = Math.max(0, gameState.score - 1);
    } else {
        gameState.score = Math.max(0, gameState.score - 3);
    }
    
    gameState.moves++;
    gameState.moveHistory.push(move);
    gameState.redoStack = [];
    
    updateUI();
    render();
}

// Recycle Waste
function recycleWaste() {
    if (gameState.waste.length === 0) return;
    
    const move = {
        type: 'recycle',
        wasteCards: [...gameState.waste],
        oldScore: gameState.score
    };
    
    while (gameState.waste.length > 0) {
        const card = gameState.waste.pop();
        card.faceUp = false;
        gameState.stock.push(card);
    }
    
    gameState.stock.reverse();
    gameState.score = Math.max(0, gameState.score - 100);
    gameState.moves++;
    gameState.moveHistory.push(move);
    gameState.redoStack = [];
    
    updateUI();
    render();
    showMessage('Waste recycled to stock');
}

// Move Card
function moveCard(fromType, fromPile, fromIndex, toType, toPile, count) {
    const move = {
        type: 'move',
        from: { type: fromType, pile: fromPile, index: fromIndex },
        to: { type: toType, pile: toPile },
        cards: [],
        flippedCard: null,
        oldScore: gameState.score
    };
    
    // Get cards to move
    if (fromType === 'waste') {
        move.cards = [gameState.waste.pop()];
    } else if (fromType === 'tableau') {
        move.cards = gameState.tableau[fromPile].splice(fromIndex, count);
        
        // Flip card if needed
        if (gameState.tableau[fromPile].length > 0) {
            const topCard = gameState.tableau[fromPile][gameState.tableau[fromPile].length - 1];
            if (!topCard.faceUp) {
                topCard.faceUp = true;
                move.flippedCard = { pile: fromPile, card: topCard };
                gameState.score += 5;
            }
        }
    }
    
    // Place cards
    if (toType === 'foundation') {
        gameState.foundations[toPile].push(...move.cards);
        gameState.score += 10 * move.cards.length;
    } else if (toType === 'tableau') {
        gameState.tableau[toPile].push(...move.cards);
        if (fromType === 'waste' || fromType === 'foundation') {
            gameState.score += 5 * move.cards.length;
        }
    }
    
    gameState.moves++;
    gameState.moveHistory.push(move);
    gameState.redoStack = [];
    
    updateUI();
    checkAutoComplete();
    checkWin();
    render();
}

// Undo Move - FIXED FOR DRAW MODE
function undo() {
    if (gameState.moveHistory.length === 0) return;
    
    const move = gameState.moveHistory.pop();
    gameState.redoStack.push(move);
    
    if (move.type === 'draw') {
        move.cards.reverse().forEach(card => {
            gameState.waste.pop();
            card.faceUp = false;
            gameState.stock.push(card);
        });
    } else if (move.type === 'recycle') {
        while (gameState.stock.length > 0) {
            gameState.stock.pop();
        }
        move.wasteCards.forEach(card => gameState.waste.push(card));
    } else if (move.type === 'move') {
        // Remove from destination
        if (move.to.type === 'foundation') {
            gameState.foundations[move.to.pile].splice(-move.cards.length);
        } else if (move.to.type === 'tableau') {
            gameState.tableau[move.to.pile].splice(-move.cards.length);
        }
        
        // Return to source
        if (move.from.type === 'waste') {
            gameState.waste.push(...move.cards);
        } else if (move.from.type === 'tableau') {
            gameState.tableau[move.from.pile].push(...move.cards);
            
            // Unflip card
            if (move.flippedCard) {
                move.flippedCard.card.faceUp = false;
            }
        }
    }
    
    gameState.score = move.oldScore;
    gameState.moves--;
    
    updateUI();
    render();
}

// Redo Move
function redo() {
    if (gameState.redoStack.length === 0) return;
    
    const move = gameState.redoStack.pop();
    
    if (move.type === 'draw') {
        move.cards.forEach(card => {
            const c = gameState.stock.pop();
            c.faceUp = true;
            gameState.waste.push(c);
        });
        gameState.score = Math.max(0, gameState.score - (move.drawCount === 1 ? 1 : 3));
    } else if (move.type === 'recycle') {
        while (gameState.waste.length > 0) {
            const card = gameState.waste.pop();
            card.faceUp = false;
            gameState.stock.push(card);
        }
        gameState.stock.reverse();
        gameState.score = Math.max(0, gameState.score - 100);
    } else if (move.type === 'move') {
        // Remove from source
        if (move.from.type === 'waste') {
            gameState.waste.pop();
        } else if (move.from.type === 'tableau') {
            gameState.tableau[move.from.pile].splice(move.from.index);
            if (move.flippedCard) {
                move.flippedCard.card.faceUp = true;
            }
        }
        
        // Add to destination
        if (move.to.type === 'foundation') {
            gameState.foundations[move.to.pile].push(...move.cards);
            gameState.score += 10 * move.cards.length;
        } else if (move.to.type === 'tableau') {
            gameState.tableau[move.to.pile].push(...move.cards);
            if (move.from.type === 'waste' || move.from.type === 'foundation') {
                gameState.score += 5 * move.cards.length;
            }
        }
    }
    
    gameState.moveHistory.push(move);
    gameState.moves++;
    
    updateUI();
    render();
}

// Game Logic Functions
function canPlaceOnFoundation(card, foundation) {
    if (!card.faceUp) return false;
    if (foundation.length === 0) return card.rank === 'A';
    
    const topCard = foundation[foundation.length - 1];
    return card.suit === topCard.suit && 
           RANKS.indexOf(card.rank) === RANKS.indexOf(topCard.rank) + 1;
}

function canPlaceOnTableau(card, pile) {
    if (!card.faceUp) return false;
    if (pile.length === 0) return card.rank === 'K';
    
    const topCard = pile[pile.length - 1];
    if (!topCard.faceUp) return false;
    
    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
    const isTopRed = topCard.suit === 'hearts' || topCard.suit === 'diamonds';
    
    return isRed !== isTopRed && 
           RANKS.indexOf(card.rank) === RANKS.indexOf(topCard.rank) - 1;
}

function isValidSequence(cards) {
    for (let i = 1; i < cards.length; i++) {
        if (!canPlaceOnTableau(cards[i], [cards[i - 1]])) {
            return false;
        }
    }
    return true;
}

// Hint System
function showHint() {
    if (!gameState.hintsEnabled) {
        showMessage('Hints are disabled');
        return;
    }
    
    // Check waste to foundation
    if (gameState.waste.length > 0) {
        const card = gameState.waste[gameState.waste.length - 1];
        for (let i = 0; i < 4; i++) {
            if (canPlaceOnFoundation(card, gameState.foundations[i])) {
                showMessage(`Move ${card.rank}${SUIT_SYMBOLS[card.suit]} from waste to foundation`);
                return;
            }
        }
    }
    
    // Check tableau to foundation
    for (let i = 0; i < 7; i++) {
        const pile = gameState.tableau[i];
        if (pile.length > 0 && pile[pile.length - 1].faceUp) {
            const card = pile[pile.length - 1];
            for (let j = 0; j < 4; j++) {
                if (canPlaceOnFoundation(card, gameState.foundations[j])) {
                    showMessage(`Move ${card.rank}${SUIT_SYMBOLS[card.suit]} from column ${i + 1} to foundation`);
                    return;
                }
            }
        }
    }
    
    // Check waste to tableau
    if (gameState.waste.length > 0) {
        const card = gameState.waste[gameState.waste.length - 1];
        for (let i = 0; i < 7; i++) {
            if (canPlaceOnTableau(card, gameState.tableau[i])) {
                showMessage(`Move ${card.rank}${SUIT_SYMBOLS[card.suit]} from waste to column ${i + 1}`);
                return;
            }
        }
    }
    
    // Check tableau to tableau
    for (let i = 0; i < 7; i++) {
        const pile = gameState.tableau[i];
        for (let j = 0; j < pile.length; j++) {
            if (pile[j].faceUp) {
                for (let k = 0; k < 7; k++) {
                    if (i !== k && canPlaceOnTableau(pile[j], gameState.tableau[k])) {
                        showMessage(`Move ${pile[j].rank}${SUIT_SYMBOLS[pile[j].suit]} from column ${i + 1} to column ${k + 1}`);
                        return;
                    }
                }
            }
        }
    }
    
    // Suggest drawing
    if (gameState.stock.length > 0) {
        showMessage('Try drawing from the stock');
    } else {
        showMessage('No obvious moves available');
    }
}

// Auto Complete
function autoComplete() {
    const allFaceUp = gameState.tableau.every(pile => 
        pile.every(card => card.faceUp)
    );
    
    if (!allFaceUp) {
        showMessage('Cannot auto-complete: cards still face down');
        return;
    }
    
    let movesMade = 0;
    let maxMoves = 100;
    
    while (movesMade < maxMoves) {
        let moved = false;
        
        // Try waste to foundation
        if (gameState.waste.length > 0) {
            const card = gameState.waste[gameState.waste.length - 1];
            for (let i = 0; i < 4; i++) {
                if (canPlaceOnFoundation(card, gameState.foundations[i])) {
                    moveCard('waste', 0, gameState.waste.length - 1, 'foundation', i, 1);
                    moved = true;
                    movesMade++;
                    break;
                }
            }
        }
        
        if (moved) continue;
        
        // Try tableau to foundation
        for (let i = 0; i < 7; i++) {
            const pile = gameState.tableau[i];
            if (pile.length > 0 && pile[pile.length - 1].faceUp) {
                const card = pile[pile.length - 1];
                for (let j = 0; j < 4; j++) {
                    if (canPlaceOnFoundation(card, gameState.foundations[j])) {
                        moveCard('tableau', i, pile.length - 1, 'foundation', j, 1);
                        moved = true;
                        movesMade++;
                        break;
                    }
                }
                if (moved) break;
            }
        }
        
        if (!moved) break;
    }
    
    if (movesMade > 0) {
        showMessage(`Auto-completed ${movesMade} moves`);
    } else {
        showMessage('No moves available for auto-complete');
    }
}

function checkAutoComplete() {
    const allFaceUp = gameState.tableau.every(pile => 
        pile.every(card => card.faceUp)
    );
    const autoBtn = document.getElementById('autoComplete');
    autoBtn.disabled = !allFaceUp;
}

// Check Win
function checkWin() {
    const isWin = gameState.foundations.every(pile => pile.length === 13);
    
    if (isWin) {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        stats.gamesWon++;
        stats.currentStreak++;
        stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);
        stats.bestScore = Math.max(stats.bestScore, gameState.score);
        saveStats();
        
        // Update rank
        updateRank();
        
        // Show win modal
        document.getElementById('winScore').textContent = gameState.score;
        document.getElementById('winTime').textContent = document.getElementById('time').textContent;
        document.getElementById('winMoves').textContent = gameState.moves;
        
        setTimeout(() => {
            if (gameState.animationsEnabled) {
                animateWin();
            } else {
                openModal('winModal');
            }
        }, 500);
    }
}

// Win Animation
function animateWin() {
    let frame = 0;
    const maxFrames = 60;
    const allCards = gameState.foundations.flat();
    
    function animate() {
        const w = layoutPositions.canvasWidth;
        const h = layoutPositions.canvasHeight;
        
        ctx.fillStyle = COLORS.GREEN;
        ctx.fillRect(0, 0, w, h);
        
        allCards.forEach((card, i) => {
            const angle = (frame / 10 + i * 0.5);
            const radius = 100 * scale * (frame / maxFrames);
            const x = w / 2 + Math.cos(angle) * radius - cardSize.width / 2;
            const y = h / 2 + Math.sin(angle) * radius - cardSize.height / 2;
            drawCard(card, x, y);
        });
        
        frame++;
        if (frame < maxFrames) {
            requestAnimationFrame(animate);
        } else {
            render();
            openModal('winModal');
        }
    }
    
    animate();
}

// Update UI
function updateUI() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('moves').textContent = gameState.moves;
    document.getElementById('undo').disabled = gameState.moveHistory.length === 0;
    document.getElementById('redo').disabled = gameState.redoStack.length === 0;
    
    checkAutoComplete();
}

function updateTimer() {
    if (!gameState.timed) return;
    const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    document.getElementById('time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function updateRank() {
    let rank = 'Bronze Chip';
    if (stats.currentStreak >= 5 || stats.gamesWon >= 20) {
        rank = 'Gold Chip';
    } else if (stats.currentStreak >= 3 || stats.gamesWon >= 10) {
        rank = 'Silver Chip';
    }
    document.getElementById('rank').textContent = rank;
}

// Settings Functions
function toggleDrawMode() {
    gameState.drawMode = gameState.drawMode === 1 ? 3 : 1;
    document.getElementById('drawToggle').textContent = `Draw ${gameState.drawMode}`;
    saveSettings();
    showMessage(`Draw mode: ${gameState.drawMode} card${gameState.drawMode > 1 ? 's' : ''}`);
}

function toggleTimed() {
    gameState.timed = !gameState.timed;
    document.getElementById('timedToggle').textContent = gameState.timed ? 'On' : 'Off';
    
    if (gameState.timed) {
        gameState.startTime = Date.now();
        timerInterval = setInterval(updateTimer, 1000);
    } else {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        document.getElementById('time').textContent = '0:00';
    }
    saveSettings();
}

function toggleHints() {
    gameState.hintsEnabled = !gameState.hintsEnabled;
    document.getElementById('hintsToggle').textContent = gameState.hintsEnabled ? 'On' : 'Off';
    saveSettings();
}

function toggleAnimations() {
    gameState.animationsEnabled = !gameState.animationsEnabled;
    document.getElementById('animToggle').textContent = gameState.animationsEnabled ? 'On' : 'Off';
    saveSettings();
}

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Message Display
function showMessage(msg) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = msg;
    if (msg) {
        messageEl.classList.add('show');
        setTimeout(() => {
            messageEl.classList.remove('show');
        }, 3000);
    } else {
        messageEl.classList.remove('show');
    }
}

// Statistics Functions
function updateStatsDisplay() {
    document.getElementById('gamesPlayed').textContent = stats.gamesPlayed;
    document.getElementById('gamesWon').textContent = stats.gamesWon;
    const winRate = stats.gamesPlayed > 0 ? 
        Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
    document.getElementById('winRate').textContent = `${winRate}%`;
    document.getElementById('currentStreak').textContent = stats.currentStreak;
    document.getElementById('bestStreak').textContent = stats.bestStreak;
    document.getElementById('bestScore').textContent = stats.bestScore;
}

function resetStats() {
    if (confirm('Are you sure you want to reset all statistics?')) {
        stats = {
            gamesPlayed: 0,
            gamesWon: 0,
            currentStreak: 0,
            bestStreak: 0,
            bestScore: 0
        };
        saveStats();
        updateStatsDisplay();
        updateRank();
        showMessage('Statistics reset');
    }
}

// Storage Functions
function saveStats() {
    try {
        localStorage.setItem('casinoSolitaireStats', JSON.stringify(stats));
    } catch (e) {
        console.warn('Could not save stats:', e);
    }
}

function loadStats() {
    try {
        const saved = localStorage.getItem('casinoSolitaireStats');
        if (saved) {
            stats = JSON.parse(saved);
        }
    } catch (e) {
        console.warn('Could not load stats:', e);
    }
    updateRank();
}

function saveSettings() {
    try {
        const settings = {
            drawMode: gameState.drawMode,
            timed: gameState.timed,
            hintsEnabled: gameState.hintsEnabled,
            animationsEnabled: gameState.animationsEnabled
        };
        localStorage.setItem('casinoSolitaireSettings', JSON.stringify(settings));
    } catch (e) {
        console.warn('Could not save settings:', e);
    }
}

function loadSettings() {
    try {
        const saved = localStorage.getItem('casinoSolitaireSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            gameState.drawMode = settings.drawMode || 1;
            gameState.timed = settings.timed || false;
            gameState.hintsEnabled = settings.hintsEnabled !== false;
            gameState.animationsEnabled = settings.animationsEnabled !== false;
            
            // Update UI
            document.getElementById('drawToggle').textContent = `Draw ${gameState.drawMode}`;
            document.getElementById('timedToggle').textContent = gameState.timed ? 'On' : 'Off';
            document.getElementById('hintsToggle').textContent = gameState.hintsEnabled ? 'On' : 'Off';
            document.getElementById('animToggle').textContent = gameState.animationsEnabled ? 'On' : 'Off';
        }
    } catch (e) {
        console.warn('Could not load settings:', e);
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
