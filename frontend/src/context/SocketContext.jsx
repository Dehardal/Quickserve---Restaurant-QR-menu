import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

// Premium synthesized audio notification to wow the user out-of-the-box!
const playChime = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play double chime note
    const playNote = (freq, start, duration) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      
      gainNode.gain.setValueAtTime(0.15, start);
      gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(start);
      osc.stop(start + duration);
    };

    const now = ctx.currentTime;
    playNote(523.25, now, 0.4); // C5
    playNote(659.25, now + 0.15, 0.5); // E5
  } catch (error) {
    console.error('Audio synthesizer error:', error);
  }
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Connect to server (proxy will handle it or default back)
    const socketUrl = window.location.origin;
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  // When user registers or logs in, join their custom socket room
  useEffect(() => {
    if (socket && user && user._id) {
      socket.emit('join', user._id);

      // Listen for incoming orders
      socket.on('new_order', (newOrder) => {
        playChime();
        
        // Add toast notification
        const notification = {
          id: Date.now(),
          title: '🛎️ New Order Received!',
          message: `${newOrder.customerName} placed an order of $${newOrder.subtotal.toFixed(2)} for ${newOrder.tableNumber}`,
          order: newOrder,
          read: false,
        };

        setNotifications((prev) => [notification, ...prev]);

        // Auto remove notifications from toast list after 7 seconds
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
        }, 7000);
      });
    }

    return () => {
      if (socket) {
        socket.off('new_order');
      }
    };
  }, [socket, user]);

  const clearNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const value = {
    socket,
    notifications,
    clearNotification,
    triggerTestChime: playChime,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
      
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className="animate-slide-up bg-slate-900 border border-brand-500 text-white p-4 rounded-xl shadow-2xl flex flex-col gap-1 backdrop-blur-xl relative overflow-hidden glow-glow"
          >
            {/* Ambient subtle glow bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-brand-500"></div>
            
            <div className="flex justify-between items-start mt-1">
              <span className="font-bold text-brand-500 font-sans tracking-wide">{notif.title}</span>
              <button
                onClick={() => clearNotification(notif.id)}
                className="text-slate-400 hover:text-white transition-colors ml-2"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-slate-200 mt-1 leading-relaxed">{notif.message}</p>
            <div className="flex gap-2 mt-2">
              <a
                href="/orders"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/orders';
                }}
                className="text-xs font-semibold px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors flex items-center gap-1"
              >
                View Dashboard
              </a>
            </div>
          </div>
        ))}
      </div>
    </SocketContext.Provider>
  );
};
