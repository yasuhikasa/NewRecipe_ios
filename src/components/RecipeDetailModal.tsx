// src/components/RecipeDetailModal.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import ReactMarkdown from 'react-native-markdown-display';
import axios from 'axios';
import supabase from '../config/supabaseClient';

type RecipeDetailModalProps = {
  visible: boolean;
  recipeId: string;
  onClose: () => void;
  onDelete: (id: string) => void;
};

type Recipe = {
  id: string;
  title: string;
  recipe: string; // Markdown content
  form_data: any; // 必要に応じて型を調整
  created_at: string;
  updated_at: string;
};

const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({ visible, recipeId, onClose, onDelete }) => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  

  const fetchRecipeDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://recipeapp-096ac71f3c9b.herokuapp.com/api/recipes/${recipeId}`);
  
      if (response.status === 200) {
        setRecipe(response.data.recipe);
      } else {
        Alert.alert('Error', 'レシピの取得に失敗しました。');
        onClose();
      }
    } catch (error: any) {
      console.error('Error fetching recipe details:', error.message);
      Alert.alert('Error', 'レシピの取得中にエラーが発生しました。');
      onClose();
    } finally {
      setLoading(false);
    }
  }, [recipeId, onClose]);
  
  useEffect(() => {
    if (visible && recipeId) {
      fetchRecipeDetails();
    }
  }, [visible, recipeId, fetchRecipeDetails]);
  

  const handleDelete = () => {
    Alert.alert(
      'レシピを削除しますか？',
      '本当にこのレシピを削除してもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: '削除', style: 'destructive', onPress: confirmDelete },
      ]
    );
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      // ユーザー情報を取得
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!userData.user) {
        Alert.alert('Error', 'ユーザーが認証されていません。');
        onClose();
        return;
      }

      const user_id = userData.user.id;

      // レシピ削除を実行
      console.log('Deleting recipe:', recipeId);
      const response = await axios.delete(`https://recipeapp-096ac71f3c9b.herokuapp.com/api/recipes/${recipeId}`, {
        data: { user_id }, // user_id をリクエストボディに含める
      });

      if (response.status === 200) {
        Alert.alert('Success', 'レシピが削除されました。');
        onDelete(recipeId);
        onClose();
      } else {
        Alert.alert('Error', 'レシピの削除に失敗しました。');
      }
    } catch (error: any) {
      console.error('Error deleting recipe:', error.message);
      Alert.alert('Error', 'レシピの削除中にエラーが発生しました。');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#ff6347" />
              <Text style={styles.loaderText}>レシピを読み込んでいます...</Text>
            </View>
          ) : (
            <>
              <ScrollView style={styles.contentContainer}>
  <Text style={styles.title}>{recipe?.title}</Text>
  <ReactMarkdown
    style={{
      body: styles.markdownBody,
      heading1: styles.heading1,
      heading2: styles.heading2,
      heading3: styles.heading3,
      heading4: styles.heading4,
      listItem: styles.listItem,
      strong: styles.strong,
      em: styles.em,
      blockquote: styles.blockquote,
    }}
  >
    {recipe?.recipe || ''}
  </ReactMarkdown>
</ScrollView>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={isDeleting}>
                  {isDeleting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>削除する</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={onClose} disabled={isDeleting}>
                  <Text style={styles.buttonText}>閉じる</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
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
    backgroundColor: '#fffaf0',
    borderRadius: 8,
    width: '100%',
    maxHeight: '80%',
    padding: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#777',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ff6347',
    marginBottom: 12,
    textAlign: 'center',
  },
  contentContainer: {
    flexGrow: 1,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  deleteButton: {
    backgroundColor: '#ff6347',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  markdownBody: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 12,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff6347',
    marginBottom: 12,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffa07a',
    marginBottom: 10,
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f08080',
    marginBottom: 8,
  },
  heading4: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#cd5c5c',
    marginBottom: 6,
    marginTop: 6,
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
    color: '#333',
  },
  strong: {
    fontWeight: 'bold',
    color: '#000',
  },
  em: {
    fontStyle: 'italic',
    color: '#555',
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#ffa07a',
    paddingLeft: 12,
    fontStyle: 'italic',
    marginBottom: 10,
    color: '#555',
  },
});

export default RecipeDetailModal;
