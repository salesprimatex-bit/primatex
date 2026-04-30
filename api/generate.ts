export default function handler(req, res) {
  if (req.method === 'POST') {
    return res.status(200).json({
      message: "API hidup",
      data: req.body
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
