export enum TabId {
  HOME = 'HOME',
  TIME = 'TIME',
  JSON = 'JSON', // Placeholder for future expansion
  UUID = 'UUID'  // Placeholder for future expansion
}

export interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}
