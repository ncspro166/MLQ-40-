const axios = require('axios');

module.exports = {
    config: {
        name: "uptime1",
        aliases: ['monitor2', 'uptimecheck'],
        author: "Hassan",
        version: "1.0",
        shortDescription: "Create a monitor for a specified URL",
        longDescription: "This command creates a monitor to track the uptime of a specified URL.",
        category: "utility",
        guide: {
            vi: "",
            en: ""
        }
    },

    onStart: async function ({ args, message, getLang }) {
        try {
            const urlToMonitor = args[0];
            if (!urlToMonitor) {
                return message.reply("Please provide a URL to monitor.");
            }

            const apiUrl = `https://uptime-c83m.onrender.com/create-monitor?url=${encodeURIComponent(urlToMonitor)}`;

            message.reply('⏳ Creating a monitor...');

            const response = await axios.get(apiUrl);

            if (response.data.message === "Failed to create monitor" && response.data.error.type === "already_exists") {
                return message.reply("⚠️ Monitor already exists for this URL.");
            } else {
                return message.reply(`✅ Monitor created successfully for ${urlToMonitor}`);
            }
        } catch (error) {
            console.error(error);
            return message.reply("Sorry, there was an error creating the monitor.");
        }
    }
};
