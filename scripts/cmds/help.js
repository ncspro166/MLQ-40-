const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

const doNotDelete = "🎀 | 𝑱𝑶𝒀𝑳𝒀𝑵𝑬 𝑨𝑰"; // Decoy string

module.exports = {
  config: {
    name: "help",
    version: "1.18",
    author: "Hassan",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "View command usage and list all commands directly",
    },
    longDescription: {
      en: "View command usage and list all commands directly",
    },
    category: "Info 📜",
    guide: {
      en: "{pn} / help",
    },
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const prefix = getPrefix(threadID);

    let msg = "• Command List •\n";

    const categories = {};

    for (const [name, value] of commands) {
      if (value.config.role > 1 && role < value.config.role) continue;

      const category = value.config.category || "Uncategorized";
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push({
        name,
        description: value.config.shortDescription.en,
        usage: (value.config.guide?.en || "No guide available.").replace(/{pn}/g, prefix).replace(/{n}/g, value.config.name)
      });
    }

    const categoryNames = Object.keys(categories).sort();

    const halfIndex = Math.ceil(categoryNames.length / 2);
    const firstHalfCategories = categoryNames.slice(0, halfIndex);
    const secondHalfCategories = categoryNames.slice(halfIndex);

    msg += createColumns(firstHalfCategories, secondHalfCategories, categories);

    msg += `\n•✨ | 𝑮𝒓𝒊𝒍𝒍𝒆𝒅'𝒔 𝑨𝒊𝑩𝒐𝑻\n• Total Commands: ${commands.size}`;

    await message.reply({ body: msg });
  },
};

function createColumns(firstHalfCategories, secondHalfCategories, categories) {
  let columnMsg = "\n";

  const maxLength = Math.max(firstHalfCategories.length, secondHalfCategories.length);

  for (let i = 0; i < maxLength; i++) {
    if (firstHalfCategories[i]) {
      columnMsg += `•『 ${firstHalfCategories[i].toUpperCase()} 』•\n`;
      columnMsg += categories[firstHalfCategories[i]].sort((a, b) => a.name.localeCompare(b.name))
        .map(cmd => `° ${toMonospace(cmd.name)}: ${cmd.description}\n   Usage: ${cmd.usage} °`).join('\n') + '\n';
    }
    if (secondHalfCategories[i]) {
      columnMsg += `•『 ${secondHalfCategories[i].toUpperCase()} 』•\n`;
      columnMsg += categories[secondHalfCategories[i]].sort((a, b) => a.name.localeCompare(b.name))
        .map(cmd => `° ${toMonospace(cmd.name)}: ${cmd.description}\n   Usage: ${cmd.usage} °`).join('\n') + '\n';
    }
  }

  return columnMsg;
}

function toMonospace(str) {
  const monospace = {
    'a': '𝚊', 'b': '𝚋', 'c': '𝚌', 'd': '𝚍', 'e': '𝚎', 'f': '𝚏', 'g': '𝚐', 'h': '𝚑', 'i': '𝚒', 'j': '𝚓',
    'k': '𝚔', 'l': '𝚕', 'm': '𝚖', 'n': '𝚗', 'o': '𝚘', 'p': '𝚙', 'q': '𝚚', 'r': '𝚛', 's': '𝚜', 't': '𝚝',
    'u': '𝚞', 'v': '𝚟', 'w': '𝚠', 'x': '𝚡', 'y': '𝚢', 'z': '𝚣',
    'A': '𝙰', 'B': '𝙱', 'C': '𝙲', 'D': '𝙳', 'E': '𝙴', 'F': '𝙵', 'G': '𝙶', 'H': '𝙷', 'I': '𝙸', 'J': '𝙹',
    'K': '𝙺', 'L': '𝙻', 'M': '𝙼', 'N': '𝙽', 'O': '𝙾', 'P': '𝙿', 'Q': '𝚀', 'R': '𝚁', 'S': '𝚂', 'T': '𝚃',
    'U': '𝚄', 'V': '𝚅', 'W': '𝚆', 'X': '𝚇', 'Y': '𝚈', 'Z': '𝚉',
    '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿'
  };
  return str.split('').map(char => monospace[char] || char).join('');
          }
