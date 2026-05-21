export interface QuickLink {
  id: string;
  name: string;
  url: string;
  icon: string;
  iconType: "emoji" | "icon" | "text";
  browserPackage?: string;
  password?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  defaultBrowser?: string;
  tutorialCompleted: boolean;
  biometricEnabled: boolean;
}

export interface BrowserInfo {
  packageName: string;
  name: string;
  icon: string;
}

export type RootStackParamList = {
  Home: undefined;
  AddEditLink: { linkId?: string };
  Settings: undefined;
  Tutorial: undefined;
};
