const net = require("net");
const { HOST, PORT } = require("../config/config");
const { processData, handleMissingSequences } = require("./dataProcessor");
const { requestAllPackets } = require("./packetHandler");
const logger = require("./logger");
const { saveDataToFile } = require("./utils");

const dataPackets = [];
const missingSequences = new Set();

const client = new net.Socket();

client.connect(PORT, HOST, () => {
  logger.info(`Connected to server at ${HOST}:${PORT}`);
  requestAllPackets(client);
});

client.on("data", (data) => {
  logger.info(`Received data: ${data.toString("hex")}`);
  processData(data, dataPackets, missingSequences);

  if (missingSequences.size === 0) {
    logger.info("All missing packets received.");
    client.end();
  }
});

client.on("close", () => {
  logger.info("Connection closed");
  if (missingSequences.size === 0) {
    saveDataToFile(dataPackets);
  } else {
    handleMissingSequences(client, missingSequences);
  }
});

client.on("error", (err) => {
  logger.error(`Connection error: ${err.message}`);
});
