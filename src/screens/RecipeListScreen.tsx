import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { fetchRecipesWithLabels, getUser } from '../utils/api';
import RecipeDetailModal from '../components/RecipeDetailModal';
import RecipeLabelModal from '../components/RecipeLabelModal';
import { Recipe, Label } from '../types/types';
import useDeviceOrientation from '../hooks/useDeviceOrientation';

const RecipeListScreen: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [editRecipeName, setEditRecipeName] = useState<string>('');
  const [editRecipeLabels, setEditRecipeLabels] = useState<string[]>([]);
  const { isLandscape, isLargeScreen } = useDeviceOrientation();

  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: isLargeScreen ? (isLandscape ? 50 : 40) : 16,
      backgroundColor: '#FFF8E1',
    },
    labelContainer: {
      marginBottom: isLargeScreen ? 24 : 16,
    },
    labelContentContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: isLargeScreen ? 'center' : 'flex-start',
    },
    label: {
      padding: isLargeScreen ? 14 : 10,
      backgroundColor: '#e0e0e0',
      borderRadius: 8,
      margin: isLargeScreen ? 10 : 5,
    },
    selectedLabel: {
      backgroundColor: '#ff6347',
    },
    labelText: {
      color: '#333',
      fontSize: isLargeScreen ? 18 : 14,
    },
    selectedLabelText: {
      color: '#fff',
    },
    recipeContainer: {
      paddingBottom: isLargeScreen ? 40 : 20,
    },
    recipeItem: {
      padding: isLargeScreen ? 24 : 20,
      backgroundColor: '#ffffff',
      borderRadius: 15,
      marginBottom: isLargeScreen ? 20 : 16,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
    },
    recipeTitle: {
      fontSize: isLargeScreen ? 20 : 18,
      color: '#333',
      fontWeight: 'bold',
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      textAlign: 'center',
      marginTop: isLargeScreen ? 30 : 20,
      fontSize: isLargeScreen ? 18 : 16,
      color: '#777',
    },
    operationGuide: {
      fontSize: isLargeScreen ? 24 : 18,
      color: '#777',
      textAlign: 'center',
      marginTop: 10,
      marginBottom: 10,
    },
  });

  const loadData = useCallback(async (labelId?: string | null) => {
    setLoading(true);
    try {
      const user = await getUser();
      const { labels = [], recipes = [] } = await fetchRecipesWithLabels(
        user.id,
        labelId || undefined,
      );
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
    setEditRecipeLabels(recipe.labels?.map((label) => String(label.id)) || []); // 数値から文字列へ変換
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
              style={[
                styles.label,
                selectedLabelId === (label.id ? String(label.id) : null) &&
                  styles.selectedLabel,
              ]}
              onPress={() =>
                handleLabelClick(label.id !== null ? String(label.id) : null)
              }
            >
              <Text
                style={[
                  styles.labelText,
                  selectedLabelId === (label.id ? String(label.id) : null) &&
                    styles.selectedLabelText,
                ]}
              >
                {label.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View>
        <Text style={styles.operationGuide}>
          レシピを長押しするとレシピ名の編集とラベル分けができます。
        </Text>
      </View>
      {/* レシピセクション */}
      <View style={styles.recipeContainer}>
        {recipes.length === 0 ? (
          <Text style={styles.emptyText}>
            ラベルに関連するレシピがありません。
          </Text>
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
            setRecipes((prev) =>
              prev.filter((recipe) => recipe.id !== selectedRecipeId),
            );
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

export default RecipeListScreen;
