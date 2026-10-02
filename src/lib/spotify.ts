/**
 * Spotify API 客户端
 * 使用 Client Credentials Flow 来获取访问令牌
 */

let spotifyAccessToken: string | null = null;
let tokenExpireTime: number = 0;

/**
 * 获取 Spotify 访问令牌
 */
async function getSpotifyAccessToken(): Promise<string> {
  // 如果 token 还未过期,直接返回
  if (spotifyAccessToken && Date.now() < tokenExpireTime) {
    return spotifyAccessToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify API 凭证未配置。请设置 SPOTIFY_CLIENT_ID 和 SPOTIFY_CLIENT_SECRET 环境变量。');
  }

  // Base64 编码凭证
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`Spotify 认证失败: ${response.status}`);
  }

  const data = await response.json();
  spotifyAccessToken = data.access_token;
  tokenExpireTime = Date.now() + data.expires_in * 1000 - 60000; // 提前 1 分钟刷新

  return spotifyAccessToken;
}

/**
 * 搜索 Spotify 中的歌曲
 */
export async function searchSpotifySongs(query: string, limit: number = 20) {
  const token = await getSpotifyAccessToken();

  const params = new URLSearchParams({
    q: query,
    type: 'track',
    limit: limit.toString(),
  });

  const response = await fetch(`https://api.spotify.com/v1/search?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Spotify 搜索失败: ${response.status}`);
  }

  const data = await response.json();

  // 转换 Spotify 数据为我们的格式
  const songs = data.tracks.items.map((track: any) => ({
    id: track.id,
    title: track.name,
    artist: track.artists.map((a: any) => a.name).join(', '),
    url: track.preview_url, // Spotify 提供 30 秒预览 URL
    duration: Math.floor(track.duration_ms / 1000),
    image: track.album.images[0]?.url || '',
    spotifyUrl: track.external_urls.spotify,
  }));

  return songs;
}

/**
 * 获取 Spotify 热门歌曲
 */
export async function getSpotifyTrendingSongs(limit: number = 20) {
  const token = await getSpotifyAccessToken();

  // 获取热门播放列表
  const response = await fetch(
    `https://api.spotify.com/v1/playlists/37i9dQZF1DXcBWIGoYsB0d/tracks?limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`获取热门歌曲失败: ${response.status}`);
  }

  const data = await response.json();

  const songs = data.items.map((item: any) => ({
    id: item.track.id,
    title: item.track.name,
    artist: item.track.artists.map((a: any) => a.name).join(', '),
    url: item.track.preview_url,
    duration: Math.floor(item.track.duration_ms / 1000),
    image: item.track.album.images[0]?.url || '',
    spotifyUrl: item.track.external_urls.spotify,
  }));

  return songs;
}

/**
 * 获取 Spotify 推荐歌曲
 */
export async function getSpotifyRecommendations(seedArtists: string[] = [], limit: number = 20) {
  const token = await getSpotifyAccessToken();

  // 如果没有种子艺术家,使用一些流行的
  let seeds = seedArtists;
  if (seeds.length === 0) {
    // 获取一些热门艺术家 ID
    const trendingResponse = await fetch(
      'https://api.spotify.com/v1/playlists/37i9dQZF1DXcBWIGoYsB0d/tracks?limit=5',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    const trendingData = await trendingResponse.json();
    seeds = trendingData.items.slice(0, 3).map((item: any) => item.track.artists[0].id);
  }

  const params = new URLSearchParams({
    seed_artists: seeds.join(','),
    limit: limit.toString(),
  });

  const response = await fetch(`https://api.spotify.com/v1/recommendations?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`获取推荐歌曲失败: ${response.status}`);
  }

  const data = await response.json();

  const songs = data.tracks.map((track: any) => ({
    id: track.id,
    title: track.name,
    artist: track.artists.map((a: any) => a.name).join(', '),
    url: track.preview_url,
    duration: Math.floor(track.duration_ms / 1000),
    image: track.album.images[0]?.url || '',
    spotifyUrl: track.external_urls.spotify,
  }));

  return songs;
}

