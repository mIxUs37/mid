import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const MyStock = ({ myStock, onStockCreated, onPriceUpdated }) => {
  const { token } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [ticker, setTicker] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [message, setMessage] = useState('');

  const handleCreateStock = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:3001/api/stocks/create',
        { ticker },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Stock created successfully!');
      setTicker('');
      setShowCreate(false);
      onStockCreated();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to create stock');
    }
  };

  const handleUpdatePrice = async (e) => {
    e.preventDefault();
    if (!newPrice) return;

    try {
      await axios.put(
        'http://localhost:3001/api/stocks/update-price',
        { ticker: myStock.ticker, price: parseFloat(newPrice) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Price updated successfully!');
      setNewPrice('');
      onPriceUpdated();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to update price');
    }
  };

  if (!myStock) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-400">My Stock</h2>
        {!showCreate ? (
          <button
            onClick={() => setShowCreate(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded transition font-bold"
          >
            Create Your Stock
          </button>
        ) : (
          <form onSubmit={handleCreateStock}>
            <label className="block text-gray-300 mb-2">Stock Ticker Symbol</label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500 mb-4"
              placeholder="e.g., DEV"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded transition"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded transition"
              >
                Cancel
              </button>
            </div>
            {message && (
              <div className={`mt-4 p-3 rounded ${
                message.includes('successful') ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'
              }`}>
                {message}
              </div>
            )}
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-400">My Stock: ${myStock.ticker}</h2>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700 p-4 rounded">
          <p className="text-gray-400 text-sm">Current Price</p>
          <p className="text-2xl font-bold text-green-400">${myStock.price.toFixed(2)}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded">
          <p className="text-gray-400 text-sm">Total Shares</p>
          <p className="text-2xl font-bold">{myStock.totalShares}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded">
          <p className="text-gray-400 text-sm">Market Cap</p>
          <p className="text-2xl font-bold text-blue-400">${(myStock.price * myStock.totalShares).toFixed(2)}</p>
        </div>
      </div>

      <form onSubmit={handleUpdatePrice}>
        <label className="block text-gray-300 mb-2">Update Price</label>
        <div className="flex gap-2">
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
            placeholder="New price"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded transition"
          >
            Update
          </button>
        </div>
        {message && (
          <div className={`mt-4 p-3 rounded ${
            message.includes('successful') ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default MyStock;
