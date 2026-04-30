const express = require('express');
const Stock = require('../models/Stock');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/buy', authenticateToken, async (req, res) => {
  try {
    const { ticker, shares } = req.body;

    if (!ticker || !shares || shares <= 0) {
      return res.status(400).json({ error: 'Valid ticker and shares required' });
    }

    const stock = await Stock.findOne({ ticker: ticker.toUpperCase() });
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    const user = await User.findById(req.user.userId);
    const totalCost = stock.price * shares;

    if (user.walletBalance < totalCost) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    if (stock.totalShares < shares) {
      return res.status(400).json({ error: 'Not enough shares available' });
    }

    user.walletBalance -= totalCost;
    stock.totalShares -= shares;

    await user.save();
    await stock.save();

    let portfolio = await Portfolio.findOne({
      user: req.user.userId,
      stock: stock._id
    });

    if (portfolio) {
      portfolio.shares += shares;
    } else {
      portfolio = new Portfolio({
        user: req.user.userId,
        stock: stock._id,
        shares
      });
    }

    await portfolio.save();

    res.json({
      message: 'Purchase successful',
      newBalance: user.walletBalance,
      sharesOwned: portfolio.shares
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/sell', authenticateToken, async (req, res) => {
  try {
    const { ticker, shares } = req.body;

    if (!ticker || !shares || shares <= 0) {
      return res.status(400).json({ error: 'Valid ticker and shares required' });
    }

    const stock = await Stock.findOne({ ticker: ticker.toUpperCase() });
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    const portfolio = await Portfolio.findOne({
      user: req.user.userId,
      stock: stock._id
    });

    if (!portfolio || portfolio.shares < shares) {
      return res.status(400).json({ error: 'Not enough shares to sell' });
    }

    const user = await User.findById(req.user.userId);
    const totalRevenue = stock.price * shares;

    user.walletBalance += totalRevenue;
    stock.totalShares += shares;
    portfolio.shares -= shares;

    await user.save();
    await stock.save();
    await portfolio.save();

    if (portfolio.shares === 0) {
      await Portfolio.deleteOne({ _id: portfolio._id });
    }

    res.json({
      message: 'Sale successful',
      newBalance: user.walletBalance,
      sharesRemaining: portfolio.shares
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/portfolio', authenticateToken, async (req, res) => {
  try {
    const portfolio = await Portfolio.find({ user: req.user.userId })
      .populate('stock');
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
