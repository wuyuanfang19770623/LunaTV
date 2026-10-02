import { NextResponse } from 'next/server';

// 示例音乐数据库 - 实际应用可以从数据库或第三方 API 获取
const MUSIC_DATABASE = [
  {
    id: 1,
    title: '孤独',
    artist: '伦桑',
    url: 'https://example.com/music/loneliness.mp3',
    duration: 240,
  },
  {
    id: 2,
    title: '光年之外',
    artist: '邓紫棋',
    url: 'https://example.com/music/lightyearsaway.mp3',
    duration: 288,
  },
  {
    id: 3,
    title: '梦',
    artist: '周笔畅',
    url: 'https://example.com/music/dream.mp3',
    duration: 267,
  },
  {
    id: 4,
    title: '青花瓷',
    artist: '周杰伦',
    url: 'https://example.com/music/blueandwhiteporcelain.mp3',
    duration: 306,
  },
  {
    id: 5,
    title: '稻香',
    artist: '周杰伦',
    url: 'https://example.com/music/rice.mp3',
    duration: 308,
  },
  {
    id: 6,
    title: '说好不哭',
    artist: '五月天',
    url: 'https://example.com/music/dontcry.mp3',
    duration: 251,
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (query) {
      const lowerQuery = query.toLowerCase();
      const filtered = MUSIC_DATABASE.filter(
        (song) =>
          song.title.toLowerCase().includes(lowerQuery) ||
          song.artist.toLowerCase().includes(lowerQuery)
      );
      return NextResponse.json({ success: true, data: filtered });
    }

    return NextResponse.json({ success: true, data: MUSIC_DATABASE });
  } catch (error) {
    console.error('Failed to fetch songs:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

