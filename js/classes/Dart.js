// dart.js

class Dart {
    constructor({ x, y, direction, image }) {
        this.position = createVector(x, y); // Using p5.js createVector for position
        this.direction = direction;
        this.image = image;
        this.speed = 4;
        this.width = 20; // Adjust the width according to your dart image
        this.height = 10; // Adjust the height according to your dart image
    }

    update() {
        if (this.direction === 'right') {
            this.position.x += this.speed;
        } else {
            this.position.x -= this.speed;
        }
        this.draw();
    }

    draw() {
        push();
        translate(this.position.x, this.position.y);
        imageMode(CENTER);
        if (this.direction === 'left') {
            // Rotate the image for left direction
            rotate(PI);
        }
        image(this.image, 0, 0, this.width, this.height);
        pop();
    }

    hits(enemy) {
        // Adjusted collision detection based on enemy's position and size
        return (
            this.position.x > enemy.position.x - enemy.width / 2 &&
            this.position.x < enemy.position.x + enemy.width / 2 &&
            this.position.y > enemy.position.y - enemy.height / 2 &&
            this.position.y < enemy.position.y + enemy.height / 2
        );
    }
}
