// api/consulta.js

export default async function handler(req, res) {
  try {
    let { tipo, cnpj, token } = req.method === 'POST' ? req.body : req.query;

    // Limpa espaços em branco
    cnpj = cnpj?.trim();
    token = token?.trim();
    tipo = tipo?.trim();

    if (tipo === 'parceirosLogin') {
      const baseId = process.env.AIRTABLE_BASE_ID;
      const tabela = process.env.AIRTABLE_PARCEIROS;
      const apiKey = process.env.AIRTABLE_API_KEY;

      const url = `https://api.airtable.com/v0/${baseId}/${tabela}?filterByFormula=AND({cnpj}='${cnpj}', {token}='${token}', {ativo}=1)`;

      const resposta = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      const dados = await resposta.json();

      if (dados.records && dados.records.length > 0) {
        return res.status(200).json({ autorizado: true, dados: dados.records[0].fields });
      } else {
        return res.status(401).json({ autorizado: false, erro: 'CNPJ ou Token inválido.' });
      }
    }

    return res.status(400).json({ erro: 'Tipo inválido ou não especificado.' });
  } catch (err) {
    console.error('Erro interno na API:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
}
