# 🎮 Homework Quest

A gamified homework system for students aged 10-16. Complete quests (homework) and track your progress!

## Features
- 🎯 Quest-based homework (MCQ & Fill-in-the-blanks)
- ⏱️ Completion timer
- 🏆 Achievement tracking
- 📊 Results summary
- 🎨 Clean, student-friendly interface

## How to Use

### For Students:
1. Open `index.html` in your browser
2. Enter your Quest Code (filename without .json)
3. Complete the quest!
4. View your results and completion time

### For Teachers:
1. Create JSON quest files (see format below)
2. Upload to `/quests/` folder
3. Share the quest code (filename) with students

## Quest File Format

```json
{
  "questTitle": "Your Quest Title",
  "subject": "Mathematics",
  "difficulty": "Medium",
  "description": "A brief description",
  "questions": [
    {
      "id": 1,
      "type": "mcq",
      "question": "What is 2 + 2?",
      "options": ["3", "4", "5", "6"],
      "answer": "4",
      "points": 10
    },
    {
      "id": 2,
      "type": "fill",
      "question": "The capital of Singapore is ___.",
      "answer": "Singapore",
      "points": 10
    }
  ]
}