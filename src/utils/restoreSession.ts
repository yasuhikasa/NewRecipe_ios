import AsyncStorage from '@react-native-async-storage/async-storage';
import supabase from '../config/supabaseClient';

export const restoreSession = async () => {
  const sessionData = await AsyncStorage.getItem('loginSession');
  console.log('保存されたセッション:', sessionData); // セッションデータを確認
  if (sessionData) {
    const session = JSON.parse(sessionData);
    await supabase.auth.setSession(session);
  }
};
