const axios = require("axios");
const path = require("path");
const fs = require("fs-extra");

const Prefixes = ["ai", "Yau5", "Ai"];

module.exports = {
  config: {
    name: "ai",
    version: "2.2.4",
    author: "Hassan", // do not change
    role: 2,
    category: "ai",
    shortDescription: {
      en: "Asks AI for an answer.",
    },
    longDescription: {
      en: "Asks AI for an answer based on the user prompt.",
    },
    guide: {
      en: "{pn} [prompt]",
    },
  },
  onStart: async function ({ message, api, event, args }) {
    // No changes needed here
  },
  onChat: async function ({ api, event, args, message }) {
    try {
      const prefix = Prefixes.find(
        (p) => event.body && event.body.toLowerCase().startsWith(p)
      );

      if (!prefix) {
        return;
      }

      let prompt = event.body.substring(prefix.length).trim();

      // Determine if user specified a limit for images
      let numberImages = 6; // Default to 6 images
      const match = prompt.match(/-(\d+)$/);

      if (match) {
        numberImages = Math.min(parseInt(match[1], 10), 8); // Max 8 images
        prompt = prompt.replace(/-\d+$/, "").trim(); // Remove the number part from prompt
      }

      if (prompt === "") {
        await api.sendMessage(
          "Kindly provide the question at your convenience and I shall strive to deliver an effective response. Your satisfaction is my top priority.",
          event.threadID
        );
        return;
      }

      api.setMessageReaction("⌛", event.messageID, () => { }, true);

      // Use the local AI server's endpoint
      const response = await axios.get(
        `https://hassan-cafe.onrender.com/ai?prompt=${encodeURIComponent(prompt)}`
      );

      console.log("API Response:", response.data); // Log the response data for debugging

      if (response.status !== 200 || !response.data || !response.data.response) {
        throw new Error("Unable to respond");
      }

      const messageText = response.data.response;

      // If the response includes URLs for images
      const urls = messageText.match(/https?:\/\/\S+\.(jpg|jpeg|png|gif)/gi);

      if (urls && urls.length > 0) {
        const imgData = [];
        const limitedUrls = urls.slice(0, numberImages);

        for (let i = 0; i < limitedUrls.length; i++) {
          const imgResponse = await axios.get(limitedUrls[i], {
            responseType: "arraybuffer"
          });
          const imgPath = path.join(__dirname, "cache", `image_${i + 1}.jpg`);
          await fs.outputFile(imgPath, imgResponse.data);
          imgData.push(fs.createReadStream(imgPath));
        }

        await api.sendMessage({
          body: `Here are the top ${limitedUrls.length} images:`,
          attachment: imgData,
        }, event.threadID, event.messageID);

        await fs.remove(path.join(__dirname, "cache"));
      } else {
        await message.reply(messageText);
      }

      api.setMessageReaction("✅", event.messageID, () => { }, true);
    } catch (error) {
      console.error("Error in onChat:", error);
      await api.sendMessage(
        `Failed to get answer: ${error.message}`,
        event.threadID
      );
    }
  }
}
