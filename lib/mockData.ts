import { Product } from '@/types';

// Empty default products array - all products read strictly from Supabase
export const mockProducts: Product[] = [];

export const categories = [
  'All',
  'Milk',
  'Curd',
  'Ghee',
  'Paneer',
  'Butter',
  'Beverages',
  'Milk Powder',
];

export const brands = ['All', 'Hatsun', 'Arogya', 'Hapdaily'] as const;
