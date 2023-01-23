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
  let { directorId, movieName, leadActor } = request.body;
  const postMethod = `
  INSERT INTO
  movie (director_id, movie_name, lead_actor)
  VALUES
    ('${directorId}', ${movieName}, '${leadActor}');`;
  let method = await db.run(postMethod);
  console.log("Player Added");
});
//GET
const convertIntoCamel2 = (item) => {
  return {
    movieId: item.movie_id,
    directorId: item.director_id,
    movieName: item.movie_name,
    leadActor: item.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  console.log(movieId);
  let get = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  let getMethod = await db.get(get);
  response.send(convertIntoCamel2(getMethod));
});

//PUT
app.put("/movies/:movieId/", async (request, response) => {
  let Id = request.params;
  let { directorId, movieName, leadActor } = request.body;
  const updatePlayerQuery = `
  UPDATE
    movie
  SET
    director_id = '${directorId}',
    movie_name =  ${movieName},
    lead_actor = '${leadActor}'
  WHERE
    player_id = ${Id};`;

  await db.run(updatePlayerQuery);
  response.send("Movie Details Updated");
});
//DELETE
app.delete("/movies/:movieId/", async (request, response) => {
  let { deleteId } = request.params;
  let deleteQuery = `DELETE FROM movie WHERE movie_id = ${deleteId};`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});
//GET DIRECTORS

const rund = (item) => {
  return {
    directorId: item.director_id,
    directorName: item.director_name,
  };
};
app.get("/directors/", async (request, response) => {
  let getDirectors = `SELECT * FROM director;`;
  let directors = await db.all(getDirectors);
  response.send(directors.map((item) => rund(item)));
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const directId = request.params;
  let getMovies = `SELECT * FROM movie WHERE director_id = ${directId}:`;
  let directorMovies = await db.all(getMovies);
  response.send(directorMovies);
});

module.exports = app;
