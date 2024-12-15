// src/components/RecipeModal.tsx
import React, { useEffect, useState } from "react";
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
} from "react-native";
import ReactMarkdown from "react-native-markdown-display";

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

  // レシピ名を抽出して初期値に設定
  useEffect(() => {
    if (recipe) {
      // レシピ名の抽出ロジックを実装（例として単純に最初の行をタイトルとする）
      const lines = recipe.split('\n');
      const titleLine = lines.find((line) => line.startsWith('レシピ名:'));
      if (titleLine) {
        setTitle(titleLine.replace('レシピ名:', '').trim());
      } else {
        setTitle('');
      }
    }
  }, [recipe]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'タイトルを入力してください。');
      return;
    }
    onSave(title.trim());
  };

  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.modalContainer} activeOpacity={1}>
          <ScrollView contentContainerStyle={styles.contentContainer}>
            <Text style={styles.title}>AIが提案したレシピ 🍴</Text>

            {isGenerating ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ff6347" />
                <Text style={styles.loadingText}>レシピを生成中です...⏳</Text>
              </View>
            ) : (
              <>
                <ReactMarkdown style={markdownStyles}>{recipe}</ReactMarkdown>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>保存するレシピタイトルを設定してください 🍴</Text>
                  <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="レシピタイトルを入力してください"
                    maxLength={50}
                  />
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isGenerating}>
                    <Text style={styles.saveButtonText}>保存する</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={isGenerating}>
                    <Text style={styles.cancelButtonText}>保存しない</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.newRecipeButton} onPress={onGenerateNewRecipe} disabled={isGenerating}>
                    <Text style={styles.newRecipeButtonText}>別のレシピを見る</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const markdownStyles = {
  body: {
    color: '#333',
    fontSize: 16,
    lineHeight: 24,
  },
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '100%',
    maxHeight: '90%',
    padding: 20,
  },
  contentContainer: {
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ff6347',
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  inputContainer: {
    marginTop: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#ff6347',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderColor: '#ff6347',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelButtonText: {
    color: '#ff6347',
    fontSize: 16,
    fontWeight: 'bold',
  },
  newRecipeButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  newRecipeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RecipeModal;
