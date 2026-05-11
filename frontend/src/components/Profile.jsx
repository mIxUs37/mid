import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Профиль пользователя</h2>
          
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Информация об аккаунте</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Имя пользователя</p>
                  <p className="text-lg font-medium text-gray-900">{user?.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-lg font-medium text-gray-900">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Финансовая информация</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Баланс кошелька</p>
                  <p className="text-2xl font-bold text-green-600">${user?.walletBalance?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ваш тикер</p>
                  <p className="text-lg font-medium text-gray-900">
                    {user?.stockTicker ? `$${user.stockTicker}` : 'Не создан'}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Статистика</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Дата регистрации</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(user?.createdAt).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ID пользователя</p>
                  <p className="text-sm font-mono text-gray-900">{user?.userId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Статус</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Активен
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200"
              >
                Выйти из аккаунта
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
