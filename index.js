// Bilibotz — Simple WhatsApp Bot
// By sahalanbili804-ops

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const pino = require("pino");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
    logger: pino({ level: "silent" })
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        startBot();
      } else {
        console.log("Bot Logged Out");
      }
    } else if (connection === "open") {
      console.log("Bot Berhasil Terhubung ✔️");
    }
  });

  sock.ev.on("messages.upsert", async (msg) => {
    try {
      const chat = msg.messages[0];
      if (!chat.message) return;

      const sender = chat.key.remoteJid;
      let text = chat.message.conversation || chat.message.extendedTextMessage?.text;

      // Fitur sederhana
      if (text?.toLowerCase() === "ping") {
        await sock.sendMessage(sender, { text: "Pong! 🏓" });
      }

      if (text?.toLowerCase() === "menu") {
        await sock.sendMessage(sender, {
          text: `*Bilibotz Menu*
          
1. ping
2. menu
3. owner

Ketik salah satu!`
        });
      }

      if (text?.toLowerCase() === "owner") {
        await sock.sendMessage(sender, { text: "Owner: 085353118090" });
      }

    } catch (e) {
      console.log("Error:", e);
    }
  });
}

startBot();
