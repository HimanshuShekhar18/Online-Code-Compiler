require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
app.use(cors());
const PORT = 5501;
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "20mb" }));
app.use(bodyParser.json());

const generateFile = require("./generateFile");
const executeFile = require("./executeFile");

app.get("/", (req, res) => {
  //   res.send("Hello from server.js");
  return res.json({ message: "Hello form server.js json" });
});

app.post("/run", async (req, res) => {
  const { language = "cpp", code } = req.body;
  if (code === undefined) {
    res.status(400).json({ success: "false", error: "Empty code body" });
  }

  try {
    console.log(Date.now());
    // i) we need to generate a c++ file with content from the request
    const filepath = await generateFile(language, code);
    // return res.send({filepath});
    //  ii)   we need to run the file and send the response
    const output = await executeFile(filepath);
    
    console.log(Date.now());
    return res.send({ filepath, output });

    // return res.json({language,code});
    //   return res.send({ language, code });
  } catch (err) {
    res.status(500).json({err});
  }
});

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
