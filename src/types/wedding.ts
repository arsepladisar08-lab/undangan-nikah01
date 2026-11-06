export interface WishItem {
  id: string;
  name: string;
  attendance: 'InshaAllah Attending' | 'Regretfully Unable';
  guestCount: string;
  message: string;
  timestamp: string;
}

export interface VenueDetail {
  title: string;
  type: string;
  date: string;
  time: string;
  placeName: string;
  address: string;
  coordinates: string;
  mapsUrl: string;
}

export interface GalleryItem {
  id: string;
  chapter: string;
  title: string;
  src: string;
  caption: string;
  speed: number;
}
