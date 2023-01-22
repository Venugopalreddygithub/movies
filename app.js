const express = require("express");
const app = express();

app.use(express.json());

const sqlite3 = require("sqlite3");
const path = require("path");
const dbpath = path.join(__dirname, "moviesData.db");
const { open } = require("sqlite");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertIntoCamel = (item) => {
  return {
    movieName: item.movie_name,
  };
};

//GET
app.get("/movies/", async (request, response) => {
  const getMovies = `SELECT * FROM movie;`;
  const movies = await db.all(getMovies);
  response.send(movies.map((item) => convertIntoCamel(item)));
});
//POST
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;

  const postMethod = `
  INSERT INTO
    movie (director_id, movie_name, lead_actor)
  VALUES
    ('${directorId}', ${movieName}, '${leadActor}');`;
  const dbResponse = await db.run(postMethod);
  response.send("Movie Successfully Added");
});
