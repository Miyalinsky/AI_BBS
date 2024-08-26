import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from './services/authService';
import Login from './components/Login';
import Register from './components/Register';
import Logout from './components/Logout';
import ThreadList from './components/ThreadList';
import ThreadForm from './components/ThreadForm';
import ThreadDetail from './components/ThreadDetail';
import { startPolling } from './services/pollingService';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        startPolling(user.uid); // ユーザーがログインしたらポーリングを開始
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      {user ? (
        <div>
          <Logout />
          <Routes>
            <Route path="/" element={<><ThreadForm userId={user.uid} /><ThreadList userId={user.uid} /></>} />
            <Route path="/thread/:threadId" element={<ThreadDetail userId={user.uid} />} />
            {/* デフォルトルートを設定 */}
            <Route path="*" element={<ThreadList userId={user.uid} />} />
          </Routes>
        </div>
      ) : (
        <div>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* デフォルトルートを設定 */}
            <Route path="*" element={<Login />} />
          </Routes>
        </div>
      )}
    </div>
  );
};

export default App;
