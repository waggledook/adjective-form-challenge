class AdjectiveFormsChallenge {
    constructor(sentences) {
        this.originalSentences = sentences;
        this.sentences = this.shuffle([...sentences]);
        this.currentIndex = 0;
        this.score = 0;
        this.wrongAnswers = [];
        this.timer = 120; // 2 minutes timer
        this.interval = null;
        this.gameActive = false;
        this.reviewMode = false;
        this.initUI();
    }

    shuffle(array) {
        return array.sort(() => Math.random() - 0.5);
    }

    initUI() {
        console.log("Game script is running!");
        document.body.innerHTML = `
            <style>
                body {
                    font-family: 'Poppins', sans-serif;
                    background: linear-gradient(135deg, #2E3192, #1BFFFF);
                    color: white;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                }
                /* Instructions Overlay */
                #instructions-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                #instructions-box {
                    background: #333;
                    padding: 20px;
                    border-radius: 10px;
                    max-width: 500px;
                    text-align: left;
                }
                #instructions-box h2 {
                    margin-top: 0;
                }
                #close-instructions {
                    margin-top: 15px;
                    padding: 5px 10px;
                    background: #28a745;
                    border: none;
                    border-radius: 5px;
                    color: white;
                    cursor: pointer;
                    transition: 0.3s;
                }
                #close-instructions:hover {
                    opacity: 0.8;
                }
                /* Game container styles */
                #game-container {
                    background: rgba(0, 0, 0, 0.8);
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
                    text-align: center;
                    z-index: 1;
                    position: relative;
                }
                p {
                    font-size: 18px;
                }
                input {
                    padding: 10px;
                    font-size: 16px;
                    border-radius: 5px;
                    border: none;
                    outline: none;
                    text-align: center;
                    display: block;
                    margin: 10px auto;
                    width: 80%;
                }
                input.correct {
                    border: 2px solid #00FF00;
                    background-color: rgba(0, 255, 0, 0.2);
                }
                input.incorrect {
                    border: 2px solid #FF0000;
                    background-color: rgba(255, 0, 0, 0.2);
                }
                button {
                    padding: 10px 20px;
                    font-size: 18px;
                    margin-top: 10px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: 0.3s;
                }
                button:hover {
                    opacity: 0.8;
                }
                #start {
                    background: #28a745;
                    color: white;
                }
                #restart {
                    background: #007bff;
                    color: white;
                    display: none;
                }
                #review {
                    background: #ffc107;
                    color: black;
                    display: none;
                }
                #timer-bar {
                    width: 100%;
                    height: 10px;
                    background: red;
                    transition: width 1s linear;
                }
                /* New style for root words */
                .root-word {
                    font-weight: bold;
                    color: #FFD700;
                    margin-left: 10px;
                }
                /* Game over overlay styles */
                .game-over {
                    font-size: 24px;
                    color: #FF4500;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .new-high {
                    font-size: 20px;
                    color: #FFD700;
                    font-weight: bold;
                }
            </style>
            <!-- Instructions Overlay -->
            <div id="instructions-overlay">
                <div id="instructions-box">
                    <h2>How to Play</h2>
                    <p>Welcome to the Adjective Forms Challenge!</p>
                    <p>In this game, you will see sentences with a blank. Your task is to fill in the blank with the correct adjective form.</p>
                    <p>Use the -ed or -ing form where possible, or provide the correct irregular adjective/verb form if needed.</p>
                    <p>Try to answer as quickly and accurately as possible to earn more points.</p>
                    <p>Good luck!</p>
                    <button id="close-instructions">Got It!</button>
                </div>
            </div>
            <!-- Game Container -->
            <div id="game-container">
                <h1>Adjective Forms Challenge</h1>
                <div id="timer-bar"></div>
                <p id="timer">Time left: 120s</p>
                <p id="sentence"></p>
                <input type="text" id="answer" autofocus>
                <p id="feedback"></p>
                <p>Score: <span id="score">0</span></p>
                <p>Best Score: <span id="bestScore">0</span></p>
                <button id="start">Start Game</button>
                <button id="restart">Restart</button>
                <button id="review">Review Mistakes</button>
                <button id="downloadReport" style="display:none;">Download Report</button>
            </div>
        `;

        document.getElementById("close-instructions").addEventListener("click", () => {
            document.getElementById("instructions-overlay").style.display = "none";
        });
        document.getElementById("start").addEventListener("click", () => this.startGame());
        document.getElementById("restart").addEventListener("click", () => this.restartGame());
        document.getElementById("review").addEventListener("click", () => this.startReview());
        this.setupInputListener();
        this.updateBestScoreDisplay();
    }

    setupInputListener() {
        document.getElementById("answer").addEventListener("keyup", (event) => {
            if (event.key === "Enter") {
                this.checkAnswer();
            }
        });
    }

    startGame() {
        this.gameActive = true;
        this.reviewMode = false;
        this.currentIndex = 0;
        this.score = 0;
        this.wrongAnswers = [];
        this.sentences = this.shuffle([...this.originalSentences]);
        this.timer = 120; // Reset to 2 minutes
        clearInterval(this.interval);
        document.getElementById("start").style.display = "none";
        document.getElementById("restart").style.display = "block";
        document.getElementById("review").style.display = "none";
        document.getElementById("score").textContent = this.score;
        document.getElementById("feedback").textContent = "";
        document.getElementById("timer-bar").style.width = "100%";
        document.getElementById("answer").value = "";
        document.getElementById("answer").style.display = "block";
        document.getElementById("answer").focus();
        this.updateSentence();
        this.startTimer();
    }

    updateSentence() {
        if (this.currentIndex < this.sentences.length) {
            const current = this.sentences[this.currentIndex];
            document.getElementById("sentence").innerHTML = current.sentence +
                " <span class='root-word'>(" + current.root + ")</span>";
            document.getElementById("answer").value = "";
        } else {
            this.endGame();
        }
    }

    checkAnswer() {
        if (!this.gameActive && !this.reviewMode) return;
        const input = document.getElementById("answer");
        const userInput = input.value.trim().toLowerCase();
        const currentSet = this.reviewMode ? this.wrongAnswers : this.sentences;
        const correctAnswer = currentSet[this.currentIndex].answer;

        if (this.reviewMode) {
            if (userInput === correctAnswer) {
                input.classList.add("correct");
            } else {
                input.classList.add("incorrect");
            }
            setTimeout(() => {
                input.classList.remove("correct", "incorrect");
                this.currentIndex++;
                this.showReviewSentence();
            }, 1000);
        } else {
            if (userInput === correctAnswer) {
                this.score += 5;
                document.getElementById("score").textContent = this.score;
                input.classList.add("correct");
                setTimeout(() => {
                    input.classList.remove("correct");
                    this.currentIndex++;
                    this.updateSentence();
                }, 500);
            } else {
                this.score -= 1;
                document.getElementById("score").textContent = this.score;
                input.classList.add("incorrect");
                document.getElementById("feedback").textContent = `Incorrect: Correct answer is '${correctAnswer}'`;
                this.wrongAnswers.push({
                    sentence: currentSet[this.currentIndex].sentence,
                    answer: currentSet[this.currentIndex].answer,
                    root: currentSet[this.currentIndex].root,
                    userAnswer: userInput || "(no answer)"
                });
                setTimeout(() => {
                    input.classList.remove("incorrect");
                    document.getElementById("feedback").textContent = "";
                    this.currentIndex++;
                    this.updateSentence();
                }, 1000);
            }
        }
    }

    startTimer() {
        this.interval = setInterval(() => {
            if (this.timer > 0) {
                this.timer--;
                document.getElementById("timer").textContent = `Time left: ${this.timer}s`;
                document.getElementById("timer-bar").style.width = (this.timer / 120) * 100 + "%";
            } else {
                clearInterval(this.interval);
                this.endGame();
            }
        }, 1000);
    }

    endGame() {
    this.gameActive = false;
    clearInterval(this.interval);
    console.log("EndGame Triggered!");
    console.log("Wrong Answers Count:", this.wrongAnswers.length);

    // 1) Check and update best score using localStorage
    let storedBest = localStorage.getItem("bestScore") || 0;
    let newHighScore = false;
    if (this.score > storedBest) {
        localStorage.setItem("bestScore", this.score);
        newHighScore = true;
    }
    this.updateBestScoreDisplay(); // If you have a function that refreshes the Best Score display

    // 2) Build a "Time's Up" message
    let endMessage = `
        <div class="game-over">Time's Up!</div>
        <div>Your score: ${this.score}</div>
    `;
    if (newHighScore) {
        endMessage += `<div class="new-high">New High Score!</div>`;
    }

    // 3) Replace the last sentence with the end message
    document.getElementById("sentence").innerHTML = endMessage;

    // 4) Hide the answer input box and optionally clear or hide the timer
    document.getElementById("answer").style.display = "none";
    document.getElementById("timer").textContent = ""; 
    // or: document.getElementById("timer").style.display = "none";
    document.getElementById("timer-bar").style.width = "0%";

    // 5) Show the "Review Mistakes" button if there are mistakes
    document.getElementById("review").style.display = 
        this.wrongAnswers.length > 0 ? "block" : "none";

    // 6) Show the "Download Report" button if you have it in your HTML
    const reportButton = document.getElementById("downloadReport");
    if (reportButton) {
        reportButton.style.display = "block";
        if (!reportButton.dataset.listenerAdded) {
            reportButton.addEventListener("click", () => this.generateReport());
            reportButton.dataset.listenerAdded = "true";
        }
    }
}

    updateBestScoreDisplay() {
        let storedBest = localStorage.getItem("bestScore") || 0;
        document.getElementById("bestScore").textContent = storedBest;
    }

    startReview() {
        if (this.wrongAnswers.length === 0) return;
        this.reviewMode = true;
        this.currentIndex = 0;
        document.getElementById("answer").style.display = "block";
        document.getElementById("answer").value = "";
        this.showReviewSentence();
    }

    showReviewSentence() {
        if (this.currentIndex < this.wrongAnswers.length) {
            const currentMistake = this.wrongAnswers[this.currentIndex];
            document.getElementById("sentence").innerHTML = currentMistake.sentence +
                " <span class='root-word'>(" + currentMistake.root + ")</span>";
            document.getElementById("answer").value = "";
            document.getElementById("feedback").textContent = "";
        } else {
            document.getElementById("sentence").textContent = "Review complete!";
            document.getElementById("answer").style.display = "none";
            document.getElementById("feedback").textContent = "";
            this.reviewMode = false;
            this.currentIndex = 0;
        }
    }

    restartGame() {
        this.gameActive = false;
        this.reviewMode = false;
        clearInterval(this.interval);
        this.currentIndex = 0;
        this.score = 0;
        this.timer = 120;
        this.wrongAnswers = [];
        this.sentences = this.shuffle([...this.originalSentences]);
        document.getElementById("score").textContent = this.score;
        document.getElementById("feedback").textContent = "";
        document.getElementById("sentence").textContent = "";
        document.getElementById("answer").value = "";
        document.getElementById("restart").style.display = "none";
        document.getElementById("review").style.display = "none";
        document.getElementById("start").style.display = "block";
    }

    downloadReport() {
        let reportText = "Adjective Forms Challenge - Mistakes Report\n\n";
        this.wrongAnswers.forEach(mistake => {
            reportText += `You wrote: "${mistake.sentence.replace("____", mistake.userAnswer.toUpperCase())}"\n`;
            reportText += `The correct answer is: "${mistake.sentence.replace("____", mistake.answer.toUpperCase())}"\n`;
            reportText += `Root word: ${mistake.root}\n\n`;
        });
        const blob = new Blob([reportText], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "game_report.txt";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Updated sentences with root words
const sentences = [
    { sentence: "It really _______ me when my students don't do their homework.", answer: "infuriates", root: "infuriate" },
    { sentence: "It's ________ when students don't do their homework.", answer: "infuriating", root: "infuriate" },
    { sentence: "I get very ________ when I don't do well on an exam, even after studying a lot.", answer: "frustrated", root: "frustrate" },
    { sentence: "It's really ________ failing an exam, even after studying a lot.", answer: "frustrating", root: "frustrate" },
    { sentence: "I was so ______ when I fell down in the middle of the street.", answer: "embarrassed", root: "embarrass" },
    { sentence: "It was _______ falling down in the middle of the street.", answer: "embarrassing", root: "embarrass" },
    { sentence: "It has been an _______ day, I´m tired!", answer: "exhausting", root: "exhaust" },
    { sentence: "I was so _________ after the marathon, I had to take a nap!", answer: "exhausted", root: "exhaust" },
    { sentence: "She was really ________ because she fell ill and had to cancel her holiday.", answer: "disappointed", root: "disappoint" },
    { sentence: "It was a ________ match, we lost 3-0.", answer: "disappointing", root: "disappoint" },
    { sentence: "The Taj Mahal is an ______ building.", answer: "amazing", root: "amaze" },
    { sentence: "I was absolutely ______ when I saw the Taj Mahal.", answer: "amazed", root: "amaze" },
    { sentence: "The horror film was _______.", answer: "terrifying", root: "terrify" },
    { sentence: "I was ________ as I jumped out of the airplane.", answer: "terrified", root: "terrify" },
    { sentence: "The book was really _______. I´m going to do the same thing as the character Molly!", answer: "inspiring", root: "inspire" },
    { sentence: "I felt ________ after reading the book. I´m going to do the same thing as the character Molly!", answer: "inspired", root: "inspire" },
    { sentence: "This exercise is really ________.", answer: "confusing", root: "confuse" },
    { sentence: "I was so _______, I couldn't finish the exercise.", answer: "confused", root: "confuse" },
    { sentence: "The musical was _______. I'd never seen such a beautiful production.", answer: "impressive", root: "impress" },
    { sentence: "I was ________ by the musical. I'd never seen such a beautiful production.", answer: "impressed", root: "impress" },
    { sentence: "My job is really _______.", answer: "stressful", root: "stress" },
    { sentence: "I was so _______ because of work.", answer: "stressed", root: "stress" },
    { sentence: "The film was really _______. I was on the edge of my seat!", answer: "scary", root: "scare" },
    { sentence: "I was so _______, I could barely watch the film!", answer: "scared", root: "scare" },
    { sentence: "I was _______ to help. You have helped me so much already.", answer: "delighted", root: "delight" },
    { sentence: "She is a _______ little child. She´s always smiling and laughing.", answer: "delightful", root: "delight" },
    { sentence: "That was the most ______ speech I've ever heard. How could he say that?", answer: "offensive", root: "offend" },
    { sentence: "I was completely ______ by that speech. How could he say that?", answer: "offended", root: "offend" },
    { sentence: "It really ______ me when people chew loudly.", answer: "irritates", root: "irritate" },
    { sentence: "It always ______ me how quickly a child learns.", answer: "amazes", root: "amaze" },
    { sentence: "It ______ me when unexpected events occur.", answer: "surprises", root: "surprise" },
    { sentence: "It ______ me to see litter scattered in the park.", answer: "depresses", root: "depress" },
    { sentence: "It ______ me when the same song plays on loop.", answer: "annoys", root: "annoy" },
    { sentence: "It ______ me when news reports focus on negativity.", answer: "troubles", root: "trouble" },
    { sentence: "It ______ me whenever a great movie starts.", answer: "captivates", root: "captivate" },
    { sentence: "It ______ me to strive for excellence every day.", answer: "motivates", root: "motivate" },
    { sentence: "It ______ me when accidents occur without warning.", answer: "shocks", root: "shock" },
    { sentence: "It ______ me to see children enjoying their play.", answer: "delights", root: "delight" },
    { sentence: "Hi, Jane. Have you had an _______ day?", answer: "interesting", root: "interest" },
    { sentence: "My nephew was _______ by the clown.", answer: "amused", root: "amuse" },
    { sentence: "It's so _______! No matter how much I study I can't seem to remember this vocabulary.", answer: "frustrating", root: "frustrate" },
    { sentence: "This lesson is so _______!", answer: "boring", root: "bore" },
    { sentence: "I'm feeling ________, so I'm going to go home, eat some chocolate, and go to bed early with a good book.", answer: "depressed", root: "depress" },
    { sentence: "I thought her new idea was absolutely _______.", answer: "fascinating", root: "fascinate" },
    { sentence: "This maths problem is so _______. Can you help me?", answer: "confusing", root: "confuse" },
    { sentence: "The teacher was really _______ so the lesson passed quickly.", answer: "amusing", root: "amuse" },
    { sentence: "The journey was _______! Twelve hours by bus.", answer: "exhausting", root: "exhaust" },
    { sentence: "The plane began to move in a rather _______ way.", answer: "alarming", root: "alarm" },
    { sentence: "He was _______ when he saw the spider.", answer: "frightened", root: "frighten" },
    { sentence: "I was really _______ when I fell over in the street.", answer: "embarrassed", root: "embarrass" },
    { sentence: "That film was so _______! There was no happy ending for any of the characters.", answer: "depressing", root: "depress" },
    { sentence: "I'm sorry, I can't come tonight. I'm completely _______.", answer: "exhausted", root: "exhaust" },
    { sentence: "We are going in a helicopter? How _______!", answer: "exciting", root: "excite" },
    { sentence: "Don't show my baby photos to people, Mum! It's so _______!", answer: "embarrassing", root: "embarrass" },
    { sentence: "It's okay, it's only me. Don't be _______.", answer: "alarmed", root: "alarm" },
    { sentence: "My sister is so _______ because she is going on holiday tomorrow.", answer: "excited", root: "excite" },
    { sentence: "I hate long flights, I'm always really _______.", answer: "bored", root: "bore" },
    { sentence: "She looked very _______ when I told her we had to change the plan.", answer: "confused", root: "confuse" },
    { sentence: "His arguments were very _______ and convinced everyone.", answer: "persuasive", root: "persuade" },
    { sentence: "The scientist's approach was highly _______ and led to a breakthrough.", answer: "innovative", root: "innovate" },
    { sentence: "The seminar was very _______; I learned a lot from it.", answer: "informative", root: "inform" }
];

const game = new AdjectiveFormsChallenge(sentences);
