/**
 * Dependencies:
 * rxjs
 */

class Answer {
    constructor(data) {
        this.ID = data.ID;
        this.QUESTION_ID = data.QUESTION_ID;
        this.TEXT = data.TEXT;
        this.CORRECT = data.CORRECT;
    }
}

class Question {
    constructor(data) {
        this.ID = data.ID;
        this.TEXT = data.TEXT;
        this.ANSWERS = [];
    }
}

class Quiz {
    constructor() {
        this.element = document.getElementById("quiz");
        this.questions = new Map();
        this.selections = new Map();

        this.getQuestions();
    }

    getQuestions() {
        let xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = () => {
            if (xhttp.readyState == 4) {
                let parsedResult = JSON.parse(xhttp.response);

                for (let i = 0; i < parsedResult.length; i++) {
                    this.questions.set(
                        parsedResult[i].ID,
                        new Question(parsedResult[i])
                    );
                }
                this.getAnswers();
            }
        };

        xhttp.open("GET", "/COMP4537/assignments/quizindb/questions");
        xhttp.send();
    }

    getAnswers() {
        let xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = () => {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                let parsedResult = JSON.parse(xhttp.response);

                for (let i = 0; i < parsedResult.length; i++) {
                    let question = this.questions.get(
                        parsedResult[i].QUESTION_ID
                    );
                    question.ANSWERS.push(new Answer(parsedResult[i]));
                }

                this.render();
            }
        };

        xhttp.open("GET", "/COMP4537/assignments/quizindb/answers");
        xhttp.send();
    }

    createButton(name) {
        let button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-secondary";
        button.innerText = name;
        return button;
    }

    calculateScore() {
        const alert = document.getElementById("feedback");
        alert.classList = "alert alert-primary";
        let count = 0;
        for (let selection of this.selections.values()) {
            if (selection) count++;
        }
        alert.innerText = "Score: " + count + " / " + this.questions.size;
    }

    render() {
        while (this.element.firstChild)
            this.element.removeChild(this.element.lastChild);

        // Appends the title
        this.title = document.createElement("h4");
        this.title.innerHTML = "Quiz";
        this.element.appendChild(this.title);

        // Create a list of questions
        let questionList = document.createElement("ul");
        questionList.className = "list-group";

        // Questions -> list of text boxes
        this.questions.forEach((question, key, map) => {
            let questionContainer = document.createElement("li");
            questionContainer.className = "list-group-item";

            let questionText = document.createElement("textarea");
            questionText.className = "form-control";
            questionText.value = question.TEXT;
            questionText.disabled = true;
            questionContainer.appendChild(questionText);

            // Answers -> list of form inputs
            for (let answer of question.ANSWERS) {
                let answerContainer = document.createElement("div");
                answerContainer.className = "input-group mb-3";

                let inputGroupPrepend = document.createElement("div");
                inputGroupPrepend.className = "input-group-text";
                answerContainer.appendChild(inputGroupPrepend);

                let radio = document.createElement("input");
                radio.type = "radio";
                radio.name = answer.QUESTION_ID;
                radio.oninput = (value) => {
                    this.selections.set(
                        answer.QUESTION_ID,
                        radio.value == "on" && answer.CORRECT == 1
                    );
                };

                inputGroupPrepend.appendChild(radio);

                let inputContainer = document.createElement("input");
                inputContainer.value = answer.TEXT;
                inputContainer.style.flex = 1;
                inputContainer.disabled = true;
                answerContainer.appendChild(inputContainer);

                questionContainer.appendChild(answerContainer);
            }

            questionList.appendChild(questionContainer);
        });

        // Adds Question List to the Quiz Node
        this.element.appendChild(questionList);

        // Holds buttons
        let buttonGroup = document.createElement("div");
        buttonGroup.className = "btn-group";
        buttonGroup.role = "group";
        this.element.append(buttonGroup);

        let submitButton = this.createButton("SUBMIT");
        submitButton.onclick = () => {
            this.calculateScore();
        };
        buttonGroup.appendChild(submitButton);
    }
}

document.addEventListener("DOMContentLoaded", (event) => {
    new Quiz();
});
