const Portfolio = ({ portfolio, tickerPrices, onPortfolioUpdated }) => {
  if (portfolio.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-400">My Portfolio</h2>
        <p className="text-gray-400">You don't own any stocks yet.</p>
      </div>
    );
  }

  const calculateValue = (shares, ticker, originalPrice) => {
    const currentPrice = tickerPrices[ticker] || originalPrice;
    return shares * currentPrice;
  };

  const totalValue = portfolio.reduce((sum, item) => {
    return sum + calculateValue(item.shares, item.stock.ticker, item.stock.price);
  }, 0);

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-400">My Portfolio</h2>
      
      <div className="mb-4">
        <p className="text-gray-400">Total Value</p>
        <p className="text-3xl font-bold text-green-400">${totalValue.toFixed(2)}</p>
      </div>

      <div className="space-y-3">
        {portfolio.map((item) => {
          const currentPrice = tickerPrices[item.stock.ticker] || item.stock.price;
          const value = calculateValue(item.shares, item.stock.ticker, item.stock.price);
          
          return (
            <div key={item._id} className="bg-gray-700 p-4 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-lg">${item.stock.ticker}</span>
                  <span className="text-gray-400 ml-2">{item.shares} shares</span>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-400">${value.toFixed(2)}</p>
                  <p className="text-sm text-gray-400">@ ${currentPrice.toFixed(2)}/share</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Portfolio;
