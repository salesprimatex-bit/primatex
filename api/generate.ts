export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const {
    frasaKunci,
    anchorText1,
    url1,
    anchorText2,
    url2
  } = req.body || {};

  return res.status(200).json({
    success: true,
    konten: `<h1>${frasaKunci}</h1><p>Konten dummy</p>`,
    judul: frasaKunci,
    judul_seo: frasaKunci + " SEO",
    slug: frasaKunci.toLowerCase().replace(/\s+/g, '-'),
    meta_deskripsi: "Meta " + frasaKunci,
    kutipan: "Ringkasan " + frasaKunci,
    tag: "geotextile, primatex"
  });
}
