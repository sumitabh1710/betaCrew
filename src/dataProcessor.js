const logger = require("./logger");
const { parsePacket } = require("./utils");
const { PORT, HOST, PACKET_SIZE } = require("../config/config");
const { resendPacket } = require("./packetHandler");

let BUFFER_COLLECTOR = Buffer.alloc(0);

function processData(data, dataPackets, missingSequences) {
  try {
    BUFFER_COLLECTOR = Buffer.concat([BUFFER_COLLECTOR, data]);

    while (BUFFER_COLLECTOR.length >= PACKET_SIZE) {
      const packetBuffer = BUFFER_COLLECTOR.slice(0, PACKET_SIZE);
      BUFFER_COLLECTOR = BUFFER_COLLECTOR.slice(PACKET_SIZE);

      try {
        const packet = parsePacket(packetBuffer);
        logger.info(`Processed packet: ${JSON.stringify(packet)}`);

        dataPackets.push(packet);
        missingSequences.delete(packet.sequence);

        dataPackets.sort((a, b) => a.sequence - b.sequence);

        const lastSequence = dataPackets[dataPackets.length - 1].sequence;
        for (let i = 1; i <= lastSequence; i++) {
          if (!dataPackets.find((p) => p.sequence === i)) {
            missingSequences.add(i);
          }
        }
      } catch (err) {
        logger.error(`Error parsing packet: ${err.message}`);
      }
    }
  } catch (err) {
    logger.error(`Error processing data: ${err.message}`);
  }
}

function handleMissingSequences(client, missingSequences) {
  client.connect(PORT, HOST, () => {
    logger.info(
      `Reconnected to server at ${HOST}:${PORT} to request missing packets`
    );
    missingSequences.forEach((sequence) => {
      resendPacket(client, sequence);
    });
  });
}

module.exports = { processData, handleMissingSequences };
