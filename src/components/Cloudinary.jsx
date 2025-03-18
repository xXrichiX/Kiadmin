import React, { useState } from "react";

const Cloudinary = () => {
  const cloud_name = import.meta.env.VITE_CLOUD_NAME;
  const preset_name = import.meta.env.VITE_UPLOAD_PRESET;

  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  const uploadImage = async (e) => {
    const files = e.target.files;
    const data = new FormData();
    data.append("file", files[0]);
    data.append("upload_preset", preset_name);

    setLoading(true);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );

      const file = await response.json();
      setImage(file.secure_url);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Upload Image</h1>
      <input type="file" onChange={uploadImage} />
      {loading ? <h3>Loading...</h3> : image && <img src={image} alt="Uploaded" />}
    </div>
  );
};

export default Cloudinary;
