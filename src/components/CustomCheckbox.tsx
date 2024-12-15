// src/components/CustomCheckbox.tsx
import React from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';

type CustomCheckboxProps = {
  value: boolean;
  onValueChange: (newValue: boolean) => void;
  label?: string;
};

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ value, onValueChange, label }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onValueChange(!value)}>
      <View style={[styles.checkbox, value && styles.checkedCheckbox]}>
        {value && <View style={styles.checkmark} />}
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#6200ee',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkedCheckbox: {
    backgroundColor: '#6200ee',
  },
  checkmark: {
    width: 12,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  label: {
    fontSize: 16,
    color: '#555',
  },
});

export default CustomCheckbox;
