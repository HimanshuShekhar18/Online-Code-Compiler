require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const DbConnect = require("./database");
app.use(cors());
const PORT = 5501;
DbConnect();
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "20mb" }));
app.use(bodyParser.json());

const generateFile = require("./generateFile");
const jobModel = require("./models/job-model");
const addJobToQueue = require("./jobQueue");

app.get("/", (req, res) => {
  //   res.send("Hello from server.js");
  return res.json({ message: "Hello form server.js json" });
});

app.get("/status", async (req, res) => {
  const jobId = req.query.id;

  try {
    const job = await jobModel.findById(jobId);
    if (job === undefined) {
      return res
        .status(400)
        .json({ success: "false", message: "missing id query param" });
    }
    return res.status(200).json({ success: true, job });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ success: false, error: JSON.stringify(error) });
  }
});

app.post("/run", async (req, res) => {
  const { language = "cpp", code } = req.body;
  console.log(language, code.length);
  if (code === undefined) {
    res.status(400).json({ success: "false", error: "Empty code body" });
  }

  let job;
  try {
    // i) we need to generate a c++ file with content from the request
    const filepath = await generateFile(language, code);
    // return res.send({filepath});

    job = await jobModel.create({ language, filepath });
    const jobId = job._id;
    console.log(job);
    await addJobToQueue(jobId);
    res.status(201).send(job);
  } catch (err) {
    return res.status(500).send(JSON.stringify(err));
  }
});

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
