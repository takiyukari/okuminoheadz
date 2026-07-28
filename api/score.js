// Supabaseに接続するための準備
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// このファイルがAPIの本体です。POST（保存）とGET（取得）の2つの動きをします
module.exports = async (req, res) => {

  // ① スコアを保存する（ゲームオーバー時に呼ばれる）
  if (req.method === 'POST') {
    const { player_name, score, stage } = req.body;

    // 最低限のチェック：名前とスコアが無ければ弾く
    if (!player_name || typeof score !== 'number') {
      return res.status(400).json({ error: '不正なデータです' });
    }

    const { error } = await supabase.from('scores').insert([
      { player_name: player_name.slice(0, 20), score, stage }
    ]);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  // ② ランキングを取得する(上位30件、スコアが高い順)
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('scores')
      .select('player_name, score, stage, created_at')
      .order('score', { ascending: false })
      .limit(30);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ranking: data });
  }

  return res.status(405).json({ error: '対応していないリクエストです' });
};
