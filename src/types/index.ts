export interface FirefighterInfo {
  firefighterName: string;
  firefighterId: string;
  rank?: string;
  department?: string;
}

export interface EquipmentItem {
  serial?: string;
  photo?: File;
  photoPreview?: string;
  size?: string;
  manufacturer?: string;
  mfgDate?: string;
  mfgDate_showDateInput?: boolean;
  lastCleaned?: string;
  lastCleaned_showDateInput?: boolean;
  notes?: string;
}

export interface MiscEquipment extends EquipmentItem {
  type: string;
  lastService?: string;
  lastService_showDateInput?: boolean;
}

export interface EquipmentSet {
  primary: EquipmentItem;
  secondary: EquipmentItem;
}

export interface FormData {
  firefighterInfo: FirefighterInfo;
  jacketShell: EquipmentSet;
  jacketLiner: EquipmentSet;
  pantsShell: EquipmentSet;
  pantsLiner: EquipmentSet;
  helmet: EquipmentSet;
  hood: EquipmentSet;
  gloves: EquipmentSet;
  boots: EquipmentSet;
  miscEquipment: MiscEquipment[];
}