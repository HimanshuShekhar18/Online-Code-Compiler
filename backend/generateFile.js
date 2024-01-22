const fs = require("fs"); // fs (built-in Node.js File System module)

const path = require("path");

const { v4: uuid } = require("uuid");

// works fine cross-platform availability
const dirCodes = path.join(__dirname, "codes");

// at the end we wiil have with "codes" folder
if (!fs.existsSync(dirCodes)) {
  fs.mkdirSync(dirCodes, { recursive: true });
}

// we will use unique ID genrator and using it create a unique ID for each file join.cpp after it and save the cotent in this file
const generateFile = async (format, code) => {
  const jobId = uuid(); // gets a string

  const filename = `${jobId}.${format}`;

  const filepath = path.join(dirCodes, filename);

  // write content inside this file
  await fs.writeFileSync(filepath, code);

  return filepath;
};

module.exports = generateFile;
