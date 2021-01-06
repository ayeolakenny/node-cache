import express, { Request, Response, NextFunction } from "express";
import fetch from "node-fetch";
import { createClient } from "redis";

const PORT = process.env.port || 5000;
const REDIS_PORT: any = process.env.port || 6379;

const client = createClient(REDIS_PORT);

const app = express();

const setResponse = (username: string, repos: string) => {
  return `<h2>${username} has ${repos} Github repos`;
};

const getRepos = async (req: Request, res: Response) => {
  try {
    console.log("Fetching data...");

    const { username } = req.params;

    const response = await fetch(`https://api.github.com/users/${username}`);

    const data = await response.json();
    const repos = data.public_repos;

    //set to redis
    client.setex(username, 3600, repos);

    res.send(setResponse(username, repos));
  } catch (error) {
    console.error(error);
    res.status(500);
  }
};

// cache middleware
const cahce = (req: Request, res: Response, next: NextFunction) => {
  const { username } = req.params;

  client.get(username, (err, data) => {
    if (err) throw err;

    if (data !== null) {
      res.send(setResponse(username, data));
    } else {
      next();
    }
  });
};

app.get("/repos/:username", cahce, getRepos);

app.listen(4000, () => {
  console.log("App listening on port " + PORT);
});
