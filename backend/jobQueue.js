// Queue class
const Queue = require("bull");

// Queue class ka instance
const jobQueue = new Queue("job-queue");
const NUM_WORKERS = 5;
const jobModel = require("./models/job-model");
const executeCpp = require("./executeCpp");
const executePy = require("./executePy");
const executeJava = require("./executeJava");

// processing function
jobQueue.process(NUM_WORKERS, async ({ data }) => {
  console.log(data); // { id: '65b3dbac577c481c9cfc8885' }
  const { id: jobId } = data;
  const job = await jobModel.findById(jobId);
  if (job === undefined) {
    throw Error("job not found");
  }
  console.log("Fetched Job", job);

  //  ii)   we need to run the file and send the response
  try {
    let output;
    job["startedAt"] = Date.now();
    await job.save();

    if (job.language === "cpp") {
      output = await executeCpp(job.filepath);
    } else if (job.language === "py") {
      output = await executePy(job.filepath);
    } else {
      output = await executeJava(job.filepath);
    }

    job["completedAt"] = Date.now();
    job["status"] = "success";
    job["output"] = output;

    await job.save();
    return true;
  } catch (err) {
    job["completedAt"] = Date.now();
    job["status"] = "error";
    // JSON stringify cna be helpful in converting complicated objects to a JSON string
    job["output"] = JSON.stringify(err);
    await job.save();
    throw Error(JSON.stringify(err));
  }
});

// You can listen to completed (or failed) jobs by attaching listeners
jobQueue.on("failed", (error) => {
  console.log(error.data.id, "failed", error.failedReason);
});

const addJobToQueue = async (jobId) => {
  await jobQueue.add({ id: jobId });
};
module.exports = addJobToQueue;
