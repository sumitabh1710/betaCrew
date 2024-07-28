const logger = require("./logger");

function requestAllPackets(client) {
  const callType = Buffer.alloc(2);
  callType.writeInt8(1, 0);
  callType.writeInt8(0, 1);
  client.write(callType, () => {
    logger.info("Request to stream all packets sent successfully");
  });
}

function resendPacket(client, sequenceNumber) {
  const packetRequest = Buffer.alloc(2);
  packetRequest.writeInt8(2, 0);
  packetRequest.writeInt8(sequenceNumber, 1);
  client.write(packetRequest, () => {
    logger.info(`Request to resend packet ${sequenceNumber} sent successfully`);
  });
}

module.exports = { requestAllPackets, resendPacket };
