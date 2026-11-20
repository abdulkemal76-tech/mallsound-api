const express = require('express');
const cors = require('cors');
const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core');

const app = express();
app.use(cors());

app.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);
  try {
    const r = await yts(query);
    const videos = r.videos.slice(0, 10).map(v => ({
      id: v.videoId, title: v.title, artist: v.author.name, cover: v.thumbnail
    }));
    res.json(videos);
  } catch (error) { res.status(500).json({ error: 'Error' }); }
});

app.get('/stream', async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: 'No ID' });
  try {
    const info = await ytdl.getInfo(id);
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });
    res.json({
      streamUrl: format.url,
      title: info.videoDetails.title,
      artist: info.videoDetails.author.name,
      artwork: info.videoDetails.thumbnails[0]?.url
    });
  } catch (error) { res.status(500).json({ error: 'Error' }); }
});

app.listen(process.env.PORT || 3000);