import PDFDocument from "pdfkit";
import Groq from "groq-sdk";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pdfjsPath = join(__dirname, "../../node_modules/pdfjs-dist");
const standardFontDataUrl = join(pdfjsPath, "standard_fonts") + "/";

async function extractTextFromPDF(buffer) {
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    standardFontDataUrl,
    disableRange: true,
    disableStream: true,
    disableAutoFetch: true,
  });

  const pdf = await loadingTask.promise;
  const textParts = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(" ");
    textParts.push(pageText);
  }

  return textParts.join("\n");
}

const PROMPTS = {
  test: (text) => `
You are an academic exam paper creator. Based on the following study material, generate a professional test paper with:
- 5 Multiple Choice Questions (4 options each, mark the correct answer with *)
- 5 Short Answer Questions (2-3 sentences expected)
- 3 Long Answer / Essay Questions

Format clearly with section headings. Be thorough and academically rigorous.

Study Material:
${text}
`,
  summary: (text) => `
You are an expert academic summarizer. Based on the following study material, generate:
- A concise executive summary (3-4 sentences)
- Key Concepts (bullet points, each with a brief explanation)
- Important Definitions
- Key Takeaways (5-7 points)

Make it student-friendly and well-structured.

Study Material:
${text}
`,
  questions: (text) => `
You are an expert academic coach. Based on the following study material, generate:
- 10 Most Important Questions likely to appear in exams (with brief answer hints)
- 5 Tricky/Conceptual Questions (with explanation of why they are important)
- 5 One-liner fact-based questions

Format with clear numbering and sections.

Study Material:
${text}
`,
};

const FEATURE_TITLES = {
  test: "AI Generated Test Paper",
  summary: "AI Generated Summary",
  questions: "AI Generated Important Questions",
};

function writeAiTextToPdf(doc, aiText) {
  for (const line of aiText.split("\n")) {
    const t = line.trim();

    if (!t) {
      doc.moveDown(0.4);
      continue;
    }

    if (/^#{1,2} /.test(t)) {
      doc.font("Helvetica-Bold").fontSize(13).fillColor("#1E1B4B").text(t.replace(/^#+\s*/, ""), {
        paragraphGap: 4,
      });
      doc.moveDown(0.2);
    } else if (/^\*\*.+\*\*$/.test(t)) {
      doc.font("Helvetica-Bold").fontSize(11).fillColor("#312E81").text(t.replace(/\*\*/g, ""), {
        paragraphGap: 2,
      });
    } else if (/^[-*] /.test(t)) {
      doc.font("Helvetica").fontSize(11).fillColor("#111827").text(`• ${t.slice(2)}`, {
        indent: 10,
        paragraphGap: 2,
      });
    } else if (/^\d+\./.test(t)) {
      doc.font("Helvetica").fontSize(11).fillColor("#111827").text(t, {
        indent: 10,
        paragraphGap: 2,
      });
    } else {
      doc.font("Helvetica").fontSize(11).fillColor("#111827").text(t, {
        paragraphGap: 2,
      });
    }
  }
}

export const generatePdfAI = async (req, res) => {
  try {
    const { feature } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No PDF file uploaded" });
    }

    if (!["test", "summary", "questions"].includes(feature)) {
      return res.status(400).json({ message: "Invalid feature type" });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "GROQ_API_KEY is missing or empty" });
    }

    let extractedText = "";
    try {
      extractedText = await extractTextFromPDF(req.file.buffer);
    } catch (err) {
      console.error("PDF text extraction error:", err);
      return res.status(400).json({
        message: `Failed to parse the PDF: ${err.message}`,
      });
    }

    extractedText = extractedText.trim();

    if (!extractedText || extractedText.length < 100) {
      return res.status(400).json({
        message: "Could not extract enough text from the PDF. Make sure it is not a scanned image-only file.",
      });
    }

    const groq = new Groq({ apiKey });
    const truncatedText = extractedText.slice(0, 12000);
    const prompt = PROMPTS[feature](truncatedText);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4000,
    });

    const aiText = completion.choices?.[0]?.message?.content?.trim();

    if (!aiText) {
      return res.status(500).json({ message: "AI returned empty content" });
    }

    const title = FEATURE_TITLES[feature];

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${title.replace(/ /g, "_")}.pdf"`);

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    doc.pipe(res);

    doc.font("Helvetica-Bold").fontSize(20).fillColor("#4F46E5").text(title, { align: "center" });

    doc.moveDown(0.4);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#6366F1").lineWidth(1).stroke();
    doc.moveDown(1);

    writeAiTextToPdf(doc, aiText);

    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#E5E7EB").lineWidth(0.5).stroke();
    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(9).fillColor("#9CA3AF").text("Generated by Student's Corner AI — Powered by Groq", {
      align: "center",
    });

    doc.end();
  } catch (error) {
    console.error("PDF AI generation error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "AI generation failed", error: error.message });
    }
  }
};