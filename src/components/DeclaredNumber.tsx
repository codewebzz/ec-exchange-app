import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import APIService from '../screens/services/APIService';
import { scale } from 'react-native-size-matters';

interface DeclaredNumberProps {
  date: string;
  shiftId: number;
}

const DeclaredNumber: React.FC<DeclaredNumberProps> = ({ date, shiftId }) => {
  const [declaredNumber, setDeclaredNumber] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeclaredNumber = async () => {
      if (!date || !shiftId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        // Ensure date is sent in YYYY-MM-DD for the API if needed, 
        // but the API expects whatever format is required.
        // Convert from DD/MM/YYYY to YYYY-MM-DD if needed.
        let formattedDate = date;
        if (date.includes('/')) {
          const parts = date.split('/');
          if (parts.length === 3) {
            formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
        }

        const response = await APIService.GetDeclaredNumber({ date: formattedDate, shift_id: shiftId });

        if (response?.success && response?.data?.declared_number !== undefined) {
          setDeclaredNumber(response.data.declared_number);
        } else {
          console.error("Error fetching declared number:", response?.message);
          setError("Failed to fetch");
        }
      } catch (err) {
        console.error("Error fetching declared number:", err);
        setError("Something went wrong!");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeclaredNumber();
  }, [date, shiftId]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={'#333'} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.badge, styles.badgeError]}>
        <Text style={styles.badgeTextError}>-</Text>
      </View>
    );
  }

  if (declaredNumber === null) {
    return null;
  }

  return (
    <View style={[styles.badge, styles.badgeSuccess]}>
      <Text style={styles.badgeTextSuccess}>{declaredNumber}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(2),
  },
  badge: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    borderRadius: scale(12),
    alignSelf: 'flex-start',
  },
  badgeSuccess: {
    backgroundColor: '#dcfce7', // green-100
    borderWidth: 1,
    borderColor: '#86efac', // green-300
  },
  badgeTextSuccess: {
    color: '#166534', // green-800
    fontSize: scale(12),
    fontWeight: '600',
  },
  badgeError: {
    backgroundColor: '#fee2e2', // red-100
    borderWidth: 1,
    borderColor: '#fca5a5', // red-300
  },
  badgeTextError: {
    color: '#991b1b', // red-800
    fontSize: scale(12),
    fontWeight: 'bold',
  },
});

export default DeclaredNumber;
