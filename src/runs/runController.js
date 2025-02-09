const client = require("../client/client");
const {
  retrieveMessageStatus,
  retrieveLastMessage
} = require("../lib/assistantService");
const { Contact } = require("../models/Contact");

let runsObserver = [];

function getRuns() {
  return runsObserver;
}

function pushRun(run) {
  runsObserver.push(run);
}

function removeRun(contactId) {
  runsObserver = runsObserver.filter((run) => run.contactId !== contactId);
}

function randomBoolean() {
  return Math.random() < 0.5;
}

function randomSecondsFromInterval(min, max) {
  const randomValue = Math.random() * (max - min) + min;
  return Math.floor(randomValue * 100) / 100;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const functionExecutors = {
  generatePayment: (params, contactId) => {
    console.log(`params`,params, contactId)
  },
  changeName: (params, contactId, msg) => {
    Contact.findOneAndUpdate({ contactId }, { contactName: params })
      .then(() => msg.reply(`Feito! Alterei para ${params}.`))
      .catch((error) => console.log(`error changeName`, error));
  }
 };

async function processExecuteFunction(message, contactId, msg) {
  try {
    if (
      message.includes("[EXECUTE-START]") &&
      message.includes("[EXECUTE-END]")
    ) {
      const startIndex = message.indexOf("[EXECUTE-START]") + 15;
      const endIndex = message.indexOf("[EXECUTE-END]");
      const snippet = message.substring(startIndex, endIndex).trim();

      const functionName = snippet.substring(0, snippet.indexOf("(")).trim();
      let paramsRaw = snippet.substring(
        snippet.indexOf("(") + 1,
        snippet.lastIndexOf(")")
      );
      paramsRaw = paramsRaw.replace(/['"]/g, "").trim();

      if (functionExecutors[functionName]) {
        functionExecutors[functionName](paramsRaw, contactId, msg);
      }
    }
  } catch (error) {
    console.error(`error processExecuteFunction`, error);
  }
}

async function processRuns() {
  try {
    if (runsObserver.length)
      for (const run of runsObserver) {
        if (run.sendMessagesInProgress) continue;

        const { status } = await retrieveMessageStatus(run.threadId, run.runId);
        if (status === "completed") {
          run.sendMessagesInProgress = true;
          let lastMessage = await retrieveLastMessage(run.threadId);
          console.log(`generatedMessage`,lastMessage)
          let content = lastMessage.content.split("[EXECUTE-START]")[0];
          const messages = content.split("\n");
          const chat = await run.msg.getChat();
          const toReply = randomBoolean();
          if (toReply) await run.msg.reply(messages[0]);
          else await client.sendMessage(run.contactId, messages[0]);

          for (let i = 1; i < messages.length; i++) {
            if (!messages[i]) continue;
            await chat.sendStateTyping();
            const delayTime = randomSecondsFromInterval(2, 5);
            await delay(delayTime * 1000);
            await client.sendMessage(run.contactId, messages[i]);
          }
          processExecuteFunction(lastMessage.content, run.contactId, run.msg);
          removeRun(run.contactId);
        }
      }
  } catch (error) {
    console.error(`error processRuns`, error);
  }
}

setInterval(processRuns, 2000);

module.exports = { getRuns, pushRun, removeRun };
