const SYMBOLS = ['7️⃣', '💎', '⭐', '🔔', '🍒', '🍋', 'BAR'];

const SYMBOL_WEIGHTS = {
    '7️⃣': 1,
    '💎': 2,
    '⭐': 2,
    '🔔': 3,
    '🍒': 4,
    '🍋': 4,
    'BAR': 4
};

const PRIZE_POOL = {
    legendary: [
        { name: 'Rare Casino Society PFP #42', value: 500, tier: 'legendary', image: '../assets/b_garlinghouse.png' },
        { name: 'Golden Card NFT', value: 400, tier: 'legendary', image: '../assets/casino_cards_nft_thumbnail.png' },
        { name: 'LOX Token (10,000)', value: 300, tier: 'legendary', image: '../assets/casino_brand.png' },
        { name: 'Legendary Banner NFT', value: 350, tier: 'legendary', image: '../assets/banner_collection_brand.png' },
        { name: 'Diamond Card Collection', value: 450, tier: 'legendary', image: '../assets/casino_cards_nft_thumbnail.png' }
    ],
    epic: [
        { name: 'Casino Banner NFT', value: 150, tier: 'epic', image: '../assets/banner_collection_brand.png' },
        { name: 'Premium Token Bundle', value: 100, tier: 'epic', image: '../assets/casino_brand.png' },
        { name: 'Epic PFP Collection', value: 120, tier: 'epic', image: '../assets/b_garlinghouse.png' },
        { name: 'Star Card NFT', value: 130, tier: 'epic', image: '../assets/casino_cards_nft_thumbnail.png' }
    ],
    rare: [
        { name: 'Casino Card NFT', value: 50, tier: 'rare', image: '../assets/casino_cards_nft_thumbnail.png' },
        { name: 'Token Pack (1,000)', value: 40, tier: 'rare', image: '../assets/casino_brand.png' },
        { name: 'Rare PFP', value: 45, tier: 'rare', image: '../assets/b_garlinghouse.png' },
        { name: 'Bell Card', value: 35, tier: 'rare', image: '../assets/casino_cards_nft_thumbnail.png' }
    ],
    common: [
        { name: 'XRP Memecoin (100)', value: 10, tier: 'common', image: '../assets/casino_brand.png' },
        { name: 'Casino Points (500)', value: 5, tier: 'common', image: '../assets/casino_brand.png' },
        { name: 'Cherry Card', value: 8, tier: 'common', image: '../assets/casino_cards_nft_thumbnail.png' },
        { name: 'Lemon Token Bundle', value: 12, tier: 'common', image: '../assets/casino_brand.png' }
    ],
    consolation: [
        { name: 'Small Token Pack', value: 2, tier: 'consolation', image: '../assets/casino_brand.png' },
        { name: '80% Bet Refund', value: 0, tier: 'consolation', image: '../assets/casino_brand.png' },
        { name: 'Casino Points (50)', value: 1, tier: 'consolation', image: '../assets/casino_brand.png' }
    ]
};

let gameState = {
    mode: 'free',
    balance: 1000,
    bet: 1,
    totalSpins: 0,
    jackpot: 1250,
    jackpotCounter: 0,
    isSpinning: false,
    soundEnabled: true,
    spinHistory: [],
    totalWagered: 0,
    totalWon: 0,
    wins: 0,
    prizesClaimed: {
        legendary: 0,
        epic: 0,
        rare: 0,
        common: 0,
        consolation: 0
    }
};

let reelPositions = [0, 0, 0];
let reelElements = [];
let soundEffects = {};

document.addEventListener('DOMContentLoaded', init);

function init() {
    setupReels();
    setupEventListeners();
    updateUI();
    loadGameState();
}

function setupReels() {
    reelElements = [
        document.getElementById('reel1'),
        document.getElementById('reel2'),
        document.getElementById('reel3')
    ];

    reelElements.forEach((reel, index) => {
        const strip = reel.querySelector('.reel-strip');
        const symbols = generateReelStrip();
        
        symbols.forEach(symbol => {
            const symbolDiv = document.createElement('div');
            symbolDiv.className = 'reel-symbol';
            symbolDiv.textContent = symbol;
            strip.appendChild(symbolDiv);
        });

        reelPositions[index] = 0;
    });
}

function generateReelStrip() {
    const strip = [];
    for (let i = 0; i < 30; i++) {
        strip.push(getWeightedRandomSymbol());
    }
    return strip;
}

function getWeightedRandomSymbol() {
    const totalWeight = Object.values(SYMBOL_WEIGHTS).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (const [symbol, weight] of Object.entries(SYMBOL_WEIGHTS)) {
        random -= weight;
        if (random <= 0) return symbol;
    }
    
    return SYMBOLS[0];
}

function setupEventListeners() {
    document.getElementById('spinButton').addEventListener('click', spin);
    document.getElementById('lever').addEventListener('click', spin);
    
    document.querySelectorAll('.bet-btn').forEach(btn => {
        btn.addEventListener('click', () => selectBet(parseInt(btn.dataset.bet)));
    });
    
    document.getElementById('freePlayBtn').addEventListener('click', () => switchMode('free'));
    document.getElementById('realPlayBtn').addEventListener('click', () => switchMode('real'));
    
    document.getElementById('soundToggle').addEventListener('click', toggleSound);
    document.getElementById('infoBtn').addEventListener('click', () => openModal('infoModal'));
    document.getElementById('historyBtn').addEventListener('click', () => openHistoryModal());
    
    document.getElementById('closeWin').addEventListener('click', () => closeModal('winModal'));
    document.getElementById('closeInfo').addEventListener('click', () => closeModal('infoModal'));
    document.getElementById('closeHistory').addEventListener('click', () => closeModal('historyModal'));
    
    document.getElementById('spinAgain').addEventListener('click', () => {
        closeModal('winModal');
        setTimeout(() => spin(), 300);
    });
    
    document.getElementById('claimPrize').addEventListener('click', () => {
        showMessage('Prize claimed! (Wallet integration coming soon)', 'success');
        closeModal('winModal');
    });
}

function selectBet(amount) {
    if (gameState.isSpinning) return;
    
    gameState.bet = amount;
    
    document.querySelectorAll('.bet-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.bet) === amount);
    });
    
    document.querySelector('.spin-cost').textContent = `(${amount} XRP)`;
    playSound('click');
}

function switchMode(mode) {
    gameState.mode = mode;
    
    document.getElementById('freePlayBtn').classList.toggle('active', mode === 'free');
    document.getElementById('realPlayBtn').classList.toggle('active', mode === 'real');
    
    if (mode === 'free' && gameState.balance === 0) {
        gameState.balance = 1000;
        showMessage('Starting fresh with 1000 XRP!', 'success');
    }
    
    if (mode === 'real') {
        showMessage('Real play mode - Connect wallet to play for real prizes!', 'info');
    }
    
    updateUI();
    playSound('click');
}

function spin() {
    if (gameState.isSpinning) return;
    
    if (gameState.balance < gameState.bet) {
        showMessage('Insufficient balance!', 'error');
        playSound('error');
        return;
    }
    
    gameState.isSpinning = true;
    gameState.balance -= gameState.bet;
    gameState.totalSpins++;
    gameState.totalWagered += gameState.bet;
    gameState.jackpotCounter++;
    gameState.jackpot += gameState.bet * 0.1;
    
    updateUI();
    
    const lever = document.getElementById('lever');
    lever.classList.add('pulling');
    setTimeout(() => {
        lever.classList.remove('pulling');
        lever.classList.add('returning');
        setTimeout(() => lever.classList.remove('returning'), 300);
    }, 200);
    
    playSound('lever');
    
    document.getElementById('spinButton').disabled = true;
    
    startReelSpin();
}

function startReelSpin() {
    playSound('spin');
    
    reelElements.forEach((reel, index) => {
        reel.classList.add('spinning');
    });
    
    const spinDurations = [2000, 2500, 3000];
    const results = calculateSpinResults();
    
    reelElements.forEach((reel, index) => {
        setTimeout(() => {
            stopReel(reel, index, results[index]);
        }, spinDurations[index]);
    });
    
    setTimeout(() => {
        checkWin(results);
    }, 3500);
}

function stopReel(reel, index, targetSymbol) {
    reel.classList.remove('spinning');
    
    const strip = reel.querySelector('.reel-strip');
    const symbols = Array.from(strip.children);
    
    const targetIndex = symbols.findIndex(s => s.textContent === targetSymbol);
    
    if (targetIndex !== -1) {
        const offset = -(targetIndex * 120) + 120;
        strip.style.transform = `translateY(${offset}px)`;
        reelPositions[index] = targetIndex;
    }
    
    playSound('stop');
}

function calculateSpinResults() {
    const isJackpot = gameState.jackpotCounter >= 250;
    
    if (isJackpot) {
        return ['7️⃣', '7️⃣', '7️⃣'];
    }
    
    const odds = getOddsForBet(gameState.bet);
    const random = Math.random() * 100;
    
    let cumulativeOdds = 0;
    let tier = 'consolation';
    
    if (random < (cumulativeOdds += odds.legendary)) {
        tier = 'legendary';
    } else if (random < (cumulativeOdds += odds.epic)) {
        tier = 'epic';
    } else if (random < (cumulativeOdds += odds.rare)) {
        tier = 'rare';
    } else if (random < (cumulativeOdds += odds.common)) {
        tier = 'common';
    }
    
    return getSymbolsForTier(tier);
}

function getOddsForBet(bet) {
    const freePlayOdds = {
        legendary: 1,
        epic: 5,
        rare: 15,
        common: 30,
        consolation: 49
    };
    
    const realPlayOdds = {
        1: { legendary: 1, epic: 5, rare: 15, common: 30, consolation: 49 },
        2: { legendary: 3, epic: 10, rare: 25, common: 40, consolation: 22 },
        5: { legendary: 8, epic: 20, rare: 35, common: 30, consolation: 7 }
    };
    
    return gameState.mode === 'free' ? freePlayOdds : (realPlayOdds[bet] || realPlayOdds[1]);
}

function getSymbolsForTier(tier) {
    const combinations = {
        legendary: [['7️⃣', '7️⃣', '7️⃣']],
        epic: [['💎', '💎', '💎'], ['⭐', '⭐', '⭐']],
        rare: [['🔔', '🔔', '🔔']],
        common: [['🍒', '🍒', '🍒'], ['🍋', '🍋', '🍋']],
        consolation: [
            ['🍒', '🍒', '🍋'],
            ['💎', '💎', '🔔'],
            ['⭐', '⭐', '🍒'],
            ['🔔', '🔔', '🍋']
        ]
    };
    
    const options = combinations[tier] || combinations.consolation;
    return options[Math.floor(Math.random() * options.length)];
}

function checkWin(results) {
    const isWin = results[0] === results[1] && results[1] === results[2];
    const isPartialWin = results[0] === results[1] || results[1] === results[2] || results[0] === results[2];
    
    const isJackpot = gameState.jackpotCounter >= 250 && isWin;
    
    if (isJackpot) {
        handleJackpotWin(results);
        return;
    }
    
    if (isWin) {
        handleWin(results, getTierFromSymbols(results));
    } else if (isPartialWin && gameState.mode === 'real') {
        handleConsolationPrize(results);
    } else if (gameState.mode === 'real') {
        handleConsolationPrize(results);
    } else {
        handleLoss();
    }
}

function getTierFromSymbols(symbols) {
    const symbol = symbols[0];
    if (symbol === '7️⃣') return 'legendary';
    if (symbol === '💎' || symbol === '⭐') return 'epic';
    if (symbol === '🔔') return 'rare';
    return 'common';
}

function handleJackpotWin(results) {
    playSound('jackpot');
    
    const jackpotAmount = gameState.jackpot;
    gameState.balance += jackpotAmount;
    gameState.totalWon += jackpotAmount;
    gameState.wins++;
    
    reelElements.forEach(reel => reel.classList.add('win-reel'));
    document.querySelector('.reels-container').classList.add('winning');
    
    const prize = {
        name: '🎰 JACKPOT WIN! 🎰',
        value: jackpotAmount,
        tier: 'legendary',
        image: '../assets/casino_brand.png'
    };
    
    addToHistory(gameState.bet, prize, jackpotAmount);
    addToRecentWins(prize, jackpotAmount);
    
    gameState.jackpot = 1250;
    gameState.jackpotCounter = 0;
    
    setTimeout(() => {
        showWinModal(prize);
        createConfetti(100);
        gameState.isSpinning = false;
        document.getElementById('spinButton').disabled = false;
        updateUI();
        
        reelElements.forEach(reel => reel.classList.remove('win-reel'));
        document.querySelector('.reels-container').classList.remove('winning');
    }, 1000);
}

function handleWin(results, tier) {
    playSound('win');
    
    const prizePool = PRIZE_POOL[tier];
    const prize = prizePool[Math.floor(Math.random() * prizePool.length)];
    
    const winAmount = prize.value;
    gameState.balance += winAmount;
    gameState.totalWon += winAmount;
    gameState.wins++;
    gameState.prizesClaimed[tier]++;
    
    reelElements.forEach(reel => reel.classList.add('win-reel'));
    document.querySelector('.reels-container').classList.add('winning');
    
    addToHistory(gameState.bet, prize, winAmount);
    addToRecentWins(prize, winAmount);
    
    setTimeout(() => {
        showWinModal(prize);
        createConfetti(30);
        gameState.isSpinning = false;
        document.getElementById('spinButton').disabled = false;
        updateUI();
        
        reelElements.forEach(reel => reel.classList.remove('win-reel'));
        document.querySelector('.reels-container').classList.remove('winning');
    }, 1000);
}

function handleConsolationPrize(results) {
    playSound('smallwin');
    
    const refundAmount = Math.floor(gameState.bet * 0.8);
    const prizePool = PRIZE_POOL.consolation;
    
    let prize;
    if (Math.random() < 0.5) {
        prize = {
            name: '80% Bet Refund',
            value: refundAmount,
            tier: 'consolation',
            image: '../assets/casino_brand.png'
        };
    } else {
        prize = prizePool[Math.floor(Math.random() * prizePool.length)];
    }
    
    const winAmount = prize.name === '80% Bet Refund' ? refundAmount : prize.value;
    gameState.balance += winAmount;
    gameState.totalWon += winAmount;
    gameState.prizesClaimed.consolation++;
    
    addToHistory(gameState.bet, prize, winAmount);
    
    setTimeout(() => {
        showWinModal(prize);
        gameState.isSpinning = false;
        document.getElementById('spinButton').disabled = false;
        updateUI();
    }, 1000);
}

function handleLoss() {
    playSound('lose');
    
    addToHistory(gameState.bet, null, 0);
    
    setTimeout(() => {
        showMessage('Try again! Better luck next spin!', 'info');
        gameState.isSpinning = false;
        document.getElementById('spinButton').disabled = false;
        updateUI();
    }, 1000);
}function showWinModal(prize) {
    document.getElementById('winMessage').textContent = prize.tier === 'legendary' ? '🎰 JACKPOT! 🎰' : 'YOU WIN!';
    document.getElementById('prizeImage').src = prize.image;
    document.getElementById('prizeName').textContent = prize.name;
    document.getElementById('prizeTier').textContent = prize.tier.toUpperCase();
    document.getElementById('prizeTier').className = `prize-tier ${prize.tier}`;
    document.getElementById('prizeValue').textContent = `Value: ${prize.value} XRP`;
    
    openModal('winModal');
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function openHistoryModal() {
    updateHistoryDisplay();
    openModal('historyModal');
}

function createConfetti(count) {
    const container = document.querySelector('.confetti-container');
    container.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = ['#E6D39E', '#C8102E', '#FFD700', '#FF6B6B'][Math.floor(Math.random() * 4)];
            confetti.style.animationDelay = Math.random() * 2 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            container.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 4000);
        }, i * 20);
    }
}

function addToHistory(bet, prize, amount) {
    const historyItem = {
        timestamp: new Date().toISOString(),
        bet: bet,
        prize: prize ? prize.name : 'No win',
        amount: amount,
        result: prize ? 'win' : 'loss'
    };
    
    gameState.spinHistory.unshift(historyItem);
    
    if (gameState.spinHistory.length > 50) {
        gameState.spinHistory = gameState.spinHistory.slice(0, 50);
    }
    
    saveGameState();
}

function addToRecentWins(prize, amount) {
    const winsList = document.getElementById('winsList');
    
    if (winsList.querySelector('.no-wins')) {
        winsList.innerHTML = '';
    }
    
    const winItem = document.createElement('div');
    winItem.className = 'win-item';
    winItem.innerHTML = `
        <div class="win-details">
            <div class="win-prize">${prize.name}</div>
            <div class="win-time">${new Date().toLocaleTimeString()}</div>
        </div>
        <div class="win-value">+${amount} XRP</div>
    `;
    
    winsList.insertBefore(winItem, winsList.firstChild);
    
    if (winsList.children.length > 10) {
        winsList.removeChild(winsList.lastChild);
    }
}

function updateHistoryDisplay() {
    const wins = gameState.spinHistory.filter(h => h.result === 'win').length;
    const winRate = gameState.totalSpins > 0 ? ((wins / gameState.totalSpins) * 100).toFixed(1) : 0;
    
    document.getElementById('historyTotalSpins').textContent = gameState.totalSpins;
    document.getElementById('historyWagered').textContent = gameState.totalWagered + ' XRP';
    document.getElementById('historyWon').textContent = gameState.totalWon + ' XRP';
    document.getElementById('historyWinRate').textContent = winRate + '%';
    
    const historyList = document.getElementById('historyList');
    
    if (gameState.spinHistory.length === 0) {
        historyList.innerHTML = '<div class="no-history">No spins yet</div>';
        return;
    }
    
    historyList.innerHTML = gameState.spinHistory.slice(0, 20).map(item => `
        <div class="history-item">
            <div class="history-spin-info">
                <div class="history-spin-bet">Bet: ${item.bet} XRP</div>
                <div class="history-spin-result">${item.prize}</div>
            </div>
            <div class="history-spin-value" style="color: ${item.result === 'win' ? 'var(--gold)' : 'rgba(230,211,158,0.5)'}">
                ${item.result === 'win' ? '+' : ''}${item.amount} XRP
            </div>
        </div>
    `).join('');
}

function updateUI() {
    document.getElementById('balance').textContent = gameState.balance.toFixed(0) + ' XRP';
    document.getElementById('jackpot').textContent = gameState.jackpot.toFixed(0) + ' XRP';
    document.getElementById('totalSpins').textContent = gameState.totalSpins;
    
    const remaining = {
        legendary: 5 - gameState.prizesClaimed.legendary,
        epic: 20 - gameState.prizesClaimed.epic,
        rare: 50 - gameState.prizesClaimed.rare,
        common: 75 - gameState.prizesClaimed.common
    };
    
    document.getElementById('legendaryCount').textContent = Math.max(0, remaining.legendary);
    document.getElementById('epicCount').textContent = Math.max(0, remaining.epic);
    document.getElementById('rareCount').textContent = Math.max(0, remaining.rare);
    document.getElementById('commonCount').textContent = Math.max(0, remaining.common);
    
    const totalRemaining = Object.values(remaining).reduce((a, b) => a + Math.max(0, b), 0);
    document.getElementById('totalPrizes').textContent = totalRemaining;
}

function showMessage(message, type = 'info') {
    const existingMessage = document.querySelector('.toast-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'error' ? '#C8102E' : type === 'success' ? '#2ecc71' : '#3498db'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        font-weight: 600;
        z-index: 10001;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        animation: slideDown 0.3s ease-out;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    const icon = document.querySelector('.sound-icon');
    icon.textContent = gameState.soundEnabled ? '🔊' : '🔇';
    playSound('click');
    saveGameState();
}

function playSound(soundName) {
    if (!gameState.soundEnabled) return;
    
    const sounds = {
        'lever': { frequency: 200, duration: 100 },
        'spin': { frequency: 400, duration: 300 },
        'stop': { frequency: 300, duration: 80 },
        'win': { frequency: 600, duration: 500 },
        'jackpot': { frequency: 800, duration: 1000 },
        'smallwin': { frequency: 500, duration: 300 },
        'lose': { frequency: 150, duration: 200 },
        'click': { frequency: 400, duration: 50 },
        'error': { frequency: 100, duration: 300 }
    };
    
    const sound = sounds[soundName];
    if (!sound) return;
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = sound.frequency;
        oscillator.type = soundName === 'jackpot' ? 'square' : 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration / 1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + sound.duration / 1000);
    } catch (e) {
        console.log('Audio not supported');
    }
}

function saveGameState() {
    const saveData = {
        balance: gameState.balance,
        totalSpins: gameState.totalSpins,
        jackpot: gameState.jackpot,
        jackpotCounter: gameState.jackpotCounter,
        spinHistory: gameState.spinHistory,
        totalWagered: gameState.totalWagered,
        totalWon: gameState.totalWon,
        wins: gameState.wins,
        prizesClaimed: gameState.prizesClaimed,
        soundEnabled: gameState.soundEnabled
    };
    
    try {
        localStorage.setItem('casinoSlotMachine', JSON.stringify(saveData));
    } catch (e) {
        console.log('Could not save game state');
    }
}

function loadGameState() {
    try {
        const saved = localStorage.getItem('casinoSlotMachine');
        if (saved) {
            const data = JSON.parse(saved);
            gameState.balance = data.balance || 1000;
            gameState.totalSpins = data.totalSpins || 0;
            gameState.jackpot = data.jackpot || 1250;
            gameState.jackpotCounter = data.jackpotCounter || 0;
            gameState.spinHistory = data.spinHistory || [];
            gameState.totalWagered = data.totalWagered || 0;
            gameState.totalWon = data.totalWon || 0;
            gameState.wins = data.wins || 0;
            gameState.prizesClaimed = data.prizesClaimed || {
                legendary: 0,
                epic: 0,
                rare: 0,
                common: 0,
                consolation: 0
            };
            gameState.soundEnabled = data.soundEnabled !== undefined ? data.soundEnabled : true;
            
            if (!gameState.soundEnabled) {
                document.querySelector('.sound-icon').textContent = '🔇';
            }
            
            updateUI();
            
            if (gameState.spinHistory.length > 0) {
                const recentWins = gameState.spinHistory
                    .filter(h => h.result === 'win')
                    .slice(0, 10);
                
                if (recentWins.length > 0) {
                    document.getElementById('winsList').innerHTML = '';
                    recentWins.forEach(win => {
                        const prize = { name: win.prize };
                        addToRecentWins(prize, win.amount);
                    });
                }
            }
        }
    } catch (e) {
        console.log('Could not load game state');
    }
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { transform: translate(-50%, -100px); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
    @keyframes slideUp {
        from { transform: translate(-50%, 0); opacity: 1; }
        to { transform: translate(-50%, -100px); opacity: 0; }
    }
`;
document.head.appendChild(style);

console.log('🎰 Casino Society Slot Machine loaded! No Crying in the Casino! 🎰');
