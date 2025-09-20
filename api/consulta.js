// /api/consulta.js
export default async function handler(req, res) {
  let { tipo, cnpj, token } = req.query;

  if (req.method === 'POST') {
    cnpj = req.body.cnpj;
    token = req.body.token;
    tipo = req.body.tipo || tipo;
  }

  // Whitelist de tipo permitido
  if (tipo !== 'parceirosLogin') {
    return res.status(400).json({ erro: 'Tipo de consulta inválido.' });
  }

  try {
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tabela = process.env.AIRTABLE_PARCEIROS;
    const apiKey = process.env.AIRTABLE_API_KEY;

    // ⚠️ Certifique-se de que os campos estão exatamente assim no Airtable
    const formula = `AND({A cnpj}='${cnpj}', {A token}='${token}', {A ativo}='SIM')`;

    const url = `https://api.airtable.com/v0/${baseId}/${tabela}?filterByFormula=${encodeURIComponent(formula)}`;

    const resposta = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    const dados = await resposta.json();

    if (dados?.records?.length > 0) {
      const parceiro = dados.records[0].fields;

      // 🔐 Limpeza da resposta
      return res.status(200).json({
        cnpj: parceiro["A cnpj"],
        nome: parceiro["A nome"] || "",
        whatsapp: parceiro.whatsapp || "",
        instagram: parceiro.instagram || ""
      });
    } else {
      return res.status(401).json({ erro: "CNPJ ou Token inválidos." });
    }

  } catch (erro) {
    console.error("Erro interno:", erro);
    return res.status(500).json({ erro: "Erro interno do servidor." });
  }
}
