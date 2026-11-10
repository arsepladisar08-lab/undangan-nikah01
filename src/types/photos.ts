export type PhotoSlotKey =
  | 'heroArch'
  | 'groomPhoto'
  | 'bridePhoto'
  | 'story1'
  | 'story2'
  | 'story3'
  | 'gallery1'
  | 'gallery2'
  | 'gallery3'
  | 'gallery4'
  | 'gallery5'
  | 'gallery6';

export interface PhotoSlotConfig {
  key: PhotoSlotKey;
  label: string;
  section: 'Hero' | 'Mempelai' | 'Cerita Cinta' | 'Galeri';
  description: string;
  defaultUrl: string;
}

export type PhotoMap = Record<PhotoSlotKey, string>;

export const DEFAULT_PHOTOS: PhotoMap = {
  heroArch: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=900&q=80',
  groomPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80',
  bridePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80',
  story1: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=700&q=80',
  story2: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=700&q=80',
  story3: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=700&q=80',
  gallery1: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=85',
  gallery2: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
  gallery3: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85',
  gallery4: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=85',
  gallery5: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=85',
  gallery6: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=85',
};

export const PHOTO_SLOT_CONFIGS: PhotoSlotConfig[] = [
  {
    key: 'heroArch',
    label: 'Foto Utama Lengkungan Hero',
    section: 'Hero',
    description: 'Foto mempelai berdua dalam lengkungan gerbang utama hero section.',
    defaultUrl: DEFAULT_PHOTOS.heroArch,
  },
  {
    key: 'groomPhoto',
    label: 'Foto Raden Mas Bagaskara (Groom)',
    section: 'Mempelai',
    description: 'Foto potret mempelai pria di kartu mempelai.',
    defaultUrl: DEFAULT_PHOTOS.groomPhoto,
  },
  {
    key: 'bridePhoto',
    label: 'Foto Roro Sekar Arum (Bride)',
    section: 'Mempelai',
    description: 'Foto potret mempelai wanita di kartu mempelai.',
    defaultUrl: DEFAULT_PHOTOS.bridePhoto,
  },
  {
    key: 'story1',
    label: 'Cerita 1: First Encounter at Sekaten',
    section: 'Cerita Cinta',
    description: 'Foto linimasa babak pertama pertemuan di Kauman Yogyakarta.',
    defaultUrl: DEFAULT_PHOTOS.story1,
  },
  {
    key: 'story2',
    label: 'Cerita 2: Prayers Across Two Cities',
    section: 'Cerita Cinta',
    description: 'Foto linimasa babak kedua (Yogyakarta - Surakarta).',
    defaultUrl: DEFAULT_PHOTOS.story2,
  },
  {
    key: 'story3',
    label: 'Cerita 3: Khitbah & Peningsetan',
    section: 'Cerita Cinta',
    description: 'Foto linimasa babak pertunangan di Laweyan Solo.',
    defaultUrl: DEFAULT_PHOTOS.story3,
  },
  {
    key: 'gallery1',
    label: 'Galeri Chapter I: Royal Heritage',
    section: 'Galeri',
    description: 'Foto potret Kraton Yogyakarta di galeri.',
    defaultUrl: DEFAULT_PHOTOS.gallery1,
  },
  {
    key: 'gallery2',
    label: 'Galeri Chapter II: Sacred Promise',
    section: 'Galeri',
    description: 'Foto janji suci di Pendopo Ambarrukmo.',
    defaultUrl: DEFAULT_PHOTOS.gallery2,
  },
  {
    key: 'gallery3',
    label: 'Galeri Chapter III: Golden Hour Blessings',
    section: 'Galeri',
    description: 'Foto nuansa sore di Taman Sari.',
    defaultUrl: DEFAULT_PHOTOS.gallery3,
  },
  {
    key: 'gallery4',
    label: 'Galeri Chapter IV: Timeless Devotion',
    section: 'Galeri',
    description: 'Foto kesetiaan di Laweyan Solo.',
    defaultUrl: DEFAULT_PHOTOS.gallery4,
  },
  {
    key: 'gallery5',
    label: 'Galeri Chapter V: The Khitbah Rings',
    section: 'Galeri',
    description: 'Foto cincin pertunangan.',
    defaultUrl: DEFAULT_PHOTOS.gallery5,
  },
  {
    key: 'gallery6',
    label: 'Galeri Chapter VI: Toward Forever',
    section: 'Galeri',
    description: 'Foto langkah melangkah bersama menuju masa depan.',
    defaultUrl: DEFAULT_PHOTOS.gallery6,
  },
];

export interface GuestItem {
  id: string;
  name: string;
  phone?: string;
  customUrl: string;
  notes?: string;
}
