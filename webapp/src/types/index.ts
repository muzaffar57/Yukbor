export const UserRole = {
  SHIPPER: "shipper",
  DRIVER: "driver",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const Region = {
  TOSHKENT_SHAHAR: "toshkent_shahar",
  TOSHKENT_VILOYATI: "toshkent_viloyati",
  ANDIJON: "andijon",
  FARGONA: "fargona",
  NAMANGAN: "namangan",
  SIRDARYO: "sirdaryo",
  JIZZAX: "jizzax",
  SAMARQAND: "samarqand",
  BUXORO: "buxoro",
  NAVOIY: "navoiy",
  QASHQADARYO: "qashqadaryo",
  SURXONDARYO: "surxondaryo",
  XORAZM: "xorazm",
  QORAQALPOGISTON: "qoraqalpogiston",
} as const;
export type Region = (typeof Region)[keyof typeof Region];

export const REGION_LABELS: Record<Region, string> = {
  toshkent_shahar: "Toshkent shahri",
  toshkent_viloyati: "Toshkent viloyati",
  andijon: "Andijon",
  fargona: "Farg'ona",
  namangan: "Namangan",
  sirdaryo: "Sirdaryo",
  jizzax: "Jizzax",
  samarqand: "Samarqand",
  buxoro: "Buxoro",
  navoiy: "Navoiy",
  qashqadaryo: "Qashqadaryo",
  surxondaryo: "Surxondaryo",
  xorazm: "Xorazm",
  qoraqalpogiston: "Qoraqalpog'iston",
};

export const VehicleType = {
  KATTA_ISUZU: "katta_isuzu",
  KICHIK_ISUZU: "kichik_isuzu",
  PARAVOZ: "paravoz",
  SHALANDA: "shalanda",
  REF: "ref",
  TONAR: "tonar",
  CHAKMAN: "chakman",
  KAMAZ: "kamaz",
  LABO: "labo",
  BONGO: "bongo",
  FURA: "fura",
  TENTOVKA: "tentovka",
  BORTOVOY: "bortovoy",
  IZOTERM: "izoterm",
  ISUZU: "isuzu",
  LABO_CHANGAN: "labo_changan",
  BOSHQA: "boshqa",
} as const;
export type VehicleType = (typeof VehicleType)[keyof typeof VehicleType];

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  katta_isuzu: "Katta Isuzu",
  kichik_isuzu: "Kichik Isuzu",
  paravoz: "Paravoz",
  shalanda: "Shalanda",
  ref: "Ref",
  tonar: "Tonar",
  chakman: "Chakman",
  kamaz: "Kamaz",
  labo: "Labo",
  bongo: "Bongo",
  fura: "Fura",
  tentovka: "Tento'vka",
  bortovoy: "Bortovoy",
  izoterm: "Izoterm (Xolodilnik)",
  isuzu: "Isuzu",
  labo_changan: "Labo/Changan",
  boshqa: "Boshqa",
};

/** Yangi e'lon va filtrda chiqadigan turlar (eski isuzu/labo_changan yo'q). */
export const VEHICLE_TYPE_OPTIONS: VehicleType[] = [
  "katta_isuzu",
  "kichik_isuzu",
  "paravoz",
  "shalanda",
  "ref",
  "tonar",
  "chakman",
  "kamaz",
  "labo",
  "bongo",
  "fura",
  "tentovka",
  "bortovoy",
  "izoterm",
  "boshqa",
];

export const LoadType = {
  TOLIQ_MASHINA: "toliq_mashina",
  QISMAN_YUK: "qisman_yuk",
} as const;
export type LoadType = (typeof LoadType)[keyof typeof LoadType];

export const LOAD_TYPE_LABELS: Record<LoadType, string> = {
  toliq_mashina: "To'liq yuk",
  qisman_yuk: "Lahtak",
};

export const PaymentType = {
  NAQD: "naqd",
  OTKAZMA: "otkazma",
} as const;
export type PaymentType = (typeof PaymentType)[keyof typeof PaymentType];

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  naqd: "Naqd",
  otkazma: "O'tkazma",
};

export const CargoStatus = {
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELED: "canceled",
} as const;
export type CargoStatus = (typeof CargoStatus)[keyof typeof CargoStatus];

export const CARGO_STATUS_LABELS: Record<CargoStatus, string> = {
  active: "Faol",
  completed: "Yakunlangan",
  canceled: "Bekor qilingan",
};

export interface UserOut {
  id: number;
  full_name: string;
  phone_number: string;
  role: UserRole;
  is_active: boolean;
  is_admin: boolean;
  telegram_id?: number | null;
  telegram_username?: string | null;
  subscription_expires_at?: string | null;
  created_at: string;
}

export interface CargoOwnerOut {
  id: number;
  full_name: string;
  phone_number: string;
}

export interface CargoPhotoOut {
  id: number;
  url: string;
  created_at: string;
}

export interface CargoOut {
  id: number;
  title: string;
  description: string | null;
  weight: number;
  volume: number | null;
  loading_region: Region;
  loading_district: string | null;
  loading_landmark: string | null;
  loading_lat: number | null;
  loading_lon: number | null;
  unloading_region: Region;
  unloading_district: string | null;
  unloading_landmark: string | null;
  unloading_lat: number | null;
  unloading_lon: number | null;
  distance_km: number | null;
  vehicle_type: VehicleType;
  load_type: LoadType;
  price: number;
  payment_type: PaymentType;
  loading_date: string | null;
  status: CargoStatus;
  owner: CargoOwnerOut;
  photos: CargoPhotoOut[];
  created_at: string;
}

export interface CargoListOut {
  total: number;
  limit: number;
  offset: number;
  items: CargoOut[];
}

export interface CargoCreatePayload {
  title: string;
  description?: string | null;
  weight: number;
  volume?: number | null;
  loading_region: Region;
  loading_district?: string | null;
  loading_landmark?: string | null;
  loading_lat?: number | null;
  loading_lon?: number | null;
  unloading_region: Region;
  unloading_district?: string | null;
  unloading_landmark?: string | null;
  unloading_lat?: number | null;
  unloading_lon?: number | null;
  vehicle_type: VehicleType;
  load_type: LoadType;
  price: number;
  payment_type: PaymentType;
  loading_date?: string | null;
}

export interface DriverOfferDriverOut {
  id: number;
  full_name: string;
  phone_number: string;
}

export interface DriverOfferOut {
  id: number;
  description: string | null;
  departure_region: Region;
  departure_district: string | null;
  departure_landmark: string | null;
  departure_lat: number | null;
  departure_lon: number | null;
  destination_region: Region | null;
  destination_district: string | null;
  destination_landmark: string | null;
  distance_km: number | null;
  vehicle_type: VehicleType;
  load_type: LoadType;
  available_weight: number | null;
  available_volume: number | null;
  price_expectation: number | null;
  payment_type: PaymentType | null;
  departure_date: string;
  status: CargoStatus;
  driver: DriverOfferDriverOut;
  created_at: string;
}

export interface DriverOfferListOut {
  total: number;
  limit: number;
  offset: number;
  items: DriverOfferOut[];
}

export interface DriverOfferCreatePayload {
  description?: string | null;
  departure_region: Region;
  departure_district?: string | null;
  departure_landmark?: string | null;
  departure_lat?: number | null;
  departure_lon?: number | null;
  destination_region?: Region | null;
  destination_district?: string | null;
  destination_landmark?: string | null;
  vehicle_type: VehicleType;
  load_type: LoadType;
  available_weight?: number | null;
  available_volume?: number | null;
  price_expectation?: number | null;
  payment_type?: PaymentType | null;
  departure_date: string;
}
