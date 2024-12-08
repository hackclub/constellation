require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const port = 6969;

const multer = require("multer");
const bodyParser = require("body-parser");
const upload = multer(); // for parsing multipart/form-data

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cors());

const { WebClient } = require("@slack/web-api");

const Airtable = require("airtable");

Airtable.configure({
    endpointUrl: "https://api.airtable.com",
    apiKey: process.env.AIRTABLE_WRITE_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

app.get("/", (req, res) => {
    console.log(req.ip);
    res.send("Hi hello this is the route route");
});

// Send off sanitized records from airtable, should be significantly faster than pulling directl from all the different pages at varying speeds
app.get("/starships", async (req, res) => {
    console.log("get request made");
    let starshipsResponse = {
        starships: [],
    };
    base("Starships")
        .select({
            // Selecting the first 3 records in Grid view:
            // maxRecords: 3,
            view: "overview",
        })
        .eachPage(
            function page(records, fetchNextPage) {
                // This function (`page`) will get called for each page of records.
                // append each record's info (minus extra) to the frontend response !!
                records.forEach((record) => {
                    const slackId = record.get("slack_id");
                    starshipsResponse.starships.push({
                        slack_id: slackId,
                        website_url: record.get("website_url"),
                        country: record.get("country"),
                        city: record.get("city"),
                    });
                    console.log("Retrieved", slackId);
                });

                // To fetch the next page of records, call `fetchNextPage`.
                // If there are more records, `page` will get called again.
                // If there are no more records, `done` will get called.
                fetchNextPage();
            },
            function done(err) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: err.message });
                }
                res.json(starshipsResponse);
            }
        );
});

// Add yourself via cURL + post request
app.post("/starships", async (req, res) => {
    const submission = await fetch(req.body.url).then((response) =>
        response.json()
    );
    console.log(submission);

    // verify slack ID exists & has not been submitted before
    if (submission.slack_id) {
        try {
            const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

            const membersResponse = await slack.conversations.members({
                channel: "C07TQPAGAMA",
            });

           const asdf = membersResponse.members;

           console.log(asdf);

            if (membersResponse.members.includes(submission.slack_id)) {
                console.log("Slack ID exists in channel");
                // Continue with your next steps
            } else {
                console.log(submission.slack_id)
                return res.send(
                    "invalid slack ID!! (are you in #constellation?) please use #what-is-my-slack-id"
                );
            }
        } catch (error) {
            return res.status(500).send("Error checking Slack membership");
        }
    } else {
        await res.send(
            "missing slack ID!! please reference constellation.hackclub.com/heidi/api"
        );
    }

    // verify country is 2-letter ISO code
    if (!submission.country) {
        await res.send("missing country!!");
    }

    // verify city exists
    if (!submission.city) {
        await res.send("missing city!!");
    }

    // ping-pong response after. how does this work?? no fucking clue lolz

    // if all fields are good to go,
    await base("Starships").create(
        [
            {
                fields: {
                    city: submission.city,
                    country: submission.country,
                    slack_id: submission.slack_id,
                    extra: submission.extra ? submission.extra : "N/A",
                },
            },
        ],
        function (err, records) {
            if (err) {
                console.error(err);
                return;
            }
            records.forEach(function f(record) {
                console.log(record.getId());
            });
        }
    );

    // Shoot back success
    await res.send(
        "POST Request received!! If everything went well, you should be able to find your submission"
    );
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
