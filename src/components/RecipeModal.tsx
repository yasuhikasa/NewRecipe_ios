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

  // レシピタイトルを抽出して初期値を設定
  useEffect(() => {
    if (recipe) {
      const lines = recipe.split('\n');
      const titleLine = lines.find((line) => line.startsWith('### レシピ名:')); // レシピ名行を探す
      if (titleLine) {
        setTitle(titleLine.replace('### レシピ名:', '').trim()); // "### レシピ名:" を除去
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
            <Text style={styles.title}>生成中のレシピ 🍴</Text>

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
                  <Text style={styles.inputLabel}>保存するレシピタイトルを設定してください 🍴</Text>
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

const mstyles = StyleSheet.create({
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 8,
  },
  heading1: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#ff6347',
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#ffa07a',
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#f08080',
  },
  heading4: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 6,
    color: '#cd5c5c',
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
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


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fffaf0',
    borderRadius: 8,
    width: '100%',
    maxHeight: '80%',
    padding: 16,
  },
  contentContainer: {
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ff6347',
    marginBottom: 12,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#555',
    marginTop: 10,
  },
  inputContainer: {
    marginTop: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: 'red',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
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

export default RecipeModal;
