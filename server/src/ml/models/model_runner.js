// server/src/ml/model_runner.js

const { spawn } = require("child_process");
const path = require("path");
const logger = require("../utils/logger");

// Function to run python script
const runPythonScript = (scriptPath, args) => {
  return new Promise((resolve, reject) => {
    const python = spawn("python", [scriptPath, ...args]);

    let dataString = "";
    let errorString = "";

    // Collect data from script
    python.stdout.on("data", (data) => {
      dataString += data.toString();
    });

    // Collect errors from script
    python.stderr.on("data", (data) => {
      errorString += data.toString();
    });

    // Handle script close
    python.on("close", (code) => {
      if (code !== 0) {
        logger.error(`Python script exited with code ${code}: ${errorString}`);
        return reject(
          new Error(`Python script exited with code ${code}: ${errorString}`)
        );
      }

      try {
        const result = JSON.parse(dataString);
        return resolve(result);
      } catch (err) {
        logger.error(`Error parsing Python script output: ${err.message}`);
        return reject(
          new Error(`Error parsing Python script output: ${err.message}`)
        );
      }
    });
  });
};

// Run ARIMA model
exports.runARIMA = async (data, forecastSteps) => {
  try {
    const scriptPath = path.join(__dirname, "scripts", "run_arima.py");

    // Convert data to JSON string for passing to Python
    const dataArg = JSON.stringify(data);
    const stepsArg = forecastSteps.toString();

    const result = await runPythonScript(scriptPath, [dataArg, stepsArg]);
    return result;
  } catch (error) {
    logger.error(`Error running ARIMA model: ${error.message}`);
    throw error;
  }
};

// Similar functions for Prophet and Random Forest models
