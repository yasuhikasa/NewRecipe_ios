// src/screens/LabelManagementScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { fetchLabels, addLabel, deleteLabel, getUser } from '../utils/api';
import { Label } from '../types/types';

const LabelManagementScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [labels, setLabels] = useState<Label[]>([]);
  const [newLabel, setNewLabel] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

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
      console.log('Sending data to API:', { user_id: user.id, name: newLabel.trim() });
  
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
        { text: '削除', style: 'destructive', onPress: () => confirmDeleteLabel(id) },
      ]
    );
  };

  const confirmDeleteLabel = async (id: string) => {
    setLoading(true);
    try {
      await deleteLabel(id);
      setLabels(prev => prev.filter(label => label.id !== id));
    } catch (error: any) {
      console.error('Error deleting label:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderLabelItem = ({ item }: { item: Label }) => (
    <View style={styles.labelItem}>
      <Text style={styles.labelName}>{item.name}</Text>
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteLabel(item.id)}>
        <Text style={styles.deleteButtonText}>削除</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>ラベル管理</Text>

      <View style={styles.addLabelContainer}>
        <TextInput
          style={styles.input}
          placeholder="新しいラベル名"
          value={newLabel}
          onChangeText={setNewLabel}
          maxLength={20}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddLabel} disabled={loading}>
          <Text style={styles.addButtonText}>追加</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#ff6347" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={labels}
          keyExtractor={(item) => item.id}
          renderItem={renderLabelItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>ラベルがありません。</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  addLabelContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 20,
  },
  labelItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fffaf0',
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 1 }, // iOS shadow
    shadowOpacity: 0.1, // iOS shadow
    shadowRadius: 2, // iOS shadow
  },
  labelName: {
    fontSize: 16,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#ff6347',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#777',
  },
});

export default LabelManagementScreen;
