const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true}));
app.use(express.static('public'));

// define routes
app.get('/', (req, res) =>{
    res.sendFile(path.join(--dirname, 'public', 'index.html'))
});

app.post('/add', (req, res) => {
    const { note } = req.body;
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
const port = 3000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);

});