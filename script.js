document.addEventListener('DOMContentLoaded', () => {
    // Initialize variables
    let questions = [];
    let currentQuestionIndex = 0;
    let scores = {};
    let selectedScore = null;

    // Wait for the "start" button to be clicked
    const startButton = document.getElementById('start-button');
    const nameEntryDiv = document.getElementById('name-entry');
    const appDiv = document.getElementById('app');
    const usernameInput = document.getElementById('username');

    startButton.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        if (username !== "") {
            nameEntryDiv.style.display = 'none';  // Hide the name entry section
            appDiv.style.display = 'block';  // Show the quiz section
            fetchQuestions();
        } else {
            alert('Please enter a valid name to start.');
        }
    });

    // Load questions from a JSON file
    function fetchQuestions() {
        fetch('questions.json')
            .then(response => response.json())
            .then(data => {
                questions = shuffleArray(data);  // Shuffle questions for randomness
                displayQuestion();  // Display the first question
            })
            .catch(error => console.error('Error loading questions:', error));
    }

    // Shuffle an array for randomness
    function shuffleArray(array) {
        return array.sort(() => Math.random() - 0.5);
    }

    // Display the current question
    function displayQuestion() {
        if (currentQuestionIndex < questions.length) {
            const question = questions[currentQuestionIndex];

            // Update the question textarea
            const questionElement = document.getElementById('question');
            if (questionElement) {
                questionElement.value = question.question;
            }

            // Update the score buttons
            const scoreButtonsElement = document.getElementById('score-buttons');
            if (scoreButtonsElement) {
                scoreButtonsElement.innerHTML = `
                    <button class="score-button" data-score="1">NEVER</button>
                    <button class="score-button" data-score="2">SELDOM</button>
                    <button class="score-button" data-score="3">SOMETIMES</button>
                    <button class="score-button" data-score="4">OFTEN</button>
                    <button class="score-button" data-score="5">ALWAYS</button>
                `;

                // Highlight button functionality
                document.querySelectorAll('.score-button').forEach(button => {
                    button.addEventListener('click', event => {
                        playAudio('buttonsound.mp3');
                        selectedScore = parseInt(event.target.getAttribute('data-score'));

                        // Remove highlight from all buttons and reset their color
                        document.querySelectorAll('.score-button').forEach(btn => {
                            btn.classList.remove('highlight');
                            btn.style.backgroundColor = ''; // Reset color
                            btn.style.color = ''; // Reset text color
                        });

                        // Add highlight and change background color of clicked button
                        event.target.classList.add('highlight');
                        event.target.style.backgroundColor = 'yellow'; // Change to yellow
                        event.target.style.color = 'black'; // Ensure the text stays black
                    });
                });
            }
        } else {
            playAudio('trumpets.mp3');
            displayResults();
        }
    }

    // Handle "Enter" button click
    const enterButton = document.getElementById('enter-button');
    if (enterButton) {
        enterButton.addEventListener('click', () => {
            playAudio('entersound.mp3');

            if (selectedScore !== null) {
                const category = questions[currentQuestionIndex].category;
                scores[category] = (scores[category] || 0) + selectedScore;
                selectedScore = null;
                currentQuestionIndex++; 
                displayQuestion(); 
            } else {
                alert('Please select a score before clicking Enter.');
            }
        });
    }

    // Play audio function for button clicks
    function playAudio(filename) {
        const audio = new Audio(filename);
        audio.play().catch(error => console.error(`Audio playback failed for ${filename}:`, error));
    }

    // Display results as a bar chart
    function displayResults() {
        const username = document.getElementById('username').value || "User";
        const app = document.getElementById('app');
        app.innerHTML = `
            <h1>INTELLIGENCE IDENTIFIER</h1>
            <p id="outro-text">Congratulations, ${username}!<br>Here are the parts of your brain you use the most!</p>
            <canvas id="barChart"></canvas>
        `;

        const canvas = document.getElementById('barChart');
        const ctx = canvas.getContext('2d');

        // Get device pixel ratio to handle high DPI displays
        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth * 0.8;  // Set width to 80% of the window's width
        const height = 500;  // Keep the height fixed

        // Manually scale the canvas size by the device pixel ratio
        canvas.width = width * dpr;
        canvas.height = height * dpr;

        // Scale the context to match the high resolution
        ctx.scale(dpr, dpr);

        const categoryDetails = {
            CatA: { name: "Verbal / Linguistic", color: "#F79D00" },
            CatB: { name: "Visual / Spatial", color: "#973913" },
            CatC: { name: "Musical", color: "#EEE40A" },
            CatD: { name: "Logical / Mathematical", color: "#3958F7" },
            CatE: { name: "Interpersonal (ter)", color: "#20AD01" },
            CatF: { name: "Naturalistic", color: "#838C8C" },
            CatG: { name: "Body / Kinesthetic", color: "#C42BA6" },
            CatH: { name: "Intrapersonal (tra)", color: "#EE0A0A" }
        };

        const descriptions = {
            CatA: `If you scored high in Linguistic Intelligence, you're really good with words...`,
            CatB: `If you scored high in Spatial Intelligence, you're good at understanding and creating visual stuff...`,
            CatC: `If you scored high in Musical Intelligence, you have a knack for understanding music...`,
            CatD: `If you scored high in Logical-Mathematical Intelligence, you're great at solving problems...`,
            CatE: `If you scored high in Interpersonal Intelligence, you're great at understanding people...`,
            CatF: `If you scored high in Naturalistic Intelligence, you have a strong connection with nature...`,
            CatG: `If you scored high in Bodily-Kinesthetic Intelligence, you're really coordinated...`,
            CatH: `If you scored high in Intrapersonal Intelligence, you understand yourself really well...`
        };

        const categories = Object.keys(scores);
        const labels = categories.map(cat => categoryDetails[cat].name);
        const data = categories.map(cat => scores[cat]);
        const colors = categories.map(cat => categoryDetails[cat].color);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.raw}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 40,
                        grid: { display: false },
                        ticks: {
                            display: false,
                            font: {
                                size: 16  // Set font size for the X-axis labels
                            }
                        }
                    },
                    y: {
                        grid: { display: false },
                        ticks: {
                            display: true,
                            font: {
                                family: 'Helvetica',  // Font family
                                size: 27,
                                color: '#000000',
                                weight: 'bold'
                            }
                        }
                    }
                }
            }
        });

        // Add a button to download results as a PDF
        const pdfButton = document.createElement('button');
        pdfButton.textContent = 'Download Results as PDF';
        pdfButton.addEventListener('click', () => generatePDF(categoryDetails, descriptions, categories, data));
        app.appendChild(pdfButton);
    }

    // Generate a PDF of the results
    function generatePDF(categoryDetails, descriptions, categories, dataValues) {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        const margin = 20;
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const contentWidth = pageWidth - 2 * margin;
        const contentHeight = pageHeight - 2 * margin;
        let yPosition = margin;

        // Add the Congratulations message at the top
        const username = document.getElementById('username').value || "User";
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(24);

        // Calculate the width of the text to center it
        const congratsText = `Congratulations, ${username}!`;
        const congratsTextWidth = pdf.getTextWidth(congratsText);
        const centerX = (pageWidth - congratsTextWidth) / 2;

        // Add the text centered on the page
        pdf.text(congratsText, centerX, yPosition);
        yPosition += 10;  // Add some space after the title

        // Add the "Here's how you are using your brain!" sentence
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(16);
        const sentenceText = "Here is how you prefer to think!";

        // Calculate the width of the sentence text to center it
        const sentenceTextWidth = pdf.getTextWidth(sentenceText);
        const sentenceCenterX = (pageWidth - sentenceTextWidth) / 2;

        // Add the sentence centered on the page
        pdf.text(sentenceText, sentenceCenterX, yPosition);
        yPosition += 5;  // Add some space after the new sentence


        // Add the chart image
        const canvas = document.getElementById('barChart');
        const graphImage = canvas.toDataURL('image/png', 1.0);  // Full resolution (quality 1.0)
        const graphHeight = 80;
        pdf.addImage(graphImage, 'PNG', margin, yPosition, contentWidth, graphHeight);
        yPosition += graphHeight + 10;  // Add space after the chart

        // Add descriptions for each category
        categories.forEach((category, index) => {
            const categoryName = categoryDetails[category].name;
            const description = descriptions[category];

            // Add the category name
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text(categoryName, margin, yPosition);
            yPosition += 6;

            // Add the category description
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(12);
            pdf.text(description, margin, yPosition);
            yPosition += 15;

            if (yPosition > contentHeight - 30) {
                pdf.addPage();
                yPosition = margin;  // Reset the yPosition to top of the page
            }
        });

        // Save the PDF document
        pdf.save(`${username}-Intelligence-Results.pdf`);
    }
});
