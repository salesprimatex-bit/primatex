import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Buat artikel SEO profesional dalam format JSON.

Keyword utama: ${frasaKunci}

Gunakan anchor text berikut secara natural:
- ${anchorText1} (${url1})
- ${anchorText2} (${url2})

Aturan:
- Bahasa Indonesia profesional
- Minimal 800 kata
- Struktur HTML: <h1>, <h2>, <h3>, <p>
- Tambahkan internal link
- Jangan keluar dari format JSON

Format output WAJIB:

{
  "konten": "<html lengkap>",
  "judul": "...",
  "judul_seo": "...",
  "slug": "...",
  "meta_deskripsi": "...",
  "kutipan": "...",
  "tag": "tag1, tag2, tag3"
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // 🔥 ambil JSON dari hasil AI
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Format JSON tidak ditemukan");
    }

    const data = JSON.parse(jsonMatch[0]);

    return res.status(200).json({
      success: true,
      ...data
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
