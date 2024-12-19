// src/components/RecipeDetailModal.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Switch } from 'react-native';
import ReactMarkdown from 'react-native-markdown-display';
import { fetchLabels, assignLabelToRecipe, removeLabelFromRecipe, getUser } from '../utils/api';
import { Recipe, Label } from '../types/types';
import axios from 'axios';

type RecipeDetailModalProps = {
  visible: boolean;
  recipeId: string;
  onClose: () => void;
  onDelete: (id: string) => void;
};

const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({ visible, recipeId, onClose, onDelete }) => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const [recipeLabels, setRecipeLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isUpdatingLabels, setIsUpdatingLabels] = useState<boolean>(false);

  const fetchRecipeDetails = useCallback(async () => {
    setLoading(true);
    try {
      const user = await getUser();
      const response = await axios.get(`https://recipeapp-096ac71f3c9b.herokuapp.com/api/recipes/${recipeId}`, {
        params: { user_id: user.id },
      });

      if (response.status === 200) {
        const fetchedRecipe: Recipe = response.data.recipe;
        setRecipe(fetchedRecipe);
        setRecipeLabels(fetchedRecipe.labels.map((label: Label) => label.id));
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

  const loadLabels = useCallback(async () => {
    try {
      const user = await getUser();
      const fetchedLabels = await fetchLabels(user.id);
      setLabels(fetchedLabels);
    } catch (error: any) {
      console.error('Error fetching labels:', error.message);
      Alert.alert('Error', error.message);
    }
  }, []);

  useEffect(() => {
    if (visible && recipeId) {
      fetchRecipeDetails();
      loadLabels();
    }
  }, [visible, recipeId, fetchRecipeDetails, loadLabels]);

  const handleDelete = () => {
    Alert.alert(
      'レシピを削除しますか？',
      '本当にこのレシピを削除してもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: '削除', style: 'destructive', onPress: () => confirmDelete() },
      ]
    );
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const user = await getUser();

      const response = await axios.delete(`https://recipeapp-096ac71f3c9b.herokuapp.com/api/recipes/${recipeId}`, {
        data: { user_id: user.id }, // user_id をリクエストボディに含める
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

  const handleToggleLabel = async (labelId: string) => {
    const isAssigned = recipeLabels.includes(labelId);
    setIsUpdatingLabels(true);

    try {
      if (isAssigned) {
        await removeLabelFromRecipe(recipeId, labelId);
        setRecipeLabels(prev => prev.filter(id => id !== labelId));
      } else {
        await assignLabelToRecipe(recipeId, labelId);
        setRecipeLabels(prev => [...prev, labelId]);
      }
    } catch (error: any) {
      console.error('Error updating labels:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setIsUpdatingLabels(false);
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
                <ReactMarkdown style={mstyles}>{recipe?.recipe || ''}</ReactMarkdown>

                {/* Labels Section */}
                <View style={styles.labelsContainer}>
                  <Text style={styles.labelsTitle}>カテゴリ:</Text>
                  {labels.map(label => (
                    <View key={label.id} style={styles.labelItem}>
                      <Text style={styles.labelName}>{label.name}</Text>
                      <Switch
                        value={recipeLabels.includes(label.id)}
                        onValueChange={() => handleToggleLabel(label.id)}
                        disabled={isUpdatingLabels}
                      />
                    </View>
                  ))}
                </View>
              </ScrollView>

              {/* Buttons */}
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
  labelsContainer: {
    marginTop: 20,
  },
  labelsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  labelItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelName: {
    fontSize: 16,
    color: '#333',
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
