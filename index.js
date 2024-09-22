import express from "express"
import fs from "fs"
import mysql from "mysql2"
import cors from "cors"
import multer from "multer"
import path from "path"
import bodyParser from "body-parser"
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express()
app.use(express.json());
app.use(cors());

app.use(bodyParser.json());
app.use(express.static('public')); 

const db = mysql.createConnection({
    host : "localhost",
    user : "root",
    password : "123456",
    database : "test",
    port : 3306,
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'public/images/';
        if (!fs.existsSync(dir)){
          fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
      },
      filename: function (req, file, cb) {
        const bookTitle = req.body.title ? req.body.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'default';
        const extension = path.extname(file.originalname);
        cb(null, `${bookTitle}_${extension}`);
    }
});
const upload = multer({ storage });


app.get("/", (req,res) => {
    res.json("hello this is backend")
})

app.get("/books", (req,res)=>{
    const q = "SELECT * FROM books"
    db.query(q,(err,data)=> {
        if(err) return res.json(err)
        return res.json(data)
    })
})

app.get("/books/:id", (req, res) => {
    const bookId = req.params.id;
    const q = "SELECT * FROM books WHERE id = ?";
    db.query(q, [bookId], (err, data) => {
      if (err) {
        console.error("Error querying database:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }
      if (data.length === 0) {
        return res.status(404).json({ message: "Book not found" });
      }
      return res.json(data[0]);
    });
  });
  
  

app.post('/addbooks', upload.single('cover'), (req, res) => {
    const { title, description, price } = req.body;
    const cover = req.file ? req.file.filename : '';
    const sql = 'INSERT INTO books (title, description, price, cover) VALUES (?, ?, ?, ?)';
    db.query(sql, [title, description, price, cover], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }
      res.json({ message: 'Book added successfully', data: result });
    });
  });



app.delete("/books/:id", (req, res) => {
    const bookId = req.params.id;

    const getCoverQuery = "SELECT cover FROM books WHERE id = ?";
    db.query(getCoverQuery, [bookId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });

        if (result.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const cover = result[0].cover;

        if (cover) {
            const coverPath = path.join(__dirname, 'public/images', cover);
            fs.unlink(coverPath, (err) => {
                if (err) {
                    console.error('Error deleting the cover file:', err);
                } else {
                    console.log('Cover file deleted successfully');
                }
            });
        }

        const deleteBookQuery = "DELETE FROM books WHERE id = ?";
        db.query(deleteBookQuery, [bookId], (err, data) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });
            return res.json({ message: "Book has been deleted" });
        });
    });
});


// app.put("/books/:id",upload.single('cover'), (req,res)=> {
//     const bookId = req.params.id;
//     let cover =  req.body.cover;

//     if(req.file){
//         cover = req.file.filename;
        
//     }
//     const q = "UPDATE books SET `title` = ? ,`description` = ? ,`price` = ? ,`cover` = ? WHERE id = ?" 
//     const values = [
//         req.body.title,
//         req.body.description,
//         req.body.price,
//         cover,
//     ]
//     db.query(q,[...values,bookId],(err,data)=> {
//         if(err) return res.json(err)
//             return res.json("Book has been updateded")
//     })
// })


app.put("/books/:id", upload.single('cover'), (req, res) => {
  const bookId = req.params.id;
  const { title, description, price } = req.body;
  let cover = req.file ? req.file.filename : null;

  // If there's a new cover image, delete the old cover image
  if (cover) {
    const getOldCoverQuery = "SELECT cover FROM books WHERE id = ?";
    db.query(getOldCoverQuery, [bookId], (err, result) => {
      if (err) {
        console.error("Error retrieving old cover name:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }

      if (result.length > 0) {
        const oldCover = result[0].cover;
        if (oldCover) {
          const oldCoverPath = path.join(__dirname, 'public/images', oldCover);
          fs.unlink(oldCoverPath, (err) => {
            if (err) {
              console.error('Error deleting the old cover file:', err);
            } else {
              console.log('Old cover file deleted successfully');
            }
          });
        }
      }

      // Update the book record with the new cover image
      const updateBookQuery = "UPDATE books SET title = ?, description = ?, price = ?, cover = ? WHERE id = ?";
      const values = [title, description, price, cover, bookId];

      db.query(updateBookQuery, values, (err, data) => {
        if (err) {
          console.error("Error updating book:", err);
          return res.status(500).json({ message: "Database error", error: err });
        }
        return res.json({ message: "Book has been updated with new cover" });
      });
    });
  } else {
    // Update the book record without changing the cover image
    const updateBookQuery = "UPDATE books SET title = ?, description = ?, price = ? WHERE id = ?";
    const values = [title, description, price, bookId];

    db.query(updateBookQuery, values, (err, data) => {
      if (err) {
        console.error("Error updating book:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }
      return res.json({ message: "Book has been updated" });
    });
  }
});



app.listen(8000,()=> {
    console.log("connected to database !");
})