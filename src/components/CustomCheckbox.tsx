import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import useDeviceOrientation from '../hooks/useDeviceOrientation';

interface CustomCheckboxProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  value,
  onValueChange,
  label,
}) => {
  const { isLargeScreen } = useDeviceOrientation(); // iPad対応用

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: isLargeScreen ? 10 : 5,
    },
    checkbox: {
      width: isLargeScreen ? 32 : 24,
      height: isLargeScreen ? 32 : 24,
      borderWidth: 2,
      borderColor: '#6200ee',
      borderRadius: 4,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: isLargeScreen ? 12 : 8,
    },
    checkedCheckbox: {
      backgroundColor: '#6200ee',
    },
    checkmark: {
      width: isLargeScreen ? 16 : 12,
      height: isLargeScreen ? 16 : 12,
      backgroundColor: '#fff',
      borderRadius: 2,
    },
    label: {
      fontSize: isLargeScreen ? 20 : 16,
      color: '#555',
    },
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onValueChange(!value)}
    >
      <View style={[styles.checkbox, value && styles.checkedCheckbox]}>
        {value && <View style={styles.checkmark} />}
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
};

export default CustomCheckbox;
