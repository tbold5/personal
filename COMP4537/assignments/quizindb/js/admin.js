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

    getProperties() {
        return {
            ID: this.ID,
            QUESTION_ID: this.QUESTION_ID,
            TEXT: this.TEXT,
            CORRECT: this.CORRECT,
        };
    }
}

class Question {
    constructor(data) {
        this.ID = data.ID;
        this.TEXT = data.TEXT;
        this.ANSWERS = [];
    }

    getProperties() {
        return {
            ID: this.ID,
            TEXT: this.TEXT,
            ANSWERS: this.ANSWERS.map((answer) => answer.getProperties()),
        };
    }
}

class Quiz {
    constructor() {
        // Container for Editor.
        this.element = document.getElementById("quiz");

        // Observables
        this.questions = new Map();
        this.isLoading = new rxjs.BehaviorSubject(false);

        // Subscriptions
        this.isLoadingSubscription = this.isLoading.subscribe((isLoading) => {
            this.render();
        });

        // Get Initial State
        this.getQuestions();
    }

    getQuestions() {
        this.isLoading.next(true);
        let xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = () => {
            const alert = document.getElementById("feedback");

            if (xhttp.readyState == 4 && xhttp.status == 200) {
                let parsedResult = JSON.parse(xhttp.response);

                this.questions.clear();

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
            const alert = document.getElementById("feedback");

            if (xhttp.readyState == 4 && xhttp.status == 200) {
                alert.className = "alert alert-primary";
                alert.innerText = "SUCCESSFULLY GOT DATA";

                let parsedResult = JSON.parse(xhttp.response);

                for (let i = 0; i < parsedResult.length; i++) {
                    let question = this.questions.get(
                        parsedResult[i].QUESTION_ID
                    );
                    question.ANSWERS.push(new Answer(parsedResult[i]));
                }

                this.isLoading.next(false);
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

    createQuestion() {
        this.isLoading.next(true);
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState == 4) {
                this.getQuestions();
            }
        };
        xhttp.open("POST", "/COMP4537/assignments/quizindb/questions");
        xhttp.send();
    }

    updateQuestion() {
        if (this.questions.size > 0) {
            this.isLoading.next(true);

            let latestQuestion = Array.from(this.questions.values()).pop();
            let data = JSON.stringify(latestQuestion.getProperties());
            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = () => {
                if (xhttp.readyState == 4) {
                    this.getQuestions();
                }
            };

            xhttp.open("PUT", "/COMP4537/assignments/quizindb/questions");
            xhttp.send(data);
        }
    }

    deleteQuestion() {
        if (this.questions.size > 0) {
            this.isLoading.next(true);

            let latestQuestion = Array.from(this.questions.values()).pop();
            let data = JSON.stringify(latestQuestion.getProperties());
            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = () => {
                if (xhttp.readyState == 4) {
                    this.getQuestions();
                }
            };

            xhttp.open("DELETE", "/COMP4537/assignments/quizindb/questions");
            xhttp.send(data);
        }
    }

    addAnswer() {
        if (this.questions.size != 0) {
            this.isLoading.next(true);
            let latestQuestion = Array.from(this.questions.values()).pop();
            let data = JSON.stringify(latestQuestion.getProperties());

            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = () => {
                if (xhttp.readyState == 4) {
                    this.getQuestions();
                }
            };

            xhttp.open("POST", "/COMP4537/assignments/quizindb/answers");
            xhttp.send(data);
        }
    }

    deleteAnswer() {
        if (this.questions.size != 0) {
            let latestQuestion = Array.from(this.questions.values()).pop();
            if (latestQuestion.ANSWERS.length > 0) {
                this.isLoading.next(true);

                let data = JSON.stringify(
                    latestQuestion.ANSWERS[latestQuestion.ANSWERS.length - 1]
                );

                let xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = () => {
                    if (xhttp.readyState == 4) {
                        this.getQuestions();
                    }
                };

                xhttp.open("DELETE", "/COMP4537/assignments/quizindb/answers");
                xhttp.send(data);
            }
        }
    }

    render() {
        while (this.element.firstChild)
            this.element.removeChild(this.element.lastChild);

        // Appends the title
        this.title = document.createElement("h4");
        this.title.innerHTML = "Edit Questions";
        this.element.appendChild(this.title);

        // If document is still loading add a spinner
        if (this.isLoading.getValue()) {
            let spinner = document.createElement("div");
            spinner.className = "spinner-border";
            spinner.setAttribute("role", "status");

            this.element.appendChild(spinner);
        } else {
            // Create a list of questions
            let questionList = document.createElement("ul");
            questionList.className = "list-group";

            // Questions -> list of text boxes
            let lastQuestion = Array.from(this.questions.values()).pop();
            let lastID = null;
            if (lastQuestion) lastID = lastQuestion.ID;

            this.questions.forEach((question, key, map) => {
                let questionContainer = document.createElement("li");
                questionContainer.className = "list-group-item";

                let questionText = document.createElement("textarea");
                questionText.className = "form-control";
                questionText.value = question.TEXT;
                questionText.oninput = (value) => {
                    this.questions.get(question.ID).TEXT = questionText.value;
                };
                if (question.ID != lastID) questionText.disabled = true;
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
                    radio.checked = answer.CORRECT == 1;
                    radio.name = answer.QUESTION_ID;
                    radio.oninput = (value) => {
                        this.questions
                            .get(answer.QUESTION_ID)
                            .ANSWERS.forEach((item) => {
                                item.CORRECT = 0;
                            });
                        answer.CORRECT = radio.value == "on" ? 1 : 0;
                    };

                    if (question.ID != lastID) radio.disabled = true;
                    inputGroupPrepend.appendChild(radio);

                    let inputContainer = document.createElement("input");
                    inputContainer.value = answer.TEXT;
                    inputContainer.style.flex = 1;
                    inputContainer.oninput = (value) => {
                        answer.TEXT = inputContainer.value;
                    };
                    if (question.ID != lastID) inputContainer.disabled = true;
                    answerContainer.appendChild(inputContainer);

                    questionContainer.appendChild(answerContainer);
                }

                questionList.appendChild(questionContainer);
            });

            // Adds Question List to the Quiz Node
            this.element.appendChild(questionList);

            // Adds Button to Create New Questions
            let buttonGroup = document.createElement("div");
            buttonGroup.className = "btn-group";
            buttonGroup.role = "group";
            this.element.append(buttonGroup);

            let createQuestionButton = this.createButton("NEW QUESTION");
            createQuestionButton.onclick = () => {
                this.createQuestion();
            };
            buttonGroup.appendChild(createQuestionButton);

            let updateQuestionButton = this.createButton("UPDATE QUESTION");
            updateQuestionButton.onclick = () => {
                this.updateQuestion();
            };
            buttonGroup.appendChild(updateQuestionButton);

            let deleteQuestionButton = this.createButton("DELETE QUESTION");
            deleteQuestionButton.onclick = () => {
                this.deleteQuestion();
            };
            buttonGroup.appendChild(deleteQuestionButton);

            let addAnswerButton = this.createButton("ADD ANSWER");
            addAnswerButton.onclick = () => {
                this.addAnswer();
            };
            buttonGroup.appendChild(addAnswerButton);

            let deleteAnswerButton = this.createButton("DELETE ANSWER");
            deleteAnswerButton.onclick = () => {
                this.deleteAnswer();
            };
            buttonGroup.appendChild(deleteAnswerButton);
        }
    }
}

document.addEventListener("DOMContentLoaded", (event) => {
    new Quiz();
});
