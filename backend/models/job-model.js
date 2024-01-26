const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const jobSchema = new Schema(
  {
    language: {
      type: String,
      required: true,
      enum: ["cpp", "py", "java"]
// Enumeration (enum) is a reliable way to validate string data i.e will accept these values only
    },
    filepath: {
      type: String,
      require: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    startedAt: {
      type: Date
    },
    completedAt: {
      type: Date
    },
    output: {
      type: String
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "success", "error"]
    }
  }
);

module.exports = mongoose.model("Job", jobSchema, "jobs");
