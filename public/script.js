
document.addEventListener("DOMContentLoaded", () => {
    const elements = {
        startBtn: document.querySelector(".start_btn button"),
        startContainer: document.querySelector(".start_btn"),
        infoBox: document.querySelector(".info_box"),
        exitBtn: document.querySelector(".buttons .quit"),
        continueBtn: document.querySelector(".buttons .restart"),
        quizBox: document.querySelector(".quiz_box"),
        resultBox: document.querySelector(".result_box"),
        optionList: document.querySelector(".option_list"),
        timerText: document.querySelector(".timer .timer_text"),
        timerCount: document.querySelector(".timer .timer_sec"),
        nextBtn: document.querySelector("footer .next_btn"),
        questionCounter: document.querySelector("footer .total_que"),
        categoryBox: document.querySelector(".category_box"),
        categoryButtons: document.querySelectorAll(".category"),
        numQuestionsInput: document.getElementById("num_questions_input"),
        promptBox: document.querySelector(".prompt_box"),
        promptNextBtn: document.querySelector(".prompt_box .next_btn button"),
        restartQuizBtn: document.querySelector(".result_box .buttons .restart"),
        quitQuizBtn: document.querySelector(".result_box .buttons .quit"),
    };

    let questions = [];
    let timeValue = 15;
    let questionIndex = 0;
    let userScore = 0;
    let timer;
    let isLoading = false;

    // Show welcome prompt initially
    elements.promptBox.style.opacity = "1";
    elements.promptBox.style.pointerEvents = "auto";

    // Handle welcome prompt transition
    elements.promptNextBtn.addEventListener("click", () => {
        elements.promptBox.style.opacity = "0";
        elements.promptBox.style.pointerEvents = "none";
        elements.categoryBox.style.opacity = "1";
        elements.categoryBox.style.pointerEvents = "auto";
    });

    // Handle category selection
    elements.categoryButtons.forEach(button => {
        button.addEventListener("click", function () {
            const selectedCategory = this.getAttribute("data-category");
            elements.categoryBox.style.opacity = "0";
            elements.categoryBox.style.pointerEvents = "none";
            elements.startContainer.style.opacity = "1";
            elements.startContainer.style.pointerEvents = "auto";
            elements.startContainer.setAttribute("data-category", selectedCategory);
        });
    });

    // Start Quiz
    elements.startBtn.addEventListener("click", async () => {
        const category = elements.startContainer.getAttribute("data-category");
        if (!category) {
            alert("Please select a category before starting the quiz.");
            return;
        }

        const count = elements.numQuestionsInput.value || 5;

        elements.infoBox.style.opacity = "1";
        elements.infoBox.style.pointerEvents = "auto";
        elements.infoBox.style.transform = "translate(-50%, -50%) scale(1)";

        try {

            // Set loading state
            isLoading = true;
            showLoading();
            const response = await fetch(`/quiz/${category}/${count}`);
            const data = await response.json();
            if (!data.questions || data.questions.length === 0) {
                throw new Error("No questions received from the server.");
            }
            questions = data.questions;

            // Clear loading state
            isLoading = false;
            hideLoading();

            elements.continueBtn.addEventListener("click", startQuiz);
        } catch (error) {
            isLoading = false; // Ensure loading state is reset even on error
            hideLoading();
            console.error("Error fetching questions:", error);
            alert("Could not load questions. Please try again.");
        }
    });

    function showLoading() {
        // Assuming you have an element with class 'loading-overlay' for showing loading state
        document.querySelector('.loading-overlay').style.display = 'flex';
    }

    function hideLoading() {
        document.querySelector('.loading-overlay').style.display = 'none';
    }

    // Start Quiz
    function startQuiz() {
        elements.infoBox.style.opacity = "0";
        elements.quizBox.style.opacity = "1";
        elements.quizBox.style.pointerEvents = "auto";
        elements.quizBox.style.transform = "translate(-50%, -50%) scale(1)";

        questionIndex = 0;
        userScore = 0;
        showQuestion(questionIndex);
        updateQuestionCounter(1);
        startTimer(timeValue);
    }

    // Show Question
    function showQuestion(index) {
        const queText = document.querySelector(".que_text");
        let questionHTML = `<span>${index + 1}. ${questions[index].question}</span>`;
        let optionsHTML = questions[index].options.map(option =>
            `<div class="option"><span>${option}</span></div>`
        ).join("");

        queText.innerHTML = questionHTML;
        elements.optionList.innerHTML = optionsHTML;

        elements.optionList.querySelectorAll(".option").forEach(option => {
            option.addEventListener("click", () => selectOption(option));
        });
    }

    // Select Option
    function selectOption(answer) {
        clearInterval(timer);

        const userAnswer = answer.textContent.trim();
        const correctAnswer = questions[questionIndex].answer;

        if (userAnswer === correctAnswer) {
            userScore++;
            answer.classList.add("correct");
            answer.innerHTML += `<div class="icon tick"><i class="fas fa-check"></i></div>`;
        } else {
            answer.classList.add("incorrect");
            answer.innerHTML += `<div class="icon cross"><i class="fas fa-times"></i></div>`;

            elements.optionList.querySelectorAll(".option").forEach(opt => {
                if (opt.textContent.trim() === correctAnswer) {
                    opt.classList.add("correct");
                    opt.innerHTML += `<div class="icon tick"><i class="fas fa-check"></i></div>`;
                }
            });
        }

        elements.optionList.querySelectorAll(".option").forEach(opt => opt.classList.add("disabled"));
        elements.nextBtn.style.display = "block";
    }

    // Next Question
    elements.nextBtn.addEventListener("click", () => {
        if (questionIndex < questions.length - 1) {
            questionIndex++;
            showQuestion(questionIndex);
            updateQuestionCounter(questionIndex + 1);
            clearInterval(timer);
            startTimer(timeValue);
            elements.nextBtn.style.display = "none";
        } else {
            showResult();
        }
    });

    // Show Result
    function showResult() {
        elements.quizBox.style.opacity = "0";
        elements.resultBox.style.opacity = "1";
        elements.resultBox.style.pointerEvents = "auto";
        elements.resultBox.style.transform = "translate(-50%, -50%) scale(1)";

        const scoreText = elements.resultBox.querySelector(".score_text");
        scoreText.innerHTML = `<span>${userScore > 3 ? "Congrats!" : "Nice!"} You got <p>${userScore}</p> out of <p>${questions.length}</p></span>`;
    }

    // Start Timer
    function startTimer(time) {
        timer = setInterval(() => {
            elements.timerCount.textContent = time < 10 ? "0" + time : time;
            if (time <= 0) {
                clearInterval(timer);
                elements.timerText.textContent = "Time Off";

                const correctAnswer = questions[questionIndex].answer;
                elements.optionList.querySelectorAll(".option").forEach(option => {
                    option.classList.add("disabled");
                    if (option.textContent.trim() === correctAnswer) {
                        option.classList.add("correct");
                        option.innerHTML += `<div class="icon tick"><i class="fas fa-check"></i></div>`;
                    }
                });

                elements.nextBtn.style.display = "block";
            }
            time--;
        }, 1000);
    }

    // Update Question Counter
    function updateQuestionCounter(index) {
        elements.questionCounter.innerHTML = `<span><p>${index}</p> of <p>${questions.length}</p> Questions</span>`;
    }

    // Restart Quiz
    elements.restartQuizBtn.addEventListener("click", startQuiz);

    // Quit Quiz
    elements.quitQuizBtn.addEventListener("click", () => location.reload());
});
