const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // to serve static files like HTML, CSS, JavaScript

// Enhanced WAF logic simulator with additional functionalities
class WAFSimulator {
    constructor() {
        this.rules = [
            {
                id: 1,
                description: 'SQL Injection detection',
                condition: (input) => /union\s+select|select\s+.*\s+from\s+.*|drop\s+table|exec\s+\(.*\)/i.test(input),
                action: 'block',
                feedback: 'SQL command patterns detected'
            },
            {
                id: 2,
                description: 'XSS attack detection',
                condition: (input) => /<script>|<\/script>|javascript:/i.test(input),
                action: 'block',
                feedback: 'Malicious script patterns detected'
            },
            // Add more rules here
            {
                id: 3,
                description: 'Command Injection detection',
                condition: (input) => /;|&&|\|\||\b(cat|ls|rm|echo|whoami|wget|curl)\b/i.test(input),
                action: 'block',
                feedback: 'Command injection patterns detected'
            },
            {
                id: 4,
                description: 'Path Traversal detection',
                condition: (input) => /\.\.|\/etc\/passwd|\/bin\/sh/i.test(input),
                action: 'block',
                feedback: 'Path traversal patterns detected'
            },
        ];
        this.blockedIPs = {};
    }

    analyze(input, ip) {
        for (let rule of this.rules) {
            if (rule.condition(input)) {
                this.logThreat(input, ip, rule.description, rule.feedback);
                return {
                    action: rule.action,
                    rule: rule.description,
                    feedback: rule.feedback
                };
            }
        }
        return { action: 'allow', rule: '', feedback: 'No malicious patterns detected' };
    }

    logThreat(input, ip, rule, feedback) {
        const logEntry = `${new Date().toISOString()} - IP: ${ip}, Input: ${input}, Rule: ${rule}, Feedback: ${feedback}\n`;
        fs.appendFile('logs/threats.log', logEntry, (err) => {
            if (err) throw err;
        });

        if (!this.blockedIPs[ip]) {
            this.blockedIPs[ip] = 0;
        }
        this.blockedIPs[ip] += 1;

        if (this.blockedIPs[ip] > 5) {
            fs.appendFile('logs/blocked_ips.log', `${ip}\n`, (err) => {
                if (err) throw err;
            });
        }
    }

    isBlocked(ip) {
        return this.blockedIPs[ip] > 5;
    }
}

const waf = new WAFSimulator();

// Endpoint to test strings against the WAF rules
app.post('/test-input', (req, res) => {
    const userInput = req.body.input;
    const userIP = req.ip;

    if (waf.isBlocked(userIP)) {
        res.status(403).send({ action: 'block', rule: 'IP blocked', feedback: 'Too many malicious attempts from this IP' });
        return;
    }

    const result = waf.analyze(userInput, userIP);
    res.send(result);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
