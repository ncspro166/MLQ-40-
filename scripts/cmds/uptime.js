const moment = require('moment-timezone');const fs = require('fs');const path = require('path');
const os = require('os');
const si = require('systeminformation');
const { performance } = require('perf_hooks');

// Assuming config.json is in the same directory as info.js
const configPath = path.resolve(__dirname, '../config.dev.json'); // Adjust the path based on your project structure

// Read and parse config.dev.json
let config = {};
try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (error) {
    console.error("Error reading config.json:", error.message);
    // Handle the error, maybe exit or provide default config values
}

module.exports = {
    config: {
        name: "uptime",
        aliases: ["up"],
        version: "1.5", 
        author: "Itz Aryan",
        countDown: 5,
        role: 0, 
        shortDescription: {
            vi: "Cung cấp thông tin bot và hệ thống",
            en: "Provides bot and system information"
        },
        longDescription: {
            vi: "Lệnh này cung cấp thông tin chi tiết về bot và hệ thống bao gồm thời gian hoạt động, thông tin hệ điều hành, CPU, bộ nhớ, đĩa, mạng và các thông tin bổ sung khác.",
            en: "This command provides detailed information about the bot and system including uptime, OS details, CPU, memory, disk, network, and additional settings."
        },
        category: "owner",
        guide: {
            vi: "Sử dụng lệnh này để nhận thông tin chi tiết về bot và hệ thống của bạn.",
            en: "Use this command to get detailed information about your bot and system."
        },
        envConfig: config 
    },
    onStart: async function ({ api, event, usersData, threadsData }) {
        const botName = config.nickNameBot || "Goatbot"; // Fetching from config
        const botPrefix = config.prefix || "-";
        const botVersion = "1.5"; 
        const botDescription = "This bot can help you with various tasks including managing the server, providing information, and more."; // Manually set bot description

        const now = moment().tz(config.timeZone || 'Africa/Lusaka'); // Fetching from config
        const date = now.format('MMMM Do YYYY');
        const time = now.format('h:mm:ss A');

        // Manually set image links
        const links = [
            "https://i.imgur.com/iu0YeDe.jpeg"
        ];
        const link = links[Math.floor(Math.random() * links.length)];

        // System uptime calculation
        const systemUptime = os.uptime();
        const systemUptimeString = formatUptime(systemUptime);

        // Process uptime (since bot started)
        const processUptime = process.uptime();
        const processUptimeString = formatUptime(processUptime);

        // OS information
        const osInfo = await si.osInfo();
        const osArchitecture = os.arch();
        const osHostname = os.hostname();
        const osHomeDir = os.homedir();

        // CPU information
        let cpuCurrentSpeed = {};
        let cpuLoad = {};
        let cpuUsage = 'CPU information not available';
        try {
            cpuCurrentSpeed = await si.cpuCurrentspeed();
            cpuLoad = await si.currentLoad();
            cpuUsage = `User ${cpuLoad.currentload_user ? cpuLoad.currentload_user.toFixed(2) : 'N/A'}%, System ${cpuLoad.currentload_system ? cpuLoad.currentload_system.toFixed(2) : 'N/A'}%`;
        } catch (error) {
            console.error("Error fetching CPU information:", error.message);
        }
        const cpuManufacturer = cpuCurrentSpeed.manufacturer || "Unknown";

        // CPU Temperature
        const cpuTemp = await si.cpuTemperature();
        const cpuTempString = `${cpuTemp.main} °C`; // Adjust according to your preferred formatting

        // GPU information
        let gpuInfo = '';
        try {
            const graphics = await si.graphics();
            gpuInfo = `GPU: ${graphics.controllers[0].model}, VRAM: ${graphics.controllers[0].vram} GB`;
        } catch (error) {
            console.error("Error fetching GPU information:", error.message);
            gpuInfo = 'GPU information not available';
        }

        // Memory information
        const memInfo = await si.mem();
        const totalMemory = (memInfo.total / (1024 ** 3)).toFixed(2);
        const freeMemory = (memInfo.free / (1024 ** 3)).toFixed(2);
        const usedMemory = (memInfo.used / (1024 ** 3)).toFixed(2);

        // Disk information
        const diskInfo = await si.fsSize();
        const diskType = diskInfo[0].type;
        const diskSpace = `Total ${diskInfo[0].size}, Used ${diskInfo[0].used}, Available ${diskInfo[0].available}`;

        // Network interfaces
        const networkInterfaces = os.networkInterfaces();
        const networkInfo = Object.keys(networkInterfaces).map(name => `${name}: ${networkInterfaces[name][0].address} (IPv${networkI
