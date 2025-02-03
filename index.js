// Get all required elements
const start_btn = document.querySelector(".start_btn button");
const info_box = document.querySelector(".info_box");
const exit_btn = document.querySelector(".buttons .quit");
const continue_btn = document.querySelector(".buttons .restart");
const quiz_box = document.querySelector(".quiz_box");
const result_box = document.querySelector(".result_box");
const option_list = document.querySelector(".option_list");
const time_line = document.querySelector(".time_line");
const timeText = document.querySelector(".timer .timer_text");
const timeCount = document.querySelector(".timer .timer_sec");
const next_btn = document.querySelector("footer .next_btn");
const bottom_ques_counter = document.querySelector("footer .total_que");


// Quiz Questions
const questions = [
    {
        numb: 1,
        question: "What does HTML stand for?",
        answer: "Hyper Text Markup Language",
        options: [
            "Hyper Text Markup Language",
            "Hyperlinks and Text Markup Process",
            "Hyper Text Multiple Language",
            "Hyper Tool Multi Language"
        ]
    },
    {
        numb: 2,
        question: "What does CSS stand for?",
        answer: "Cascading Style Sheets",
        options: [
            "Common Style Sheet",
            "Colorful Style Sheet",
            "Computer Style Sheet",
            "Cascading Style Sheets"
        ]
    },
    {
        numb: 3,
        question: "What does PHP stand for?",
        answer: "Hypertext Preprocessor",
        options: [
            "Hypertext Preprocessor",
            "Hypertext Programming",
            "Hypertext Preprogramming",
            "Hometext Preprocessor"
        ]
    },
    {
        numb: 4,
        question: "What does SQL stand for?",
        answer: "Structured Query Language",
        options: [
            "Stylish Question Language",
            "Stylesheet Query Language",
            "Statement Question Language",
            "Structured Query Language"
        ]
    },
    {
        numb: 5,
        question: "What does XML stand for?",
        answer: "eXtensible Markup Language",
        options: [
            "eXtensible Markup Language",
            "eXecutable Multiple Language",
            "eXtra Multi-Program Language",
            "eXamine Multiple Language"
        ]
    }
];

let timeValue = 15;
let que_count = 0;
let que_numb = 1;
let userScore = 0;
let counter;
let counterLine;
let widthValue = 0;

// If startQuiz button clicked
start_btn.onclick = () => {
    info_box.style.opacity = "1";
    info_box.style.pointerEvents = "auto";
    info_box.style.transform = "translate(-50%, -50%) scale(1)";
}

// If exitQuiz button clicked
exit_btn.onclick = () => {
    info_box.style.opacity = "0";
    info_box.style.pointerEvents = "none";
    info_box.style.transform = "translate(-50%, -50%) scale(0.9)";
}

// If continueQuiz button clicked
continue_btn.onclick = () => {
    info_box.style.opacity = "0";
    info_box.style.pointerEvents = "none";
    quiz_box.style.opacity = "1";
    quiz_box.style.pointerEvents = "auto";
    quiz_box.style.transform = "translate(-50%, -50%) scale(1)";
    showQuestions(0);
    queCounter(1);
    startTimer(15);
}


// If Next Question button clicked
next_btn.onclick = () => {
    if (que_count < questions.length - 1) {
        que_count++;
        que_numb++;
        showQuestions(que_count);
        queCounter(que_numb);
        clearInterval(counter);
        clearInterval(counterLine);
        startTimer(timeValue);
        next_btn.style.display = "none";
    } else {
        clearInterval(counter);
        clearInterval(counterLine);
        showResult();
    }
}

// Getting questions and options from array
function showQuestions(index) {
    const que_text = document.querySelector(".que_text");
    let que_tag = '<span>' + questions[index].numb + ". " + questions[index].question + '</span>';
    let option_tag = '';

    for (let i = 0; i < questions[index].options.length; i++) {
        option_tag += `<div class="option"><span>${questions[index].options[i]}</span></div>`;
    }

    que_text.innerHTML = que_tag;
    option_list.innerHTML = option_tag;

    const option = option_list.querySelectorAll(".option");
    for (let i = 0; i < option.length; i++) {
        option[i].setAttribute("onclick", "optionSelected(this)");
    }
}

// Creating the new div tags for icons
let tickIconTag = '<div class="icon tick"><i class="fas fa-check"></i></div>';
let crossIconTag = '<div class="icon cross"><i class="fas fa-times"></i></div>';

function optionSelected(answer) {
    clearInterval(counter);
    clearInterval(counterLine);
    let userAns = answer.textContent.trim();
    let correctAns = questions[que_count].answer;
    const allOptions = option_list.children.length;

    if (userAns == correctAns) {
        userScore += 1;
        answer.classList.add("correct");
        answer.insertAdjacentHTML("beforeend", tickIconTag);
    } else {
        answer.classList.add("incorrect");
        answer.insertAdjacentHTML("beforeend", crossIconTag);

        // Auto select correct answer
        for (let i = 0; i < allOptions; i++) {
            if (option_list.children[i].textContent.trim() == correctAns) {
                option_list.children[i].setAttribute("class", "option correct");
                option_list.children[i].insertAdjacentHTML("beforeend", tickIconTag);
            }
        }
    }

    // Disable all options once user select an option
    for (let i = 0; i < allOptions; i++) {
        option_list.children[i].classList.add("disabled");
    }
    next_btn.style.display = "block";
}

function showResult() {
    info_box.style.opacity = "0";
    info_box.style.pointerEvents = "none";
    quiz_box.style.opacity = "0";
    quiz_box.style.pointerEvents = "none";
    result_box.style.opacity = "1";
    result_box.style.pointerEvents = "auto";
    result_box.style.transform = "translate(-50%, -50%) scale(1)";

    const scoreText = result_box.querySelector(".score_text");
    if (userScore > 3) {
        let scoreTag = '<span>and congrats! You got <p>' + userScore + '</p> out of <p>' + questions.length + '</p></span>';
        scoreText.innerHTML = scoreTag;
    }
    else if (userScore > 1) {
        let scoreTag = '<span>and nice, You got <p>' + userScore + '</p> out of <p>' + questions.length + '</p></span>';
        scoreText.innerHTML = scoreTag;
    }
    else {
        let scoreTag = '<span>and sorry, You got only <p>' + userScore + '</p> out of <p>' + questions.length + '</p></span>';
        scoreText.innerHTML = scoreTag;
    }
}

function startTimer(time) {
    counter = setInterval(timer, 1000);
    function timer() {
        timeCount.textContent = time;
        time--;
        if (time < 9) {
            let addZero = timeCount.textContent;
            timeCount.textContent = "0" + addZero;
        }
        if (time < 0) {
            clearInterval(counter);
            timeText.textContent = "Time Off";
            const allOptions = option_list.children.length;

            // Disable all options but don't select any
            for (let i = 0; i < allOptions; i++) {
                option_list.children[i].classList.add("disabled");
            }

            // Mark all answers as wrong if none was selected
            for (let i = 0; i < allOptions; i++) {
                option_list.children[i].classList.add("incorrect");
                option_list.children[i].insertAdjacentHTML("beforeend", crossIconTag);
            }

            next_btn.style.display = "block";
        }
    }
}

function queCounter(index) {
    let totalQueCounTag = '<span><p>' + index + '</p> of <p>' + questions.length + '</p> Questions</span>';
    bottom_ques_counter.innerHTML = totalQueCounTag;
}

// Reset quiz functionality
const restart_quiz = result_box.querySelector(".buttons .restart");
const quit_quiz = result_box.querySelector(".buttons .quit");

restart_quiz.onclick = () => {
    quiz_box.style.opacity = "1";
    quiz_box.style.pointerEvents = "auto";
    result_box.style.opacity = "0";
    result_box.style.pointerEvents = "none";
    timeValue = 15;
    que_count = 0;
    que_numb = 1;
    userScore = 0;
    widthValue = 0;
    showQuestions(que_count);
    queCounter(que_numb);
    clearInterval(counter);
    clearInterval(counterLine);
    startTimer(timeValue);
    next_btn.style.display = "none";
}

quit_quiz.onclick = () => {
    window.location.reload();
}

const category_box = document.querySelector(".category_box");
const category_buttons = document.querySelectorAll(".category");

// Initially show the category selection
category_box.style.opacity = "1";
category_box.style.pointerEvents = "auto";

// Event listener for category selection
category_buttons.forEach(button => {
    button.addEventListener('click', function () {
        const selectedCategory = this.getAttribute('data-category');
        console.log('Selected category:', selectedCategory);
        // Here you can filter questions by category if you have implemented different question sets
        // For now, we'll just hide the category box and show the start button
        category_box.style.opacity = "0";
        category_box.style.pointerEvents = "none";
        start_btn.style.display = "block"; // Assuming start_btn is hidden initially
    });
});

// Modify start_btn click to ensure it only shows after category selection
start_btn.onclick = () => {
    if (start_btn.style.display !== "none") {
        info_box.style.opacity = "1";
        info_box.style.pointerEvents = "auto";
        info_box.style.transform = "translate(-50%, -50%) scale(1)";
    }
}