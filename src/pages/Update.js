import React, { useState } from "react";
import axios from "axios";
import { useNavigate,useLocation } from "react-router-dom";

const Update = () => {
  const [title, setBookTital] = useState("");
  const [description, setDescription] = useState("");
  const [price, setBookPrice] = useState("");
  const [cover, setBookCover] = useState(null);

  const navigate = useNavigate();
  const location = useLocation()

  const bookId = location.pathname.split("/")[2];

  const handleImageChange = (e) => {
    setBookCover(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("cover", cover);

    try {
      await axios.put("http://localhost:8000/books/"+ bookId 
        ,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Book updated successfully");
      navigate('/');

    } catch (err) {
      console.error(err);
      alert("Error adding book");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h2>update Book</h2>
      <div>
        <input
          type="text"
          value={title}
          placeholder="Book name"
          onChange={(e) => setBookTital(e.target.value)}
          required
        />
      </div>
      <div>
        <input
          type="text"
          value={description}
          placeholder=" Book Description"
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div>
        <input
          typeof="number"
          value={price}
          placeholder="Book price"
          onChange={(e) => setBookPrice(e.target.value)}
          required
        ></input>
      </div>
      <div>
        <input
          type="file"
          placeholder="Book Image"
          onChange={handleImageChange}
          required
        />
      </div>
      <button className="formbtn" type="submit">
        Add Book
      </button>
    </form>
  );
};

export default Update;
