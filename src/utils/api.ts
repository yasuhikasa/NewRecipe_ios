// src/utils/api.ts
import axios from 'axios';
import supabase from '../config/supabaseClient';
import { Label, Recipe } from '../types/types';

// APIのベースURL
const API_BASE_URL = 'https://recipeapp-096ac71f3c9b.herokuapp.com/api';

// ユーザー情報取得
export const getUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error('ユーザーが認証されていません。');
  }
  return data.user;
};

// ラベル取得
export const fetchLabels = async (user_id: string): Promise<Label[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/labels`, {
      params: { user_id },
    });

    console.log('Fetch Labels Response:', response.data);

    if (response.status === 200) {
      return response.data.labels;
    } else {
      throw new Error('Failed to fetch labels');
    }
  } catch (error) {
    console.error('Error in fetchLabels:', error);
    throw new Error('ラベルの取得に失敗しました');
  }
};


// ラベル追加
export const addLabel = async (user_id: string, name: string): Promise<Label> => {
  const response = await axios.post(`${API_BASE_URL}/labels`, { user_id, name });

  if (response.status === 201) {
    return response.data.label;
  } else {
    throw new Error('ラベルの追加に失敗しました。');
  }
};

// ラベル削除
export const deleteLabel = async (label_id: string): Promise<void> => {
  const response = await axios.delete(`${API_BASE_URL}/labels/${label_id}`);

  if (response.status !== 200) {
    throw new Error('ラベルの削除に失敗しました。');
  }
};

// レシピ取得（オプションでラベルフィルタ）
export const fetchRecipes = async (user_id: string, label_id?: string): Promise<Recipe[]> => {
  const params: Record<string, string | undefined> = { user_id };
  if (label_id) {
    params.label_id = label_id;
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/recipes`, { params });

    console.log('Fetch Recipes Response:', response.data);

    if (response.status === 200) {
      return response.data.recipes;
    } else {
      throw new Error('Failed to fetch recipes');
    }
  } catch (error) {
    console.error('Error in fetchRecipes:', error);
    throw new Error('レシピの取得に失敗しました');
  }
};


// レシピにラベルを割り当てる
export const assignLabelToRecipe = async (recipeId: string, labelId: string): Promise<void> => {
  const response = await axios.post(`${API_BASE_URL}/recipes/${recipeId}/labels`, { label_id: labelId });

  if (response.status !== 200) {
    throw new Error('ラベルの割り当てに失敗しました。');
  }
};

// レシピからラベルを削除する
export const removeLabelFromRecipe = async (recipeId: string, labelId: string): Promise<void> => {
  const response = await axios.delete(`${API_BASE_URL}/recipes/${recipeId}/labels/${labelId}`);

  if (response.status !== 200) {
    throw new Error('ラベルの削除に失敗しました。');
  }
};

// 統合されたデータを取得
export const fetchRecipesWithLabels = async (user_id: string, label_id?: string): Promise<{ labels: Label[]; recipes: Recipe[] }> => {
  const params: Record<string, string | undefined> = { user_id };
  if (label_id) {
    params.label_id = label_id;
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/recipesWithLabels`, { params });

    if (response.status === 200) {
      const { recipes, labels } = response.data;
      return { recipes: recipes || [], labels: labels || [] };
    } else {
      throw new Error('Failed to fetch data');
    }
  } catch (error: any) {
    console.error('Error in fetchRecipesWithLabels:', error.message);
    throw new Error('データの取得に失敗しました');
  }
};


