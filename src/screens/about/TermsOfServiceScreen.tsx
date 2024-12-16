import React from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import useDeviceOrientation from '../../hooks/useDeviceOrientation';

const TermsOfServiceScreen: React.FC = () => {
  const { width } = useWindowDimensions(); // 画面サイズ取得
  const { isLandscape } = useDeviceOrientation(); // デバイスの向きを判定

  const isLargeScreen = width > 768; // iPadサイズ判定

  // 動的スタイルを生成
  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: '#FFF8E1',
      padding: isLargeScreen ? (isLandscape ? 40 : 30) : 20,
      paddingBottom: 100, // スクロール領域の下部に余白を追加
    },
    title: {
      fontSize: isLargeScreen ? 30 : 24,
      fontWeight: 'bold',
      marginBottom: isLargeScreen ? 30 : 20,
      color: '#FF7043',
      textAlign: 'center',
    },
    heading: {
      fontSize: isLargeScreen ? 22 : 20,
      fontWeight: 'bold',
      marginTop: isLargeScreen ? 30 : 20,
      marginBottom: isLargeScreen ? 15 : 10,
      color: '#FF7043',
    },
    text: {
      fontSize: isLargeScreen ? 20 : 16,
      color: '#37474F',
      lineHeight: isLargeScreen ? 28 : 24,
      marginBottom: isLargeScreen ? 15 : 10,
    },
  });
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>利用規約</Text>

      <Text style={styles.heading}>第1条（適用）</Text>
      <Text style={styles.text}>
        本利用規約（以下「本規約」といいます）は、本アプリ（以下「本サービス」といいます）の利用条件を定めるものです。本サービスを利用される全てのユーザー（以下「ユーザー」といいます）に適用されます。
      </Text>

      <Text style={styles.heading}>第2条（利用登録）</Text>
      <Text style={styles.text}>
        ユーザーは、本サービスを利用するにあたり、運営者が定める方法で利用登録を行うものとします。
        {'\n\n'}
        登録情報に虚偽、誤記、または記入漏れがあった場合、運営者は当該ユーザーの利用を停止または登録を抹消することができます。
      </Text>

      <Text style={styles.heading}>第3条（アカウントの管理責任）</Text>
      <Text style={styles.text}>
        ユーザーは、自身のアカウント情報を適切に管理する責任を負います。
        {'\n\n'}
        アカウントの不正利用によって生じた損害について、運営者は一切の責任を負いません。
        {'\n\n'}
        アカウント情報の紛失や不正アクセスが判明した場合、ユーザーは速やかに運営者に通知するものとします。
        {'\n\n'}
        {/* 一人一アカウント・譲渡不可の追記 */}
        ユーザーは、運営者が特別に許可しない限り、一人につき1つのアカウントのみを保有するものとし、アカウントを第三者へ譲渡、貸与、共有、または売買することはできません。
      </Text>

      <Text style={styles.heading}>第4条（禁止事項）</Text>
      <Text style={styles.text}>
        ユーザーは、本サービスの利用に際し、以下の行為を行ってはなりません。
        {'\n\n'}
        1. 法令または公序良俗に違反する行為。
        {'\n\n'}
        2. 他のユーザーまたは第三者への誹謗中傷、脅迫、嫌がらせ。
        {'\n\n'}
        3. 本サービスの不正利用、リバースエンジニアリング、バグの悪用。
        {'\n\n'}
        4. サーバーやネットワークの妨害、ハッキング行為。
        {'\n\n'}
        5. 無断での広告・宣伝、営業活動。
        {'\n\n'}
        6. その他、運営者が不適切と判断する行為。
      </Text>

      <Text style={styles.heading}>第5条（ユーザー行動規範）</Text>
      <Text style={styles.text}>
        ユーザーは、他のユーザーや第三者の権利を尊重し、良識ある行動をとるものとします。不適切なコンテンツの投稿や迷惑行為は厳禁とします。
      </Text>

      <Text style={styles.heading}>
        第6条（サブスクリプションに関する規定）
      </Text>
      <Text style={styles.text}>
        本サービスの機能は、サブスクリプションの購入により利用可能となります。
        {'\n\n'}
        サブスクリプションの料金、支払い方法、更新については、各ストア（App
        Store または Google Play）の規定に従います。
        {'\n\n'}
        サブスクリプションの解約手続きは、各ストアの手順に従ってユーザー自身が行うものとします。
      </Text>

      <Text style={styles.heading}>
        第7条（サブスクリプション管理およびリファンドポリシー）
      </Text>
      <Text style={styles.text}>
        ユーザーは、サブスクリプションの管理および解約を各ストアの設定画面から行うものとします。
        {'\n\n'}
        解約後も、契約期間満了日までは本サービスを利用することができます。
        {'\n\n'}
        返金については、各ストアの返金ポリシーに従い、運営者は直接の返金対応を行いません。
      </Text>

      <Text style={styles.heading}>第8条（免責事項）</Text>
      <Text style={styles.text}>
        運営者は、本サービスの利用により生じたユーザーの損害について、一切の責任を負いません。
        {'\n\n'}
        本サービスは現状有姿で提供されるものであり、その正確性、完全性、有用性を保証するものではありません。
        {'\n\n'}
        サーバーの障害、メンテナンス、ネットワークトラブルなどによりサービスが一時的に停止する場合があります。
        {'\n\n'}
        {/* 免責に関する追加文言 */}
        運営者は、本サービスの利用または利用不能、もしくは本規約に関する一切の事項において、特別、間接、付随的、派生的損害（逸失利益、事業機会の喪失、データの喪失など）についても、一切の責任を負わないものとします。
      </Text>

      <Text style={styles.heading}>第9条（サポートポリシー）</Text>
      <Text style={styles.text}>
        運営者は、ユーザーからの問い合わせに対し、可能な限り迅速に対応します。
        {'\n\n'}
        サポート対応時間は、平日9:00～18:00（日本時間）とします。
        {'\n\n'}
        お問い合わせは、メール（info@sinamonoinfo.com）またはアプリ内のお問い合わせフォームよりお願いいたします。
      </Text>

      <Text style={styles.heading}>第10条（知的財産権）</Text>
      <Text style={styles.text}>
        本サービスに関する著作権、商標権、特許権、その他の知的財産権は、運営者または正当な権利を有する第三者に帰属します。ユーザーは、運営者の事前の承諾なく、これらの権利を侵害する行為をしてはなりません。
      </Text>

      <Text style={styles.heading}>第11条（アプリ更新に関するポリシー）</Text>
      <Text style={styles.text}>
        運営者は、ユーザーに通知することなく、本サービスの内容を変更、追加、削除することがあります。
        {'\n\n'}
        アプリの更新により、サービスの一部または全部が利用できなくなる場合があります。
        {'\n\n'}
        ユーザーは、常に最新のバージョンを利用するよう努めるものとします。
      </Text>

      <Text style={styles.heading}>第12条（広告ポリシー）</Text>
      <Text style={styles.text}>
        本サービスでは、第三者の広告が表示される場合があります。
        {'\n\n'}
        広告の内容は、広告主の責任によるものであり、運営者はその内容について一切の責任を負いません。
        {'\n\n'}
        ユーザーは、広告の閲覧や利用により生じた損害について、運営者が責任を負わないことを了承します。
      </Text>

      <Text style={styles.heading}>第13条（クッキーポリシー）</Text>
      <Text style={styles.text}>
        本サービスは、ユーザーの利便性向上やサービス改善のためにクッキーを使用する場合があります。
        {'\n\n'}
        ユーザーは、ブラウザの設定によりクッキーの使用を拒否することができますが、その場合、本サービスの一部機能が利用できなくなる可能性があります。
      </Text>

      <Text style={styles.heading}>第14条（特別規約や地域別規約）</Text>
      <Text style={styles.text}>
        ユーザーが日本国外から本サービスを利用する場合、その国または地域の法令を遵守するものとします。
        {'\n\n'}
        特定の地域で追加の規約が適用される場合、ユーザーはそれらに従うものとします。
      </Text>

      <Text style={styles.heading}>第15条（リファンドポリシー）</Text>
      <Text style={styles.text}>
        サブスクリプションの返金は、各ストア（App Store または Google
        Play）の返金ポリシーに従います。
        {'\n\n'}
        運営者は、直接の返金対応を行いませんので、返金を希望される場合は各ストアにお問い合わせください。
      </Text>

      <Text style={styles.heading}>第16条（準拠法および裁判管轄）</Text>
      <Text style={styles.text}>
        本規約の解釈および適用に関しては、日本法を準拠法とします。
        {'\n\n'}
        本サービスに関連して紛争が生じた場合、運営者の所在地を管轄する日本の裁判所を専属的合意管轄とします。
      </Text>

      <Text style={styles.heading}>第17条（改定）</Text>
      <Text style={styles.text}>
        運営者は、本規約を必要に応じて改定することができます。改定後の規約は、本サービス上に掲載した時点から効力を生じるものとします。
      </Text>

      <Text style={styles.heading}>附則</Text>
      <Text style={styles.text}>本規約は2024年12月1日より施行します。</Text>
    </ScrollView>
  );
};

export default TermsOfServiceScreen;