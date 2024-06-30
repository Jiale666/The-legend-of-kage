class Enemy {
    constructor({ position, imageSrc, scale = 0.5, collisionBlocks, platformCollisionBlocks, gravity, speed }) {
        this.position = position;
        this.velocity = { x: Math.random() > 0.5 ? speed : -speed, y: 0 };
        this.image = imageSrc;
        this.scale = scale;
        this.width = 80;
        this.height = 80;
        this.collisionBlocks = collisionBlocks;
        this.platformCollisionBlocks = platformCollisionBlocks;
        this.gravity = gravity;
        this.speed = speed;
        this.hitbox = {
            position: { x: this.position.x, y: this.position.y },
            width: this.width * this.scale,
            height: this.height * this.scale,
        };
    }

    update() {
        this.applyGravity();
        this.checkForVerticalCollisions();
        this.checkForHorizontalCollisions();
        this.position.x += this.velocity.x;

        if (this.position.x < 0 || this.position.x > canvas.width) {
            this.velocity.x *= -1;
        }
        this.draw();
    }

    draw() {
        push();
        translate(this.position.x, this.position.y);
        if (this.velocity.x > 0) {
            // If moving to the right, flip the image horizontally
            scale(-1, 1);
        }
        imageMode(CENTER);
        image(this.image, 0, 0, this.width * this.scale, this.height * this.scale);
        pop();
    }

    applyGravity() {
        this.velocity.y += this.gravity;
        this.position.y += this.velocity.y;
    }

    updateHitbox() {
        this.hitbox.position.x = this.position.x - this.width * this.scale / 2;
        this.hitbox.position.y = this.position.y - this.height * this.scale / 2;
    }

    checkForHorizontalCollisions() {
        this.updateHitbox();
        for (let i = 0; i < this.collisionBlocks.length; i++) {
            const block = this.collisionBlocks[i];
            if (this.hitbox.position.x < block.position.x + block.width &&
                this.hitbox.position.x + this.hitbox.width > block.position.x &&
                this.hitbox.position.y < block.position.y + block.height &&
                this.hitbox.position.y + this.hitbox.height > block.position.y) {
                if (this.velocity.x > 0) {
                    this.position.x = block.position.x - this.hitbox.width / 2;
                    this.velocity.x = -this.speed;
                } else if (this.velocity.x < 0) {
                    this.position.x = block.position.x + block.width + this.hitbox.width / 2;
                    this.velocity.x = this.speed;
                }
            }
        }
    }

    checkForVerticalCollisions() {
        this.updateHitbox();
        for (let i = 0; i < this.collisionBlocks.length; i++) {
            const block = this.collisionBlocks[i];
            if (this.hitbox.position.x < block.position.x + block.width &&
                this.hitbox.position.x + this.hitbox.width > block.position.x &&
                this.hitbox.position.y < block.position.y + block.height &&
                this.hitbox.position.y + this.hitbox.height > block.position.y) {
                if (this.velocity.y > 0) {
                    this.position.y = block.position.y - this.hitbox.height / 2;
                    this.velocity.y = 0;
                } else if (this.velocity.y < 0) {
                    this.position.y = block.position.y + block.height + this.hitbox.height / 2;
                    this.velocity.y = 0;
                }
            }
        }
        // Check for platform collisions
        for (let i = 0; i < this.platformCollisionBlocks.length; i++) {
            const block = this.platformCollisionBlocks[i];
            if (this.hitbox.position.x < block.position.x + block.width &&
                this.hitbox.position.x + this.hitbox.width > block.position.x &&
                this.hitbox.position.y < block.position.y + block.height &&
                this.hitbox.position.y + this.hitbox.height > block.position.y) {
                if (this.velocity.y > 0) {
                    this.position.y = block.position.y - this.hitbox.height / 2;
                    this.velocity.y = 0;
                }
            }
        }
    }
}
