const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.set('view engine', 'ejs'); // Set the view engine to EJS

// Middleware setup
app.use(express.urlencoded({ extended: true}));
app.use(express.static('public'));

// define routes
app.get('/', (req, res) =>{
    // res.sendFile(path.join(--dirname, 'public', 'index.html'))
    const notesDir = path.join(__dirname, 'notes');
    fs.readdir(notesDir, (err, files) =>{
        if (err) {
            console.error(err);
            res.status(500).send('Error reading notes');
        } else{

            const notes = files.map(file => {
                const filePath = path.join(notesDir, file);
                const note = fs.readFileSync(filePath, 'utf8');
                return { fileName: file, content: note};
            });
            res.render('index', {notes});
        }
    });
});

app.post('/add', (req, res) => {
    const { note } = req.body;

    if (!note) {
        res.status(400).send('Note cannot be empty');
        return;
    }

    const fileName = Date.now() + '.txt';
    const filePath = path.join(__dirname, 'notes', fileName);

    fs.writeFile(filePath, note, (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error saving note');
        } else {
            res.redirect('/');
        }
    });
});

//start the Server
const port = 5000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);

});