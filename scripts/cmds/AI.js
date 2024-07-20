const fetch = require('node-fetch');
const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
const { Buffer } = require('buffer');

const API_KEY = "AIzaSyB4XGZJ359gmhdaSmk8dL93uXEzd9spJw8";

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro-latest" });

const persistentChats = new Map();

const safetySettings = [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
];

module.exports = {
  config: {
    name: "Ai",
    aliases: "T",
    author: "Hassan",
    version: "1.10",
    shortDescription: "chat with Google Gemini AI",
    longDescription: "Get responses from Google Gemini AI based on user input.",
    category: "ai",
    guide: {
      vi: "",
      en: "{pn} <query>"
    }
  },

  onStart: async function ({ args, message }) {
    try {
      const userID = message.senderID;
      const prompt = args.join(' ');
      
      if (!prompt) {
        return message.reply("Please provide a query.");
      }

      message.reply('⏳Processing your request...');

      const chatHistory = readChatHistory(userID);

      if (!persistentChats.has(userID)) {
        persistentChats.set(userID, model.startChat({
          model: "gemini-1.0-pro-latest",
          history: chatHistory,
          safetySettings,
          generationConfig: {
            maxOutputTokens: 2048,
          },
        }));
      }

      const persistentChat = persistentChats.get(userID);

      const result = await persistentChat.sendMessage(prompt, safetySettings);
      const response = await result.response;
      const text = response.text();

      appendToChatHistory(userID, { role: "user", parts: [{ text: prompt }] });
      appendToChatHistory(userID, { role: "model", parts: [{ text: text }] });

      const totalWords = text.split(/\s+/).filter(word => word !== '').length;

      message.reply(`💬 Gemini AI response:\n\n${text}\n\nTotal words: ${totalWords}`);
    } catch (error) {
      console.error(error);
      return message.reply("Sorry, there was an error processing your request.");
    }
  }
};

function ensureChatHistoryFile(userID) {
  const directoryPath = path.join(__dirname, 'chatHistory');
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath);
  }
  const filePath = path.join(directoryPath, `${userID}gemini.json`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
  }
  return filePath;
}

function readChatHistory(userID) {
  const filePath = ensureChatHistoryFile(userID);
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading chat history for user ${userID}:`, err);
    return [];
  }
}

function appendToChatHistory(userID, messageObject) {
  const filePath = ensureChatHistoryFile(userID);
  try {
    const chatHistory = readChatHistory(userID);
    chatHistory.push(messageObject);
    fs.writeFileSync(filePath, JSON.stringify(chatHistory, null, 2));
  } catch (err) {
    console.error(`Error appending message to chat history for user ${userID}:`, err);
  }
}

function clearChatHistory(userID) {
  const filePath = path.join(__dirname, 'chatHistory', `${userID}gemini.json`);
  try {
    fs.unlinkSync(filePath);
    console.log(`Chat history cleared for user ${userID}`);
  } catch (err) {
    console.error(`Error clearing chat history for user ${userID}:`, err);
  }
  }
