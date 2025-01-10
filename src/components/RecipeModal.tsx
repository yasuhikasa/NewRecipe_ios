// src/components/RecipeModal.tsx
import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import ReactMarkdown from 'react-native-markdown-display';
import useDeviceOrientation from '../hooks/useDeviceOrientation';

type RecipeModalProps = {
  open: boolean;
  recipe: string;
  onClose: () => void;
  onSave: (title: string) => void;
  onGenerateNewRecipe: () => void;
  isGenerating: boolean;
};

const RecipeModal: React.FC<RecipeModalProps> = ({
  open,
  recipe,
  onClose,
  onSave,
  onGenerateNewRecipe,
  isGenerating,
}) => {
  const [title, setTitle] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { isLargeScreen, isLandscape } = useDeviceOrientation();

  // レシピタイトルを抽出して初期値を設定
  useEffect(() => {
    if (recipe) {
      const lines = recipe.split('\n');
      const titleLine = lines.find(
        (line) =>
          line.startsWith('### レシピ名:') || line.startsWith('### レシピ名'),
      ); // 2通りの形式に対応
      if (titleLine) {
        setTitle(
          titleLine
            .replace('### レシピ名:', '')
            .replace('### レシピ名', '')
            .trim(),
        ); // 不要な部分を除去
      }
    }
  }, [recipe]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'タイトルを入力してください。');
      return;
    }
    setIsSaving(true); // 保存開始
    try {
      await onSave(title.trim());
    } catch (error) {
      Alert.alert('Error', '保存中にエラーが発生しました。');
    } finally {
      setIsSaving(false); // 保存終了
    }
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: isLargeScreen ? 30 : 10,
    },
    modalContainer: {
      backgroundColor: '#fff',
      borderRadius: 8,
      width: isLargeScreen ? (isLandscape ? '70%' : '80%') : '95%',
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
    inputContainer: {
      marginTop: isLargeScreen ? 24 : 20,
    },
    inputLabel: {
      fontSize: isLargeScreen ? 18 : 16,
      color: 'red',
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      padding: isLargeScreen ? 14 : 10,
      fontSize: isLargeScreen ? 18 : 16,
      backgroundColor: '#f9f9f9',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: isLargeScreen ? 24 : 20,
    },
    button: {
      flex: 1,
      padding: isLargeScreen ? 14 : 12,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 5,
    },
    buttonText: {
      color: '#fff',
      fontSize: isLargeScreen ? 18 : 16,
      fontWeight: 'bold',
    },
    saveButton: {
      backgroundColor: '#ff6347',
    },
    closeButton: {
      backgroundColor: '#4CAF50',
    },
    newRecipeButton: {
      backgroundColor: '#008CBA',
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
              <>
                {/* マークダウンのプレビュー */}
                <ReactMarkdown style={mstyles}>{recipe}</ReactMarkdown>

                {/* タイトル入力フィールド */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    保存するレシピタイトルを設定してください 🍴
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="レシピタイトルを入力してください"
                    value={title}
                    onChangeText={(text) => setTitle(text)}
                    maxLength={30}
                  />
                </View>

                {/* ボタンコンテナ */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleSave}
                    disabled={isGenerating}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>保存する</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.closeButton]}
                    onPress={onClose}
                    disabled={isGenerating}
                  >
                    <Text style={styles.buttonText}>閉じる</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.newRecipeButton]}
                    onPress={onGenerateNewRecipe}
                    disabled={isGenerating}
                  >
                    <Text style={styles.buttonText}>別のレシピを見る</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default RecipeModal;
