import { USERNAME_REGEX } from '../utils/validators.js';
import { recordInvestigation } from '../services/analytics.js';

// ---------------------------------------------------------------------------
// Every check below fetches a genuine public page/API for the given platform.
// A platform is only listed here if it exposes a real, guessable per-username
// URL or public endpoint — earlier revisions of this file included ~90
// "checks" against endpoints that don't actually resolve by username (e.g.
// meeting-ID/workspace/snowflake-ID based URLs, or numeric-ID-only Q&A sites
// reused for dozens of fake "topics"). Those produced meaningless results
// (always false, or occasionally a false positive) and roughly 10x'd the
// number of outbound requests per search. They were removed in favor of a
// smaller, accurate, well-maintained list.
// ---------------------------------------------------------------------------

async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, { ...options, signal: AbortSignal.timeout(7000) });
    return res;
  } catch {
    return null;
  }
}

const BROWSER_UA = { 'User-Agent': 'Mozilla/5.0 (compatible; SentryScope-OSINT/1.0; +https://sentryscope.example)' };

/** Generic "does this URL 200" check, used for platforms without a public API. */
async function checkByUrl(platform, url, { notFoundMarkers = [] } = {}) {
  const res = await safeFetch(url, { headers: BROWSER_UA });
  if (!res || res.status !== 200) return { platform, exists: false, url };
  if (notFoundMarkers.length) {
    const body = await res.text().catch(() => '');
    if (notFoundMarkers.some((marker) => body.includes(marker))) {
      return { platform, exists: false, url };
    }
  }
  return { platform, exists: true, url };
}

// ---- Developer platforms (real public APIs) --------------------------------

async function checkGitHub(username) {
  const res = await safeFetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
    headers: { ...BROWSER_UA, Accept: 'application/vnd.github+json' },
  });
  if (!res || res.status !== 200) return { platform: 'GitHub', exists: false, url: `https://github.com/${username}` };
  const data = await res.json();
  return {
    platform: 'GitHub',
    exists: true,
    url: data.html_url,
    avatar: data.avatar_url,
    bio: data.bio,
    name: data.name,
    followers: data.followers,
    publicRepos: data.public_repos,
    website: data.blog || null,
    joined: data.created_at,
  };
}

async function checkGitLab(username) {
  const res = await safeFetch(`https://gitlab.com/api/v4/users?username=${encodeURIComponent(username)}`);
  if (!res || res.status !== 200) return { platform: 'GitLab', exists: false, url: `https://gitlab.com/${username}` };
  const data = await res.json();
  const user = Array.isArray(data) ? data[0] : null;
  if (!user) return { platform: 'GitLab', exists: false, url: `https://gitlab.com/${username}` };
  return {
    platform: 'GitLab',
    exists: true,
    url: user.web_url,
    avatar: user.avatar_url,
    name: user.name,
    joined: user.created_at || null,
  };
}

async function checkBitbucket(username) {
  const res = await safeFetch(`https://api.bitbucket.org/2.0/users/${encodeURIComponent(username)}`);
  if (!res || res.status !== 200) return { platform: 'Bitbucket', exists: false, url: `https://bitbucket.org/${username}` };
  const data = await res.json();
  return {
    platform: 'Bitbucket',
    exists: true,
    url: data.links?.html?.href || `https://bitbucket.org/${username}`,
    avatar: data.avatarUrl || null,
    name: data.display_name || null,
    joined: data.created_on || null,
  };
}

async function checkHackerNews(username) {
  const res = await safeFetch(`https://hacker-news.firebaseio.com/v0/user/${encodeURIComponent(username)}.json`);
  if (!res || res.status !== 200) return { platform: 'Hacker News', exists: false, url: `https://news.ycombinator.com/user?id=${username}` };
  const data = await res.json();
  if (!data) return { platform: 'Hacker News', exists: false, url: `https://news.ycombinator.com/user?id=${username}` };
  return {
    platform: 'Hacker News',
    exists: true,
    url: `https://news.ycombinator.com/user?id=${username}`,
    karma: data.karma,
    joined: data.created ? new Date(data.created * 1000).toISOString() : null,
  };
}

async function checkNpm(username) {
  const res = await safeFetch(`https://registry.npmjs.org/-/v1/search?text=maintainer:${encodeURIComponent(username)}&size=1`);
  if (!res || res.status !== 200) return { platform: 'npm', exists: false, url: `https://www.npmjs.com/~${username}` };
  const data = await res.json();
  const hasPackages = (data.total || 0) > 0;
  return {
    platform: 'npm',
    exists: hasPackages,
    url: `https://www.npmjs.com/~${username}`,
    packageCount: data.total || 0,
  };
}

async function checkCodePen(username) {
  const res = await safeFetch(`https://api.codepen.io/users/${encodeURIComponent(username)}`);
  if (!res || res.status !== 200) return { platform: 'CodePen', exists: false, url: `https://codepen.io/${username}` };
  const data = await res.json();
  return {
    platform: 'CodePen',
    exists: true,
    url: `https://codepen.io/${data.user?.username || username}`,
    avatar: data.user?.avatar || null,
    name: data.user?.name || null,
  };
}

async function checkStackOverflow(username) {
  const res = await safeFetch(
    `https://api.stackexchange.com/2.3/users?order=desc&sort=reputation&inname=${encodeURIComponent(username)}&site=stackoverflow`
  );
  if (!res || res.status !== 200) return { platform: 'Stack Overflow', exists: false, url: `https://stackoverflow.com/users/search?q=${encodeURIComponent(username)}` };
  const data = await res.json();
  const user = Array.isArray(data.items) ? data.items[0] : null;
  if (!user) return { platform: 'Stack Overflow', exists: false, url: `https://stackoverflow.com/users/search?q=${encodeURIComponent(username)}` };
  return {
    platform: 'Stack Overflow',
    exists: true,
    url: user.link || `https://stackoverflow.com/users/search?q=${encodeURIComponent(username)}`,
    name: user.display_name,
    reputation: user.reputation,
    joined: user.creation_date ? new Date(user.creation_date * 1000).toISOString() : null,
  };
}

async function checkKeybase(username) {
  const res = await safeFetch(`https://keybase.io/_/api/1.0/user/lookup.json?usernames=${encodeURIComponent(username)}`);
  if (!res || res.status !== 200) return { platform: 'Keybase', exists: false, url: `https://keybase.io/${username}` };
  const data = await res.json().catch(() => null);
  const found = data?.them?.[0];
  if (!found) return { platform: 'Keybase', exists: false, url: `https://keybase.io/${username}` };
  return { platform: 'Keybase', exists: true, url: `https://keybase.io/${username}` };
}

async function checkReplit(username) {
  return checkByUrl('Replit', `https://replit.com/@${encodeURIComponent(username)}`);
}

async function checkKaggle(username) {
  return checkByUrl('Kaggle', `https://www.kaggle.com/${encodeURIComponent(username)}`);
}

// ---- Q&A / competitive programming -----------------------------------------

async function checkHackerRank(username) {
  return checkByUrl('HackerRank', `https://www.hackerrank.com/${encodeURIComponent(username)}`);
}
async function checkLeetCode(username) {
  return checkByUrl('LeetCode', `https://leetcode.com/${encodeURIComponent(username)}`);
}
async function checkCodeforces(username) {
  return checkByUrl('Codeforces', `https://codeforces.com/profile/${encodeURIComponent(username)}`);
}
async function checkAtCoder(username) {
  return checkByUrl('AtCoder', `https://atcoder.jp/users/${encodeURIComponent(username)}`);
}
async function checkCodewars(username) {
  return checkByUrl('Codewars', `https://www.codewars.com/users/${encodeURIComponent(username)}`);
}
async function checkExercism(username) {
  return checkByUrl('Exercism', `https://exercism.org/profiles/${encodeURIComponent(username)}`);
}

// ---- Social ------------------------------------------------------------

async function checkReddit(username) {
  const res = await safeFetch(`https://www.reddit.com/user/${encodeURIComponent(username)}/about.json`, {
    headers: BROWSER_UA,
  });
  if (!res || res.status !== 200) return { platform: 'Reddit', exists: false, url: `https://reddit.com/user/${username}` };
  const json = await res.json().catch(() => null);
  const data = json?.data;
  if (!data) return { platform: 'Reddit', exists: false, url: `https://reddit.com/user/${username}` };
  return {
    platform: 'Reddit',
    exists: true,
    url: `https://reddit.com/user/${username}`,
    avatar: data.icon_img?.split('?')[0] || null,
    karma: (data.link_karma || 0) + (data.comment_karma || 0),
    joined: data.created_utc ? new Date(data.created_utc * 1000).toISOString() : null,
  };
}

async function checkTwitter(username) {
  return checkByUrl('Twitter / X', `https://x.com/${encodeURIComponent(username)}`);
}
async function checkInstagram(username) {
  return checkByUrl('Instagram', `https://www.instagram.com/${encodeURIComponent(username)}/`);
}
async function checkFacebook(username) {
  return checkByUrl('Facebook', `https://www.facebook.com/${encodeURIComponent(username)}`);
}
async function checkLinkedIn(username) {
  return checkByUrl('LinkedIn', `https://www.linkedin.com/in/${encodeURIComponent(username)}/`);
}
async function checkPinterest(username) {
  return checkByUrl('Pinterest', `https://www.pinterest.com/${encodeURIComponent(username)}/`);
}
async function checkTikTok(username) {
  return checkByUrl('TikTok', `https://www.tiktok.com/@${encodeURIComponent(username)}`);
}
async function checkThreads(username) {
  return checkByUrl('Threads', `https://www.threads.net/@${encodeURIComponent(username)}`);
}
async function checkMastodon(username) {
  return checkByUrl('Mastodon', `https://mastodon.social/@${encodeURIComponent(username)}`);
}
async function checkSnapchat(username) {
  return checkByUrl('Snapchat', `https://www.snapchat.com/add/${encodeURIComponent(username)}`);
}
async function checkVK(username) {
  return checkByUrl('VK', `https://vk.com/${encodeURIComponent(username)}`);
}

async function checkBluesky(username) {
  // Real public AT Protocol endpoint — no key required, no HTML scraping.
  const handle = username.includes('.') ? username : `${username}.bsky.social`;
  const url = `https://bsky.app/profile/${handle}`;
  const res = await safeFetch(
    `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(handle)}`
  );
  if (!res || res.status !== 200) return { platform: 'Bluesky', exists: false, url };
  const data = await res.json().catch(() => null);
  if (!data?.did) return { platform: 'Bluesky', exists: false, url };
  return {
    platform: 'Bluesky',
    exists: true,
    url,
    avatar: data.avatar || null,
    name: data.displayName || null,
    followers: data.followersCount ?? null,
  };
}

// ---- Media / creative ---------------------------------------------------

async function checkYouTube(username) {
  return checkByUrl('YouTube', `https://www.youtube.com/@${encodeURIComponent(username)}`);
}
async function checkTwitch(username) {
  return checkByUrl('Twitch', `https://www.twitch.tv/${encodeURIComponent(username)}`);
}
async function checkSpotify(username) {
  return checkByUrl('Spotify', `https://open.spotify.com/user/${encodeURIComponent(username)}`);
}
async function checkSoundCloud(username) {
  return checkByUrl('SoundCloud', `https://soundcloud.com/${encodeURIComponent(username)}`);
}
async function checkMedium(username) {
  return checkByUrl('Medium', `https://medium.com/feed/@${encodeURIComponent(username)}`, {});
}
async function checkPatreon(username) {
  return checkByUrl('Patreon', `https://www.patreon.com/${encodeURIComponent(username)}`);
}
async function checkBehance(username) {
  return checkByUrl('Behance', `https://www.behance.net/${encodeURIComponent(username)}`);
}
async function checkDribbble(username) {
  return checkByUrl('Dribbble', `https://dribbble.com/${encodeURIComponent(username)}`);
}
async function checkVimeo(username) {
  return checkByUrl('Vimeo', `https://vimeo.com/${encodeURIComponent(username)}`);
}
async function checkFlickr(username) {
  return checkByUrl('Flickr', `https://www.flickr.com/people/${encodeURIComponent(username)}`);
}
async function checkDeviantArt(username) {
  return checkByUrl('DeviantArt', `https://www.deviantart.com/${encodeURIComponent(username)}`);
}
async function checkLetterboxd(username) {
  return checkByUrl('Letterboxd', `https://letterboxd.com/${encodeURIComponent(username)}/`);
}
async function checkKoFi(username) {
  return checkByUrl('Ko-fi', `https://ko-fi.com/${encodeURIComponent(username)}`);
}

// ---- Messaging ------------------------------------------------------------

async function checkTelegram(username) {
  return checkByUrl('Telegram', `https://t.me/${encodeURIComponent(username)}`);
}

// ---- Gaming ----------------------------------------------------------------

async function checkSteam(username) {
  return checkByUrl('Steam', `https://steamcommunity.com/id/${encodeURIComponent(username)}`);
}

async function checkMinecraft(username) {
  const res = await safeFetch(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(username)}`, {
    headers: BROWSER_UA,
  });
  if (!res || res.status !== 200) return { platform: 'Minecraft', exists: false, url: `https://namemc.com/profile/${username}` };
  const data = await res.json().catch(() => null);
  if (!data?.id) return { platform: 'Minecraft', exists: false, url: `https://namemc.com/profile/${username}` };
  return {
    platform: 'Minecraft',
    exists: true,
    url: `https://namemc.com/profile/${data.name || username}`,
    uuid: data.id,
  };
}

async function checkChessDotCom(username) {
  const res = await safeFetch(`https://api.chess.com/pub/player/${encodeURIComponent(username.toLowerCase())}`);
  if (!res || res.status !== 200) return { platform: 'Chess.com', exists: false, url: `https://www.chess.com/member/${username}` };
  const data = await res.json().catch(() => null);
  if (!data?.username) return { platform: 'Chess.com', exists: false, url: `https://www.chess.com/member/${username}` };
  return {
    platform: 'Chess.com',
    exists: true,
    url: data.url || `https://www.chess.com/member/${username}`,
    avatar: data.avatar || null,
    name: data.name || null,
    joined: data.joined ? new Date(data.joined * 1000).toISOString() : null,
  };
}

async function checkLichess(username) {
  const res = await safeFetch(`https://lichess.org/api/user/${encodeURIComponent(username)}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res || res.status !== 200) return { platform: 'Lichess', exists: false, url: `https://lichess.org/@/${username}` };
  const data = await res.json().catch(() => null);
  if (!data?.id) return { platform: 'Lichess', exists: false, url: `https://lichess.org/@/${username}` };
  return {
    platform: 'Lichess',
    exists: true,
    url: data.url || `https://lichess.org/@/${username}`,
    name: data.profile?.firstName || null,
    joined: data.createdAt ? new Date(data.createdAt).toISOString() : null,
  };
}

async function checkRoblox(username) {
  // Real public API — resolves a username to a numeric user ID (no scraping).
  try {
    const res = await safeFetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: false }),
    });
    if (!res || res.status !== 200) return { platform: 'Roblox', exists: false, url: `https://www.roblox.com/search/users?keyword=${encodeURIComponent(username)}` };
    const data = await res.json().catch(() => null);
    const match = data?.data?.[0];
    if (!match) return { platform: 'Roblox', exists: false, url: `https://www.roblox.com/search/users?keyword=${encodeURIComponent(username)}` };
    return {
      platform: 'Roblox',
      exists: true,
      url: `https://www.roblox.com/users/${match.id}/profile`,
      name: match.displayName || null,
    };
  } catch {
    return { platform: 'Roblox', exists: false, url: `https://www.roblox.com/search/users?keyword=${encodeURIComponent(username)}` };
  }
}

async function checkEpicGames(username) {
  return checkByUrl('Epic Games', `https://www.epicgames.com/id/${encodeURIComponent(username)}`);
}
async function checkGOG(username) {
  return checkByUrl('GOG', `https://www.gog.com/u/${encodeURIComponent(username)}`);
}
async function checkItch(username) {
  return checkByUrl('itch.io', `https://${encodeURIComponent(username)}.itch.io`);
}
async function checkNewgrounds(username) {
  return checkByUrl('Newgrounds', `https://${encodeURIComponent(username)}.newgrounds.com`);
}
async function checkKongregate(username) {
  return checkByUrl('Kongregate', `https://www.kongregate.com/accounts/${encodeURIComponent(username)}`);
}
async function checkGameJolt(username) {
  return checkByUrl('Game Jolt', `https://gamejolt.com/@${encodeURIComponent(username)}`);
}
async function checkModDB(username) {
  return checkByUrl('Mod DB', `https://www.moddb.com/members/${encodeURIComponent(username)}`);
}
async function checkIndieDB(username) {
  return checkByUrl('Indie DB', `https://www.indiedb.com/members/${encodeURIComponent(username)}`);
}

// ---------------------------------------------------------------------------

const PLATFORM_CATEGORIES = {
  GitHub: 'Developer',
  GitLab: 'Developer',
  Bitbucket: 'Developer',
  CodePen: 'Developer',
  npm: 'Developer',
  Replit: 'Developer',
  Kaggle: 'Developer',
  'Hacker News': 'Developer',
  'Stack Overflow': 'Developer',
  Keybase: 'Security',

  HackerRank: 'Competitive',
  LeetCode: 'Competitive',
  Codeforces: 'Competitive',
  AtCoder: 'Competitive',
  Codewars: 'Competitive',
  Exercism: 'Competitive',

  Reddit: 'Social',
  'Twitter / X': 'Social',
  Instagram: 'Social',
  Facebook: 'Social',
  LinkedIn: 'Social',
  Pinterest: 'Social',
  TikTok: 'Social',
  Threads: 'Social',
  Mastodon: 'Social',
  Bluesky: 'Social',
  Snapchat: 'Social',
  VK: 'Social',

  YouTube: 'Media',
  Twitch: 'Media',
  Spotify: 'Media',
  SoundCloud: 'Media',
  Medium: 'Media',
  Patreon: 'Media',
  Behance: 'Media',
  Dribbble: 'Media',
  Vimeo: 'Media',
  Flickr: 'Media',
  DeviantArt: 'Media',
  Letterboxd: 'Media',
  'Ko-fi': 'Media',

  Telegram: 'Messaging',

  Steam: 'Gaming',
  Minecraft: 'Gaming',
  'Chess.com': 'Gaming',
  Lichess: 'Gaming',
  Roblox: 'Gaming',
  'Epic Games': 'Gaming',
  GOG: 'Gaming',
  'itch.io': 'Gaming',
  Newgrounds: 'Gaming',
  Kongregate: 'Gaming',
  'Game Jolt': 'Gaming',
  'Mod DB': 'Gaming',
  'Indie DB': 'Gaming',
};

const CATEGORY_ICONS = {
  Developer: '💻',
  Competitive: '🧠',
  Social: '👤',
  Media: '🎬',
  Messaging: '📨',
  Gaming: '🎮',
  Security: '🔐',
};

const CATEGORY_ORDER = ['Developer', 'Security', 'Social', 'Media', 'Messaging', 'Gaming', 'Competitive'];

export async function searchUsername(req, res) {
  const { username } = req.query;
  if (!username || !USERNAME_REGEX.test(username)) {
    return res.status(400).json({ message: 'Enter a valid username (letters, numbers, _ . - only).' });
  }

  const tasks = [
    checkGitHub(username),
    checkGitLab(username),
    checkBitbucket(username),
    checkHackerNews(username),
    checkNpm(username),
    checkCodePen(username),
    checkStackOverflow(username),
    checkKeybase(username),
    checkReplit(username),
    checkKaggle(username),

    checkHackerRank(username),
    checkLeetCode(username),
    checkCodeforces(username),
    checkAtCoder(username),
    checkCodewars(username),
    checkExercism(username),

    checkReddit(username),
    checkTwitter(username),
    checkInstagram(username),
    checkFacebook(username),
    checkLinkedIn(username),
    checkPinterest(username),
    checkTikTok(username),
    checkThreads(username),
    checkMastodon(username),
    checkBluesky(username),
    checkSnapchat(username),
    checkVK(username),

    checkYouTube(username),
    checkTwitch(username),
    checkSpotify(username),
    checkSoundCloud(username),
    checkMedium(username),
    checkPatreon(username),
    checkBehance(username),
    checkDribbble(username),
    checkVimeo(username),
    checkFlickr(username),
    checkDeviantArt(username),
    checkLetterboxd(username),
    checkKoFi(username),

    checkTelegram(username),

    checkSteam(username),
    checkMinecraft(username),
    checkChessDotCom(username),
    checkLichess(username),
    checkRoblox(username),
    checkEpicGames(username),
    checkGOG(username),
    checkItch(username),
    checkNewgrounds(username),
    checkKongregate(username),
    checkGameJolt(username),
    checkModDB(username),
    checkIndieDB(username),
  ];

  const results = await Promise.all(
    tasks.map((task) =>
      task.then((value) => value).catch(() => ({ exists: false, url: '' }))
    )
  );

  const profilesFound = results.filter((r) => r.exists).length;
  const risk = profilesFound >= 8 ? 'high' : profilesFound >= 4 ? 'medium' : 'low';
  recordInvestigation({ type: 'Username', target: username, risk, profilesFound });

  const categorized = results.map((r) => ({
    ...r,
    category: PLATFORM_CATEGORIES[r.platform] || 'Other',
  }));

  res.json({
    username,
    results: categorized,
    meta: { categoryOrder: CATEGORY_ORDER, categoryIcons: CATEGORY_ICONS },
  });
}
