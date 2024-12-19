import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { RootStackParamList } from '../types/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import useAuthCheck from '../hooks/useAuthCheck';
import useDeviceOrientation from '../hooks/useDeviceOrientation';

type HelpScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Help'>;
  route: RouteProp<RootStackParamList, 'Help'>;
};

const HelpScreen: React.FC<HelpScreenProps> = ({ navigation }) => {
  useAuthCheck(); // ユーザー認証が完了しているかチェック
  const { isLandscape, isLargeScreen } = useDeviceOrientation();

  useEffect(() => {
    navigation.setOptions({
      title: '記録項目の説明',
    });
  }, [navigation]);

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: isLargeScreen ? (isLandscape ? 50 : 40) : 20,
      backgroundColor: '#FFF8E1',
      paddingBottom: isLargeScreen ? 150 : 100,
    },
    section: {
      marginBottom: isLargeScreen ? 30 : 20,
    },
    heading: {
      fontSize: isLargeScreen ? 24 : 20,
      fontWeight: 'bold',
      color: '#FF7043',
      marginBottom: isLargeScreen ? 15 : 10,
    },
    text: {
      fontSize: isLargeScreen ? 20 : 16,
      lineHeight: isLargeScreen ? 28 : 24,
      color: '#333',
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <Text style={styles.heading}>食事量・水分量の記録</Text>
        <Text style={styles.text}>
          食事量は、摂取した割合を1割から10割で記録します。主食として米、パン、麺類などがあり、ラーメンやパスタなどで主食が不明瞭な場合はメモ欄に詳細を記入してください。水分には味噌汁やスープ類も含まれます。
          {'\n'}
          また、むせが多い場合は誤嚥の危険があるため、とろみをつけるなどの対応や食事形態についての相談が必要です。
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>排泄状況の記録</Text>
        <Text style={styles.text}>
          排泄状況は、排尿と排便の回数や状況を記録する項目です。排便や排尿が少ない場合、薬での調整が必要になることがあるため、正確に記録することが重要です。
          {'\n'}
          また、排便時の硬さや量、排尿時の色や量なども記録し、異常があれば医療機関に相談してください。
          {'\n'}
          失禁がある場合は、尿失禁や便失禁の頻度や状況を記録し、専門家に相談して適切な対応を検討します。
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>睡眠の記録</Text>
        <Text style={styles.text}>
          睡眠の記録では、昼夜逆転がないかに特に注意してください。昼夜逆転が進行すると生活リズムが崩れ、認知症の症状悪化のリスクが増すため、日々の睡眠時間や起床時間を記録し、異常があれば対応を検討します。
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>バイタルサインの記録</Text>
        <Text style={styles.text}>
          バイタルサインには体温、血圧、脈拍、酸素飽和度（SpO₂）などがあります。これらは健康状態の重要な指標となるため、毎日の測定を習慣化し、異常があれば医療機関に相談してください。
          {'\n'}
          {'\n'}
          体温：例）「36.5°C」「37.0°C」{'\n'}
          血圧：例）「120/80 mmHg」「130/85 mmHg」{'\n'}
          脈拍：例）「70 bpm」「80 bpm」{'\n'}
          {'\n'}
          SpO₂（酸素飽和度）は血中の酸素量を示し、健康な人で100％、高齢者や喫煙者の場合は90％台後半であることが多いとされます。これより低い場合は呼吸や循環器の異常が疑われます。
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>特記事項の記録</Text>
        <Text style={styles.text}>
          特記事項には、病気やけが、体の状態、認知症予防のために行ったこと、認知症による不穏の様子、歩行や入浴の状況、介助の増減などを記入します。
          {'\n'}
          例えば、「認知症予防のためのパズル活動」「歩行時にふらつきが増加」など、日々の変化を具体的に記録することで、介護の質を高める助けになります。
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>認知症ケアのポイント</Text>
        <Text style={styles.text}>
          認知症の方には、安心できる環境を提供し、コミュニケーションを重視したケアを行いましょう。話しかけるときは優しいトーンで、ゆっくりと明瞭に話すことが大切です。
          {'\n'}
          不安定な行動が見られる場合は、その方の気持ちを尊重し、過度な制止は避けてください。また、適度な刺激が認知機能の維持に役立つため、会話や軽い運動なども取り入れてください。
        </Text>
      </View>
    </ScrollView>
  );
};

export default HelpScreen;
