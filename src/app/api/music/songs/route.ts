import { NextResponse } from 'next/server';
import { searchSpotifySongs, getSpotifyTrendingSongs } from '@/lib/spotify';

// 备用示例数据 - 当 Spotify API 失败时使用
const FALLBACK_SONGS = [
  {
    id: 'local-1',
    title: '孤独',
    artist: '伦桑',
    url: 'https://example.com/music/loneliness.mp3',
    duration: 240,
    image: '',
    spotifyUrl: '',
  },
  {
    id: 'local-2',
    title: '光年之外',
    artist: '邓紫棋',
    url: 'https://example.com/music/lightyearsaway.mp3',
    duration: 288,
    image: '',
    spotifyUrl: '',
  },
  {
    id: 'local-3',
    title: '梦',
    artist: '周笔畅',
    url: 'https://example.com/music/dream.mp3',
    duration: 267,
    image: '',
    spotifyUrl: '',
  },
  {
    id: 'local-4',
    title: '青花瓷',
    artist: '周杰伦',
    url: 'https://example.com/music/blueandwhiteporcelain.mp3',
    duration: 306,
    image: '',
    spotifyUrl: '',
  },
  {
    id: 'local-5',
    title: '稻香',
    artist: '周杰伦',
    url: 'https://example.com/music/rice.mp3',
    duration: 308,
    image: '',
    spotifyUrl: '',
  },
  {
    id: 'local-6',
    title: '说好不哭',
    artist: '五月天',
    url: 'https://example.com/music/dontcry.mp3',
    duration: 251,
    image: '',
    spotifyUrl: '',
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20');

    let songs;

    if (query) {
      // 使用搜索功能
      console.log(`搜索歌曲: ${query}`);
      songs = await searchSpotifySongs(query, limit);
    } else {
      // 获取热门歌曲
      console.log('获取热门歌曲...');
      songs = await getSpotifyTrendingSongs(limit);
    }

    // 过滤掉没有预览 URL 的歌曲(Spotify 的一些歌曲没有预览)
    const availableSongs = songs.filter((song: any) => song.url);

    return NextResponse.json({
      success: true,
      data: availableSongs.length > 0 ? availableSongs : FALLBACK_SONGS,
      source: availableSongs.length > 0 ? 'spotify' : 'fallback',
    });
  } catch (error) {
    console.error('获取音乐失败:', error);

    // 错误时返回备用数据
    return NextResponse.json(
      {
        success: true,
        data: FALLBACK_SONGS,
        source: 'fallback',
        warning: '使用备用数据。请检查 Spotify API 凭证配置。',
      },
      { status: 200 }
    );
  }
}

