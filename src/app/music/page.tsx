'use client';

import { ChevronLeft, Heart, List, Pause, Play, Plus, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Song {
  id: number;
  title: string;
  artist: string;
  url: string;
  duration: number;
}

export default function MusicPlayer() {
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [playlist, setPlaylist] = useState<number[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'songs' | 'favorites' | 'playlist'>('songs');
  const [loading, setLoading] = useState(true);

  // 加载本地存储的数据
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('music_favorites') || '[]');
    const savedPlaylist = JSON.parse(localStorage.getItem('music_playlist') || '[]');
    setFavorites(savedFavorites);
    setPlaylist(savedPlaylist);
  }, []);

  // 加载歌曲
  useEffect(() => {
    const loadSongs = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/music/songs');
        const data = await res.json();
        setSongs(data.data || []);
      } catch (error) {
        console.error('Failed to load songs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSongs();
  }, []);

  // 搜索过滤
  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 获取显示的歌曲列表
  const displaySongs =
    activeTab === 'songs'
      ? filteredSongs
      : activeTab === 'favorites'
        ? songs.filter((s) => favorites.includes(s.id))
        : songs.filter((s) => playlist.includes(s.id));

  // 切换收藏
  const toggleFavorite = (id: number) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter((fid) => fid !== id)
      : [...favorites, id];
    setFavorites(newFavorites);
    localStorage.setItem('music_favorites', JSON.stringify(newFavorites));
  };

  // 添加到播放列表
  const addToPlaylist = (song: Song) => {
    if (!playlist.includes(song.id)) {
      const newPlaylist = [...playlist, song.id];
      setPlaylist(newPlaylist);
      localStorage.setItem('music_playlist', JSON.stringify(newPlaylist));
    }
  };

  // 播放歌曲
  const playSong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  // 清空播放列表
  const clearPlaylist = () => {
    if (confirm('确定要清空播放列表吗？')) {
      setPlaylist([]);
      localStorage.setItem('music_playlist', JSON.stringify([]));
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-950 to-black text-white'>
      {/* 顶部导航 */}
      <div className='sticky top-0 z-40 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md'>
        <div className='flex items-center justify-between px-4 py-4'>
          <button
            onClick={() => router.back()}
            className='flex items-center gap-2 text-sm font-medium hover:text-blue-400 transition'
          >
            <ChevronLeft className='w-5 h-5' />
            返回
          </button>
          <h1 className='text-xl font-bold'>🎵 音乐播放器</h1>
          <div className='w-20'></div>
        </div>

        {/* 搜索和标签页 */}
        <div className='px-4 py-3 space-y-3'>
          <div className='flex gap-2'>
            <div className='flex-1 relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500' />
              <input
                type='text'
                placeholder='搜索歌曲或艺术家...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full bg-gray-800 text-white placeholder-gray-500 rounded-full pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition'
              />
            </div>
          </div>

          {/* 标签页 */}
          <div className='flex gap-2'>
            {['songs', 'favorites', 'playlist'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {tab === 'songs'
                  ? '🎵 全部'
                  : tab === 'favorites'
                    ? '❤️ 收藏'
                    : '📋 列表'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 歌曲列表 */}
      <div className='max-w-2xl mx-auto px-4 py-6 pb-48'>
        {loading ? (
          <div className='text-center py-12 text-gray-400'>加载中...</div>
        ) : displaySongs.length === 0 ? (
          <div className='text-center py-12 text-gray-400'>
            {activeTab === 'songs' && searchQuery
              ? '没有找到匹配的歌曲'
              : activeTab === 'favorites'
                ? '还没有收藏任何歌曲'
                : '播放列表为空'}
          </div>
        ) : (
          <div className='space-y-2'>
            {displaySongs.map((song) => (
              <div
                key={song.id}
                className='group bg-gray-800 hover:bg-gray-700 rounded-lg p-4 flex items-center justify-between transition cursor-pointer'
                onClick={() => playSong(song)}
              >
                <div className='flex-1 min-w-0'>
                  <p className='font-bold text-sm truncate'>{song.title}</p>
                  <p className='text-gray-400 text-xs truncate'>{song.artist}</p>
                </div>

                {/* 播放按钮 */}
                <div className='ml-2 flex gap-1 opacity-0 group-hover:opacity-100 transition'>
                  {currentSong?.id === song.id && isPlaying ? (
                    <Pause className='w-5 h-5 text-blue-400' />
                  ) : (
                    <Play className='w-5 h-5 text-gray-400' />
                  )}
                </div>

                {/* 操作按钮 */}
                <div className='ml-3 flex gap-2'>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(song.id);
                    }}
                    className='text-lg hover:scale-110 transition'
                  >
                    {favorites.includes(song.id) ? '❤️' : '🤍'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToPlaylist(song);
                    }}
                    className='text-lg hover:scale-110 transition'
                  >
                    {playlist.includes(song.id) ? '✓' : '+'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 播放器控制栏 */}
      <div className='fixed bottom-0 left-0 right-0 border-t border-gray-800 bg-gray-950 backdrop-blur-md'>
        {/* 当前播放信息 */}
        {currentSong && (
          <div className='px-4 py-3 border-b border-gray-800'>
            <div className='flex items-center justify-between'>
              <div className='flex-1 min-w-0'>
                <p className='text-xs text-gray-400'>当前播放</p>
                <p className='font-bold text-sm truncate'>{currentSong.title}</p>
                <p className='text-gray-400 text-xs truncate'>{currentSong.artist}</p>
              </div>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className='ml-3 w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition'
              >
                {isPlaying ? (
                  <Pause className='w-5 h-5' />
                ) : (
                  <Play className='w-5 h-5' />
                )}
              </button>
            </div>
          </div>
        )}

        {/* 音频播放器 */}
        {currentSong && (
          <audio
            key={currentSong.id}
            autoPlay
            controls
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className='w-full px-4 py-2'
          >
            <source src={currentSong.url} type='audio/mpeg' />
          </audio>
        )}

        {/* 操作按钮 */}
        <div className='px-4 py-3 flex gap-2'>
          <button
            onClick={() => addToPlaylist(currentSong!)}
            disabled={!currentSong || playlist.includes(currentSong.id)}
            className='flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg py-2 font-medium transition text-sm'
          >
            <Plus className='w-4 h-4' />
            添加到列表
          </button>
          <button
            onClick={clearPlaylist}
            disabled={playlist.length === 0}
            className='flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg py-2 font-medium transition text-sm'
          >
            <X className='w-4 h-4' />
            清空列表
          </button>
        </div>
      </div>
    </div>
  );
}

