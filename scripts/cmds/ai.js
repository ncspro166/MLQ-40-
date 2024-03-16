 const axios = require('axios');

const Prefixes = [
  '/ai',
  'bot',
  'Nemo',
  '+ai',
  'nemo',
  'ai',
  'ask',
];

module.exports = {
  config: {
    name: "ask",
    version: 1.0,
    author: "OtinXSandip",
    longDescription: "AI",
    category: "ai",
    guide: {
      en: "{p} questions",
    },
  },
  onStart: async function () {},
  onChat: async function ({ api, event, args, message }) {
    try {

      const prefix = Prefixes.find((p) => event.body && event.body.toLowerCase().startsWith(p));
      if (!prefix) {
        return; // Invalid prefix, ignore the command
      }
      const prompt = event.body.substring(prefix.length).trim();
   if (!prompt) {
        await message.reply("𝑆𝑎𝑙𝑢𝑡 𝑡𝑜𝑖 , 𝑚𝑜𝑖 𝑐𝑒𝑠𝑡 𝑠𝑎𝑏𝑟𝑖𝑛𝑎 𝑐'𝑒𝑠𝑡 𝑞𝑢𝑜𝑖 𝑡𝑎 𝑞𝑢𝑒𝑠𝑡𝑖𝑜𝑛 😗🍷");
        return;
      }


      const response = await axios.get(`https://sandipbaruwal.onrender.com/gpt?prompt=${encodeURIComponent(prompt)}`);
      const answer = response.data.answer;


    await message.reply({ body: `𝑀𝐼𝐶𝐾𝐸𝑌 😗🍷
━━━━━━━━━━━━━        
${answer}
━━━━━━━━━━━━━ https://www.facebook.com/profile.php?id=61553392844761`,
});

   } catch (error) {
      console.error("Error:", error.message);
    }
  }
};