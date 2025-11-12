"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  fishId?: string;
  fishImage?: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    question: "What is the largest fish in the ocean?",
    options: ["Great White Shark", "Whale Shark", "Blue Whale", "Manta Ray"],
    correctAnswer: 1,
    difficulty: "easy",
    points: 10,
  },
  {
    id: "q2",
    question: "Which fish can change its color to match its surroundings?",
    options: ["Clownfish", "Flounder", "Tuna", "Salmon"],
    correctAnswer: 1,
    difficulty: "medium",
    points: 20,
  },
  {
    id: "q3",
    question: "What is the fastest fish in the ocean?",
    options: ["Sailfish", "Marlin", "Tuna", "Swordfish"],
    correctAnswer: 0,
    difficulty: "medium",
    points: 20,
  },
  {
    id: "q4",
    question: "How many hearts does an octopus have?",
    options: ["1", "2", "3", "4"],
    correctAnswer: 2,
    difficulty: "hard",
    points: 30,
  },
  {
    id: "q5",
    question: "Which fish is known for its electrical discharge?",
    options: ["Electric Eel", "Catfish", "Stingray", "Barracuda"],
    correctAnswer: 0,
    difficulty: "easy",
    points: 10,
  },
  {
    id: "q6",
    question: "What percentage of Earth's oxygen is produced by the ocean?",
    options: ["30%", "50%", "70%", "90%"],
    correctAnswer: 2,
    difficulty: "hard",
    points: 30,
  },
  {
    id: "q7",
    question: "Which fish can live in both saltwater and freshwater?",
    options: ["Goldfish", "Salmon", "Tuna", "Shark"],
    correctAnswer: 1,
    difficulty: "medium",
    points: 20,
  },
  {
    id: "q8",
    question: "What is the deepest part of the ocean called?",
    options: [
      "Mariana Trench",
      "Atlantic Trench",
      "Pacific Abyss",
      "Deep Blue",
    ],
    correctAnswer: 0,
    difficulty: "easy",
    points: 10,
  },
];

export default function QuizPage() {
  const { data: session } = useSession();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(
    new Array(QUIZ_QUESTIONS.length).fill(false)
  );
  const [quizCompleted, setQuizCompleted] = useState(false);

  const question = QUIZ_QUESTIONS[currentQuestion];

  const handleAnswer = (answerIndex: number) => {
    if (answeredQuestions[currentQuestion]) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const isCorrect = answerIndex === question.correctAnswer;
    if (isCorrect) {
      setScore(score + question.points);
    }

    const newAnswered = [...answeredQuestions];
    newAnswered[currentQuestion] = true;
    setAnsweredQuestions(newAnswered);

    // Check if quiz is completed
    if (newAnswered.every((a) => a)) {
      setTimeout(() => {
        setQuizCompleted(true);
      }, 2000);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setAnsweredQuestions(new Array(QUIZ_QUESTIONS.length).fill(false));
    setQuizCompleted(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-500";
      case "medium":
        return "text-yellow-500";
      case "hard":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  if (quizCompleted) {
    const totalPoints = QUIZ_QUESTIONS.reduce((sum, q) => sum + q.points, 0);
    const percentage = Math.round((score / totalPoints) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center">
            <div className="text-6xl mb-4">
              {percentage >= 80 ? "🏆" : percentage >= 60 ? "🎉" : "📚"}
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Quiz Completed!
            </h2>
            <div className="text-6xl font-bold text-yellow-400 mb-4">
              {score}/{totalPoints}
            </div>
            <div className="text-2xl text-white mb-2">
              {percentage}% Correct
            </div>
            <div className="text-lg text-white/80 mb-8">
              {percentage >= 80
                ? "Outstanding! You're a marine expert! 🌟"
                : percentage >= 60
                ? "Great job! Keep learning! 💪"
                : "Keep studying! You'll get there! 📖"}
            </div>
            <button
              onClick={resetQuiz}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl"
            >
              Take Quiz Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            🧠 Marine Quiz
          </h1>
          <p className="text-white/80">Test your ocean knowledge!</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-medium">
              Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
            </span>
            <span className="text-yellow-400 font-bold">Score: {score}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-300"
              style={{
                width: `${
                  ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 mb-6">
          <div className="flex items-center justify-between mb-6">
            <span
              className={`px-4 py-1 rounded-full font-medium ${getDifficultyColor(
                question.difficulty
              )} bg-white/20`}
            >
              {question.difficulty.toUpperCase()}
            </span>
            <span className="text-yellow-400 font-bold">
              +{question.points} points
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
            {question.question}
          </h2>

          <div className="space-y-4">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correctAnswer;
              const showCorrect = showResult && isCorrect;
              const showIncorrect = showResult && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={answeredQuestions[currentQuestion]}
                  className={`w-full p-4 rounded-xl font-medium text-lg text-left transition-all ${
                    showCorrect
                      ? "bg-green-500 text-white border-2 border-green-400"
                      : showIncorrect
                      ? "bg-red-500 text-white border-2 border-red-400"
                      : "bg-white/10 hover:bg-white/20 text-white border-2 border-white/20 hover:border-white/40"
                  } ${
                    answeredQuestions[currentQuestion]
                      ? "cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        showCorrect
                          ? "bg-white text-green-500"
                          : showIncorrect
                          ? "bg-white text-red-500"
                          : "bg-white/20 text-white"
                      }`}
                    >
                      {showCorrect
                        ? "✓"
                        : showIncorrect
                        ? "✗"
                        : String.fromCharCode(65 + index)}
                    </div>
                    {option}
                  </div>
                </button>
              );
            })}
          </div>

          {showResult && (
            <div
              className={`mt-6 p-4 rounded-lg ${
                selectedAnswer === question.correctAnswer
                  ? "bg-green-500/20 border border-green-500/50"
                  : "bg-red-500/20 border border-red-500/50"
              }`}
            >
              <p className="text-white font-medium">
                {selectedAnswer === question.correctAnswer
                  ? "🎉 Correct! Great job!"
                  : `❌ Incorrect. The correct answer was: ${
                      question.options[question.correctAnswer]
                    }`}
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all"
          >
            ← Previous
          </button>

          <div className="flex gap-2">
            {QUIZ_QUESTIONS.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  answeredQuestions[index]
                    ? "bg-green-500"
                    : index === currentQuestion
                    ? "bg-yellow-400"
                    : "bg-white/20"
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextQuestion}
            disabled={currentQuestion === QUIZ_QUESTIONS.length - 1}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
