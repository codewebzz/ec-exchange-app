import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuth } from '../redux/reducers/authToken';
import LogoutTimer from '../components/LogoutTimer';
import AxiosService from '../screens/services/AxiosService';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: React.ReactNode;
}

const SOCKET_URL = 'ws://ec2-51-21-190-78.eu-north-1.compute.amazonaws.com:8000';

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const dispatch = useDispatch();
  const token = useSelector((state: any) => state?.authorization?.token);

  const handleRedirect = useCallback(() => {
    setIsLoggedOut(false);
    dispatch(clearAuth());
  }, [dispatch]);

  useEffect(() => {
    let isMounted = true;

    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const initSocket = async () => {
      try {
        const response: any = await AxiosService.get('api/my_details');

        console.log("response", response)

        // Adjust according to the exact API response structure of /my_details
        const userId = response?.data?.username

        if (!userId || !isMounted) {
          console.log('No user ID found for socket connection');
          return;
        }

        console.log('Connecting to socket URL:', SOCKET_URL, 'with userId:', userId);
        const socket = io(SOCKET_URL, {
          transports: ['websocket'],
          query: { userId },
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          console.log('✅ Socket connected:', socket.id);
          socket.emit('join', `user_${userId}`);
        });

        socket.on('logout', (data: { message?: string }) => {
          console.warn('⚠️ Force logout received:', data?.message || 'Logged in from another device');
          setIsLoggedOut(true);
        });

        socket.on('disconnect', (reason) => {
          console.log('❌ Socket disconnected:', reason);
        });

        socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
        });

      } catch (error) {
        console.log('Error fetching user details for socket:', error);
      }
    };

    initSocket();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
      {isLoggedOut && (
        <LogoutTimer
          onComplete={handleRedirect}
          duration={3}
        />
      )}
    </SocketContext.Provider>
  );
};
