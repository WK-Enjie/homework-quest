// Quest data handler
class QuestHandler {
    constructor() {
        this.questData = null;
        this.userAnswers = {};
        this.currentProgress = 0;
    }

    async loadQuest(questCode) {
        try {
            // Try to load from quests folder
            const response = await fetch(`quests/${questCode}.json`);
            
            if (!response.ok) {
                throw new Error('Quest file not found');
            }

            this.questData = await response.json();
            this.validateQuestData();
            return true;
        } catch (error) {
            console.error('Error loading quest:', error);
            throw new Error(`Could not load quest "${questCode}". Please check the quest code and try again.`);
        }
    }

    validateQuestData() {
        if (!this.questData.questTitle || !this.questData.questions || this.questData.questions.length === 0) {
            throw new Error('Invalid quest data format');
        }

        // Validate each question has required fields
        this.questData.questions.forEach((q, index) => {
            if (!q.type || !q.question || !q.answer) {
                throw new Error(`Question ${index + 1} is missing required fields`);
            }
        });
    }

    getQuestData() {
        return this.questData;
    }

    getTotalQuestions() {
        return this.questData ? this.questData.questions.length : 0;
    }

    getTotalPoints() {
        if (!this.questData) return 0;
        return this.questData.questions.reduce((total, q) => total + (q.points || 10), 0);
    }

    saveAnswer(questionId, answer) {
        this.userAnswers[questionId] = answer;
        this.updateProgress();
    }

    updateProgress() {
        const answered = Object.keys(this.userAnswers).length;
        const total = this.getTotalQuestions();
        this.currentProgress = (answered / total) * 100;
        
        // Update progress bar
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            progressFill.style.width = `${this.currentProgress}%`;
        }
    }

    checkAnswers() {
        const results = {
            totalQuestions: this.getTotalQuestions(),
            correctAnswers: 0,
            incorrectAnswers: 0,
            totalPoints: this.getTotalPoints(),
            earnedPoints: 0,
            details: []
        };

        this.questData.questions.forEach(question => {
            const userAnswer = this.userAnswers[question.id];
            const correctAnswer = question.answer;
            
            // Normalize answers for comparison
            const isCorrect = this.compareAnswers(userAnswer, correctAnswer);
            
            if (isCorrect) {
                results.correctAnswers++;
                results.earnedPoints += (question.points || 10);
            } else {
                results.incorrectAnswers++;
            }

            results.details.push({
                questionNumber: question.id,
                questionText: question.question,
                userAnswer: userAnswer || 'Not answered',
                correctAnswer: correctAnswer,
                isCorrect: isCorrect,
                points: isCorrect ? (question.points || 10) : 0
            });
        });

        results.percentage = Math.round((results.correctAnswers / results.totalQuestions) * 100);
        
        return results;
    }

    compareAnswers(userAnswer, correctAnswer) {
        if (!userAnswer) return false;
        
        // Normalize both answers (trim, lowercase)
        const normalizedUser = String(userAnswer).trim().toLowerCase();
        const normalizedCorrect = String(correctAnswer).trim().toLowerCase();
        
        return normalizedUser === normalizedCorrect;
    }

    isQuestComplete() {
        return Object.keys(this.userAnswers).length === this.getTotalQuestions();
    }

    reset() {
        this.questData = null;
        this.userAnswers = {};
        this.currentProgress = 0;
    }
}

// Create global quest handler instance
const questHandler = new QuestHandler();