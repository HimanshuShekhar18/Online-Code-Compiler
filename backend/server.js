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
const executeCpp = require("./executeCpp");
const executePy = require("./executePy");
const executeJava = require("./executeJava");
const jobModel = require("./models/job-model");


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
    /*
    {
      language: 'cpp',
      filepath: 'D:\\WEB DEVELOPMENT PRACTICAL\\PROJECTS\\2) OnlineCompiler\\Coding Part\\backend\\codes\\69ebe0d9-d245-4eaf-a037-f7f86b1e08fd.cpp',
      status: 'pending',
      _id: new ObjectId('65b04400a19a3f1bee60635d'),
      submittedAt: 2024-01-23T22:56:00.765Z,
      __v: 0
    }
    */
    
    console.log(jobId); //  new ObjectId('65b04400a19a3f1bee60635d')

    job["startedAt"] = Date.now();
    await job.save();

    //  ii)   we need to run the file and send the response
    let output;
    if (language === "cpp") {
      output = await executeCpp(filepath);
    } else if (language === "py") {
      output = await executePy(filepath);
    } else {
      output = await executeJava(filepath);
    }

    job["completedAt"] = Date.now();
    job["status"] = "success";
    job["output"] = output;

    await job.save();

    console.log(job);

    return res.status(201).send(job);

    // console.log(filepath,output);
    // return res.send({ filepath, output });

    // return res.json({language,code});
    // return res.send({ language, code });
  } catch (err) {
    job["completedAt"] = Date.now();
    job["status"] = "error";
    // JSON stringify cna be helpful in converting complicated objects to a JSON string
    job["output"] = JSON.stringify(err);
    await job.save();
    console.log(job);
    // console.log(err);
    return res.status(500).json({ err });
  }
});

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
