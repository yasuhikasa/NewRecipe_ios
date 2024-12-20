import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { fetchRecipesWithLabels, getUser, assignLabelToRecipe, removeLabelFromRecipe } from '../utils/api';
import RecipeDetailModal from '../components/RecipeDetailModal';
import RecipeLabelModal from '../components/RecipeLabelModal';
import { Recipe, Label } from '../types/types';

const RecipeListScreen: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [editRecipeName, setEditRecipeName] = useState<string>('');
  const [editRecipeLabels, setEditRecipeLabels] = useState<string[]>([]);

  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);

  const loadData = useCallback(async (labelId?: string | null) => {
    setLoading(true);
    try {
      const user = await getUser();
      const { labels = [], recipes = [] } = await fetchRecipesWithLabels(user.id, labelId || undefined);
      setLabels(labels);
      setRecipes(recipes);
    } catch (error: any) {
      console.error('Error fetching data:', error.message);
      Alert.alert('エラー', 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(null);
  }, [loadData]);

  const handleLabelClick = (labelId: string | null) => {
    setSelectedLabelId(labelId);
    loadData(labelId);
  };

  const handleLongPressRecipe = (recipe: Recipe) => {
    setEditRecipeName(recipe.title);
    setEditRecipeLabels(recipe.labels?.map((label) => label.id) || []);
    setSelectedRecipeId(recipe.id);
    setEditModalVisible(true);
  };

  const handlePressRecipe = (recipeId: string) => {
    setSelectedRecipeId(recipeId);
    setDetailModalVisible(true);
  };





  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#ff6347" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ラベルセクション */}
      <View style={styles.labelContainer}>
        <View style={styles.labelContentContainer}>
          {[{ id: null, name: 'All' }, ...labels].map((label) => (
            <TouchableOpacity
              key={label.id || 'all'}
              style={[styles.label, selectedLabelId === label.id && styles.selectedLabel]}
              onPress={() => handleLabelClick(label.id || null)}
            >
              <Text style={[styles.labelText, selectedLabelId === label.id && styles.selectedLabelText]}>
                {label.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* レシピセクション */}
      <View style={styles.recipeContainer}>
        {recipes.length === 0 ? (
          <Text style={styles.emptyText}>ラベルに関連するレシピがありません。</Text>
        ) : (
          recipes.map((recipe) => (
            <TouchableOpacity
              key={recipe.id}
              style={styles.recipeItem}
              onPress={() => handlePressRecipe(recipe.id)}
              onLongPress={() => handleLongPressRecipe(recipe)}
            >
              <Text style={styles.recipeTitle}>{recipe.title}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* レシピ詳細モーダル */}
      {selectedRecipeId && (
        <RecipeDetailModal
          visible={detailModalVisible}
          recipeId={selectedRecipeId}
          onClose={() => setDetailModalVisible(false)}
          onDelete={() => {
            setRecipes((prev) => prev.filter((recipe) => recipe.id !== selectedRecipeId));
            setDetailModalVisible(false);
          }}
        />
      )}

      {/* 編集モーダル */}
      <RecipeLabelModal
  visible={editModalVisible}
  recipeId={selectedRecipeId!} // selectedRecipeIdがnullでないことを保証
  onSaved={() => {
    loadData(selectedLabelId); // 保存後にリストをリロード
    setEditModalVisible(false);
  }}
  onClose={() => setEditModalVisible(false)}
/>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: '#f8f8f8' },
  labelContainer: { marginBottom: 16 },
  labelContentContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  label: { padding: 10, backgroundColor: '#e0e0e0', borderRadius: 8, margin: 5 },
  selectedLabel: { backgroundColor: '#ff6347' },
  labelText: { color: '#333' },
  selectedLabelText: { color: '#fff' },
  recipeContainer: { paddingBottom: 20 },
  recipeItem: { padding: 20, backgroundColor: '#ffffff', borderRadius: 15, marginBottom: 16 },
  recipeTitle: { fontSize: 18, color: '#333' },
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { backgroundColor: '#fff', borderRadius: 8, padding: 16, width: '90%', maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
  saveButton: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8 },
  cancelButton: { backgroundColor: '#f44336', padding: 12, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  labelItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  labelName: { fontSize: 16 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#777' },
});

export default RecipeListScreen;
