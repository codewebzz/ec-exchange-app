import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';

interface LogoutTimerProps {
  onComplete: () => void;
  message?: string;
  duration?: number;
}

export const LogoutTimer: React.FC<LogoutTimerProps> = ({
  onComplete,
  message = "You are being logged out due to login in another device.",
  duration = 3
}) => {
  const [countdown, setCountdown] = useState(duration);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [countdown, onComplete]);

  return (
    <Modal visible={true} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Session Expired</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.timerContainer}>
            <View style={styles.circle}>
               <Text style={styles.countdownText}>{countdown}</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  container: { 
    backgroundColor: '#fff', 
    padding: 24, 
    borderRadius: 12, 
    width: '80%', 
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 8, 
    color: '#333' 
  },
  message: { 
    fontSize: 14, 
    color: '#666', 
    textAlign: 'center', 
    marginBottom: 24 
  },
  timerContainer: { 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  circle: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    borderWidth: 4, 
    borderColor: '#e11d48', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  countdownText: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#9f1239' 
  }
});

export default LogoutTimer;
