const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();



app.set('view engine', 'ejs'); // Set the view engine to EJS



// Middleware setup
app.use(express.urlencoded({ extended: true}));
app.use(express.static('public'));



// check if a directory exists if it does not create one
const directoryPath = 'notes';
fs.stat(directoryPath, (err, stats) => {
  if (err) {
    if (err.code === 'ENOENT') {
      // Directory does not exist, create it
      fs.mkdir(directoryPath, (err) => {
        if (err) {
          console.error('Error creating directory:', err);
        } else {
          console.log('Directory created successfully');
        }
      });
    } else {
      console.error('Error checking directory:', err);
    }
  } else {
    if (stats.isDirectory()) {
      console.log('Directory exists');
    } else {
      console.log('Path exists, but it is not a directory');
    }
  }
});




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
                const createdAt = new Date(parseInt(file.split('-')[0])).toLocaleString();
                return { fileName: file, 
                         content: note,
                         createdAt: createdAt
                        };
            });
            res.render('index', {notes});
        }
    });
});

app.post('/add', (req, res) => {
    const { title, note } = req.body;

    if (!note) {
        res.status(400).send('Note cannot be empty');
        return;
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0O');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

    const fileName = `${title} ${formattedDate}`;
    const filePath = path.join(__dirname, 'notes', fileName);
    

    const noteData = {
      fileName: fileName,
      content: note,
      createdAt: formattedDate
    };
    //const folderName = path.join(__dirname, 'notes2');

    fs.writeFile(filePath, note, (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error saving note');
        } else {
            res.redirect('/');
        }
    });
});


  
// Edit a note
app.get('/edit/:noteFileName', (req, res) => {
    const noteFileName = req.params.noteFileName;
    const filePath = path.join(__dirname, 'notes', noteFileName);
  
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading note: ${err}`);
        console.error(`File path: ${filePath}`);

        res.status(500).send('Error reading note');
      } else {
        res.render('edit', { noteFileName, noteContent: data });
      }
    });
  });
  
  // Update a note
  app.post('/edit/:noteFileName', (req, res) => {
    const noteFileName = req.params.noteFileName;
    const filePath = path.join(__dirname, 'notes', noteFileName);
    const newNoteContent = req.body.note;
  
    fs.writeFile(filePath, newNoteContent, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error updating note');
      } else {
        res.redirect('/');
      }
    });
  });
  
  // Delete a note
  app.get('/delete/:noteFileName', (req, res) => {
    const noteFileName = req.params.noteFileName;
    const filePath = path.join(__dirname, 'notes', noteFileName);
  
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error deleting note');
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