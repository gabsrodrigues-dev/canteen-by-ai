const {
  createNewMessage,
  createNewThread
} = require("../lib/assistantService");
const { Contact } = require("../models/Contact");
const { getInitialThreadPrompt } = require("../prompts/initialThreadPrompt");
const { pushRun, getRuns } = require("../runs/runController");

async function processMessage(msg) {
  try {
    const contactId = msg.id.remote;
    const content = msg.body;
    const isMedia = msg.type !== "chat";
    const isGroup = msg.id.remote.includes("@g.us");

    if (isGroup) return;

    if (isMedia)
      return msg.reply(
        "Por enquanto, eu não sou capaz de entender áudios, imagens e nem vídeos. Pode digitar a mensagem? 😅"
      );

    if (getRuns().find((run) => run.contactId === contactId))
      return msg.reply(
        "Espera somente alguns segundos enquanto eu processo a mensagem anterior... ☺️"
      );

    let contact = await Contact.findOne({ contactId });

    if (!contact) {
      const whatsappContact = await msg.getContact();
      const userDefaultName =
        whatsappContact.pushname || whatsappContact.name || "";
      msg.react("👋");
      const initialThreadPrompt = getInitialThreadPrompt({
        name: userDefaultName
      });
      const { threadId } = await createNewThread(initialThreadPrompt);
      const newContact = new Contact({
        contactId,
        contactName: userDefaultName,
        threadId
      });
      if (newContact) {
        await newContact.save();
        contact = newContact;
      } else throw new Error("Tivemos um erro ao criar o seu usuário");
    }
    const chat = await msg.getChat();
    chat.sendSeen();
    const threadId = contact.threadId;
    const run = await createNewMessage(content, threadId);
    if (!run.success)
      throw new Error("Não conseguimos criar a mensagem da Thay");
    chat.sendStateTyping();
    pushRun({ runId: run.runId, contactId, threadId, msg });
  } catch (error) {
    console.error(`error processMessage`, error);
    msg.reply(
      `Algo não deu certo...  _${error.message}..._ Pode tentar mais tarde?`
    );
  }
}

module.exports = { processMessage };
