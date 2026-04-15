/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { marked } from 'marked';
import { 
  FileText, 
  Send, 
  Copy, 
  Check, 
  Loader2, 
  Sparkles, 
  Layout, 
  ExternalLink,
  ChevronRight,
  Zap,
  ArrowRight,
  Globe,
  Link as LinkIcon,
  MousePointer2,
  Code,
  Table as TableIcon,
  Download,
  Settings
} from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const SYSTEM_PROMPT = `Anda adalah SEO Content Writer profesional yang berpengalaman di industri konstruksi, geoteknik, dan geosintetik. Anda menulis untuk target pembaca: kontraktor, konsultan, vendor, dan tim pengadaan proyek.

Tugas Anda adalah membuat artikel pendukung dengan panjang 1.000–1.500 kata menggunakan bahasa Indonesia yang natural, profesional, persuasif, dan mudah dipahami.

Pendekatan yang digunakan:
- Topical Authority
- EEAT (Experience, Expertise, Authoritativeness, Trustworthiness)
- Search Intent komersial (mendukung keputusan pembelian)

Gaya penulisan:
- Storytelling ringan berbasis praktik lapangan
- Tetap teknis, kredibel, dan berbasis problem–solution
- Fokus pada pengambilan keputusan proyek
- WAJIB: Setiap paragraf harus panjang, mendalam, dan kaya informasi (minimal 4-6 kalimat per paragraf). Hindari paragraf pendek atau satu kalimat agar artikel tidak terlihat "thin content". Berikan penjelasan teknis yang detail di setiap poin.

STRUKTUR ARTIKEL WAJIB (BAGIAN 1):
1. Judul (WAJIB menggunakan format H1 Markdown: # Judul Artikel)
2. Pendahuluan (Minimal 2 paragraf panjang)
3. Pembahasan Utama (H2 - Gunakan ##) - Minimal 5-6 H2, setiap H2 memiliki minimal 3–4 H3 (Gunakan ###).
4. Subjudul H3 wajib mencakup: Fungsi, Manfaat, Spesifikasi teknis, Aplikasi proyek, Keunggulan produk, Tips pemilihan.

INTERNAL LINKING (WAJIB):
1. Artikel Utama: Sisipkan 1 paragraf transisi panjang setelah H2 ke-2 atau ke-3. Gunakan anchor text: {KEYWORD_ARTIKEL_UTAMA}. Format: [{KEYWORD_ARTIKEL_UTAMA}]({URL_ARTIKEL_UTAMA})
2. Artikel Pilar: Sisipkan 1 paragraf transisi panjang setelah H2 ke-4 atau ke-5. Gunakan anchor text: {KEYWORD_PILAR}. Format: [{KEYWORD_PILAR}]({URL_ARTIKEL_PILAR})

OUTBOUND LINKING (WAJIB):
Tambahkan 1–3 link eksternal kredibel dari ASTM/ISO/SNI, Kementerian PUPR, atau Geosynthetic Institute.

INSIGHT PRAKTIS (WAJIB):
Sertakan contoh kasus proyek nyata, kesalahan umum, dan solusi teknis dalam penjelasan yang komprehensif.

FAQ: Maksimal 5 pertanyaan dengan jawaban yang mendalam.
BRAND TRUST SIGNAL: Sisipkan sebelum kesimpulan, tonjolkan keunggulan IndoGeotextile sebagai solusi geosintetik terpercaya.
CTA INDOGEOTEXTILE (WAJIB): Gunakan maksimal 2–3 CTA dalam artikel. Penempatan alami (tidak dipaksakan). Gaya soft selling.
Gunakan link berikut:
1. Konsultasi teknis: [diskusi spesifikasi proyek](https://indogeotextile.com/konsultasi/)
2. Permintaan harga: [informasi harga sesuai spesifikasi proyek](https://indogeotextile.com/info-harga/)
3. WhatsApp: [konsultasi cepat melalui WhatsApp](https://wa.me/message/WSI7AS6VJ3SBH1)

OUTPUT HARUS TERDIRI DARI 2 BAGIAN YANG DIPISAHKAN OLEH STRING "---SEO-DATA-SEPARATOR---":

BAGIAN 1: ARTIKEL LENGKAP
(Gunakan format Markdown murni. Judul utama WAJIB diawali dengan tanda #. Jangan tulis label "BAGIAN 1")

---SEO-DATA-SEPARATOR---

BAGIAN 2: DATA SEO YANG DIBUTUHKAN
(Tampilkan dalam format SATU BARIS TEKS SAJA, dipisahkan oleh karakter TAB (\t). Jangan tulis label "BAGIAN 2", jangan tulis header, jangan gunakan tabel markdown.)
Urutan data dalam satu baris (pisahkan dengan TAB):
1. Judul Artikel (MURNI KATA-KATA, DILARANG KERAS menggunakan simbol seperti # : ; - | . , atau lainnya. Ini untuk kebutuhan spreadsheet.)
2. Judul SEO (Maks 60 karakter, mengandung kata kunci utama, MURNI KATA-KATA, DILARANG KERAS menggunakan simbol. Ini untuk kebutuhan spreadsheet.)
3. Slug SEO-friendly (Huruf kecil, tanpa simbol, pisahkan dengan tanda hubung)
4. Meta Description (±140 karakter, mengandung kata kunci utama secara natural)
5. Excerpt (1 paragraf, 50–80 kata)
6. Tags (Maks 5 item, pisahkan dengan koma)

PENTING: Judul Artikel dan Judul SEO harus murni teks tanpa tanda baca apa pun.
DILARANG menambahkan style HTML apa pun pada Bagian 2.`;

export default function App() {
  const [keywordUtama, setKeywordUtama] = useState('');
  const [keywordUtamaArtikel, setKeywordUtamaArtikel] = useState('');
  const [urlArtikelUtama, setUrlArtikelUtama] = useState('');
  const [keywordPilar, setKeywordPilar] = useState('');
  const [urlArtikelPilar, setUrlArtikelPilar] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'visual' | 'html'>('visual');

  const handleGenerate = async () => {
    if (!keywordUtama) return;
    
    setIsGenerating(true);
    setGeneratedContent('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `INPUT:
Kata Kunci Utama (H1): ${keywordUtama}
Keyword Artikel Utama (internal link 1): ${keywordUtamaArtikel}
URL Artikel Utama: ${urlArtikelUtama}
Keyword Artikel Pilar (internal link 2): ${keywordPilar}
URL Artikel Pilar: ${urlArtikelPilar}

Hasilkan artikel sesuai instruksi sistem.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.7,
        }
      });

      const text = response.text || '';
      setGeneratedContent(text);
      if (text) {
        downloadFiles(text);
      }
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Gagal menghasilkan konten. Silakan coba lagi.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    const contentToCopy = viewMode === 'html' ? marked.parse(generatedContent) : generatedContent;
    navigator.clipboard.writeText(contentToCopy as string);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFiles = (text: string) => {
    const parts = text.split('---SEO-DATA-SEPARATOR---');
    const articleMarkdown = parts[0]?.trim() || '';
    const seoData = parts[1]?.trim() || '';
    
    // Extract title from SEO data (first column)
    const title = seoData.split('\t')[0] || 'artikel-seo';
    const safeFileName = title.replace(/[/\\?%*:|"<>]/g, '-');

    // 1. Download HTML
    const htmlContent = marked.parse(articleMarkdown);
    const htmlBlob = new Blob([htmlContent as string], { type: 'text/html' });
    const htmlUrl = URL.createObjectURL(htmlBlob);
    const htmlLink = document.createElement('a');
    htmlLink.href = htmlUrl;
    htmlLink.download = `${safeFileName}.html`;
    document.body.appendChild(htmlLink);
    htmlLink.click();
    document.body.removeChild(htmlLink);
    URL.revokeObjectURL(htmlUrl);

    // 2. Download TXT (SEO Data)
    const txtBlob = new Blob([seoData], { type: 'text/plain' });
    const txtUrl = URL.createObjectURL(txtBlob);
    const txtLink = document.createElement('a');
    txtLink.href = txtUrl;
    txtLink.download = `${safeFileName}.txt`;
    document.body.appendChild(txtLink);
    txtLink.click();
    document.body.removeChild(txtLink);
    URL.revokeObjectURL(txtUrl);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar / Form Area */}
      <aside className="w-full lg:w-[400px] bg-[#f8f7f2] p-6 flex flex-col gap-6 overflow-y-auto lg:h-screen sticky top-0">
        <header className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">Indo Geotextile</h1>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">SEO AI Engine</p>
          </div>
        </header>

        {/* Konfigurasi Artikel Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-900 mb-1">
              <Settings size={18} className="text-slate-600" />
              <h2 className="text-base font-bold">Konfigurasi Artikel</h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Masukkan kata kunci dan URL untuk optimasi SEO.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Kata Kunci Utama (H1)</label>
              <input 
                type="text" 
                className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" 
                placeholder="Distributor Geotextile"
                value={keywordUtama}
                onChange={(e) => setKeywordUtama(e.target.value)}
              />
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">INTERNAL LINK 1 (ARTIKEL UTAMA)</h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700">Anchor Text</label>
                  <input 
                    type="text" 
                    className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" 
                    placeholder="Harga Produk Geotextile"
                    value={keywordUtamaArtikel}
                    onChange={(e) => setKeywordUtamaArtikel(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700">URL</label>
                  <input 
                    type="text" 
                    className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" 
                    placeholder="https://indogeotextile.com/..."
                    value={urlArtikelUtama}
                    onChange={(e) => setUrlArtikelUtama(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">INTERNAL LINK 2 (ARTIKEL PILAR)</h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700">Anchor Text</label>
                  <input 
                    type="text" 
                    className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" 
                    placeholder="Produk Geotextile"
                    value={keywordPilar}
                    onChange={(e) => setKeywordPilar(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700">URL</label>
                  <input 
                    type="text" 
                    className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" 
                    placeholder="https://indogeotextile.com/..."
                    value={urlArtikelPilar}
                    onChange={(e) => setUrlArtikelPilar(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !keywordUtama}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl py-3.5 flex items-center justify-center gap-3 font-bold text-sm transition-all shadow-lg shadow-slate-200 active:scale-[0.98]"
          >
            {isGenerating ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={16} className="-rotate-45" />
            )}
            <span>Generate Artikel</span>
          </button>
        </div>

        {/* Standar Kualitas SEO Info Box */}
        <div className="bg-[#e9e8e1] rounded-2xl p-6 border border-slate-200/50">
          <div className="flex items-center gap-2 text-slate-800 mb-4">
            <Check size={16} className="text-slate-900" />
            <h2 className="text-sm font-bold">Standar Kualitas SEO</h2>
          </div>
          <ul className="space-y-2.5">
            {[
              'Panjang 1.000 - 1.500 kata',
              'Struktur H1, H2, H3 yang rapi',
              'Paragraf panjang & mendalam (Anti-Thin)',
              'Internal & Outbound Linking otomatis',
              'CTA IndoGeotextile yang terintegrasi',
              'Gaya bahasa profesional & teknis'
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px] text-slate-500 font-medium">
                <span className="mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 flex flex-col min-h-screen bg-slate-50/50">
        {/* Modern Header */}
        <nav className="h-20 px-8 flex items-center justify-between sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md border-b border-slate-200/50">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">AI Engine Active</span>
            </div>
          </div>
        </nav>

        {/* Main Content Display */}
        <div className="flex-1 p-6 md:p-12 lg:p-16 max-w-5xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {!generatedContent && !isGenerating ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="h-full min-h-[60vh] flex flex-col items-center justify-center text-center"
              >
                <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 flex items-center justify-center mb-10 relative group">
                  <div className="absolute inset-0 bg-slate-900 rounded-[2.5rem] scale-90 blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                  <MousePointer2 size={40} className="text-slate-900 relative z-10" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">Mulai Menulis Artikel SEO</h2>
                <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                  Gunakan panel di sebelah kiri untuk memasukkan detail proyek. AI kami akan menghasilkan artikel teknis yang mendalam dan siap publish.
                </p>
                
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
                  {[
                    { icon: <Zap size={16} />, label: "Fast Generation", desc: "Crafted in seconds" },
                    { icon: <FileText size={16} />, label: "1500+ Words", desc: "Deep technical content" },
                    { icon: <Layout size={16} />, label: "SEO Ready", desc: "Optimized structure" }
                  ].map((item, i) => (
                    <div key={i} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-left">
                      <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900 mb-4">
                        {item.icon}
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 mb-1">{item.label}</h3>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : isGenerating ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[60vh] flex flex-col items-center justify-center"
              >
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                  <div className="absolute inset-0 border-4 border-slate-900 rounded-full border-t-transparent animate-spin" />
                </div>
                <div className="mt-10 text-center">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">AI sedang bekerja...</h3>
                  <p className="text-slate-400 text-sm">Menganalisis data teknis & merangkai kata kunci</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                {/* Article Section */}
                <div className="content-card bg-white">
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
                        Article Content
                      </div>
                      <div className="text-slate-300 text-xs">•</div>
                      <div className="text-slate-400 text-xs font-medium">Technical Deep-Dive</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-sm">
                        <button 
                          onClick={() => setViewMode('visual')}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                            viewMode === 'visual' ? "bg-white text-slate-900 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
                          )}
                        >
                          Visual
                        </button>
                        <button 
                          onClick={() => setViewMode('html')}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                            viewMode === 'html' ? "bg-white text-slate-900 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
                          )}
                        >
                          HTML
                        </button>
                      </div>

                      <button 
                        onClick={() => downloadFiles(generatedContent)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors shadow-sm"
                      >
                        <Download size={12} />
                        Download
                      </button>

                      <button 
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-md"
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? 'Copied' : viewMode === 'html' ? 'Copy HTML' : 'Copy MD'}
                      </button>
                    </div>
                  </div>

                  {viewMode === 'visual' ? (
                    <article className="prose prose-slate max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 tracking-tight leading-snug" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-12 mb-4 tracking-tight" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-lg font-bold text-slate-800 mt-8 mb-3" {...props} />,
                          p: ({node, ...props}) => <p className="text-slate-600 leading-relaxed mb-6 text-base" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-none p-0 mb-6 space-y-3" {...props} />,
                          li: ({node, ...props}) => (
                            <li className="flex items-start gap-3 text-slate-600 text-base">
                              <ChevronRight size={16} className="mt-1 text-slate-400 flex-shrink-0" />
                              <span>{props.children}</span>
                            </li>
                          ),
                          a: ({node, ...props}) => (
                            <a 
                              className="text-slate-900 font-bold underline decoration-slate-300 decoration-2 underline-offset-4 hover:decoration-slate-900 transition-all inline-flex items-center gap-1 group" 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              {...props} 
                            >
                              {props.children}
                              <ExternalLink size={12} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                            </a>
                          ),
                          blockquote: ({node, ...props}) => (
                            <blockquote className="bg-slate-50 border-none rounded-2xl p-6 italic text-slate-700 my-8 relative" {...props}>
                              <div className="absolute top-2 left-3 text-slate-200 text-5xl font-serif opacity-50">"</div>
                              <div className="relative z-10">{props.children}</div>
                            </blockquote>
                          ),
                          table: ({node, ...props}) => (
                            <div className="my-10 overflow-x-auto rounded-xl border border-slate-100 shadow-sm">
                              <table className="w-full text-left border-collapse" {...props} />
                            </div>
                          ),
                          thead: ({node, ...props}) => <thead className="bg-slate-900 text-white" {...props} />,
                          th: ({node, ...props}) => <th className="p-3 text-[9px] font-bold uppercase tracking-wider border-r border-slate-800 last:border-0" {...props} />,
                          td: ({node, ...props}) => <td className="p-3 text-xs text-slate-600 border-b border-slate-100 border-r last:border-r-0" {...props} />,
                          tr: ({node, ...props}) => <tr className="last:border-0" {...props} />
                        }}
                      >
                        {generatedContent.split('---SEO-DATA-SEPARATOR---')[0]}
                      </ReactMarkdown>
                    </article>
                  ) : (
                    <div className="relative">
                      <div className="absolute top-0 right-0 p-4">
                        <Code size={20} className="text-slate-200" />
                      </div>
                      <pre className="bg-slate-900 text-slate-300 p-8 rounded-3xl overflow-x-auto font-mono text-sm leading-relaxed">
                        <code>{marked.parse(generatedContent.split('---SEO-DATA-SEPARATOR---')[0])}</code>
                      </pre>
                    </div>
                  )}
                </div>

                {/* SEO Data Section */}
                {generatedContent.includes('---SEO-DATA-SEPARATOR---') && (
                  <div className="bg-blue-50/50 border border-blue-100 rounded-[2rem] p-8 md:p-10 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                      <div>
                        <h2 className="text-xl md:text-2xl font-black text-blue-900 tracking-tight mb-2 uppercase">
                          DATA SEO YANG DIBUTUHKAN
                        </h2>
                        <p className="text-sm text-blue-600/80 font-medium">
                          Data ini siap untuk ditempel ke spreadsheet atau CMS Anda.
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => downloadFiles(generatedContent)}
                          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                        >
                          <Download size={14} />
                          Download TXT
                        </button>

                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(generatedContent.split('---SEO-DATA-SEPARATOR---')[1].trim());
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="flex items-center gap-3 px-6 py-3 bg-white border border-blue-200 text-blue-700 rounded-2xl text-sm font-bold hover:bg-blue-50 transition-all shadow-sm active:scale-95 flex-shrink-0"
                        >
                          {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                          <span>{copied ? 'Berhasil Disalin' : 'Salin Data SEO (TXT)'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-inner overflow-hidden">
                      <div className="overflow-x-auto custom-scrollbar pb-2">
                        <p className="text-sm font-mono text-slate-700 whitespace-nowrap min-w-max pr-4">
                          {generatedContent.split('---SEO-DATA-SEPARATOR---')[1].trim()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-12 pt-10 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Sparkles size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">End of Generation</span>
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="text-xs font-bold text-slate-900 hover:underline underline-offset-4"
                  >
                    {copied ? 'Copied!' : 'Copy All Content'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
