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
      const response = await axios.get(`https://recipeapp1-two.vercel.app/api/recipes/${recipeId}`);
  
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
      const response = await axios.delete(`https://recipeapp1-two.vercel.app/api/recipes/${recipeId}`, {
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
                <ReactMarkdown>{recipe?.recipe || ''}</ReactMarkdown>
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
});

export default RecipeDetailModal;
