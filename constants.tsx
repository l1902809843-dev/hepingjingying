
import { Rarity, Skin } from './types';

export const SKIN_POOL: Skin[] = [
  { id: '1', name: '玛莎拉蒂 Ghibli (金色)', category: '载具', rarity: Rarity.MYTHIC, value: 3000, imageUrl: 'https://picsum.photos/seed/car1/600/400' },
  { id: '2', name: 'M416-五爪金龙 (满级)', category: '枪械', rarity: Rarity.MYTHIC, value: 2500, imageUrl: 'https://picsum.photos/seed/gun1/600/400' },
  { id: '3', name: '梦幻火箭套装', category: '套装', rarity: Rarity.LEGENDARY, value: 1680, imageUrl: 'https://picsum.photos/seed/suit1/600/400' },
  { id: '4', name: '巧克力工厂 M416', category: '枪械', rarity: Rarity.LEGENDARY, value: 1280, imageUrl: 'https://picsum.photos/seed/gun2/600/400' },
  { id: '5', name: '至尊龙雀风衣', category: '套装', rarity: Rarity.MYTHIC, value: 5000, imageUrl: 'https://picsum.photos/seed/suit2/600/400' },
  { id: '6', name: '雪国幻梦套装', category: '套装', rarity: Rarity.LEGENDARY, value: 1280, imageUrl: 'https://picsum.photos/seed/suit3/600/400' },
  { id: '7', name: '快乐主宰套装', category: '套装', rarity: Rarity.EPIC, value: 880, imageUrl: 'https://picsum.photos/seed/suit4/600/400' },
  { id: '8', name: 'SCAR-L-梦幻火箭', category: '枪械', rarity: Rarity.EPIC, value: 880, imageUrl: 'https://picsum.photos/seed/gun3/600/400' },
  { id: '9', name: '黑色高级轿车', category: '载具', rarity: Rarity.EPIC, value: 680, imageUrl: 'https://picsum.photos/seed/car2/600/400' },
];

export const RARITY_WEIGHTS = {
  [Rarity.MYTHIC]: 0.005,
  [Rarity.LEGENDARY]: 0.02,
  [Rarity.EPIC]: 0.15,
  [Rarity.RARE]: 0.825,
};

export const RARITY_COLORS = {
  [Rarity.MYTHIC]: 'text-red-600',
  [Rarity.LEGENDARY]: 'text-pink-500',
  [Rarity.EPIC]: 'text-purple-500',
  [Rarity.RARE]: 'text-blue-500',
};

export const RARITY_BORDERS = {
  [Rarity.MYTHIC]: 'border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.6)]',
  [Rarity.LEGENDARY]: 'border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]',
  [Rarity.EPIC]: 'border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]',
  [Rarity.RARE]: 'border-blue-500 shadow-none',
};
