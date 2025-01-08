import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import ReactMarkdown from 'react-native-markdown-display';
import useDeviceOrientation from '../hooks/useDeviceOrientation';
import sampleRecipe from '../utils/sampleRecipe'; // サンプルデータをインポート

type RecipeSampleModalProps = {
  visible: boolean;
  onClose: () => void;
};

const RecipeSampleModal: React.FC<RecipeSampleModalProps> = ({
  visible,
  onClose,
}) => {
  const { isLargeScreen, isLandscape } = useDeviceOrientation();

  if (!visible) return null;

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: isLargeScreen ? (isLandscape ? 40 : 30) : 20,
    },
    modalContainer: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: isLargeScreen ? 20 : 16,
      width: isLargeScreen ? (isLandscape ? '60%' : '80%') : '90%',
      maxHeight: '80%',
    },
    title: {
      fontSize: isLargeScreen ? 26 : 22,
      fontWeight: 'bold',
      color: '#ff6347',
      marginBottom: isLargeScreen ? 16 : 12,
      textAlign: 'center',
    },
    closeButton: {
      backgroundColor: '#4CAF50',
      padding: isLargeScreen ? 14 : 12,
      borderRadius: 8,
      alignSelf: 'center',
      marginTop: 12,
    },
    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: isLargeScreen ? 18 : 16,
    },
  });

  const markdownStyles = StyleSheet.create({
    body: {
      fontSize: isLargeScreen ? 18 : 16,
      lineHeight: isLargeScreen ? 28 : 24,
      color: '#333',
      marginBottom: isLargeScreen ? 14 : 12,
    },
    heading1: {
      fontSize: isLargeScreen ? 26 : 24,
      fontWeight: 'bold',
      color: '#ff6347',
      marginBottom: isLargeScreen ? 16 : 12,
    },
    heading2: {
      fontSize: isLargeScreen ? 22 : 20,
      fontWeight: 'bold',
      color: '#ffa07a',
      marginBottom: isLargeScreen ? 14 : 10,
    },
    heading3: {
      fontSize: isLargeScreen ? 20 : 18,
      fontWeight: 'bold',
      color: '#f08080',
      marginBottom: isLargeScreen ? 12 : 8,
    },
    heading4: {
      fontSize: isLargeScreen ? 18 : 16,
      fontWeight: 'bold',
      marginBottom: 6,
      marginTop: 6,
      color: '#cd5c5c',
    },
    listItem: {
      fontSize: isLargeScreen ? 18 : 16,
      marginBottom: isLargeScreen ? 10 : 8,
      color: '#333',
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView>
            <Text style={styles.title}>{sampleRecipe.title}</Text>
            <ReactMarkdown style={markdownStyles}>
              {sampleRecipe.recipe}
            </ReactMarkdown>
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.buttonText}>閉じる</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default RecipeSampleModal;
