export type RootStackParamList = {
  Login: undefined;
  Help: undefined;
  Subscription: undefined;
  AboutApp: undefined;
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
  CommercialTransaction: undefined;
  AppOperator: undefined;
  LoginHelp: undefined;
  Contact: undefined;
  Dashboard: undefined;
  RecipeCreate: undefined;
  RecipeList: undefined;
  LabelManagement: undefined;
};

export type Recipe = {
  id: string;
  title: string;
  recipe: string; // Markdown content
  labels: Label[];
  form_data: any; // 必要に応じて型を調整
  created_at: string;
  updated_at: string;
};

export type Label = {
  id: number;
  name: string;
};
