const express = require('express');
const Stock = require('../models/Stock');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

let broadcastTickerUpdate = null;

const setBroadcastFunction = (fn) => {
  broadcastTickerUpdate = fn;
};

module.exports = { router, setBroadcastFunction };

router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { ticker } = req.body;

    if (!ticker) {
      return res.status(400).json({ error: 'Ticker symbol required' });
    }

    const user = await User.findById(req.user.userId);
    if (user.stockTicker) {
      return res.status(400).json({ error: 'User already has a stock ticker' });
    }

    const existingStock = await Stock.findOne({ ticker: ticker.toUpperCase() });
    if (existingStock) {
      return res.status(400).json({ error: 'Ticker already exists' });
    }

    const stock = new Stock({
      ticker: ticker.toUpperCase(),
      owner: req.user.userId,
      price: 10.00,
      totalShares: 1000
    });

    await stock.save();

    user.stockTicker = ticker.toUpperCase();
    await user.save();

    res.status(201).json(stock);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/update-price', authenticateToken, async (req, res) => {
  try {
    const { ticker, price } = req.body;

    if (!ticker || price === undefined) {
      return res.status(400).json({ error: 'Ticker and price required' });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ error: 'Price must be a valid number greater than 0' });
    }

    if (parsedPrice < 0.01) {
      return res.status(400).json({ error: 'Minimum price is $0.01' });
    }

    const stock = await Stock.findOne({ ticker: ticker.toUpperCase() });
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    if (stock.owner.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden: You can only update your own stock price' });
    }

    stock.price = parsedPrice;
    await stock.save();

    if (broadcastTickerUpdate) {
      broadcastTickerUpdate(stock.ticker, stock.price);
    }

    res.json(stock);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const stocks = await Stock.find().populate('owner', 'username');
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/my-stock', authenticateToken, async (req, res) => {
  try {
    const stock = await Stock.findOne({ owner: req.user.userId });
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    res.json(stock);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
