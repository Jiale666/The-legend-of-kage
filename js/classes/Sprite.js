class Sprite {
    constructor({ position, imageSrc, frameRate = 1, frameBuffer = 3, scale = 1 }) {
        this.position = position;
        this.scale = scale;
        this.image = imageSrc;
        this.frameRate = frameRate;
        this.currentFrame = 0;
        this.frameBuffer = frameBuffer;
        this.elapsedFrames = 0;
    }

    draw() {
        if (!this.image) return;

        const cropbox = {
            x: this.currentFrame * (this.image.width / this.frameRate),
            y: 0,
            width: this.image.width / this.frameRate,
            height: this.image.height,
        };

        image(
            this.image,
            this.position.x,
            this.position.y,
            cropbox.width * this.scale,
            cropbox.height * this.scale,
            cropbox.x,
            cropbox.y,
            cropbox.width,
            cropbox.height
        );
    }

    update() {
        this.draw();
        this.updateFrames();
    }

    updateFrames() {
        this.elapsedFrames++;

        if (this.elapsedFrames % this.frameBuffer === 0) {
            if (this.currentFrame < this.frameRate - 1) this.currentFrame++;
            else this.currentFrame = 0;
        }
    }
}
