export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { frasa_kunci, anchor1, url1, anchor2, url2 } = req.body;

      // --- BAGIAN GENERASI KONTEN (Logika AI Anda) ---
      // Di sini Anda memanggil OpenAI SDK atau pustaka AI lainnya
      // Gunakan prompt yang sistematis sesuai standar industri konstruksi
      const hasilAI = await panggilLogicAI(frasa_kunci, anchor1, url1); 

      // --- FORMAT OUTPUT ---
      // Sesuaikan properti ini dengan apa yang dipanggil di Google Apps Script
      const dataResponse = {
        konten: hasilAI.html_content, // Format HTML
        judul: hasilAI.title,
        judul_seo: `${hasilAI.title} | Indogeotextile`,
        slug: hasilAI.slug,
        meta_deskripsi: hasilAI.meta_desc,
        kutipan: hasilAI.excerpt,
        tag: "geosintetik, konstruksi, geotextile, indonesia"
      };

      res.status(200).json(dataResponse);
    } catch (error) {
      res.status(500).json({ error: "Gagal generate konten" });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
