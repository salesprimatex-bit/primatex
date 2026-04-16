export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      frasaKunci,
      anchorText1,
      url1,
      anchorText2,
      url2
    } = req.body;

    // 🔥 PROMPT SIMPEL (tanpa library dulu)
    const prompt = `
Buat artikel SEO panjang (800 kata) tentang: ${frasaKunci}

Gunakan:
- ${anchorText1} (${url1})
- ${anchorText2} (${url2})

Format HTML dengan H1, H2, H3.
Bahasa Indonesia profesional.
`;

    // 👉 sementara kita return manual biar jelas
    return res.status(200).json({
      success: true,
      konten: `<h1>${frasaKunci}</h1><p>Artikel SEO untuk ${frasaKunci} dengan struktur lengkap...</p>`,
      judul: frasaKunci,
      judul_seo: frasaKunci + " Terbaik",
      slug: frasaKunci.toLowerCase().replace(/\s+/g, "-"),
      meta_deskripsi: "Artikel tentang " + frasaKunci,
      kutipan: "Ringkasan " + frasaKunci,
      tag: "seo, artikel"
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
