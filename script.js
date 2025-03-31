// script.js (Pacman Like - V4 - Mobile Controls)

document.addEventListener('DOMContentLoaded', () => {
    console.log(">>> DOMContentLoaded event fired. Initializing script.");

    // --- Seleção de Elementos Essenciais com Verificação ---
    const boardElement = document.getElementById('game-board');
    const scoreElement = document.getElementById('score');
    const livesElement = document.getElementById('lives');
    const startMessage = document.getElementById('start-message');
    const gameOverMessage = document.getElementById('game-over-message');
    const finalScoreElement = document.getElementById('final-score');
    const resetButton = document.getElementById('reset-button');
    const winMessage = document.getElementById('win-message');
    const winScoreElement = document.getElementById('win-score');
    const winResetButton = document.getElementById('win-reset-button');
    // Seleciona os botões de toque
    const btnUp = document.getElementById('btn-up');
    const btnDown = document.getElementById('btn-down');
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');

    // VERIFICAÇÃO CRUCIAL
    if (!boardElement || !scoreElement || !livesElement || !startMessage ||
        !gameOverMessage || !finalScoreElement || !resetButton || !winMessage ||
        !winScoreElement || !winResetButton || !btnUp || !btnDown || !btnLeft || !btnRight) {
        console.error("CRITICAL ERROR: One or more essential HTML elements not found! Check IDs.");
        // Opcional: Mostrar erro na tela
        if (startMessage) startMessage.textContent = "Erro Crítico! Verifique o Console (F12).";
        return; // Impede a execução do resto do script
    }
    console.log(">>> All essential HTML elements found successfully.");

    // --- Constantes e Layout (Mesmo de antes) ---
    const CELL_SIZE = 20;
    const P_DOT_SCORE = 10;
    const P_POWER_PELLET_SCORE = 50;
    const P_GHOST_SCORE = 200;
    const POWER_PELLET_DURATION = 7000;
    const FRIGHTENED_ENDING_TIME = 2000;
    const layout = [ /* ... Cole o layout completo aqui ... */
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,0,1,1,1,1,0,1,0,1,1,1,1,0,1,1,0,1],
        [1,3,1,1,0,1,1,1,1,0,1,0,1,1,1,1,0,1,1,3,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,0,1],
        [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
        [1,1,1,1,0,1,1,1,1,2,1,2,1,1,1,1,0,1,1,1,1],
        [2,2,2,1,0,1,2,2,2,2,2,2,2,2,2,1,0,1,2,2,2],
        [1,1,1,1,0,1,2,1,1,4,4,4,1,1,2,1,0,1,1,1,1],
        [2,2,2,2,0,2,2,1,4,4,4,4,4,1,2,2,0,2,2,2,2],
        [1,1,1,1,0,1,2,1,1,1,1,1,1,1,2,1,0,1,1,1,1],
        [2,2,2,1,0,1,2,2,2,2,2,2,2,2,2,1,0,1,2,2,2],
        [1,1,1,1,0,1,2,1,1,1,1,1,1,1,2,1,0,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,0,1,1,1,1,0,1,0,1,1,1,1,0,1,1,0,1],
        [1,3,0,1,0,0,0,0,0,0,2,0,0,0,0,0,0,1,0,3,1],
        [1,1,0,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,0,1,1],
        [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
        [1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];
    const GRID_WIDTH = layout[0].length;
    const GRID_HEIGHT = layout.length;

    // --- Game State Variables (Mesmo de antes) ---
    let score = 0;
    let lives = 3;
    let dotsCount = 0;
    let player;
    let ghosts = [];
    let currentDirection = '';
    let nextDirection = '';
    let gameInterval = null;
    let isGameOver = false;
    let isPowerPelletActive = false;
    let powerPelletTimer = null;
    let powerPelletEndingTimer = null;
    let frightenedGhostsEaten = 0;

    // --- Classes (Character, Player, Ghost) ---
    // Cole as definições completas das classes aqui (Character, Player, Ghost)
    class Character { /* ... Colar definição completa ... */
        constructor(className, startX, startY, speed) {
             if (!boardElement) { console.error("Board element not found when creating Character!"); return; }
            this.x = startX; this.y = startY; this.speed = speed;
            this.element = document.createElement('div'); this.element.className = `character ${className}`;
            this.updatePosition(); boardElement.appendChild(this.element);
        }
        updatePosition() { this.element.style.left = `${this.x*CELL_SIZE}px`; this.element.style.top = `${this.y*CELL_SIZE}px`; }
        getNextPosition(direction) { let nX=this.x, nY=this.y; switch(direction){case 'up':nY--;break; case 'down':nY++;break; case 'left':nX--;break; case 'right':nX++;break;} if(nX<0)nX=GRID_WIDTH-1;else if(nX>=GRID_WIDTH)nX=0; if(nY<0)nY=GRID_HEIGHT-1;else if(nY>=GRID_HEIGHT)nY=0; return {x:nX, y:nY}; }
        isValidMove(x, y) { if (x<0||x>=GRID_WIDTH||y<0||y>=GRID_HEIGHT){ return false; } const cellType = layout[y][x]; if(this instanceof Ghost){ return cellType!==1; }else{ return cellType!==1; } }
    }
    class Player extends Character { /* ... Colar definição completa ... */
        constructor(startX, startY, speed) { super('player', startX, startY, speed); }
        move() { let moved=false; const nextPosTry=this.getNextPosition(nextDirection); if(nextDirection&&this.isValidMove(nextPosTry.x,nextPosTry.y)){currentDirection=nextDirection;}else{const currentPosTry=this.getNextPosition(currentDirection); if(!currentDirection||!this.isValidMove(currentPosTry.x,currentPosTry.y)){currentDirection='';}} if(currentDirection){const {x:newX,y:newY}=this.getNextPosition(currentDirection); if(this.isValidMove(newX,newY)){this.x=newX;this.y=newY;this.updatePosition(); moved=true;}else{currentDirection='';}} return moved; }
        handleEat() { if(this.y<0||this.y>=GRID_HEIGHT||this.x<0||this.x>=GRID_WIDTH)return; const cellType=layout[this.y][this.x]; const cellElement=boardElement.querySelector(`.cell[data-y='${this.y}'][data-x='${this.x}']`); if(cellElement){ if(cellType===0){layout[this.y][this.x]=2; cellElement.classList.remove('dot'); dotsCount--; updateScore(P_DOT_SCORE);}else if(cellType===3){layout[this.y][this.x]=2; cellElement.classList.remove('power-pellet'); updateScore(P_POWER_PELLET_SCORE); activatePowerPellet();}} }
    }
    class Ghost extends Character { /* ... Colar definição completa ... */
        constructor(className, startX, startY, speed) { super(`ghost ${className}`, startX, startY, speed); this.className=className; this.direction=['up','down','left','right'][Math.floor(Math.random()*4)]; this.isFrightened=false; this.isEndingFrightened=false; this.spawnPoint={x:startX, y:startY}; }
        move() { const possibleDirections=['up','down','left','right']; const oppositeDirection={'up':'down','down':'up','left':'right','right':'left'}; let validMoves=[]; possibleDirections.forEach(dir=>{const{x:nextX,y:nextY}=this.getNextPosition(dir); if(this.isValidMove(nextX,nextY)){if(dir!==oppositeDirection[this.direction]){validMoves.push(dir);}}}); if(validMoves.length===0){const reverseDir=oppositeDirection[this.direction]; const{x:nextX,y:nextY}=this.getNextPosition(reverseDir); if(this.isValidMove(nextX,nextY)){validMoves.push(reverseDir);}} if(validMoves.length>0){this.direction=validMoves[Math.floor(Math.random()*validMoves.length)]; const{x:finalX,y:finalY}=this.getNextPosition(this.direction); this.x=finalX; this.y=finalY; this.updatePosition();} }
        setFrightened(state) { this.isFrightened=state; this.isEndingFrightened=false; this.element.classList.remove('ending'); if(state){this.element.classList.add('frightened');}else{this.element.classList.remove('frightened');} }
        setEndingFrightened(state) { this.isEndingFrightened=state; if(state&&this.isFrightened){this.element.classList.add('ending');}else{this.element.classList.remove('ending');} }
        respawn() { this.x=this.spawnPoint.x; this.y=this.spawnPoint.y; this.setFrightened(false); this.direction=['up','down','left','right'][Math.floor(Math.random()*4)]; this.updatePosition(); }
    }


    // --- Funções do Jogo (Principais) ---

    function createBoard() { /* ... Colar definição completa ... */
        console.log(">>> Running createBoard()");
        try { boardElement.innerHTML = ''; dotsCount = 0; boardElement.style.gridTemplateColumns = `repeat(${GRID_WIDTH}, ${CELL_SIZE}px)`; boardElement.style.gridTemplateRows = `repeat(${GRID_HEIGHT}, ${CELL_SIZE}px)`; boardElement.style.width = `${GRID_WIDTH * CELL_SIZE}px`; boardElement.style.height = `${GRID_HEIGHT * CELL_SIZE}px`;
        layout.forEach((row, y)=>{row.forEach((cellType, x)=>{const cell=document.createElement('div'); cell.classList.add('cell'); cell.dataset.x=x; cell.dataset.y=y; switch(cellType){case 1: cell.classList.add('wall');break; case 0: cell.classList.add('dot'); dotsCount++; break; case 3: cell.classList.add('power-pellet'); break;} boardElement.appendChild(cell);});});
        console.log(`>>> Board created. Dots: ${dotsCount}`);
        } catch(e){ console.error("Error in createBoard:", e); }
    }

    function updateScore(amount) { score += amount; scoreElement.textContent = score; }
    function updateLives(amount) { lives += amount; livesElement.textContent = lives; if(lives <= 0 && !isGameOver){ gameOver(); } }

    // NOVA Função para definir direção e iniciar jogo
    function setDirectionAndStart(direction) {
        if (!gameInterval && !isGameOver) { // Inicia o jogo se parado
            startGameLoop();
        }
        if (gameInterval && !isGameOver) { // Define a próxima direção se o jogo estiver rodando
            nextDirection = direction;
        }
    }

    // Função de Input do Teclado (chama a nova função)
    function handleKeyboardInput(e) {
        let direction = null;
        switch (e.key) {
            case 'ArrowUp':    direction = 'up'; break;
            case 'ArrowDown':  direction = 'down'; break;
            case 'ArrowLeft':  direction = 'left'; break;
            case 'ArrowRight': direction = 'right'; break;
        }
        if (direction) {
            e.preventDefault(); // Evita rolagem da página com as setas
            setDirectionAndStart(direction);
        }
    }

    // --- Outras Funções do Jogo (Colar completas da resposta anterior) ---
    function checkCollisions() { /* ... Colar definição completa ... */ ghosts.forEach(ghost=>{if(player.x===ghost.x && player.y===ghost.y){if(ghost.isFrightened){ghost.respawn(); updateScore(P_GHOST_SCORE * (2**frightenedGhostsEaten)); frightenedGhostsEaten++;}else if(!isGameOver){playerLosesLife();}}}); player.handleEat(); }
    function playerLosesLife() { /* ... Colar definição completa ... */ console.log("Player losing life..."); stopGameLoop(); updateLives(-1); if(!isGameOver){ setTimeout(()=>{ resetPositions(); if(!isGameOver){ startGameLoop();} }, 1500); } }
    function resetPositions() { /* ... Colar definição completa ... */ const pSpawn={x:10, y:16}; player.x=pSpawn.x; player.y=pSpawn.y; player.updatePosition(); currentDirection=''; nextDirection=''; const gSpawns=[{x:9,y:10},{x:10,y:10},{x:11,y:10},{x:10,y:9}]; ghosts.forEach((ghost,idx)=>{const spawn=gSpawns[idx%gSpawns.length]; ghost.x=spawn.x; ghost.y=spawn.y; ghost.setFrightened(false); ghost.direction=['up','down','left','right'][Math.floor(Math.random()*4)]; ghost.updatePosition();}); console.log("Positions reset."); }
    function activatePowerPellet() { /* ... Colar definição completa ... */ console.log("Power Pellet Active!"); clearTimeout(powerPelletTimer); clearTimeout(powerPelletEndingTimer); isPowerPelletActive=true; frightenedGhostsEaten=0; ghosts.forEach(g=>g.setFrightened(true)); powerPelletTimer=setTimeout(()=>{isPowerPelletActive=false; ghosts.forEach(g=>g.setFrightened(false));}, POWER_PELLET_DURATION); powerPelletEndingTimer=setTimeout(()=>{if(isPowerPelletActive){ghosts.forEach(g=>g.setEndingFrightened(true));}}, POWER_PELLET_DURATION - FRIGHTENED_ENDING_TIME); }
    function checkWinCondition() { /* ... Colar definição completa ... */ if(dotsCount <= 0 && !isGameOver){ winGame(); } }
    function gameLoop() { /* ... Colar definição completa ... */ if(isGameOver){ stopGameLoop(); return; } player.move(); ghosts.forEach(ghost => ghost.move()); checkCollisions(); checkWinCondition(); }
    function stopGameLoop() { /* ... Colar definição completa ... */ if(gameInterval){ clearInterval(gameInterval); gameInterval=null; } startMessage.style.display='none'; }
    function startGameLoop() { /* ... Colar definição completa ... */ if(isGameOver) return; if(!gameInterval){ console.log(">>> Starting game loop"); startMessage.style.display='none'; gameInterval=setInterval(gameLoop, 170); } }
    function gameOver() { /* ... Colar definição completa ... */ console.log(">>> GAME OVER <<<"); isGameOver=true; stopGameLoop(); clearTimeout(powerPelletTimer); clearTimeout(powerPelletEndingTimer); finalScoreElement.textContent=score; gameOverMessage.style.display='flex'; }
    function winGame() { /* ... Colar definição completa ... */ console.log(">>> PLAYER WINS <<<"); isGameOver=true; stopGameLoop(); clearTimeout(powerPelletTimer); clearTimeout(powerPelletEndingTimer); winScoreElement.textContent=score; winMessage.style.display='flex'; }
    function resetGame() { /* ... Colar definição completa ... */
        console.log(">>> Resetting Game <<<");
        stopGameLoop(); isGameOver=false; score=0; lives=3; currentDirection=''; nextDirection=''; isPowerPelletActive=false; clearTimeout(powerPelletTimer); clearTimeout(powerPelletEndingTimer); frightenedGhostsEaten=0;
        updateScore(0); updateLives(0); gameOverMessage.style.display='none'; winMessage.style.display='none'; startMessage.style.display='block'; startMessage.textContent = "Pressione um direcional (tela ou teclado) para iniciar"; startMessage.style.color = ''; // Reset color

        if (player && player.element) player.element.remove();
        ghosts.forEach(g => { if (g && g.element) g.element.remove(); });
        ghosts = [];

        try {
            createBoard();
            const playerSpawn = { x: 10, y: 16 };
            const ghostSpawns = [ { x: 9, y: 10, class: 'blinky' }, { x: 10, y: 10, class: 'pinky' }, { x: 11, y: 10, class: 'inky' }, { x: 10, y: 9, class: 'clyde' } ];
            player = new Player(playerSpawn.x, playerSpawn.y, 1);
            ghostSpawns.forEach(spawn => { ghosts.push(new Ghost(spawn.class, spawn.x, spawn.y, 1)); });
            console.log(">>> Game reset finished successfully.");
        } catch (error) {
            console.error(">>> CRITICAL ERROR during resetGame (creating board/chars):", error);
            startMessage.textContent = "Erro Crítico ao iniciar. Verifique o Console (F12).";
            startMessage.style.color = "red";
            startMessage.style.display = 'block';
        }
    }

    // --- Event Listeners ---
    console.log(">>> Adding event listeners.");
    // Teclado
    document.addEventListener('keydown', handleKeyboardInput);
    // Botões de Toque (usando 'click' que funciona bem em mobile também)
    btnUp.addEventListener('click', () => setDirectionAndStart('up'));
    btnDown.addEventListener('click', () => setDirectionAndStart('down'));
    btnLeft.addEventListener('click', () => setDirectionAndStart('left'));
    btnRight.addEventListener('click', () => setDirectionAndStart('right'));
    // Botões de Reset
    resetButton.addEventListener('click', resetGame);
    winResetButton.addEventListener('click', resetGame);

    // --- Inicialização ---
    resetGame(); // Configura o jogo inicialmente
    console.log(">>> Initial resetGame() call finished. Waiting for input.");

}); // Fim do DOMContentLoaded
