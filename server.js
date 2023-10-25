const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // to serve static files like HTML, CSS, JavaScript

// Enhanced WAF logic simulator with detailed feedback
class WAFSimulator {
    constructor() {
        this.rules = [
            {
                id: 1,
                description: 'SQL Injection detection',
                condition: (input) => /union\s+select|select\s+.*\s+from\s+.*|drop\s+table|exec\s+\(.*\)/i.test(input),
                action: 'block',
                feedback: 'SQL command patterns detected' // Detailed feedback
            },
            {
                id: 2,
                description: 'XSS attack detection',
                condition: (input) => /<script>|<\/script>|javascript:/i.test(input),
                action: 'block',
                feedback: 'Malicious script patterns detected' // Detailed feedback
            },
        ];
    }

    analyze(input) {
        for (let rule of this.rules) {
            if (rule.condition(input)) {
                return {
                    action: rule.action,
                    rule: rule.description,
                    feedback: rule.feedback // Return detailed feedback
                };
            }
        }
        return { action: 'allow', rule: '', feedback: 'No malicious patterns detected' };
    }
}

const waf = new WAFSimulator();

// Endpoint to test strings against the WAF rules
app.post('/test-input', (req, res) => {
    const userInput = req.body.input;
    const result = waf.analyze(userInput);
    res.send(result);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
