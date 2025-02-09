const { OpenAI } = require("openai");
require("dotenv").config();

let openAiClient;
let assistantId = process.env.OPEN_AI_ASSISTANT_ID;
let apiKey = process.env.OPEN_AI_KEY;

if (!assistantId || !apiKey) 
  throw new Error('Por favor, defina a variável OPEN_AI_ASSISTANT_ID e OPEN_AI_KEY no .env');

const connectToOpenAi = () => {
  if (!openAiClient) {
    openAiClient = new OpenAI({ apiKey });
    console.log("Conectado na OpenAi")
  }
  return openAiClient;
};

const createNewThread = async (content) => {

  const messageThread = await openAiClient.beta.threads.create({
    messages: [
      {
        role: "assistant",
        content
      }
    ]
  });

  return { threadId: messageThread.id };
};


const createNewMessage = async (
  message,
  threadId
) => {
  try{const threadMessage = await openAiClient.beta.threads.messages.create(threadId, {
    role: "user",
    content: message
  });

  const run = await openAiClient.beta.threads.runs.create(threadId, {
    assistant_id: assistantId
  });

  return {
    messageId: threadMessage.id,
    runId: run.id,
    createdAt: run.created_at,
    status: run.status,
    success: true
  };} catch (error) {
    console.log(`error createNewMessage`, error);
    return { success: false };
  }
};

const retrieveMessageStatus = async (
  threadId,
  runId
) => {
  const run = await openAiClient.beta.threads.runs.retrieve(threadId, runId);
  return { status: run.status, completedAt: run.completed_at };
};

const retrieveLastMessage = async (threadId) => {
  const threadMessages = await openAiClient.beta.threads.messages.list(threadId, {
    limit: 1
  });

  if (threadMessages.data.length === 0) {
    return { content: "", from: "" };
  }

  return {
    content: threadMessages.data[0].content[0].text.value,
    from: threadMessages.data[0].role
  };
};

const removeThread = async (threadId) => {
  try{
    const thread = await openAiClient.beta.threads.del(threadId);

  if (!thread.deleted) {
    return { success: false };
  }

  return { success: true };
  } catch (error) {
    console.log(`error removeThread`, error);
    return { success: false };
  }
};

module.exports = {connectToOpenAi, createNewThread, createNewMessage, retrieveMessageStatus, retrieveLastMessage, removeThread}