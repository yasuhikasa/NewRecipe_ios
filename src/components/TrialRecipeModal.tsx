import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import ReactMarkdown from 'react-native-markdown-display';
import useDeviceOrientation from '../hooks/useDeviceOrientation';

type TrialRecipeModalProps = {
  open: boolean;
  recipe: string;
  onClose: () => void;
  isGenerating: boolean;
};

const TrialRecipeModal: React.FC<TrialRecipeModalProps> = ({
  open,
  recipe,
  onClose,
  isGenerating,
}) => {
  const { isLargeScreen, isLandscape } = useDeviceOrientation();

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: isLargeScreen ? (isLandscape ? 40 : 30) : 10,
    },
    modalContainer: {
      backgroundColor: '#fff',
      borderRadius: 8,
      width: isLargeScreen
      ? isLandscape
        ? '70%'
        : '80%'
      : '95%',
      maxHeight: isLargeScreen ? '80%' : '90%',
      padding: isLargeScreen ? 20 : 12,
    },
    contentContainer: {
      flexGrow: 1,
    },
    title: {
      fontSize: isLargeScreen ? 24 : 22,
      fontWeight: 'bold',
      color: '#ff6347',
      marginBottom: isLargeScreen ? 16 : 12,
      textAlign: 'center',
    },
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: isLargeScreen ? 30 : 20,
    },
    loadingText: {
      fontSize: isLargeScreen ? 18 : 16,
      color: '#555',
      marginTop: 10,
    },
    closeButton: {
      marginTop: isLargeScreen ? 24 : 20,
      backgroundColor: '#4CAF50',
      padding: isLargeScreen ? 14 : 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    closeButtonText: {
      color: '#fff',
      fontSize: isLargeScreen ? 18 : 16,
      fontWeight: 'bold',
    },
  });

  const mstyles = StyleSheet.create({
    body: {
      fontSize: isLargeScreen ? 20 : 16,
      lineHeight: isLargeScreen ? 28 : 24,
      color: '#333',
      marginBottom: 8,
    },
    heading1: {
      fontSize: isLargeScreen ? 24 : 22,
      fontWeight: 'bold',
      marginBottom: 12,
      color: '#ff6347',
    },
    heading2: {
      fontSize: isLargeScreen ? 22 : 20,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#ffa07a',
    },
    heading3: {
      fontSize: isLargeScreen ? 20 : 18,
      fontWeight: 'bold',
      marginBottom: 8,
      color: '#f08080',
    },
    heading4: {
      fontSize: isLargeScreen ? 20 : 16,
      fontWeight: 'bold',
      marginBottom: 6,
      marginTop: 6,
      color: '#cd5c5c',
    },
    listItem: {
      fontSize: isLargeScreen ? 18 : 16,
      lineHeight: isLargeScreen ? 26 : 24,
      marginBottom: 6,
      color: '#333',
    },
    strong: {
      fontWeight: 'bold',
    },
    em: {
      fontStyle: 'italic',
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: '#ffa07a',
      paddingLeft: 12,
      fontStyle: 'italic',
      marginBottom: 10,
    },
  });

  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.contentContainer}>
            {isGenerating ? (
              <Text style={styles.title}>レシピ生成中 🍴</Text>
            ) : (
              <Text style={styles.title}>AI監修のレシピ🍴</Text>
            )}

            {isGenerating ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ff6347" />
                <Text style={styles.loadingText}>レシピを生成中です...⏳</Text>
              </View>
            ) : (
              <ReactMarkdown style={mstyles}>{recipe}</ReactMarkdown>
            )}

            {/* 閉じるボタン */}
            {!isGenerating && (
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>閉じる</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default TrialRecipeModal;
