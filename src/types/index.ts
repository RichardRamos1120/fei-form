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
  model?: string;
  mfgDate?: string;
  mfgDate_showDateInput?: boolean;
  notes?: string;
}

export interface MiscEquipment extends EquipmentItem {
  type: string;
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