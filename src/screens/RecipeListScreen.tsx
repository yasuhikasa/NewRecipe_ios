import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, LayoutChangeEvent } from 'react-native';
import { fetchRecipesWithLabels, getUser } from '../utils/api';
import RecipeDetailModal from '../components/RecipeDetailModal';
import { Recipe, Label } from '../types/types';

const RecipeListScreen: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [labelContainerHeight, setLabelContainerHeight] = useState<number>(0); // ラベルセクションの高さ

  const loadData = useCallback(async (labelId?: string | null) => {
    setLoading(true);
    try {
      const user = await getUser();
      const { labels, recipes } = await fetchRecipesWithLabels(user.id, labelId || undefined);
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

  const handleDeleteRecipe = (id: string) => {
    setRecipes((prev) => prev.filter((recipe) => recipe.id !== id));
    setIsModalOpen(false);
    Alert.alert('削除しました', 'レシピが正常に削除されました。');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRecipeId(null);
  };

  const onLabelContainerLayout = (e: LayoutChangeEvent) => {
    const { height } = e.nativeEvent.layout;
    setLabelContainerHeight(height); // ラベルセクションの高さを保存
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
      <View onLayout={onLabelContainerLayout} style={styles.labelContainer}>
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
              onPress={() => {
                setSelectedRecipeId(recipe.id);
                setIsModalOpen(true);
              }}
            >
              <Text style={styles.recipeTitle}>{recipe.title}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* レシピ詳細モーダル */}
      {selectedRecipeId && (
        <RecipeDetailModal
          visible={isModalOpen}
          recipeId={selectedRecipeId}
          onClose={closeModal}
          onDelete={handleDeleteRecipe}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // ScrollView の中身が親コンテナにフィットするように調整
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  labelContainer: {
    marginBottom: 16,
  },
  labelContentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // ラベルが折り返すように設定
    justifyContent: 'flex-start', // 左寄せ
    alignItems: 'flex-start', // 上寄せ
  },
  label: {
    height: 40, // 明示的に高さを指定
    minWidth: 80, // ボタンの最小幅を設定
    paddingHorizontal: 14, // 横の余白を設定
    backgroundColor: '#e0e0e0', // デフォルト背景色
    borderRadius: 20, // 丸みを強調
    marginHorizontal: 6, // ボタン間の間隔
    marginVertical: 6, // ボタンの上下間隔を追加
    borderWidth: 1, // ボーダーを追加
    borderColor: '#ccc', // ボーダー色
    justifyContent: 'center', // テキストを垂直方向で中央揃え
    alignItems: 'center', // テキストを水平方向で中央揃え
  },
  selectedLabel: {
    backgroundColor: '#ff6347', // 選択時の背景色
    borderColor: '#ff6347', // 選択時のボーダー色
  },
  labelText: {
    color: '#333', // デフォルト文字色
    fontSize: 14, // ボタンに合わせた文字サイズ
    fontWeight: '500', // 中くらいの太さ
  },
  selectedLabelText: {
    color: '#fff', // 選択時の文字色
  },
  recipeContainer: {
    paddingBottom: 20,
  },
  recipeItem: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    marginBottom: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  recipeTitle: {
    fontSize: 18,
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
    marginTop: 20,
    fontSize: 16,
    color: '#777',
  },
});

export default RecipeListScreen;
