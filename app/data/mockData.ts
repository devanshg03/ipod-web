import { Song, Album, Artist, Playlist, Photo, PhotoAlbum } from '../types';

// Album artwork colors (we'll use gradients as placeholders)
const albumArtworks = {
  midnight: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  sunset: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #ff9ff3 100%)',
  ocean: 'linear-gradient(135deg, #0077b6 0%, #00b4d8 50%, #90e0ef 100%)',
  forest: 'linear-gradient(135deg, #2d6a4f 0%, #40916c 50%, #74c69d 100%)',
  purple: 'linear-gradient(135deg, #7400b8 0%, #6930c3 50%, #5e60ce 100%)',
  golden: 'linear-gradient(135deg, #f4a261 0%, #e76f51 50%, #e9c46a 100%)',
  minimal: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%)',
  noir: 'linear-gradient(135deg, #212529 0%, #343a40 50%, #495057 100%)',
};

export const songs: Song[] = [
  // Midnight Dreams Album
  { id: 's1', title: 'Starlight', artist: 'Luna Nova', album: 'Midnight Dreams', albumArt: albumArtworks.midnight, duration: 245, genre: 'Electronic', year: 2023 },
  { id: 's2', title: 'Night Drive', artist: 'Luna Nova', album: 'Midnight Dreams', albumArt: albumArtworks.midnight, duration: 198, genre: 'Electronic', year: 2023 },
  { id: 's3', title: 'Cosmic Dance', artist: 'Luna Nova', album: 'Midnight Dreams', albumArt: albumArtworks.midnight, duration: 276, genre: 'Electronic', year: 2023 },
  { id: 's4', title: 'Dream State', artist: 'Luna Nova', album: 'Midnight Dreams', albumArt: albumArtworks.midnight, duration: 312, genre: 'Electronic', year: 2023 },
  
  // Sunset Boulevard Album
  { id: 's5', title: 'Golden Hour', artist: 'The Waves', album: 'Sunset Boulevard', albumArt: albumArtworks.sunset, duration: 223, genre: 'Indie', year: 2022 },
  { id: 's6', title: 'Summer Nights', artist: 'The Waves', album: 'Sunset Boulevard', albumArt: albumArtworks.sunset, duration: 187, genre: 'Indie', year: 2022 },
  { id: 's7', title: 'Beach Town', artist: 'The Waves', album: 'Sunset Boulevard', albumArt: albumArtworks.sunset, duration: 265, genre: 'Indie', year: 2022 },
  { id: 's8', title: 'Fading Light', artist: 'The Waves', album: 'Sunset Boulevard', albumArt: albumArtworks.sunset, duration: 298, genre: 'Indie', year: 2022 },
  
  // Deep Blue Album
  { id: 's9', title: 'Ocean Waves', artist: 'Aqua', album: 'Deep Blue', albumArt: albumArtworks.ocean, duration: 234, genre: 'Ambient', year: 2023 },
  { id: 's10', title: 'Coral Reef', artist: 'Aqua', album: 'Deep Blue', albumArt: albumArtworks.ocean, duration: 189, genre: 'Ambient', year: 2023 },
  { id: 's11', title: 'Tidal', artist: 'Aqua', album: 'Deep Blue', albumArt: albumArtworks.ocean, duration: 267, genre: 'Ambient', year: 2023 },
  { id: 's12', title: 'Submarine', artist: 'Aqua', album: 'Deep Blue', albumArt: albumArtworks.ocean, duration: 345, genre: 'Ambient', year: 2023 },
  
  // Into The Wild Album
  { id: 's13', title: 'Forest Path', artist: 'Wanderer', album: 'Into The Wild', albumArt: albumArtworks.forest, duration: 212, genre: 'Folk', year: 2021 },
  { id: 's14', title: 'Mountain High', artist: 'Wanderer', album: 'Into The Wild', albumArt: albumArtworks.forest, duration: 278, genre: 'Folk', year: 2021 },
  { id: 's15', title: 'River Song', artist: 'Wanderer', album: 'Into The Wild', albumArt: albumArtworks.forest, duration: 195, genre: 'Folk', year: 2021 },
  { id: 's16', title: 'Wilderness', artist: 'Wanderer', album: 'Into The Wild', albumArt: albumArtworks.forest, duration: 324, genre: 'Folk', year: 2021 },
  
  // Ultraviolet Album
  { id: 's17', title: 'Neon Lights', artist: 'Synth City', album: 'Ultraviolet', albumArt: albumArtworks.purple, duration: 198, genre: 'Synthwave', year: 2024 },
  { id: 's18', title: 'Retrowave', artist: 'Synth City', album: 'Ultraviolet', albumArt: albumArtworks.purple, duration: 245, genre: 'Synthwave', year: 2024 },
  { id: 's19', title: 'Digital Dreams', artist: 'Synth City', album: 'Ultraviolet', albumArt: albumArtworks.purple, duration: 267, genre: 'Synthwave', year: 2024 },
  { id: 's20', title: 'Cyber Night', artist: 'Synth City', album: 'Ultraviolet', albumArt: albumArtworks.purple, duration: 289, genre: 'Synthwave', year: 2024 },
  
  // Autumn Gold Album
  { id: 's21', title: 'Falling Leaves', artist: 'Amber', album: 'Autumn Gold', albumArt: albumArtworks.golden, duration: 234, genre: 'Jazz', year: 2022 },
  { id: 's22', title: 'Harvest Moon', artist: 'Amber', album: 'Autumn Gold', albumArt: albumArtworks.golden, duration: 312, genre: 'Jazz', year: 2022 },
  { id: 's23', title: 'Warm Glow', artist: 'Amber', album: 'Autumn Gold', albumArt: albumArtworks.golden, duration: 278, genre: 'Jazz', year: 2022 },
  { id: 's24', title: 'Cozy Evening', artist: 'Amber', album: 'Autumn Gold', albumArt: albumArtworks.golden, duration: 345, genre: 'Jazz', year: 2022 },
];

export const albums: Album[] = [
  { id: 'a1', title: 'Midnight Dreams', artist: 'Luna Nova', artwork: albumArtworks.midnight, year: 2023, songs: ['s1', 's2', 's3', 's4'] },
  { id: 'a2', title: 'Sunset Boulevard', artist: 'The Waves', artwork: albumArtworks.sunset, year: 2022, songs: ['s5', 's6', 's7', 's8'] },
  { id: 'a3', title: 'Deep Blue', artist: 'Aqua', artwork: albumArtworks.ocean, year: 2023, songs: ['s9', 's10', 's11', 's12'] },
  { id: 'a4', title: 'Into The Wild', artist: 'Wanderer', artwork: albumArtworks.forest, year: 2021, songs: ['s13', 's14', 's15', 's16'] },
  { id: 'a5', title: 'Ultraviolet', artist: 'Synth City', artwork: albumArtworks.purple, year: 2024, songs: ['s17', 's18', 's19', 's20'] },
  { id: 'a6', title: 'Autumn Gold', artist: 'Amber', artwork: albumArtworks.golden, year: 2022, songs: ['s21', 's22', 's23', 's24'] },
];

export const artists: Artist[] = [
  { id: 'ar1', name: 'Luna Nova', albums: ['a1'] },
  { id: 'ar2', name: 'The Waves', albums: ['a2'] },
  { id: 'ar3', name: 'Aqua', albums: ['a3'] },
  { id: 'ar4', name: 'Wanderer', albums: ['a4'] },
  { id: 'ar5', name: 'Synth City', albums: ['a5'] },
  { id: 'ar6', name: 'Amber', albums: ['a6'] },
];

export const playlists: Playlist[] = [
  { id: 'p1', name: 'Favorites', songs: ['s1', 's5', 's9', 's17', 's21'] },
  { id: 'p2', name: 'Chill Vibes', songs: ['s9', 's10', 's11', 's13', 's14', 's23'] },
  { id: 'p3', name: 'Night Drive', songs: ['s1', 's2', 's17', 's18', 's19'] },
  { id: 'p4', name: 'Recently Added', songs: ['s17', 's18', 's19', 's20'] },
];

export const genres = ['Electronic', 'Indie', 'Ambient', 'Folk', 'Synthwave', 'Jazz'];

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

