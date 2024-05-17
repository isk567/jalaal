const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const DATA_FILE = path.join(__dirname, 'tally_data.json');

// Initialize data if file does not exist
if (!fs.existsSync(DATA_FILE)) {
    const initialData = [
        { name: 'ISK', count: 0, rate: 10, income: 0 },
        { name: 'GANIM', count: 0, rate: 10, income: 0 },
        { name: 'RAFSAN', count: 0, rate: 9.5, income: 0 }
    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

// Endpoint to get tally data
app.get('/api/tally', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading data file', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(JSON.parse(data));
    });
});

// Endpoint to update tally count
app.post('/api/tally', (req, res) => {
    const { name, count } = req.body;
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading data file', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        const tallies = JSON.parse(data);
        const tally = tallies.find(t => t.name === name);
        if (tally) {
            tally.count = count;
            tally.income = tally.count * tally.rate;
            fs.writeFile(DATA_FILE, JSON.stringify(tallies, null, 2), (err) => {
                if (err) {
                    console.error('Error writing data file', err);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                }
                res.json({ message: 'Tally updated successfully' });
            });
        } else {
            res.status(400).json({ error: 'Invalid tally name' });
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
