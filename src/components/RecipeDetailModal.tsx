import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import ReactMarkdown from 'react-native-markdown-display';
import supabase from '../config/supabaseClient';
import axios from 'axios';
import useDeviceOrientation from '../hooks/useDeviceOrientation';

type RecipeDetailModalProps = {
  visible: boolean;
  recipeId: string;
  onClose: () => void;
  onDelete: (id: string) => void;
};

const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  visible,
  recipeId,
  onClose,
  onDelete,
}) => {
  const [recipe, setRecipe] = React.useState<{
    title: string;
    recipe: string;
  } | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);
  const { isLargeScreen, isLandscape } = useDeviceOrientation();

  React.useEffect(() => {
    const fetchRecipeDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://recipeapp-096ac71f3c9b.herokuapp.com/api/recipes/${recipeId}`,
        );
        if (response.status === 200) {
          setRecipe(response.data.recipe);
        } else {
          Alert.alert('エラー', 'レシピの取得に失敗しました。');
          onClose();
        }
      } catch (error) {
        console.error('Error fetching recipe:', error);
        Alert.alert('エラー', 'レシピの取得中にエラーが発生しました。');
        onClose();
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      fetchRecipeDetails();
    }
  }, [visible, recipeId, onClose]);

  const handleDelete = () => {
    Alert.alert('確認', 'このレシピを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: confirmDelete },
    ]);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const { data, error } = await supabase.auth.getUser();

      if (!data || error) {
        console.error('Error fetching user:', error?.message);
        Alert.alert('エラー', 'ユーザー情報の取得に失敗しました。');
        return;
      }
      const user_id = data.user.id;

      const response = await axios.delete(
        `https://recipeapp-096ac71f3c9b.herokuapp.com/api/recipes/${recipeId}`,
        {
          headers: { 'Content-Type': 'application/json' }, // ヘッダーを明示
          data: { user_id }, // 削除リクエストに user_id を含める
        },
      );

      if (response.status === 200) {
        Alert.alert('成功', 'レシピが正常に削除されました。');
        onDelete(recipeId);
        onClose();
      } else {
        console.error('Unexpected response:', response.status);
        Alert.alert('エラー', 'レシピの削除に失敗しました。');
      }
    } catch (error: any) {
      console.error('Error deleting recipe:', error.message);
      Alert.alert('エラー', 'レシピの削除中にエラーが発生しました。');
    }
  };

  if (!visible) return null;

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: isLargeScreen ? (isLandscape ? 40 : 30) : 20,
    },
    modalContainer: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: isLargeScreen ? 20 : 16,
      width: isLargeScreen ? (isLandscape ? '60%' : '80%') : '90%',
      maxHeight: '80%',
      justifyContent: 'space-between',
    },
    contentContainer: {
      flexGrow: 1,
    },
    title: {
      fontSize: isLargeScreen ? 26 : 22,
      fontWeight: 'bold',
      color: '#ff6347',
      marginBottom: isLargeScreen ? 16 : 12,
      textAlign: 'center',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    deleteButton: {
      backgroundColor: '#ff6347',
      padding: isLargeScreen ? 14 : 12,
      borderRadius: 8,
      flex: 1,
      marginRight: 8,
    },
    closeButton: {
      backgroundColor: '#4CAF50',
      padding: isLargeScreen ? 14 : 12,
      borderRadius: 8,
      flex: 1,
      marginLeft: 8,
    },
    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: isLargeScreen ? 18 : 16,
    },
  });

  const markdownStyles = StyleSheet.create({
    body: {
      fontSize: isLargeScreen ? 18 : 16,
      lineHeight: isLargeScreen ? 28 : 24,
      color: '#333',
      marginBottom: isLargeScreen ? 14 : 12,
    },
    heading1: {
      fontSize: isLargeScreen ? 26 : 24,
      fontWeight: 'bold',
      color: '#ff6347',
      marginBottom: isLargeScreen ? 16 : 12,
    },
    heading2: {
      fontSize: isLargeScreen ? 22 : 20,
      fontWeight: 'bold',
      color: '#ffa07a',
      marginBottom: isLargeScreen ? 14 : 10,
    },
    heading3: {
      fontSize: isLargeScreen ? 20 : 18,
      fontWeight: 'bold',
      color: '#f08080',
      marginBottom: isLargeScreen ? 12 : 8,
    },
    listItem: {
      fontSize: isLargeScreen ? 18 : 16,
      marginBottom: isLargeScreen ? 10 : 8,
      color: '#333',
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: '#ffa07a',
      paddingLeft: isLargeScreen ? 14 : 12,
      fontStyle: 'italic',
      color: '#555',
      marginBottom: isLargeScreen ? 14 : 12,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#ff6347" />
          ) : (
            <>
              <ScrollView style={styles.contentContainer}>
                <Text style={styles.title}>{recipe?.title}</Text>
                <ReactMarkdown style={markdownStyles}>
                  {recipe?.recipe}
                </ReactMarkdown>
              </ScrollView>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDelete}
                  disabled={isDeleting}
                >
                  <Text style={styles.buttonText}>
                    {isDeleting ? '削除中...' : '削除'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
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

export default RecipeDetailModal;
