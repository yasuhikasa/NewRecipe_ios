import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { fetchLabels, addLabel, deleteLabel, updateLabel, getUser } from '../utils/api';
import { Label } from '../types/types';
import useDeviceOrientation from '../hooks/useDeviceOrientation';

const LabelManagementScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const [labels, setLabels] = useState<Label[]>([]);
  const [newLabel, setNewLabel] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { isLandscape, isLargeScreen } = useDeviceOrientation();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFF8E1',
    },
    contentContainer: {
      flexGrow: 1,
      padding: isLargeScreen ? (isLandscape ? 50 : 40) : 16, // iPadなら余白を広げる
    },
    header: {
      fontSize: isLargeScreen ? 28 : 24, // iPad用にフォントサイズを調整
      fontWeight: 'bold',
      marginBottom: isLargeScreen ? 30 : 20, // 間隔を調整
      textAlign: 'center',
    },
    addLabelContainer: {
      flexDirection: 'row',
      marginBottom: isLargeScreen ? 24 : 20, // 余白をデバイス別に調整
      alignItems: 'center',
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      padding: isLargeScreen ? 14 : 10, // 入力欄をiPad用に広げる
      fontSize: isLargeScreen ? 18 : 16,
      backgroundColor: '#fff',
    },
    addButton: {
      marginLeft: isLargeScreen ? 14 : 10, // ボタン間のスペースをデバイス別に調整
      backgroundColor: '#007bff',
      paddingVertical: isLargeScreen ? 12 : 10, // ボタンサイズを調整
      paddingHorizontal: isLargeScreen ? 16 : 12,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addButtonText: {
      color: '#fff',
      fontSize: isLargeScreen ? 18 : 16,
      fontWeight: 'bold',
    },
    list: {
      paddingBottom: isLargeScreen ? 40 : 20, // iPadなら余白を広げる
    },
    labelItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: isLargeScreen ? 16 : 12, // 項目の余白を調整
      backgroundColor: '#fffaf0',
      borderRadius: 8,
      marginBottom: isLargeScreen ? 15 : 10,
      elevation: 2, // Android shadow
      shadowColor: '#000', // iOS shadow
      shadowOffset: { width: 0, height: 1 }, // iOS shadow
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    labelName: {
      fontSize: isLargeScreen ? 18 : 16,
      color: '#333',
    },
    deleteButton: {
      backgroundColor: '#ff6347',
      paddingVertical: isLargeScreen ? 8 : 6,
      paddingHorizontal: isLargeScreen ? 14 : 12,
      borderRadius: 5,
    },
    deleteButtonText: {
      color: '#fff',
      fontSize: isLargeScreen ? 16 : 14,
    },
    editButton: {
      backgroundColor: '#4caf50',
      paddingVertical: isLargeScreen ? 8 : 6,
      paddingHorizontal: isLargeScreen ? 14 : 12,
      borderRadius: 5,
    },
    editButtonText: {
      color: '#fff',
      fontSize: isLargeScreen ? 16 : 14,
    },
    emptyText: {
      textAlign: 'center',
      marginTop: isLargeScreen ? 30 : 20, // 余白を調整
      fontSize: isLargeScreen ? 18 : 16,
      color: '#777',
    },
    description: {
      fontSize: 18,
      color: '#333',
      textAlign: 'center',
      marginBottom: 20,
      paddingHorizontal: 20,
    },
  });

  const loadLabels = async () => {
    setLoading(true);
    try {
      const user = await getUser();
      const fetchedLabels = await fetchLabels(user.id);
      setLabels(fetchedLabels);
    } catch (error: any) {
      console.error('Error fetching labels:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLabels();
  }, []);

  const handleAddLabel = async () => {
    if (!newLabel.trim()) {
      Alert.alert('Error', 'ラベル名を入力してください。');
      return;
    }

    setLoading(true);
    try {
      const user = await getUser();
      console.log('Sending data to API:', {
        user_id: user.id,
        name: newLabel.trim(),
      });

      await addLabel(user.id, newLabel.trim()); // ラベルを追加
      const updatedLabels = await fetchLabels(user.id); // 最新のラベルを取得

      setLabels(updatedLabels); // 最新のラベルをセット
      setNewLabel('');
    } catch (error: any) {
      console.error('Error adding label:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLabel = async (id: string) => {
    Alert.alert(
      'ラベルを削除しますか？',
      '本当にこのラベルを削除してもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => confirmDeleteLabel(id),
        },
      ],
    );
  };

  const confirmDeleteLabel = async (id: string) => {
    setLoading(true);
    try {
      await deleteLabel(id);
      setLabels((prev) => prev.filter((label) => String(label.id) !== id));
    } catch (error: any) {
      console.error('Error deleting label:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditLabel = (id: string, currentName: string) => {
    Alert.prompt(
      'ラベル名を変更',
      '新しいラベル名を入力してください',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '変更',
          onPress: async (newName) => {
            if (newName?.trim()) {
              setLoading(true);
              try {
                // getUser() でユーザー情報を取得し、その後ラベルを更新
                const user = await getUser(); // 非同期でユーザー情報を取得
                await updateLabel(id, newName.trim(), user.id); // ユーザーの id を渡す
                
                const updatedLabels = await fetchLabels(user.id); // 最新のラベルを取得
                setLabels(updatedLabels);
              } catch (error: any) {
                console.error('Error updating label:', error.message);
                Alert.alert('Error', error.message);
              } finally {
                setLoading(false);
              }
            }
          },
        },
      ],
      'plain-text',
      currentName
    );
  };

  const renderLabelItem = ({ item }: { item: Label }) => (
    <View style={styles.labelItem}>
      <Text style={styles.labelName}>{item.name}</Text>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditLabel(String(item.id), item.name)}
        >
          <Text style={styles.editButtonText}>変更</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteLabel(String(item.id))}
        >
          <Text style={styles.deleteButtonText}>削除</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      data={labels}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderLabelItem}
      ListEmptyComponent={
        <Text style={styles.emptyText}>ラベルがありません。</Text>
      }
      ListHeaderComponent={
        <>
          <Text style={styles.header}>ラベル管理</Text>
          <Text style={styles.description}>
            ⭐️ラベルを作成し、レシピ一覧ページでレシピを整理できます。
          </Text>
          <View style={styles.addLabelContainer}>
            <TextInput
              style={styles.input}
              placeholder="新しいラベル名(10文字以内)"
              value={newLabel}
              onChangeText={setNewLabel}
              maxLength={10}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddLabel}
              disabled={loading}
            >
              <Text style={styles.addButtonText}>追加</Text>
            </TouchableOpacity>
          </View>
          {loading && (
            <ActivityIndicator
              size="large"
              color="#ff6347"
              style={{ marginTop: 20 }}
            />
          )}
        </>
      }
    />
  );
};

export default LabelManagementScreen;
