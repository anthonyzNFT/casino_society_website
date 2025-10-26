/**
 * Utility functions for Casino Society Solitaire
 * Includes scoring, timer, rank system, and general helpers
 */

/**
 * Updates the game score based on action type
 * @param {number} currentScore - Current score
 * @param {string} action - Action type ('tableauToFoundation', 'flipCard', 'stockToWaste', etc.)
 * @returns {number} New score
 */
function updateScore(currentScore, action) {
    switch (action) {
        case 'tableauToFoundation':
            return currentScore + 10;
        case 'wasteToFoundation':
            return currentScore + 10;
        case 'tableauToTableau':
            return currentScore + 5;
        case 'wasteToTableau':
            return currentScore + 5;
        case 'flipCard':
            return currentScore + 5;
        case 'stockToWaste':
            return currentScore - 1;
        default:
            return currentScore;
    }
}

/**
 * Updates the move count
 * @param {number} currentMoves - Current move count
 * @returns {number} New move count
 */
function updateMoves(currentMoves) {
    return currentMoves + 1;
}

/**
 * Updates the game timer
 * @param {number} startTime - Game start timestamp (ms)
 * @param {boolean} timed - Whether timed mode is enabled
 * @returns {number} Elapsed time in seconds
 */
function getElapsedTime(startTime, timed) {
    if (!timed) return 0;
    return Math.floor((Date.now() - startTime) / 1000);
}

/**
 * Updates player rank based on wins and streak
 * @param {number} wins - Total wins
 * @param {number} streak - Current win streak
 * @returns {string} Updated rank
 */
function updateRank(wins, streak) {
    if (streak >= 5) return 'Gold Chip';
    if (streak >= 3) return 'Silver Chip';
    if (wins >= 10) return 'Silver Chip';
    return 'Bronze Chip';
}

/**
 * Debounces a function to prevent multiple rapid calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/**
 * Generates a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export { updateScore, updateMoves, getElapsedTime, updateRank, debounce, randomInt };
