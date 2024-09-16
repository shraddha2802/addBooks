import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Add = () => {
  const [title, setBookTital] = useState("");
  const [description, setDescription] = useState("");
  const [price, setBookPrice] = useState("");
  const [cover, setBookCover] = useState(null);
  
 const navigate = useNavigate()

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
      const response = await axios.post(
        "http://localhost:8000/addbooks",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }

      );
      console.log(response.data);
      alert("Book added successfully");
      navigate("/");

    } catch (err) {
      console.log(err);
      alert("Error adding book");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h2>Add Book</h2>
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

export default Add;
