const client = require("./src/client/client");
const qrcode = require("qrcode-terminal");
const {handleMessage} = require("./src/events/handleMessage");
const { connectToOpenAi } = require("./src/lib/assistantService");
const { connectToDatabase } = require("./src/lib/mongoose");

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  await connectToOpenAi();
  await connectToDatabase();
  console.log("Client is ready!");
});

client.on("message", (msg) => {
  handleMessage(msg);
});

client.initialize();

module.exports = client;