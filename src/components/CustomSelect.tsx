import React, { useState } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import useDeviceOrientation from '../hooks/useDeviceOrientation';

type Option = {
  label: string;
  value: string;
};

type CustomSelectProps = {
  label: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  options: Option[];
};

const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  selectedValue,
  onValueChange,
  options,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { isLargeScreen, isLandscape } = useDeviceOrientation();

  const selectedLabel =
    options.find((option) => option.value === selectedValue)?.label ||
    '選択してください';

  const handleSelect = (value: string) => {
    onValueChange(value);
    setModalVisible(false);
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: isLargeScreen ? 30 : 20,
    },
    label: {
      fontSize: isLargeScreen ? 18 : 16,
      fontWeight: '600',
      marginBottom: isLargeScreen ? 12 : 8,
      color: '#333',
    },
    selectBox: {
      height: isLargeScreen ? 60 : 50,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 8,
      justifyContent: 'center',
      paddingHorizontal: isLargeScreen ? 15 : 10,
      backgroundColor: '#fff',
    },
    selectedText: {
      fontSize: isLargeScreen ? 18 : 16,
      color: '#333',
    },
    placeholderText: {
      fontSize: isLargeScreen ? 18 : 16,
      color: '#aaa',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      padding: isLargeScreen ? 40 : 20,
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: 8,
      maxHeight: '80%',
      width: isLargeScreen ? (isLandscape ? '50%' : '70%') : '90%',
      alignSelf: 'center',
    },
    option: {
      padding: isLargeScreen ? 20 : 15,
      borderBottomColor: '#eee',
      borderBottomWidth: 1,
    },
    optionText: {
      fontSize: isLargeScreen ? 18 : 16,
      color: '#333',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.selectBox}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={selectedValue ? styles.selectedText : styles.placeholderText}
        >
          {selectedLabel}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.option}
                    onPress={() => handleSelect(item.value)}
                  >
                    <Text style={styles.optionText}>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default CustomSelect;
