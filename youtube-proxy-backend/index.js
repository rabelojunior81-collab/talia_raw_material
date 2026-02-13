/**
 * Google Cloud Function para buscar transcrições de vídeos do YouTube.
 *
 * @param {import('@google-cloud/functions-framework').Request} req Objeto de requisição do Express.
 * @param {import('@google-cloud/functions-framework').Response} res Objeto de resposta do Express.
 */
const { getSubtitles } = require('youtube-captions-scraper');

exports.getYouTubeTranscript = async (req, res) => {
  // Configura CORS para permitir requisições do seu domínio de frontend
  res.set('Access-Control-Allow-Origin', '*'); // Para produção, restrinja a `https://seu-dominio.com`
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    // Tratamento da requisição pre-flight do CORS
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  const { videoId } = req.body;

  if (!videoId) {
    return res.status(400).json({ error: 'O "videoId" é obrigatório no corpo da requisição.' });
  }

  try {
    const subtitles = await getSubtitles({
      videoID: videoId,
      lang: 'en' // Busca prioritariamente por legendas em inglês
    });

    if (!subtitles || subtitles.length === 0) {
        return res.status(404).json({ error: 'Nenhuma transcrição em inglês encontrada para este vídeo.' });
    }

    const transcript = subtitles.map(line => line.text).join(' ');
    
    res.status(200).json({ transcript });

  } catch (error) {
    console.error(`Erro ao buscar legendas para o videoId ${videoId}:`, error);
    res.status(500).json({ error: 'Falha ao buscar a transcrição do vídeo.' });
  }
};
