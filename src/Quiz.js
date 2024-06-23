import React, { useState, useEffect } from "react";
import { questiondata } from "./QuestionData";
import classes from "./Quiz.module.css";

const Quiz = () => {
  const initialTime = 600;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    return JSON.parse(localStorage.getItem("currentQUestionIndex")) || 0;
  });
  const [selectedOptions, setSelectedOption] = useState(() => {
    return JSON.parse(localStorage.getItem("selectedOptions")) || null;
  });
  const [score, setScore] = useState(() => {
    return JSON.parse(localStorage.getItem("score")) || 0;
  });
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [fullscreen, setFullscreen] = useState(false);
  const [isInFullscreen, setIsInFullscreen] = useState(false);

  useEffect(() => {
    const savedTimeLeft = JSON.parse(localStorage.getItem("timeLeft"));
    if (savedTimeLeft && !showResult) {
      setTimeLeft(savedTimeLeft);
    } else {
      setTimeLeft(initialTime);
    }
  }, [showResult]);

  useEffect(() => {
    if (!document.fullscreenEnabled) {
      alert("Full screen mode is not supported by your browser");
      return;
    }

    const handleFullscreenChange = () => {
      setIsInFullscreen(document.fullscreenElement !== null);
      setFullscreen(document.fullscreenElement !== null);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullScreen = () => {
    const quizContainer = document.getElementById("quiz_container");
    if (!document.fullscreenElement) {
      quizContainer
        .requestFullscreen()
        .then(() => {
          setFullscreen(true);
          setIsInFullscreen(true);
        })

        .catch((err) => {
          alert(
            `Error attempting to enable full screen mode :${err.message} (${err.name})`
          );
        });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime < 1) {
          clearInterval(timer);
          setShowResult(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "currentQuestionIndex",
      JSON.stringify(currentQuestionIndex)
    );
    localStorage.setItem("selectedOptions", JSON.stringify(selectedOptions));
    localStorage.setItem("score", JSON.stringify(score));
    localStorage.setItem("timeLeft", JSON.stringify(timeLeft));
  }, [currentQuestionIndex, selectedOptions, score, timeLeft]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleNextQuestion = () => {
    if (
      selectedOptions === questiondata.questions[currentQuestionIndex].answer
    ) {
      setScore(score + 1);
    }

    setSelectedOption(null);
    if (currentQuestionIndex < questiondata.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResult(true);
    }
  };
  if (!questiondata.questions.length) {
    return <div>Loading...</div>;
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(0);
    setScore(0);
    setShowResult(false);
    setTimeLeft(initialTime);
  };

  return (
    <>
      <div className={classes.quiz_container} id="quiz_container">
        {isInFullscreen ? (
          !showResult ? (
            <div className="quiz-question">
              <div>
                <h2>Time Left: {formatTime(timeLeft)}</h2>
              </div>
              <h2>Q {currentQuestionIndex + 1}</h2>
              <h2>{questiondata.questions[currentQuestionIndex].question}</h2>
              <ul>
                {questiondata.questions[currentQuestionIndex].options.map(
                  (option, index) => (
                    <li className={classes.list_item} key={index}>
                      <label>
                        <input
                          type="radio"
                          name="quizoption"
                          checked={selectedOptions === option}
                          onChange={() => handleOptionSelect(option)}
                        />

                        {option}
                      </label>
                    </li>
                  )
                )}
              </ul>
              <button onClick={toggleFullScreen}>
                {fullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              </button>
              <button onClick={handleNextQuestion}>save & Next</button>
            </div>
          ) : (
            <div className="quiz_result">
              <h2>
                Your Score:{score}/{questiondata.questions.length}{" "}
                <button onClick={handleRestartQuiz}>start New Quiz</button>
              </h2>
            </div>
          )
        ) : (
          <div className={classes.fullscreen_message}>
            <p>please Enter full screen mode to start the quiz</p>
            <button onClick={toggleFullScreen}>Enter Full screen</button>
          </div>
        )}
      </div>
    </>
  );
};

export default Quiz;
