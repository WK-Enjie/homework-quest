// Timer functionality
class QuestTimer {
    constructor() {
        this.startTime = null;
        this.elapsedTime = 0;
        this.timerInterval = null;
        this.isRunning = false;
    }

    start() {
        if (!this.isRunning) {
            this.startTime = Date.now() - this.elapsedTime;
            this.timerInterval = setInterval(() => this.update(), 1000);
            this.isRunning = true;
        }
    }

    stop() {
        if (this.isRunning) {
            clearInterval(this.timerInterval);
            this.isRunning = false;
        }
    }

    reset() {
        this.stop();
        this.elapsedTime = 0;
        this.updateDisplay('00:00');
    }

    update() {
        this.elapsedTime = Date.now() - this.startTime;
        const time = this.formatTime(this.elapsedTime);
        this.updateDisplay(time);
    }

    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    updateDisplay(time) {
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            timerElement.textContent = time;
        }
    }

    getFormattedTime() {
        return this.formatTime(this.elapsedTime);
    }

    getElapsedSeconds() {
        return Math.floor(this.elapsedTime / 1000);
    }
}

// Create global timer instance
const questTimer = new QuestTimer();