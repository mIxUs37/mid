import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import axios from 'axios';
import StockMarket from './StockMarket';
import MyStock from './MyStock';
import Portfolio from './Portfolio';

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [myStock, setMyStock] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [tickerPrices, setTickerPrices] = useState({});

  const fetchStocks = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/stocks');
      setStocks(response.data);
      const prices = {};
      response.data.forEach(stock => {
        prices[stock.ticker] = stock.price;
      });
      setTickerPrices(prices);
    } catch (error) {
      console.error('Error fetching stocks:', error);
    }
  };

  const fetchMyStock = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/stocks/my-stock', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyStock(response.data);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error fetching my stock:', error);
      }
    }
  };

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/trading/portfolio', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPortfolio(response.data);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    }
  };

  useEffect(() => {
    fetchStocks();
    fetchMyStock();
    fetchPortfolio();
  }, [token]);

  const handleWebSocketMessage = (message) => {
    if (message.type === 'TICKER_UPDATE') {
      const { ticker, price } = message.payload;
      setTickerPrices(prev => ({
        ...prev,
        [ticker]: price
      }));

      setStocks(prev => 
        prev.map(stock => 
          stock.ticker === ticker ? { ...stock, price } : stock
        )
      );

      if (myStock && myStock.ticker === ticker) {
        setMyStock(prev => ({ ...prev, price }));
      }
    }
  };

  useWebSocket(token, handleWebSocketMessage);

  const calculateNetWorth = () => {
    let stockValue = 0;
    portfolio.forEach(item => {
      const currentPrice = tickerPrices[item.stock.ticker] || item.stock.price;
      stockValue += item.shares * currentPrice;
    });
    return user.walletBalance + stockValue;
  };

  const netWorth = calculateNetWorth();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-blue-400">PEX</h1>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-gray-400 text-sm">Net Worth</p>
              <p className="text-xl font-bold text-green-400">${netWorth.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Wallet</p>
              <p className="text-lg">${user.walletBalance.toFixed(2)}</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <MyStock 
              myStock={myStock} 
              onStockCreated={fetchMyStock}
              onPriceUpdated={fetchStocks}
            />
            <Portfolio 
              portfolio={portfolio}
              tickerPrices={tickerPrices}
              onPortfolioUpdated={fetchPortfolio}
            />
          </div>
          <div>
            <StockMarket 
              stocks={stocks}
              myStockTicker={myStock?.ticker}
              onStocksUpdated={fetchStocks}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
