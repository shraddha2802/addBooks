import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const Update = () => {
  const [title, setBookTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setBookPrice] = useState("");
  const [cover, setBookCover] = useState(null); 
  const [existingCover, setExistingCover] = useState(""); 
  const [preview, setPreview] = useState(""); 

  const navigate = useNavigate();
  const location = useLocation();
  const bookId = location.pathname.split("/")[2];

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/books/${bookId}`);
        const bookData = res.data;
        setBookTitle(bookData.title);
        setDescription(bookData.description);
        setBookPrice(bookData.price);
        setExistingCover(bookData.cover); 
      } catch (err) {
        console.error("Error fetching book data", err);
      }
    };
    fetchBook();
  }, [bookId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setBookCover(file);
    setPreview(URL.createObjectURL(file)); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);

    if (cover) {
      formData.append("cover", cover); 
    }

    try {
      await axios.put(`http://localhost:8000/books/${bookId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Book updated successfully");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Error updating book");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h2>Update Book</h2>

      <div>
        <input
          type="text"
          value={title}
          placeholder="Book name"
          onChange={(e) => setBookTitle(e.target.value)}
      
        />
      </div>

      <div>
        <input
          type="text"
          value={description}
          placeholder="Book Description"
          onChange={(e) => setDescription(e.target.value)}
          
        />
      </div>

      <div>
        <input
          type="number"
          value={price}
          placeholder="Book price"
          onChange={(e) => setBookPrice(e.target.value)}
          
        />
      </div>

      {existingCover && !preview && (
        <div>
          <img
            src={`http://localhost:8000/images/${existingCover}`}
            alt="Current Book Cover"
            width="100"
          />
        </div>
      )}

      {preview && (
        <div>
          <img src={preview} alt="New Book Cover Preview" width="100" />
        </div>
      )}

      <div>
        <input
          type="file"
          onChange={handleImageChange}
        />
      </div>

      <button className="formbtn" type="submit">
        Update Book
      </button>
    </form>
  );
};

export default Update;
