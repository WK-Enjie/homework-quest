// Main application logic

// Screen management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    errorText.textContent = message;
    errorElement.classList.remove('hidden');
    
    setTimeout(() => {
        errorElement.classList.add('hidden');
    }, 4000);
}

// Start quest
async function startQuest() {
    const questCode = document.getElementById('questCode').value.trim();
    
    if (!questCode) {
        showError('Please enter a quest code!');
        return;
    }

    try {
        // Show loading state
        const startButton = document.querySelector('#startScreen .btn-primary');
        startButton.textContent = 'Loading Quest...';
        startButton.disabled = true;

        // Load quest data
        await questHandler.loadQuest(questCode);
        
        // Display quest
        displayQuest();
        
        // Start timer
        questTimer.reset();
        questTimer.start();
        
        // Show quest screen
        showScreen('questScreen');
        
    } catch (error) {
        showError(error.message);
        
        // Reset button
        const startButton = document.querySelector('#startScreen .btn-primary');
        startButton.textContent = 'Start Quest';
        startButton.disabled = false;
    }
}

// Display quest content
function displayQuest() {
    const questData = questHandler.getQuestData();
    
    // Set quest header info
    document.getElementById('questTitle').textContent = questData.questTitle;
    document.getElementById('subject').textContent = questData.subject || 'General';
    document.getElementById('difficulty').textContent = questData.difficulty || 'Medium';
    document.getElementById('description').textContent = questData.description || 'Complete all questions to finish this quest!';
    
    // Set difficulty badge color
    const difficultyBadge = document.getElementById('difficulty');
    const difficulty = (questData.difficulty || 'Medium').toLowerCase();
    if (difficulty === 'easy') {
        difficultyBadge.style.background = '#d4edda';
        difficultyBadge.style.color = '#155724';
    } else if (difficulty === 'hard') {
        difficultyBadge.style.background = '#f8d7da';
        difficultyBadge.style.color = '#721c24';
    } else {
        difficultyBadge.style.background = '#fff3cd';
        difficultyBadge.style.color = '#856404';
    }
    
    // Set subject badge color
    const subjectBadge = document.getElementById('subject');
    subjectBadge.style.background = '#e7f3ff';
    subjectBadge.style.color = '#004085';
    
    // Display questions
    const questionsContainer = document.getElementById('questionsContainer');
    questionsContainer.innerHTML = '';
    
    questData.questions.forEach((question, index) => {
        const questionCard = createQuestionCard(question, index);
        questionsContainer.appendChild(questionCard);
    });
}

// Create question card with stacked fraction support
function createQuestionCard(question, index) {
    const card = document.createElement('div');
    card.className = 'question-card';
    card.id = `question-${question.id}`;
    
    // Problem set header (if exists)
    let problemSetHeader = '';
    if (question.problemSet) {
        problemSetHeader = `<div class="problem-set-label">📚 ${question.problemSet}</div>`;
    }
    
    const header = `
        <div class="question-header">
            <span class="question-number">Question ${question.id}</span>
            <span class="question-points">⭐ ${question.points || 10} points</span>
        </div>
    `;
    
    // Format question text with stacked fractions
    const formattedQuestion = fractionFormatter.formatStacked(question.question);
    const questionText = `<div class="question-text">${formattedQuestion}</div>`;
    
    // Optional hint display
    let hintDisplay = '';
    if (question.hint) {
        const formattedHint = fractionFormatter.formatStacked(question.hint);
        hintDisplay = `<div class="question-hint">💡 Hint: ${formattedHint}</div>`;
    }
    
    let inputArea = '';
    
    if (question.type === 'mcq') {
        inputArea = '<div class="options-container">';
        question.options.forEach((option, optIndex) => {
            // Format fractions in options using stacked format
            const formattedOption = fractionFormatter.formatStacked(option);
            // Escape quotes in options to prevent breaking HTML
            const escapedOption = option.replace(/'/g, "\\'").replace(/"/g, '&quot;');
            inputArea += `
                <button class="option-btn" onclick="selectOption(${question.id}, '${escapedOption}', this)">
                    ${formattedOption}
                </button>
            `;
        });
        inputArea += '</div>';
    } else if (question.type === 'fill') {
        inputArea = `
            <input type="text" 
                   class="fill-input" 
                   id="fill-${question.id}" 
                   placeholder="Type your answer here (e.g., 3/4 or 2 3/4)..."
                   oninput="saveFillAnswer(${question.id}, this.value)">
        `;
    }
    
    card.innerHTML = problemSetHeader + header + questionText + hintDisplay + inputArea;
    return card;
}

// Handle MCQ selection
function selectOption(questionId, answer, buttonElement) {
    // Remove selection from all options in this question
    const questionCard = document.getElementById(`question-${questionId}`);
    questionCard.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Add selection to clicked option
    buttonElement.classList.add('selected');
    
    // Save answer
    questHandler.saveAnswer(questionId, answer);
}

// Handle fill-in-the-blank input
function saveFillAnswer(questionId, answer) {
    questHandler.saveAnswer(questionId, answer);
}

// Submit quest
function submitQuest() {
    // Check if all questions are answered
    if (!questHandler.isQuestComplete()) {
        const answered = Object.keys(questHandler.userAnswers).length;
        const total = questHandler.getTotalQuestions();
        const unanswered = total - answered;
        
        const confirmSubmit = confirm(
            `You have ${unanswered} unanswered question(s). Submit anyway?`
        );
        
        if (!confirmSubmit) {
            return;
        }
    }
    
    // Stop timer
    questTimer.stop();
    
    // Check answers
    const results = questHandler.checkAnswers();
    
    // Display results
    displayResults(results);
    
    // Show results screen
    showScreen('resultsScreen');
}

// Display results with stacked fraction support
function displayResults(results) {
    // Set stats
    document.getElementById('scoreValue').textContent = 
        `${results.earnedPoints}/${results.totalPoints}`;
    
    document.getElementById('correctValue').textContent = 
        `${results.correctAnswers}/${results.totalQuestions}`;
    
    document.getElementById('timeValue').textContent = questTimer.getFormattedTime();
    
    document.getElementById('percentageValue').textContent = `${results.percentage}%`;
    
    // Set achievement badge
    const achievementBadge = document.getElementById('achievementBadge');
    if (results.percentage >= 90) {
        achievementBadge.className = 'achievement-badge gold';
        achievementBadge.textContent = '🏆 Outstanding! Gold Achievement!';
    } else if (results.percentage >= 75) {
        achievementBadge.className = 'achievement-badge silver';
        achievementBadge.textContent = '🥈 Great Job! Silver Achievement!';
    } else if (results.percentage >= 60) {
        achievementBadge.className = 'achievement-badge bronze';
        achievementBadge.textContent = '🥉 Well Done! Bronze Achievement!';
    } else {
        achievementBadge.className = 'achievement-badge';
        achievementBadge.style.background = '#f0f0f0';
        achievementBadge.style.color = '#666';
        achievementBadge.textContent = '💪 Keep Practicing! You Can Do Better!';
    }
    
    // Display detailed breakdown
    const breakdownContainer = document.getElementById('resultsBreakdown');
    breakdownContainer.innerHTML = '<h3 style="margin-bottom: 20px;">📋 Detailed Results</h3>';
    
    results.details.forEach(detail => {
        const resultItem = document.createElement('div');
        resultItem.className = `result-item ${detail.isCorrect ? 'correct' : 'incorrect'}`;
        
        // Format fractions in questions and answers using stacked format
        const formattedQuestion = fractionFormatter.formatStacked(detail.questionText);
        const formattedUserAnswer = fractionFormatter.formatStacked(detail.userAnswer);
        const formattedCorrectAnswer = fractionFormatter.formatStacked(detail.correctAnswer);
        
        resultItem.innerHTML = `
            <div class="result-question">
                <div><strong>Q${detail.questionNumber}:</strong> ${formattedQuestion}</div>
                <div class="your-answer">Your answer: ${formattedUserAnswer}</div>
                ${!detail.isCorrect ? `<div class="correct-answer">Correct answer: ${formattedCorrectAnswer}</div>` : ''}
            </div>
            <div class="result-status">${detail.isCorrect ? '✓ Correct' : '✗ Incorrect'}</div>
        `;
        
        breakdownContainer.appendChild(resultItem);
    });
}

// Allow Enter key to start quest
document.addEventListener('DOMContentLoaded', function() {
    const questCodeInput = document.getElementById('questCode');
    if (questCodeInput) {
        questCodeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                startQuest();
            }
        });
    }
});

// Confirmation before leaving during quest
window.addEventListener('beforeunload', function(e) {
    if (questTimer.isRunning) {
        e.preventDefault();
        e.returnValue = 'You have a quest in progress. Are you sure you want to leave?';
        return e.returnValue;
    }
});