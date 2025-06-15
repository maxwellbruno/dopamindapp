export const SOUND_NAMES: Record<string, string> = {
  lofi: "LoFi Music",
  whitenoise: "White Noise",
  ocean: "Ocean Waves",
  forest: "Forest Sounds",
  cafe: "Café Ambience",
  rain: "Gentle Rain",
};

export const SOUND_TRACKS: Record<string, { name: string; url: string, premium: boolean }[]> = {
  lofi: [
    { name: "Sakura Lofi", url: "https://brgycopmuuanrrqmrdmf.supabase.co/storage/v1/object/public/audio_files//sakura-lofi-ambient-lofi-music-340018.mp3", premium: false },
    { name: "Rainy Night", url: "https://cdn.pixabay.com/audio/2022/11/16/audio_120b1d03b8.mp3", premium: false },
    { name: "LoFi Chill", url: "https://cdn.pixabay.com/audio/2022/12/19/audio_1250240416.mp3", premium: false },
    { name: "Evening Jazz", url: "https://cdn.pixabay.com/audio/2022/03/15/audio_115b898d98.mp3", premium: false },
    { name: "Rainy Lofi City", url: "https://cdn.pixabay.com/audio/2024/05/29/audio_1947b1c313.mp3", premium: false },
    { name: "Coffee Lofi", url: "https://brgycopmuuanrrqmrdmf.supabase.co/storage/v1/object/public/audio_files//coffee-lofi-lofi-music-340017.mp3", premium: false },
    { name: "Lofi Rain", url: "https://brgycopmuuanrrqmrdmf.supabase.co/storage/v1/object/public/audio_files//lofi-rain-lofi-music-332732.mp3", premium: false },
    { name: "Rainy Lofi", url: "https://brgycopmuuanrrqmrdmf.supabase.co/storage/v1/object/public/audio_files//rainy-lofi-city-lofi-music-332746%20(1).mp3", premium: false },
    { name: "Lofi Backround", url: "https://brgycopmuuanrrqmrdmf.supabase.co/storage/v1/object/public/audio_files//lofi-background-music-326931%20(1).mp3", premium: false },
  ],
  whitenoise: [
    { name: "Pure White Noise", url: "https://cdn.pixabay.com/audio/2022/07/26/audio_121b2265a1.mp3", premium: false },
    { name: "Soft Static", url: "https://cdn.pixabay.com/audio/2022/08/20/audio_121d6f2717.mp3", premium: false },
  ],
  ocean: [
    { name: "Waves on Shore", url: "https://cdn.pixabay.com/audio/2023/04/27/audio_1492a5b94a.mp3", premium: true },
    { name: "Calm Ocean", url: "https://cdn.pixabay.com/audio/2022/02/23/audio_1154ae857c.mp3", premium: true },
  ],
  forest: [
    { name: "Morning Birds", url: "https://cdn.pixabay.com/audio/2022/04/27/audio_115f63f3d7.mp3", premium: true },
    { name: "Forest Ambience", url: "https://cdn.pixabay.com/audio/2022/12/16/audio_124f6173b1.mp3", premium: true },
  ],
  cafe: [
    { name: "Cafe Background", url: "https://cdn.pixabay.com/audio/2023/06/14/audio_128da955b3.mp3", premium: true },
    { name: "Faint Music in Cafe", url: "https://cdn.pixabay.com/audio/2022/10/16/audio_1212628ef1.mp3", premium: true },
  ],
  rain: [
    { name: "Gentle Rain", url: "https://cdn.pixabay.com/audio/2022/11/16/audio_120b1e3121.mp3", premium: true },
    { name: "Rain on Window", url: "https://cdn.pixabay.com/audio/2023/07/17/audio_1282f3da13.mp3", premium: true },
  ]
};

export const soundOptions = [
  { id: 'lofi', name: 'LoFi Music', premium: false, url: "https://cdn.pixabay.com/audio/2024/05/29/audio_1947b1c313.mp3", type: 'ambient', hasGenrePage: true },
  { id: 'whitenoise', name: 'White Noise', premium: false, url: "https://cdn.pixabay.com/audio/2022/07/26/audio_121b2265a1.mp3", type: 'ambient', hasGenrePage: true },
  { id: 'ocean', name: 'Ocean Waves', premium: true, url: "https://cdn.pixabay.com/audio/2023/04/27/audio_1492a5b94a.mp3", type: 'ambient', hasGenrePage: true },
  { id: 'forest', name: 'Forest Sounds', premium: true, url: "https://cdn.pixabay.com/audio/2022/04/27/audio_115f63f3d7.mp3", type: 'ambient', hasGenrePage: true },
  { id: 'cafe', name: 'Café Ambience', premium: true, url: "https://cdn.pixabay.com/audio/2023/06/14/audio_128da955b3.mp3", type: 'ambient', hasGenrePage: true },
  { id: 'rain', name: 'Gentle Rain', premium: true, url: "https://cdn.pixabay.com/audio/2022/11/16/audio_120b1e3121.mp3", type: 'ambient', hasGenrePage: true },
  // Meditation sounds
  { id: 'brainwaves_theta', name: 'Theta Brainwave for Relaxation', premium: true, url: 'https://cdn.pixabay.com/audio/2022/01/21/audio_5113343431.mp3', type: 'meditation' },
  { id: 'binaural_432hz', name: '432Hz Binaural Beat', premium: true, url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_2ca43c7512.mp3', type: 'meditation' },
];

export const breathingExercises = [
  { id: 'basic', name: '4-7-8 Breathing', description: 'Classic relaxation technique', premium: false },
  { id: 'box', name: 'Box Breathing', description: 'Navy SEAL technique for focus', premium: true },
  { id: 'coherent', name: 'Coherent Breathing', description: 'Heart rate variability training', premium: true },
  { id: 'wim', name: 'Wim Hof Method', description: 'Energizing breath work', premium: true },
  { id: 'alternate', name: 'Alternate Nostril', description: 'Balancing technique', premium: true },
];

export const maxFreeSessionDuration = 25;
export const maxFreeSessions = 3;
