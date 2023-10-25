document.addEventListener('DOMContentLoaded', function () {
    const userInput = document.getElementById('userInput');
    const resultDiv = document.getElementById('result');

    // Function to call the server and get analysis results
    function analyzeInput() {
        fetch('/test-input', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ input: userInput.value }),
        })
            .then(response => response.json())
            .then(data => {
                // Display detailed results
                resultDiv.innerHTML = `
                <p><strong>Action:</strong> ${data.action}</p>
                <p><strong>Rule:</strong> ${data.rule}</p>
                <p><strong>Details:</strong> ${data.feedback}</p>
            `;
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    // Event listener for real-time input
    userInput.addEventListener('input', function() {
        analyzeInput(); // Analyze input in real-time
    });
});
