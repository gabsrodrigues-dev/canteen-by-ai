const { removeThread } = require("../lib/assistantService");
const { Contact } = require("../models/Contact");

async function processAdmCommand(msg) {
  try {
    const contactId = msg.id.remote;
    if (contactId !== "553191647507@c.us") return;

    if (msg.body === "/deleteall") {
        const contacts = await Contact.find({});
        for (const contact of contacts) {
          await msg.reply(`*[ADM]*: Deletando ${contact.contactName || contact.contactId}`);
          await removeThread(contact.threadId);
          await contact.deleteOne();
          await msg.reply(`*[ADM]*: Deletado ${contact.contactName || contact.contactId}`);
        }
      } else {
        return false;
      }
      
    return true;
  } catch (error) {
    console.log(`error processAdmCommand`, error);
    return true;
  }
}

module.exports = { processAdmCommand };
