import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const StockMarket = ({ stocks, myStockTicker, onStocksUpdated }) => {
  const { token } = useAuth();
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [message, setMessage] = useState('');

  const handleBuy = async (e) => {
    e.preventDefault();
    if (!selectedStock || !buyAmount) return;

    try {
      await axios.post(
        'https://pex-backend-jxkb.onrender.com/api/trading/buy',
        { ticker: selectedStock.ticker, shares: parseInt(buyAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Purchase successful!');
      setBuyAmount('');
      onStocksUpdated();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Purchase failed');
    }
  };

  const handleSell = async (e) => {
    e.preventDefault();
    if (!selectedStock || !sellAmount) return;

    try {
      await axios.post(
        'https://pex-backend-jxkb.onrender.com/api/trading/sell',
        { ticker: selectedStock.ticker, shares: parseInt(sellAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Sale successful!');
      setSellAmount('');
      onStocksUpdated();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Sale failed');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-400">Stock Market</h2>
      
      <div className="space-y-3 mb-6">
        {stocks.map((stock) => (
          <div
            key={stock._id}
            className={`p-4 rounded border cursor-pointer transition ${
              selectedStock?._id === stock._id
                ? 'border-blue-500 bg-gray-700'
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onClick={() => setSelectedStock(stock)}
          >
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-lg">${stock.ticker}</span>
                <span className="text-gray-400 ml-2">by {stock.owner.username}</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-400">${stock.price.toFixed(2)}</p>
                <p className="text-sm text-gray-400">{stock.totalShares} shares available</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedStock && (
        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-xl font-bold mb-4">
            Trade ${selectedStock.ticker}
          </h3>

          {message && (
            <div className={`p-3 rounded mb-4 ${
              message.includes('successful') ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'
            }`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <form onSubmit={handleBuy}>
              <label className="block text-gray-300 mb-2">Buy Shares</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="Amount"
                />
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition"
                >
                  Buy
                </button>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Cost: ${(buyAmount * selectedStock.price).toFixed(2)}
              </p>
            </form>

            <form onSubmit={handleSell}>
              <label className="block text-gray-300 mb-2">Sell Shares</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="Amount"
                />
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
                >
                  Sell
                </button>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Revenue: ${(sellAmount * selectedStock.price).toFixed(2)}
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockMarket;
