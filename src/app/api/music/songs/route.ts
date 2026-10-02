import { NextResponse } from 'next/server';

// 本地音乐数据库
const LOCAL_MUSIC_DATABASE = [
  {
    id: 1,
    title: '孤独',
    artist: '伦桑',
    url: 'https://example.com/music/loneliness.mp3',
    duration: 240,
    source: 'local',
  },
  {
    id: 2,
    title: '光年之外',
    artist: '邓紫棋',
    url: 'https://example.com/music/lightyearsaway.mp3',
    duration: 288,
    source: 'local',
  },
  {
    id: 3,
    title: '梦',
    artist: '周笔畅',
    url: 'https://example.com/music/dream.mp3',
    duration: 267,
    source: 'local',
  },
  {
    id: 4,
    title: '青花瓷',
    artist: '周杰伦',
    url: 'https://example.com/music/blueandwhiteporcelain.mp3',
    duration: 306,
    source: 'local',
  },
  {
    id: 5,
    title: '稻香',
    artist: '周杰伦',
    url: 'https://example.com/music/rice.mp3',
    duration: 308,
    source: 'local',
  },
  {
    id: 6,
    title: '说好不哭',
    artist: '五月天',
    url: 'https://example.com/music/dontcry.mp3',
    duration: 251,
    source: 'local',
  },
];

/**
 * 从 1Music.cc 搜索音乐
 * 注意: 1Music.cc 可能需要爬虫识别或 API 密钥
 * 这里提供一个演示实现,实际使用需要根据网站结构调整
 */
async function searchFrom1Music(keyword: string) {
  try {
    // 1Music.cc 搜索接口示例 (需要根据实际网站调整)
    const searchUrl = `https://1music.cc/search?keyword=${encodeURIComponent(keyword)}`;

    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      // 设置请求超时
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.warn(`1Music.cc search failed: ${response.status}`);
      return [];
    }

    const html = await response.text();

    // 从 HTML 中提取音乐数据 (简单的正则匹配示例)
    // 实际应该使用 HTML 解析库如 cheerio
    const musicRegex =
      /<div\s+class="song-item"[^>]*>.*?<span\s+class="title">([^<]+)<\/span>.*?<span\s+class="artist">([^<]+)<\/span>.*?href="([^"]+)".*?<\/div>/gs;

    const results: typeof LOCAL_MUSIC_DATABASE = [];
    let match;
    let id = 1000; // 为 1Music 结果使用较大的 ID

    while ((match = musicRegex.exec(html)) !== null) {
      results.push({
        id: id++,
        title: match[1]?.trim() || 'Unknown',
        artist: match[2]?.trim() || 'Unknown Artist',
        url: match[3] || '', // 需要处理相对 URL
        duration: 0,
        source: '1music',
      });

      // 限制结果数量
      if (results.length >= 20) break;
    }

    return results;
  } catch (error) {
    console.warn('Failed to search 1Music.cc:', error);
    // 如果爬取失败,返回空数组(不中断请求)
    return [];
  }
}

/**
 * 搜索音乐 - 优先搜索本地库,然后可选地搜索 1Music.cc
 */
async function searchMusic(query: string, include1Music = false) {
  const lowerQuery = query.toLowerCase();

  // 搜索本地数据库
  const localResults = LOCAL_MUSIC_DATABASE.filter(
    (song) =>
      song.title.toLowerCase().includes(lowerQuery) ||
      song.artist.toLowerCase().includes(lowerQuery)
  );

  // 可选:搜索 1Music.cc (会增加响应时间)
  let remoteResults = [];
  if (include1Music && query.length >= 2) {
    remoteResults = await searchFrom1Music(query);
  }

  // 合并结果:本地优先
  return [...localResults, ...remoteResults];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const include1Music = searchParams.get('source') === '1music';

    if (query) {
      const results = await searchMusic(query, include1Music);
      return NextResponse.json({ success: true, data: results });
    }

    // 没有搜索词时,返回本地数据库
    return NextResponse.json({ success: true, data: LOCAL_MUSIC_DATABASE });
  } catch (error) {
    console.error('Failed to fetch songs:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * POST 用于测试/导入音乐数据
 * 可以手动添加来自其他源的音乐
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 验证必填字段
    if (!body.title || !body.artist) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, artist' },
        { status: 400 }
      );
    }

    const newSong = {
      id: Date.now(), // 使用时间戳作为 ID
      title: body.title,
      artist: body.artist,
      url: body.url || '',
      duration: body.duration || 0,
      source: body.source || 'manual',
    };

    // 在实际应用中,应该将数据保存到数据库而不是内存
    return NextResponse.json({
      success: true,
      message: 'Song added successfully',
      data: newSong,
    });
  } catch (error) {
    console.error('Failed to add song:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

