// ==UserScript==
// @name         Auto Blackjack Bot
// @namespace    Req1 - S&S
// @version      3.0
// @description  Automatically plays Blackjack on Case Clicker with basic strategy (soft hands, doubles, etc.)
// @author       req1
// @match        https://case-clicker.com/game/blackjack
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    let botRunning = false;
    let betAmount = 10;
    let gameStarted = false;
    let gameEnded = false;

    const stats = {
        played: 0, won: 0, lost: 0, tied: 0, tokensBet: 0, tokensWon: 0
    };

    function createUI() {
        const panel = document.createElement('div');
        panel.style = `position:fixed;top:10px;right:10px;background:rgba(0,0,0,0.85);color:#fff;
                       padding:15px;border-radius:8px;font-family:Arial;z-index:9999;width:260px;font-size:14px;`;
        panel.innerHTML = `
            <h3 style="margin-top:0;">Blackjack Bot</h3>
            <label>Mise : <input type="number" id="betInput" min="1" value="${betAmount}" style="width:80px;"></label><br><br>
            <button id="toggleBtn">Démarrer</button><hr>
            <div><strong>Stats :</strong><br>
            Parties : <span id="statPlayed">0</span><br>
            Gagnées : <span id="statWon">0</span><br>
            Perdues : <span id="statLost">0</span><br>
            Nuls : <span id="statTied">0</span><br>
            Tokens misés : <span id="tokensBet">0</span><br>
            Tokens gagnés : <span id="tokensWon">0</span><br>
            Gain net : <span id="tokensNet">0</span></div>`;
        document.body.appendChild(panel);

        document.getElementById('betInput').addEventListener('change', e => {
            const val = parseInt(e.target.value);
            betAmount = isNaN(val) || val < 1 ? 1 : val;
            e.target.value = betAmount;
        });

        document.getElementById('toggleBtn').addEventListener('click', () => {
            botRunning = !botRunning;
            gameStarted = gameEnded = false;
            document.getElementById('toggleBtn').textContent = botRunning ? 'Arrêter' : 'Démarrer';
            if (botRunning) runBot();
        });
    }

    function updateStatsUI() {
        document.getElementById('statPlayed').textContent = stats.played;
        document.getElementById('statWon').textContent = stats.won;
        document.getElementById('statLost').textContent = stats.lost;
        document.getElementById('statTied').textContent = stats.tied;
        document.getElementById('tokensBet').textContent = stats.tokensBet;
        document.getElementById('tokensWon').textContent = stats.tokensWon;
        document.getElementById('tokensNet').textContent = stats.tokensWon - stats.tokensBet;
    }

    function findButton(label) {
        return [...document.querySelectorAll('button')].find(btn => btn.textContent.trim().toLowerCase() === label.toLowerCase());
    }

    async function setBetFromInput() {
        const input = document.querySelector('input.mantine-NumberInput-input');
        const value = document.getElementById('betInput')?.value;
        if (!input || !value) return;

        Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        await delay(100);
    }

    function getHandValue() {
        const match = document.body.innerText.match(/Your Hand:\s+(\d+)/);
        return match ? parseInt(match[1]) : null;
    }

    function isSoftHand() {
        const text = [...document.querySelectorAll('div')].find(d => d.textContent.includes("Your Cards"))?.textContent;
        return /Ace|A/.test(text || "");
    }

    function canDoubleNow() {
        return [...document.querySelectorAll('img.mantine-Image-root')].filter(img =>
            img.alt && /^[0-9AJQK]{1,2}[HDCS]$/.test(img.alt)).length === 2;
    }

    function getDealerVisibleCardValue() {
        const card = [...document.querySelectorAll('img.mantine-Image-root')].find(img =>
            img.alt && /^[0-9AJQK]{1,2}[HDCS]$/.test(img.alt));
        if (!card) return null;
        const val = card.alt.slice(0, -1);
        return val === 'A' ? 11 : ['K', 'Q', 'J'].includes(val) ? 10 : parseInt(val);
    }

    function checkGameEnd() {
        const text = document.body.innerText;
        const outcomes = [
            { regex: /won (\d+)/, win: true },
            { regex: /lost (\d+)/, lose: true },
            { regex: /draw/, tie: true },
            { regex: /blackjack.*won (\d+)/, win: true }
        ];

        for (const o of outcomes) {
            const m = text.match(o.regex);
            if (m) {
                stats.played++;
                stats.tokensBet += betAmount;

                if (o.win) { stats.won++; stats.tokensWon += parseInt(m[1]); }
                else if (o.lose) { stats.lost++; }
                else if (o.tie) { stats.tied++; stats.tokensWon += betAmount; }

                updateStatsUI();
                gameEnded = true;
                gameStarted = false;
                return true;
            }
        }
        return false;
    }

    function decideAction(playerTotal, dealerCard) {
        const soft = isSoftHand();
        const canDouble = canDoubleNow();

        if (!soft) {
            if (playerTotal <= 8) return "hit";
            if (playerTotal === 9) return dealerCard >= 3 && dealerCard <= 6 ? (canDouble ? "double" : "hit") : "hit";
            if (playerTotal === 10) return dealerCard <= 9 ? (canDouble ? "double" : "hit") : "hit";
            if (playerTotal === 11) return canDouble ? "double" : "hit";
            if (playerTotal === 12) return dealerCard >= 4 && dealerCard <= 6 ? "stand" : "hit";
            if (playerTotal >= 13 && playerTotal <= 16) return dealerCard >= 2 && dealerCard <= 6 ? "stand" : "hit";
            if (playerTotal >= 17) return "stand";
        } else {
            if (playerTotal <= 17) return canDouble ? "double" : "hit";
            if (playerTotal === 18) {
                if (dealerCard >= 9 || dealerCard === 1) return "hit";
                if (dealerCard >= 3 && dealerCard <= 6) return canDouble ? "double" : "stand";
                return "stand";
            }
            if (playerTotal >= 19) return "stand";
        }
        return "stand";
    }

    async function runBot() {
        if (!botRunning) return;

        const startBtn = findButton("Start Game");
        const hitBtn = findButton("Hit");
        const standBtn = findButton("Stand");
        const doubleBtn = findButton("Double");

        if (checkGameEnd()) {
            if (startBtn) {
                await setBetFromInput();
                startBtn.click();
                gameStarted = true;
                gameEnded = false;
                return setTimeout(runBot, 2000);
            }
            return setTimeout(runBot, 1500);
        }

        if (!gameStarted && startBtn) {
            await setBetFromInput();
            startBtn.click();
            gameStarted = true;
            return setTimeout(runBot, 2000);
        }

        if (gameStarted && hitBtn && standBtn && !gameEnded) {
            const player = getHandValue();
            const dealer = getDealerVisibleCardValue();

            if (player === null || dealer === null) return setTimeout(runBot, 500);

            const action = decideAction(player, dealer);
            console.log(`[BOT] Action: ${action.toUpperCase()} | Player: ${player} | Dealer: ${dealer} | Soft: ${isSoftHand()}`);

            switch (action) {
                case "hit": hitBtn.click(); break;
                case "stand": standBtn.click(); break;
                case "double": if (doubleBtn) doubleBtn.click(); break;
            }

            return setTimeout(runBot, 1500);
        }

        return setTimeout(runBot, 1000);
    }

    const delay = ms => new Promise(res => setTimeout(res, ms));
    createUI();
})();
