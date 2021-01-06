"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const redis_1 = require("redis");
const PORT = process.env.port || 5000;
const REDIS_PORT = process.env.port || 6379;
const client = redis_1.createClient(REDIS_PORT);
const app = express_1.default();
const setResponse = (username, repos) => {
    return `<h2>${username} has ${repos} Github repos`;
};
const getRepos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Fetching data...");
        const { username } = req.params;
        const response = yield node_fetch_1.default(`https://api.github.com/users/${username}`);
        const data = yield response.json();
        const repos = data.public_repos;
        client.setex(username, 3600, repos);
        res.send(setResponse(username, repos));
    }
    catch (error) {
        console.error(error);
        res.status(500);
    }
});
const cahce = (req, res, next) => {
    const { username } = req.params;
    client.get(username, (err, data) => {
        if (err)
            throw err;
        if (data !== null) {
            res.send(setResponse(username, data));
        }
        else {
            next();
        }
    });
};
app.get("/repos/:username", cahce, getRepos);
app.listen(4000, () => {
    console.log("App listening on port " + PORT);
});
//# sourceMappingURL=index.js.map