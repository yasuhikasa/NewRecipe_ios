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

  const handleSaveEdit = async () => {
    if (!selectedRecipeId) return;

    try {
      // レシピ名の更新
      if (editRecipeName) {
        const response = await fetch(
          `https://recipeapp-096ac71f3c9b.herokuapp.com/api/recipes/${selectedRecipeId}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: editRecipeName }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to update recipe title');
        }
      }

      // ラベルの割り当て・削除
      for (const label of labels) {
        const isSelected = editRecipeLabels.includes(label.id);
        const isAlreadyAssigned = recipes
          .find((r) => r.id === selectedRecipeId)
          ?.labels?.some((rLabel) => rLabel.id === label.id);

        if (isSelected && !isAlreadyAssigned) {
          await assignLabelToRecipe(selectedRecipeId, label.id);
        } else if (!isSelected && isAlreadyAssigned) {
          await removeLabelFromRecipe(selectedRecipeId, label.id);
        }
      }

      Alert.alert('成功', 'レシピが更新されました。');
      loadData(selectedLabelId);
    } catch (error: any) {
      console.error('Error updating recipe:', error.message);
      Alert.alert('エラー', 'レシピの更新に失敗しました。');
    } finally {
      setEditModalVisible(false);
    }
  };

  const renderLabelItem = ({ label }: { label: Label }) => (
    <View style={styles.labelItem}>
      <Text style={styles.labelName}>{label.name}</Text>
      <Switch
        value={editRecipeLabels.includes(label.id)}
        onValueChange={(value) => {
          setEditRecipeLabels((prev) =>
            value ? [...prev, label.id] : prev.filter((id) => id !== label.id)
          );
        }}
      />
    </View>
  );

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
      <Modal visible={editModalVisible} transparent={true} animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>レシピを編集</Text>
            <TextInput
              style={styles.input}
              value={editRecipeName}
              onChangeText={setEditRecipeName}
              placeholder="レシピ名を入力"
            />
            <ScrollView>
              {labels.map((label) => renderLabelItem({ label }))}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
                <Text style={styles.buttonText}>保存</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.buttonText}>キャンセル</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
