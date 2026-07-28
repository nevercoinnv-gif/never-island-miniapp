const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// 1. اتصال به دیتابیس MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas successfully!'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// 2. مدل‌های دیتابیس
const playerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  characterName: { type: String, default: 'قهرمان بی‌نام' },
  ce: { type: Number, default: 0 },
  rank: { type: Number, default: 1 },
  tapLevel: { type: Number, default: 1 },
  energyLevel: { type: Number, default: 1 },
  updatedAt: { type: Date, default: Date.now }
});

const gameSettingsSchema = new mongoose.Schema({
  maxEnergyBase: { type: Number, default: 500 },
  energyRechargeRate: { type: Number, default: 1 },
  cePerTapBase: { type: Number, default: 1 },
  upgradeBaseCost: { type: Number, default: 50 }
});

const Player = mongoose.model('Player', playerSchema);
const Settings = mongoose.model('Settings', gameSettingsSchema);

// 3. مسیرهای API

// سینک کردن اطلاعات بازیکن
app.post('/api/player/sync', async (req, res) => {
  try {
    const { username, ce, tapLevel, energyLevel, characterName } = req.body;
    let player = await Player.findOne({ username });
    
    if (!player) {
      player = new Player({ username, characterName, ce, tapLevel, energyLevel });
    } else {
      player.ce = Math.max(player.ce, ce || 0);
      if (tapLevel) player.tapLevel = tapLevel;
      if (energyLevel) player.energyLevel = energyLevel;
      if (characterName) player.characterName = characterName;
      player.updatedAt = Date.now();
    }
    await player.save();
    res.json({ success: true, player });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// دریافت لیدربورد آنلاین
app.get('/api/leaderboard', async (req, res) => {
  try {
    const topPlayers = await Player.find()
      .sort({ ce: -1 })
      .limit(10)
      .select('username characterName ce rank');
    res.json(topPlayers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// دریافت تنظیمات بازی
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// آپدیت تنظیمات بازی (پنل مدیریت)
app.post('/api/admin/settings', async (req, res) => {
  try {
    const { maxEnergyBase, energyRechargeRate, cePerTapBase, upgradeBaseCost } = req.body;
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();
    
    if (maxEnergyBase) settings.maxEnergyBase = maxEnergyBase;
    if (energyRechargeRate) settings.energyRechargeRate = energyRechargeRate;
    if (cePerTapBase) settings.cePerTapBase = cePerTapBase;
    if (upgradeBaseCost) settings.upgradeBaseCost = upgradeBaseCost;

    await settings.save();
    res.json({ success: true, message: 'تنظیمات با موفقیت به‌روزرسانی شد', settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// اجرای فایل فرانت‌اند
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
