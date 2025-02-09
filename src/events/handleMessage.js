const { processMessage } = require("../actions/processMessage");
const { processAdmCommand } = require("../actions/processAdmCommand");

async function handleMessage(msg) {
  const stop = await processAdmCommand(msg);
  if (!stop) processMessage(msg);
}

module.exports = { handleMessage };
