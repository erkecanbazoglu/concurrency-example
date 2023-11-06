const crypto = require("crypto");

const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require("worker_threads");
const fs = require("fs");
const { resolve } = require("path");
const { EOL } = require("os");

// Check if the current script is the main thread
if (isMainThread) {
  const numWorkers = require("os").cpus().length; // Number of worker threads to use
  const outputFileName = "output.csv";
  //Create tasks lists for each cpu core

  const tasks = Array.from({ length: numWorkers }, (_, i) => `Deel PoW ${i}`);

  const workerResults = new Map();

  // Create worker threads and distribute tasks
  const workers = new Set();

  function createWorker(task) {
    const worker = new Worker(__filename, {
      workerData: { task },
    });

    worker.on("message", (message) => {
      workerResults.set(task, JSON.stringify(message));
      workers.delete(worker);

      if (workers.size === 0) {
        writeResultsToCSV(workerResults, outputFileName);
      }
    });

    workers.add(worker);
  }

  tasks.forEach((task) => createWorker(task));
} else {
  // Worker thread logic
  const { task } = workerData;
  const result = performTask(task);

  // Send the result back to the main thread
  parentPort.postMessage({ task, result });
}

function performTask(task) {
  console.log(
    "Simulating Ethereum Proof of Work (PoW) as a CPU intensive task: " + task
  );
  return simulatePoW(task, 5);
}

function writeResultsToCSV(results, outputFileName) {
  const data = Array.from(
    results,
    ([task, result]) => `${task},${result}`
  ).join(EOL);

  fs.writeFileSync(resolve(__dirname, outputFileName), data, "utf8");

  console.log(`Results written to ${outputFileName}`);
}

function simulatePoW(challenge, difficulty) {
  let nonce = 0;
  let hash;
  const prefix = "0".repeat(difficulty);

  while (true) {
    hash = crypto
      .createHash("sha256")
      .update(challenge + nonce)
      .digest("hex");

    if (hash.startsWith(prefix)) {
      console.log(`Nonce found: ${nonce}`);
      console.log(`Hash: ${hash}`);
      return {
        challenge: challenge + nonce,
        nonce,
        hash,
      };
    }

    nonce++;
  }
}
