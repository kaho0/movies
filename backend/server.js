import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors"; // Import the cors package

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(
  cors({
    origin: "*", // Allow all origins
  })
);
// Middleware
app.use(express.json());

// Use CORS middleware

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Movie Schema & Model
const MovieSchema = new mongoose.Schema({
  Budget: String,
  Home_Page: String,
  Movie_Name: String,
  Genres: [String],
  Overview: String,
  Cast: [String],
  Original_Language: [String],
  Storyline: String,
  Production_Company: [String],
  Release_Date: [String],
  Revenue: String,
  Run_Time: [String],
  Tagline: String,
  Vote_Average: Number,
  Vote_Count: String,
});

const Movie = mongoose.model("Movie", MovieSchema);

// Routes
app.get("/", (req, res) => {
  res.send("API is running");
});

app.post("/movies", async (req, res) => {
  try {
    const newMovie = new Movie(req.body);
    await newMovie.save();
    res.status(201).json(newMovie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/movies", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
