export type AudioSourceMode = 'gamelan' | 'youtube';

export interface AudioPreset {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  youtubeUrl: string;
}

export interface WeddingAudioConfig {
  mode: AudioSourceMode;
  youtubeUrl: string;
  youtubeId: string;
  title: string;
  volume: number; // 0 to 100
  startSeconds: number;
  loop: boolean;
}

export const PRESET_YOUTUBE_TRACKS: AudioPreset[] = [
  {
    id: 'kebo_giro_original',
    title: 'Gending Temu Manten Kebo Giro',
    description: 'Iringan gending klasik sakral prosesi masuknya mempelai Jawa ke pelaminan',
    youtubeId: 'SB7qdt7A92A',
    youtubeUrl: 'https://www.youtube.com/watch?v=SB7qdt7A92A',
  },
  {
    id: 'sarwo_laras_kebogiro',
    title: 'Sarwo Laras - Kebo Giro Temanten',
    description: 'Aransemen gamelan karawitan lengkap khas upacara pawiwahan agung Jawa',
    youtubeId: 'G1sEqyx-uzM',
    youtubeUrl: 'https://www.youtube.com/watch?v=G1sEqyx-uzM',
  },
  {
    id: 'kebogiro_pahargyan',
    title: 'Gending Kebogiro Pahargyan',
    description: 'Tembang penyambutan tamu luhur dan keluarga besar dengan nuansa agung',
    youtubeId: 'Jmh0ogh7_4A',
    youtubeUrl: 'https://www.youtube.com/watch?v=Jmh0ogh7_4A',
  },
  {
    id: 'gamelan_temanten_sakral',
    title: 'Karawitan Gamelan Temanten Sakral',
    description: 'Gending penuh kehangatan, doa restu, dan kelancaran untuk kedua mempelai',
    youtubeId: 'JtVx8OUY5NE',
    youtubeUrl: 'https://www.youtube.com/watch?v=JtVx8OUY5NE',
  },
];

export const DEFAULT_AUDIO_CONFIG: WeddingAudioConfig = {
  mode: 'gamelan',
  youtubeUrl: 'https://www.youtube.com/watch?v=SB7qdt7A92A',
  youtubeId: 'SB7qdt7A92A',
  title: 'Gamelan Slendro Ambience (Web Audio)',
  volume: 75,
  startSeconds: 0,
  loop: true,
};
