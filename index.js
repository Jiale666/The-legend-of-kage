let bgImage, gameOverImage, openImage, userImage, player, enemyImage, dartImage;
let collisionBlocks = [];
let platformCollisionBlocks = [];
let keys = {
    d: { pressed: false },
    a: { pressed: false }
};
let camera;
const gravity = 0.1;
const playerSpeed = 2; // Player movement speed
const enemySpeed = 0.5; // Consistent enemy movement speed
let enemies = [];
let darts = [];
let score = 0;
let highestScore = 0;
let timeLeft = 90; // 90 seconds game duration
let gameInterval, countdownInterval;
let gameOverFlag = false;
let gameStarted = false; // Flag to check if the game has started

function preload() {
    bgImage = loadImage('./img/background.png');
    gameOverImage = loadImage('./img/game.png'); // Preload the game over image
    openImage = loadImage('./img/open.png'); // Preload the opening image
    userImage = loadImage('./img/user.png'); // Preload the user image
    let idleImage = loadImage('./img/warrior/Idle.png');
    let runImage = loadImage('./img/warrior/Run.png');
    let jumpImage = loadImage('./img/warrior/Jump.png');
    let fallImage = loadImage('./img/warrior/Fall.png');
    let fallLeftImage = loadImage('./img/warrior/FallLeft.png');
    let runLeftImage = loadImage('./img/warrior/RunLeft.png');
    let idleLeftImage = loadImage('./img/warrior/IdleLeft.png');
    let jumpLeftImage = loadImage('./img/warrior/JumpLeft.png');
    enemyImage = loadImage('./img/enemy.png');
    dartImage = loadImage('./img/dart.png');

    player = new Player({
        position: { x: 100, y: 300 },
        collisionBlocks,
        platformCollisionBlocks,
        imageSrc: idleImage,
        frameRate: 8,
        animations: {
            Idle: { imageSrc: idleImage, frameRate: 8, frameBuffer: 3 },
            Run: { imageSrc: runImage, frameRate: 8, frameBuffer: 5 },
            Jump: { imageSrc: jumpImage, frameRate: 2, frameBuffer: 3 },
            Fall: { imageSrc: fallImage, frameRate: 2, frameBuffer: 3 },
            FallLeft: { imageSrc: fallLeftImage, frameRate: 2, frameBuffer: 3 },
            RunLeft: { imageSrc: runLeftImage, frameRate: 8, frameBuffer: 5 },
            IdleLeft: { imageSrc: idleLeftImage, frameRate: 8, frameBuffer: 3 },
            JumpLeft: { imageSrc: jumpLeftImage, frameRate: 2, frameBuffer: 3 },
        },
        gravity
    });

    const floorCollisions2D = [];
    for (let i = 0; i < floorCollisions.length; i += 64) {
        floorCollisions2D.push(floorCollisions.slice(i, i + 64));
    }

    floorCollisions2D.forEach((row, y) => {
        row.forEach((symbol, x) => {
            if (symbol === 202) {
                collisionBlocks.push(new CollisionBlock({ position: { x: x * 16, y: y * 16 } }));
            }
        });
    });

    const platformCollisions2D = [];
    for (let i = 0; i < platformCollisions.length; i += 64) {
        platformCollisions2D.push(platformCollisions.slice(i, i + 64));
    }

    platformCollisions2D.forEach((row, y) => {
        row.forEach((symbol, x) => {
            if (symbol === 202) {
                platformCollisionBlocks.push(new CollisionBlock({ position: { x: x * 16, y: y * 16 }, height: 4 }));
            }
        });
    });

    camera = { position: { x: 0, y: -432 + height / 4 } };
}

function setup() {
    createCanvas(1024, 576);
    highestScore = getHighestScore(); // Load the highest score from localStorage
    noLoop(); // Stop draw loop until game starts
}

function draw() {
    if (!gameStarted) {
        displayOpeningScreen();
        return;
    }

    if (timeLeft <= 0 && !gameOverFlag) {
        gameOver();
    }

    if (gameOverFlag) {
        return;
    }

    background(255);
    image(bgImage, 0, 0, width, height);

    player.checkForHorizontalCanvasCollision();
    player.update();

    player.velocity.x = 0;
    if (keys.d.pressed) {
        player.switchSprite('Run');
        player.velocity.x = playerSpeed;
        player.lastDirection = 'right';
        player.shouldPanCameraToTheLeft({ canvas, camera });
    } else if (keys.a.pressed) {
        player.switchSprite('RunLeft');
        player.velocity.x = -playerSpeed;
        player.lastDirection = 'left';
        player.shouldPanCameraToTheRight({ canvas, camera });
    } else if (player.velocity.y === 0) {
        if (player.lastDirection === 'right') player.switchSprite('Idle');
        else player.switchSprite('IdleLeft');
    }

    if (player.velocity.y < 0) {
        player.shouldPanCameraDown({ canvas, camera });
        if (player.lastDirection === 'right') player.switchSprite('Jump');
        else player.switchSprite('JumpLeft');
    } else if (player.velocity.y > 0) {
        player.shouldPanCameraUp({ canvas, camera });
        if (player.lastDirection === 'right') player.switchSprite('Fall');
        else player.switchSprite('FallLeft');
    }

    collisionBlocks.forEach(block => block.update());
    platformCollisionBlocks.forEach(block => block.update());

    enemies.forEach(enemy => enemy.update());

    darts.forEach((dart, index) => {
        dart.update();
        enemies.forEach((enemy, enemyIndex) => {
            if (dart.hits(enemy)) {
                darts.splice(index, 1);
                enemies.splice(enemyIndex, 1);
                score += 10;
            }
        });
    });

    displayScore();
    displayHighestScore();
    displayTimer();
}

function keyPressed() {
    const keyLower = key.toLowerCase();
    if (keyLower === 'd') keys.d.pressed = true;
    if (keyLower === 'a') keys.a.pressed = true;
    if (keyLower === 'w') player.velocity.y = -4;
    if (keyLower === 'j') shootDart(); // Shoot dart on 'j' key press
    if (keyCode === ENTER) {
        if (gameOverFlag) {
            resetGame();
        } else if (!gameStarted) {
            startTransition();
        }
    }
}

function keyReleased() {
    const keyLower = key.toLowerCase();
    if (keyLower === 'd') keys.d.pressed = false;
    if (keyLower === 'a') keys.a.pressed = false;
}

function generateEnemy() {
    // Choose a random platform collision block
    let randomBlock = platformCollisionBlocks[Math.floor(Math.random() * platformCollisionBlocks.length)];

    // Position the enemy on top of the chosen platform block
    const x = randomBlock.position.x + (randomBlock.width / 2);
    const y = randomBlock.position.y - 40; // Assuming the enemy height is 40

    const enemy = new Enemy({ position: { x, y }, imageSrc: enemyImage, collisionBlocks, platformCollisionBlocks, gravity, speed: enemySpeed });
    enemies.push(enemy);
    console.log("Enemy generated at:", x, y); // Debug log
}

function shootDart() {
    let dart;
    const dartPositionY = player.position.y + 20; // Adjust the Y position to be slightly below the middle of the character
    if (player.lastDirection === 'right') {
        dart = new Dart({ x: player.position.x + 25, y: dartPositionY, direction: 'right', image: dartImage });
    } else {
        dart = new Dart({ x: player.position.x - 25, y: dartPositionY, direction: 'left', image: dartImage });
    }
    darts.push(dart);
}

function displayScore() {
    if (!gameOverFlag) {
        fill(255);
        textSize(24);
        textAlign(LEFT, TOP);
        text(`Score: ${score}`, 10, 10);
    }
}

function displayHighestScore() {
    if (!gameOverFlag) {
        fill(255);
        textSize(24);
        textAlign(RIGHT, TOP);
        text(`Highest Score: ${highestScore}`, width - 10, 10);
    }
}

function displayTimer() {
    if (!gameOverFlag) {
        textSize(24);
        textAlign(CENTER, TOP);
        if (timeLeft < 10) {
            if (frameCount % 30 < 15) {
                fill('red');
            } else {
                fill(255);
            }
        } else {
            fill(255);
        }
        text(`Time Left: ${timeLeft}`, width / 2, 10);
    }
}

function updateCountdown() {
    if (timeLeft > 0) {
        timeLeft--;
    }
}

function gameOver() {
    clearInterval(gameInterval);
    clearInterval(countdownInterval);
    gameOverFlag = true;

    if (score > highestScore) {
        highestScore = score;
        localStorage.setItem('highestScore', highestScore);
    }

    image(gameOverImage, 0, 0, width, height); // Use the game over image as the background
    fill('black');
    textSize(32);
    textAlign(CENTER, CENTER);
    text(`Game Over ! Your Score: ${score}`, width / 2, height / 2);
    textSize(24);
    text(`Press ENTER to play again`, width / 2, height / 2 + 50);
}

function resetGame() {
    score = 0;
    timeLeft = 90; // Reset the game duration to 90 seconds
    enemies = [];
    darts = [];
    gameOverFlag = false;
    startGame();
}

function startGame() {
    gameStarted = true;
    gameOverFlag = false;
    score = 0;
    timeLeft = 90; // Set the game duration to 90 seconds
    enemies = [];
    darts = [];
    gameInterval = setInterval(generateEnemy, 3000); // Generate enemy every 3 seconds
    countdownInterval = setInterval(updateCountdown, 1000); // Update countdown every second
    loop(); // Start draw loop
}

function startTransition() {
    noLoop(); // Stop draw loop during transition
    background(userImage); // Display the user image
    setTimeout(() => {
        startGame(); // Start the game after 5 seconds
    }, 5000); // 5000 milliseconds = 5 seconds
}

function getHighestScore() {
    const highest = localStorage.getItem('highestScore');
    return highest ? parseInt(highest) : 0;
}

function displayOpeningScreen() {
    background(openImage); // Display the opening image as the background
    fill('white');
    textSize(32);
    textAlign(CENTER, CENTER);
    text('Please Press ENTER to Start the Game', width / 2, height - 50);
}
