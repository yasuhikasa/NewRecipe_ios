import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/types';
import useDeviceOrientation from '../../hooks/useDeviceOrientation';

type AboutAppScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'AboutApp'
>;

type Props = {
  navigation: AboutAppScreenNavigationProp;
};

const AboutAppScreen: React.FC<Props> = ({ navigation }: any) => {
  const screenWidth = Dimensions.get('window').width;
  const { isLandscape } = useDeviceOrientation();

  const isLargeScreen = screenWidth > 768; // iPadかどうか判定

  const navigateToPage = (page: keyof RootStackParamList) => {
    navigation.navigate(page);
  };

  // 動的スタイルを適用
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFF8E1',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isLargeScreen ? 60 : 20, // iPadでは余白を多く
    },
    title: {
      fontSize: isLargeScreen ? 30 : 20,
      fontWeight: 'bold',
      marginBottom: isLargeScreen ? 30 : 20,
      color: '#FF7043',
      textAlign: 'center',
    },
    button: {
      backgroundColor: '#AED581',
      paddingVertical: isLargeScreen ? 20 : 15,
      paddingHorizontal: isLargeScreen ? 50 : 30,
      borderRadius: 10,
      marginVertical: isLargeScreen ? 15 : 10,
      width: isLandscape ? '40%' : '80%', // 横向きでは幅を狭める
      alignItems: 'center',
    },
    buttonText: {
      fontSize: isLargeScreen ? 26 : 18,
      color: '#FFFFFF',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>このアプリについて</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigateToPage('TermsOfService')}
      >
        <Text style={styles.buttonText}>利用規約</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigateToPage('PrivacyPolicy')}
      >
        <Text style={styles.buttonText}>プライバシーポリシー</Text>
      </TouchableOpacity>

      {/* <TouchableOpacity
        style={styles.button}
        onPress={() => navigateToPage('CommercialTransaction')}
      >
        <Text style={styles.buttonText}>特定商取引法に基づく表記</Text>
      </TouchableOpacity> */}

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigateToPage('AppOperator')}
      >
        <Text style={styles.buttonText}>アプリ運営者情報</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AboutAppScreen;
