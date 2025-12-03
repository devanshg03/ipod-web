import { Song, Album, Artist, Playlist, Photo, PhotoAlbum } from '../types';

// No default music - users will upload their own
export const songs: Song[] = [];

export const albums: Album[] = [];

export const artists: Artist[] = [];

export const playlists: Playlist[] = [];

export const genres: string[] = [];

// Photo data
export const photos: Photo[] = [
  // Nature album
  { id: 'ph1', src: 'https://picsum.photos/seed/nature1/400/300', albumId: 'pa1', name: 'Mountain View' },
  { id: 'ph2', src: 'https://picsum.photos/seed/nature2/400/300', albumId: 'pa1', name: 'Forest Trail' },
  { id: 'ph3', src: 'https://picsum.photos/seed/nature3/400/300', albumId: 'pa1', name: 'Lake Sunset' },
  { id: 'ph4', src: 'https://picsum.photos/seed/nature4/400/300', albumId: 'pa1', name: 'Ocean Waves' },
  { id: 'ph5', src: 'https://picsum.photos/seed/nature5/400/300', albumId: 'pa1', name: 'Desert Dunes' },
  
  // City album
  { id: 'ph6', src: 'https://picsum.photos/seed/city1/400/300', albumId: 'pa2', name: 'Skyline' },
  { id: 'ph7', src: 'https://picsum.photos/seed/city2/400/300', albumId: 'pa2', name: 'Street Lights' },
  { id: 'ph8', src: 'https://picsum.photos/seed/city3/400/300', albumId: 'pa2', name: 'Downtown' },
  { id: 'ph9', src: 'https://picsum.photos/seed/city4/400/300', albumId: 'pa2', name: 'Bridge' },
  
  // Travel album
  { id: 'ph10', src: 'https://picsum.photos/seed/travel1/400/300', albumId: 'pa3', name: 'Paris' },
  { id: 'ph11', src: 'https://picsum.photos/seed/travel2/400/300', albumId: 'pa3', name: 'Tokyo' },
  { id: 'ph12', src: 'https://picsum.photos/seed/travel3/400/300', albumId: 'pa3', name: 'New York' },
  { id: 'ph13', src: 'https://picsum.photos/seed/travel4/400/300', albumId: 'pa3', name: 'London' },
  { id: 'ph14', src: 'https://picsum.photos/seed/travel5/400/300', albumId: 'pa3', name: 'Sydney' },
  { id: 'ph15', src: 'https://picsum.photos/seed/travel6/400/300', albumId: 'pa3', name: 'Rome' },
];

export const photoAlbums: PhotoAlbum[] = [
  { id: 'pa1', name: 'Nature', coverPhoto: 'ph1', photos: ['ph1', 'ph2', 'ph3', 'ph4', 'ph5'] },
  { id: 'pa2', name: 'City', coverPhoto: 'ph6', photos: ['ph6', 'ph7', 'ph8', 'ph9'] },
  { id: 'pa3', name: 'Travel', coverPhoto: 'ph10', photos: ['ph10', 'ph11', 'ph12', 'ph13', 'ph14', 'ph15'] },
];

// Helper functions
export const getSongById = (id: string): Song | undefined => songs.find(s => s.id === id);
export const getAlbumById = (id: string): Album | undefined => albums.find(a => a.id === id);
export const getArtistById = (id: string): Artist | undefined => artists.find(a => a.id === id);
export const getArtistByName = (name: string): Artist | undefined => artists.find(a => a.name === name);
export const getAlbumsByArtist = (artistName: string): Album[] => albums.filter(a => a.artist === artistName);
export const getSongsByAlbum = (albumTitle: string): Song[] => songs.filter(s => s.album === albumTitle);
export const getSongsByGenre = (genre: string): Song[] => songs.filter(s => s.genre === genre);
export const getSongsByIds = (ids: string[]): Song[] => ids.map(id => getSongById(id)).filter((s): s is Song => s !== undefined);
export const getPhotoById = (id: string): Photo | undefined => photos.find(p => p.id === id);
export const getPhotoAlbumById = (id: string): PhotoAlbum | undefined => photoAlbums.find(a => a.id === id);
export const getPhotosByAlbum = (albumId: string): Photo[] => photos.filter(p => p.albumId === albumId);

