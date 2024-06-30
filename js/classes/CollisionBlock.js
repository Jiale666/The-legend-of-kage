class CollisionBlock {
    constructor({ position, width = 16, height = 16 }) {
        this.position = position;
        this.width = width;
        this.height = height;
    }

    draw() {
        // Comment out or remove the drawing code
        // fill(255, 0, 0, 127); // Using p5.js fill function
        // rect(this.position.x, this.position.y, this.width, this.height); // Using p5.js rect function
    }

    update() {
        this.draw();
    }
}
