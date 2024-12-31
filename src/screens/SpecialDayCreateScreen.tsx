import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import SpecialDayFormExtended from '../components/SpecialDayFormExtended';

const SpecialDayCreateScreen: React.FC = () => {
  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      enableOnAndroid={true} // Android対応
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={Platform.OS === 'ios' ? 20 : 0} // iOS用スクロール余白
    >
      <SpecialDayFormExtended />
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
  },
  content: {
    flexGrow: 1,
  },
});

export default SpecialDayCreateScreen;
