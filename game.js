class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Game state
        this.theme = 'candy';
        this.difficulty = 'easy';
        this.difficultySettings = {
            easy: { ballSpeed: 4, paddleWidth: 120 },
            medium: { ballSpeed: 6, paddleWidth: 100 },
            hard: { ballSpeed: 8, paddleWidth: 80 }
        };

        // Score system
        this.score = 0;
        this.themeScores = {
            candy: { high: 0, last: 0 },
            forest: { high: 0, last: 0 },
            cyber: { high: 0, last: 0 },
            cappuccino: { high: 0, last: 0 }
        };
        this.totalHighScore = parseInt(localStorage.getItem('totalHighScore')) || 0;
        this.loadThemeScores();
        this.gamesPlayed = 0;
        
        // Theme settings
        this.themeSettings = {
            candy: {
                colors: ['#FF69B4', '#87CEEB', '#FFB6C1', '#98FB98', '#DDA0DD'],
                powerUps: {
                    sticky: { emoji: '🍯', color: '#FFD700', size: '30px' },
                    expand: { emoji: '🍬', color: '#FF69B4', size: '30px' },
                    multiball: { emoji: '🎈', color: '#87CEEB', size: '30px' }
                },
                ball: '#FF1493',
                paddle: '#FF69B4',
                pattern: this.drawCandyPattern.bind(this)
            },
            forest: {
                colors: ['#2E7D32', '#81C784', '#4CAF50', '#66BB6A', '#A5D6A7'],
                powerUps: {
                    powerball: { emoji: '✨', color: '#E65100', size: '30px' },
                    expand: { emoji: '🌿', color: '#2E7D32', size: '30px' },
                    multiball: { emoji: '🌳', color: '#1B5E20', size: '30px' }
                },
                ball: '#1B5E20',
                paddle: '#228B22',
                pattern: this.drawLeafPattern.bind(this)
            },
            cyber: {
                colors: ['#2196F3', '#00BCD4', '#4FC3F7', '#80DEEA', '#B3E5FC'],
                powerUps: {
                    laser: { emoji: '🔫', color: '#64FFDA', size: '30px' },
                    expand: { emoji: '💠', color: '#2196F3', size: '30px' },
                    multiball: { emoji: '⚡', color: '#00BCD4', size: '30px' }
                },
                ball: '#64FFDA',
                paddle: '#00CED1',
                pattern: this.drawCyberPattern.bind(this)
            },
            cappuccino: {
                colors: ['#8B4513', '#D2691E', '#DEB887', '#F5DEB3', '#FFA07A'],
                powerUps: {
                    heat: { emoji: '☕️', color: '#FF4500', size: '30px' },
                    expand: { emoji: '🥛', color: '#8B4513', size: '30px' },
                    multiball: { emoji: '🌮', color: '#D2691E', size: '30px' }
                },
                ball: '#D2691E',
                paddle: '#8B4513',
                pattern: this.drawCappuccinoPattern.bind(this)
            }
        };
        
        // Game elements
        this.paddle = {
            width: this.difficultySettings[this.difficulty].paddleWidth,
            height: 20,
            x: 350,
            y: 550,
            speed: 8
        };
        
        this.balls = [{
            radius: 10,
            x: 400,
            y: 300,
            dx: this.difficultySettings[this.difficulty].ballSpeed,
            dy: -this.difficultySettings[this.difficulty].ballSpeed,
            stuck: false,
            powerball: false
        }];
        
        this.bricks = [];
        this.brickRows = 5;
        this.brickCols = 8;
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
        this.gameStarted = false;
        this.gameOver = false;
        
        // Power-ups
        this.powerUps = [];
        this.powerUpTypes = {
            sticky: { emoji: '🍯', color: '#FFD700', size: '30px' },
            expand: { emoji: '🍬', color: '#FF69B4', size: '30px' },
            multiball: { emoji: '🎈', color: '#87CEEB', size: '30px' }
        };
        this.powerUpActive = null;
        
        this.lasers = [];
        
        this.initBricks();
        this.setupEventListeners();
        this.showMenu();
    }
    
    showMenu() {
        document.getElementById('menuScreen').classList.remove('hidden');
        document.getElementById('gameScreen').classList.add('hidden');
        this.updateScoreDisplays();
        this.resetGame();
        
        // Petit reload discret après quelques parties
        if (this.gamesPlayed >= 5) {
            this.gamesPlayed = 0;
            setTimeout(() => window.location.reload(), 100);
        }
    }
    
    loadThemeScores() {
        Object.keys(this.themeScores).forEach(theme => {
            const highScore = localStorage.getItem(`highScore_${theme}`);
            if (highScore) {
                this.themeScores[theme].high = parseInt(highScore);
            }
        });
        this.updateScoreDisplays();
    }

    saveThemeScore() {
        // Sauvegarde du score pour le thème actuel
        this.themeScores[this.theme].last = this.score;
        if (this.score > this.themeScores[this.theme].high) {
            this.themeScores[this.theme].high = this.score;
            localStorage.setItem(`highScore_${this.theme}`, this.score);
        }

        // Calcul et sauvegarde du score total
        const currentTotal = Object.values(this.themeScores)
            .reduce((sum, scores) => sum + scores.high, 0);
        
        if (currentTotal > this.totalHighScore) {
            this.totalHighScore = currentTotal;
            localStorage.setItem('totalHighScore', currentTotal);
        }

        this.updateScoreDisplays();
    }

    updateScoreDisplays() {
        // Mise à jour des scores par thème
        document.querySelectorAll('.theme-btn').forEach(btn => {
            const theme = btn.dataset.theme;
            const highScoreEl = btn.querySelector('.theme-high-score');
            const lastScoreEl = btn.querySelector('.theme-last-score');
            if (highScoreEl && lastScoreEl) {
                highScoreEl.textContent = this.themeScores[theme].high;
                lastScoreEl.textContent = this.themeScores[theme].last;
            }
        });

        // Mise à jour des scores totaux
        const currentTotal = Object.values(this.themeScores)
            .reduce((sum, scores) => sum + scores.high, 0);
        document.getElementById('totalHighScore').textContent = this.totalHighScore;
        document.getElementById('currentTotalScore').textContent = currentTotal;
    }
    
    showGame() {
        document.getElementById('menuScreen').classList.add('hidden');
        document.getElementById('gameScreen').classList.remove('hidden');
    }
    
    // Brick patterns for different themes
    drawCandyPattern(brick) {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.moveTo(brick.x, brick.y);
        this.ctx.lineTo(brick.x + brick.width, brick.y + brick.height);
        this.ctx.stroke();
    }
    
    drawLeafPattern(brick) {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.moveTo(brick.x + brick.width/2, brick.y);
        this.ctx.quadraticCurveTo(
            brick.x + brick.width * 0.75,
            brick.y + brick.height/2,
            brick.x + brick.width/2,
            brick.y + brick.height
        );
        this.ctx.quadraticCurveTo(
            brick.x + brick.width * 0.25,
            brick.y + brick.height/2,
            brick.x + brick.width/2,
            brick.y
        );
        this.ctx.stroke();
    }
    
    drawCyberPattern(brick) {
        this.ctx.strokeStyle = 'rgba(100, 255, 218, 0.3)';
        for(let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(brick.x + (brick.width/3) * i, brick.y);
            this.ctx.lineTo(brick.x + (brick.width/3) * i, brick.y + brick.height);
            this.ctx.stroke();
        }
    }
    
    drawCappuccinoPattern(brick) {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.moveTo(brick.x, brick.y);
        this.ctx.lineTo(brick.x + brick.width, brick.y + brick.height);
        this.ctx.stroke();
    }
    
    getBrickLayout() {
        const layouts = {
            candy: [
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1]
            ],
            forest: [
                [0,1,1,1,1,1,1,0],
                [0,0,1,1,1,1,0,0],
                [0,0,0,1,1,0,0,0],
                [0,0,1,1,1,1,0,0],
                [0,1,1,1,1,1,1,0]
            ],
            cyber: [
                [1,0,1,0,0,1,0,1],
                [1,1,1,0,0,1,1,1],
                [1,0,1,1,1,1,0,1],
                [1,1,1,0,0,1,1,1],
                [1,0,1,0,0,1,0,1]
            ],
            cappuccino: [
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1]
            ]
        };
        return layouts[this.theme];
    }
    
    initBricks() {
        const brickWidth = 80;
        const brickHeight = 20;
        const padding = 10;
        const offsetTop = 50;
        const offsetLeft = 60;
        
        const layout = this.getBrickLayout();
        const colors = this.themeSettings[this.theme].colors;
        
        this.bricks = [];
        
        for (let row = 0; row < layout.length; row++) {
            for (let col = 0; col < layout[row].length; col++) {
                if (layout[row][col] === 1) {
                    const x = col * (brickWidth + padding) + offsetLeft;
                    const y = row * (brickHeight + padding) + offsetTop;
                    this.bricks.push({
                        x,
                        y,
                        width: brickWidth,
                        height: brickHeight,
                        color: colors[row % colors.length],
                        powerUp: Math.random() < 0.2 ? this.getRandomPowerUp() : null
                    });
                }
            }
        }
    }
    
    getRandomPowerUp() {
        const types = Object.keys(this.themeSettings[this.theme].powerUps);
        return types[Math.floor(Math.random() * types.length)];
    }
    
    setupEventListeners() {
        document.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            this.movePaddle(mouseX - this.paddle.width / 2);
        });
        
        document.addEventListener('keydown', (e) => {
            if ((e.key === 'ArrowLeft' || e.key.toLowerCase() === 'q') && this.gameStarted) {
                this.movePaddle(this.paddle.x - this.paddle.speed);
            }
            if ((e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') && this.gameStarted) {
                this.movePaddle(this.paddle.x + this.paddle.speed);
            }
            if (e.key === ' ' && this.gameStarted) {
                this.activateSpecialPower();
            }
        });
        
        document.addEventListener('click', () => {
            if (this.gameStarted && !this.gameOver) {
                this.balls.forEach(ball => {
                    if (ball.stuck) {
                        ball.stuck = false;
                        ball.dy = -Math.abs(ball.dy);
                    }
                });
            }
        });
        
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
                this.difficulty = e.target.dataset.diff;
            });
        });
        
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('selected'));
                e.target.closest('.theme-btn').classList.add('selected');
                this.theme = e.target.closest('.theme-btn').dataset.theme;
                document.body.className = `theme-${this.theme}`;
            });
        });
        
        document.getElementById('startButton').addEventListener('click', () => {
            this.resetGame();
            this.showGame();
            this.gamesPlayed++;
        });
        
        document.getElementById('menuButton').addEventListener('click', () => {
            this.showMenu();
        });
        
        // Initialize default theme
        document.body.className = `theme-${this.theme}`;
    }
    
    movePaddle(newX) {
        this.paddle.x = Math.min(
            Math.max(newX, 0),
            this.canvas.width - this.paddle.width
        );
    }

    activateSpecialPower() {
        if (!this.powerUpActive) return;

        // Seuls les pouvoirs qui nécessitent une action manuelle sont gérés ici
        switch(this.powerUpActive.type) {
            case 'sticky':
                this.balls.forEach(ball => ball.stuck = false);
                break;
            case 'laser':
                this.shootLasers();
                break;
        }
    }

    shootLasers() {
        const laserSpeed = 10;
        this.lasers.push(
            {
                x: this.paddle.x + 10,
                y: this.paddle.y,
                dy: -laserSpeed
            },
            {
                x: this.paddle.x + this.paddle.width - 10,
                y: this.paddle.y,
                dy: -laserSpeed
            }
        );
    }
    
    resetGame() {
        this.balls = [{
            radius: 10,
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            dx: this.difficultySettings[this.difficulty].ballSpeed,
            dy: -this.difficultySettings[this.difficulty].ballSpeed,
            stuck: false,
            powerball: false
        }];
        
        this.paddle.width = this.difficultySettings[this.difficulty].paddleWidth;
        this.score = 0;
        this.bricks = [];
        this.powerUps = [];
        this.powerUpActive = null;
        this.lasers = [];
        this.initBricks();
        this.gameStarted = true;
        this.gameOver = false;
        document.getElementById('scoreValue').textContent = this.score;
    }
    
    update() {
        if (!this.gameStarted || this.gameOver) return;
        
        // Update lasers
        if (this.lasers.length > 0) {
            this.lasers = this.lasers.filter(laser => {
                laser.y += laser.dy;
                
                // Check collision with bricks
                this.bricks = this.bricks.filter(brick => {
                    if (laser.x > brick.x && 
                        laser.x < brick.x + brick.width &&
                        laser.y > brick.y && 
                        laser.y < brick.y + brick.height) {
                        this.score += 10;
                        document.getElementById('scoreValue').textContent = this.score;
                        if (brick.powerUp) {
                            this.powerUps.push({
                                type: brick.powerUp,
                                x: brick.x + brick.width / 2,
                                y: brick.y + brick.height / 2
                            });
                        }
                        return false;
                    }
                    return true;
                });
                
                return laser.y > 0;
            });
        }
        
        // Update balls
        this.balls = this.balls.filter(ball => {
            if (ball.stuck) {
                ball.x = this.paddle.x + this.paddle.width / 2;
                ball.y = this.paddle.y - ball.radius;
                return true;
            }
            
            const prevX = ball.x;
            const prevY = ball.y;
            
            ball.x += ball.dx;
            ball.y += ball.dy;
            
            // Wall collisions with minimum angle
            if (ball.x + ball.radius > this.canvas.width || ball.x - ball.radius < 0) {
                ball.x = prevX;
                ball.dx = -ball.dx;
                
                // Ensure minimum horizontal movement
                const minSpeed = this.difficultySettings[this.difficulty].ballSpeed * 0.3;
                if (Math.abs(ball.dx) < minSpeed) {
                    ball.dx = ball.dx > 0 ? minSpeed : -minSpeed;
                }
            }
            if (ball.y - ball.radius < 0) {
                ball.y = prevY;
                ball.dy = -ball.dy;
            }
            
            // Keep ball in play if it's the last one
            if (ball.y + ball.radius > this.canvas.height) {
                if (this.balls.length <= 1) {
                    this.gameOver = true;
                    if (this.score > this.highScore) {
                        this.highScore = this.score;
                        localStorage.setItem('highScore', this.highScore);
                    }
                }
                return false;
            }
            
            // Paddle collision with improved angle calculation
            if (ball.y + ball.radius > this.paddle.y &&
                ball.x > this.paddle.x &&
                ball.x < this.paddle.x + this.paddle.width &&
                ball.dy > 0) { // Only collide when ball is moving down
                
                ball.y = this.paddle.y - ball.radius; // Place ball exactly at collision point
                
                // Calculate new angle based on hit position
                const hitPoint = (ball.x - this.paddle.x) / this.paddle.width;
                const maxAngle = Math.PI / 3; // 60 degrees
                const angle = (hitPoint - 0.5) * maxAngle;
                
                // Set new velocity based on angle while maintaining speed
                const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
                ball.dx = speed * Math.sin(angle);
                ball.dy = -speed * Math.cos(angle);
                
                // Check if power-up is active
                if (this.powerUpActive && this.powerUpActive.type === 'sticky') {
                    ball.stuck = true;
                }
            }
            
            // Brick collisions
            this.bricks = this.bricks.filter(brick => {
                if (ball.x > brick.x &&
                    ball.x < brick.x + brick.width &&
                    ball.y > brick.y &&
                    ball.y < brick.y + brick.height) {
                    if (!ball.powerball) {
                        ball.dy = -ball.dy;
                    }
                    this.score += 10;
                    document.getElementById('scoreValue').textContent = this.score;
                    
                    if (brick.powerUp) {
                        this.powerUps.push({
                            type: brick.powerUp,
                            x: brick.x + brick.width / 2,
                            y: brick.y + brick.height / 2
                        });
                    }
                    return false;
                }
                return true;
            });
            
            return true;
        });
        
        // Update power-ups
        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.y += 2;
            
            if (powerUp.y > this.canvas.height) return false;
            
            if (powerUp.y + 20 > this.paddle.y &&
                powerUp.x > this.paddle.x &&
                powerUp.x < this.paddle.x + this.paddle.width) {
                this.activatePowerUp(powerUp.type);
                return false;
            }
            
            return true;
        });
        
        // Win condition
        if (this.bricks.length === 0) {
            this.gameOver = true;
            this.saveThemeScore();
            setTimeout(() => {
                this.showMenu();
            }, 2000);
        }
    }
    
    activatePowerUp(type) {
        this.powerUpActive = { type, time: Date.now() };
        
        switch(type) {
            case 'sticky':
                // Le pouvoir caramel est géré manuellement
                break;
            case 'laser':
                // Les lasers sont gérés manuellement
                break;
            case 'growth':
                // Pouvoir de la forêt - Agrandit le paddle
                this.paddle.width *= 1.5;
                setTimeout(() => {
                    this.paddle.width = this.difficultySettings[this.difficulty].paddleWidth;
                    if (this.powerUpActive && this.powerUpActive.type === 'growth') {
                        this.powerUpActive = null;
                    }
                }, 5000);
                break;
            case 'heat':
                // Pouvoir cappuccino - Traverse les briques
                this.balls.forEach(ball => {
                    ball.powerball = true;
                    setTimeout(() => {
                        if (ball) ball.powerball = false;
                    }, 5000);
                });
                setTimeout(() => {
                    if (this.powerUpActive && this.powerUpActive.type === 'heat') {
                        this.powerUpActive = null;
                    }
                }, 5000);
                break;
            default:
                // Bonus de points pour les autres power-ups
                this.score += 50;
                document.getElementById('scoreValue').textContent = this.score;
                this.powerUpActive = null;
                break;
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw lasers
        this.ctx.fillStyle = this.themeSettings[this.theme].ball;
        this.lasers.forEach(laser => {
            this.ctx.fillRect(laser.x - 2, laser.y - 10, 4, 10);
        });
        
        // Draw paddle
        this.ctx.fillStyle = this.themeSettings[this.theme].paddle;
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        
        // Draw balls with powerball effect
        this.balls.forEach(ball => {
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            
            if (ball.powerball) {
                this.ctx.fillStyle = '#FFD700';
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = '#FFD700';
            } else {
                this.ctx.fillStyle = this.themeSettings[this.theme].ball;
                this.ctx.shadowBlur = 0;
            }
            
            this.ctx.fill();
            this.ctx.closePath();
            this.ctx.shadowBlur = 0;
        });
        
        // Draw bricks
        this.bricks.forEach(brick => {
            this.ctx.fillStyle = brick.color;
            this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            this.themeSettings[this.theme].pattern(brick);
        });
        
        // Draw power-ups
        this.powerUps.forEach(powerUp => {
            const powerUpStyle = this.themeSettings[this.theme].powerUps[powerUp.type];
            this.ctx.font = powerUpStyle.size + ' Arial';
            this.ctx.fillStyle = powerUpStyle.color;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                powerUpStyle.emoji,
                powerUp.x,
                powerUp.y
            );
        });
        
        // Draw active power-up indicator
        if (this.powerUpActive) {
            const powerUpStyle = this.themeSettings[this.theme].powerUps[this.powerUpActive.type];
            this.ctx.font = '24px Arial';
            this.ctx.fillStyle = powerUpStyle.color;
            this.ctx.textAlign = 'left';
            this.ctx.fillText(
                `${powerUpStyle.emoji} Actif`,
                10,
                30
            );
        }
        
        // Draw game over or win message
        if (this.gameOver) {
            this.ctx.fillStyle = this.themeSettings[this.theme].paddle;
            this.ctx.font = '48px Fredoka';
            this.ctx.textAlign = 'center';
            const message = this.bricks.length === 0 ? '🎉 Victoire ! 🎉' : '💔 Game Over 💔';
            this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2);
        }
    }
}

// Start the game
const game = new Game();

function gameLoop() {
    game.update();
    game.draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
