require("dotenv").config();

const express = require("express");
const app = express();
const port = 3001;

const multer = require("multer");
const bodyParser = require("body-parser");
const upload = multer(); // for parsing multipart/form-data

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const Airtable = require("airtable");

Airtable.configure({
    endpointUrl: "https://api.airtable.com",
    apiKey: process.env.AIRTABLE_WRITE_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

// Get post request and then fill out airtable forms
app.post("/api/new", async (req, res) => {
    const response = await fetch(req.body.url);
    const data = await response.json();

    await base("Starships").create([
        {
            "fields": data
        }
    ], function (err, records) {
        if (err) {
            console.error(err);
            return;
        }
        records.forEach(function f(record) {
            console.log(record.getId());
        });
    });
    await res.send("POST Request received");
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
