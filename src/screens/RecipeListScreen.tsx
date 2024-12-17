// src/screens/RecipeListScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import supabase from '../config/supabaseClient';
import RecipeDetailModal from '../components/RecipeDetailModal';
import axios from 'axios';

type Recipe = {
  id: string;
  title: string;
};

const RecipeListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchUserAndRecipes = useCallback(async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Error fetching user:', error.message);
      Alert.alert('エラー', 'ユーザー情報の取得に失敗しました。');
      setLoading(false);
      return;
    }

    if (data.user) {
      fetchRecipes(data.user.id);
    } else {
      Alert.alert('エラー', 'ユーザーが認証されていません。');
      setLoading(false);
    }
  }, []);

  const fetchRecipes = async (user_id: string) => {
    setLoading(true);
    try {
      const response = await axios.get('https://recipeapp-096ac71f3c9b.herokuapp.com/api/recipes', {
        params: { user_id },
      });

      if (response.status === 200) {
        setRecipes(response.data.recipes);
      } else {
        Alert.alert('Error', 'レシピの取得に失敗しました。');
      }
    } catch (error: any) {
      console.error('Error fetching recipes:', error.message);
      Alert.alert('Error', 'レシピの取得中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAndRecipes();
  }, [fetchUserAndRecipes]);

  const handleRecipePress = (id: string) => {
    setSelectedRecipeId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRecipeId(null);
  };

  const handleDelete = async (id: string) => {
    // レシピリストから削除
    setRecipes((prevRecipes) => prevRecipes.filter((recipe) => recipe.id !== id));
    closeModal(); // モーダルを閉じる
  };

  const renderItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity style={styles.item} onPress={() => handleRecipePress(item.id)}>
      <Text style={styles.title}>{item.title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#ff6347" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {recipes.length === 0 ? (
        <Text style={styles.emptyText}>保存されたレシピがありません。</Text>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}

      {selectedRecipeId && (
        <RecipeDetailModal
          visible={isModalOpen}
          recipeId={selectedRecipeId}
          onClose={closeModal}
          onDelete={handleDelete}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  list: {
    paddingBottom: 20,
  },
  item: {
    padding: 16,
    backgroundColor: '#fffaf0',
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 }, // iOS shadow
    shadowOpacity: 0.1, // iOS shadow
    shadowRadius: 4, // iOS shadow
  },
  title: {
    fontSize: 18,
    color: '#333',
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
