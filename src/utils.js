const { PACKET_SIZE } = require("../config/config");
const logger = require("./logger");
const fs = require("fs");

function parsePacket(buffer) {
  if (buffer.length < PACKET_SIZE) {
    throw new Error("Incomplete packet received");
  }

  try {
    return {
      symbol: buffer.toString("ascii", 0, 4).trim(),
      buySellIndicator: buffer.toString("ascii", 4, 5).trim(),
      quantity: buffer.readInt32BE(5),
      price: buffer.readInt32BE(9),
      sequence: buffer.readInt32BE(13),
    };
  } catch (err) {
    throw new Error(`Error parsing packet in utils: ${err.message}`);
  }
}

function saveDataToFile(dataPackets) {
  fs.writeFile("output.json", JSON.stringify(dataPackets, null, 2), (err) => {
    if (err) {
      logger.error(`Error writing JSON file: ${err.message}`);
    } else {
      logger.info("JSON file has been saved.");
    }
  });
}

module.exports = { PACKET_SIZE, parsePacket, saveDataToFile };
