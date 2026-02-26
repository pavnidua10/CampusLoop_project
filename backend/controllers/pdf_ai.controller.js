// import fs from "fs";
// import PDFDocument from "pdfkit";
// import OpenAI from "openai";
// import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export const generateFromPDF = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No PDF uploaded" });
//     }

//     const { feature } = req.body;
//     const filePath = req.file.path;

//     // -----------------------------
//     // 1️⃣ Extract Text From PDF
//     // -----------------------------
//     const data = new Uint8Array(fs.readFileSync(filePath));
//     const pdf = await pdfjsLib.getDocument({ data }).promise;

//     let text = "";

//     for (let i = 1; i <= pdf.numPages; i++) {
//       const page = await pdf.getPage(i);
//       const content = await page.getTextContent();
//       const strings = content.items.map((item) => item.str);
//       text += strings.join(" ") + "\n";
//     }

//     text = text.slice(0, 10000); // limit size

//     // -----------------------------
//     // 2️⃣ Create Prompt
//     // -----------------------------
//     let prompt = "";

//     if (feature === "summary") {
//       prompt = `
// Create a well-structured academic summary with:
// - Proper headings
// - Bullet points
// - Clear explanations

// Content:
// ${text}
// `;
//     } else if (feature === "questions") {
//       prompt = `
// Generate important university-level exam questions.

// Divide into:
// Section A (Short Answer)
// Section B (Long Answer)

// Content:
// ${text}
// `;
//     } else {
//       prompt = `
// Create a structured university-level test paper.

// Include:
// - Section A (MCQs)
// - Section B (Short Answers)
// - Section C (Long Answers)
// - Marks distribution

// Content:
// ${text}
// `;
//     }

//     // -----------------------------
//     // 3️⃣ Generate AI Content
//     // -----------------------------
//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o-mini", // affordable + powerful
//       messages: [
//         { role: "system", content: "You are a helpful academic assistant." },
//         { role: "user", content: prompt },
//       ],
//     });

//     const responseText = completion.choices[0].message.content;

//     // -----------------------------
//     // 4️⃣ Create Output PDF
//     // -----------------------------
//     const pdfPath = `generated_${Date.now()}.pdf`;

//     const doc = new PDFDocument({ margin: 40 });
//     const stream = fs.createWriteStream(pdfPath);

//     doc.pipe(stream);

//     doc.fontSize(18).text("CampusLoop - Student’s Corner", {
//       align: "center",
//     });

//     doc.moveDown();
//     doc.fontSize(12).text(responseText);

//     doc.end();

//     // -----------------------------
//     // 5️⃣ Send File + Cleanup
//     // -----------------------------
//     stream.on("finish", () => {
//       res.download(pdfPath, () => {
//         try {
//           fs.unlinkSync(pdfPath);
//           fs.unlinkSync(filePath);
//         } catch (cleanupError) {
//           console.error("Cleanup error:", cleanupError);
//         }
//       });
//     });

//   } catch (error) {
//     console.error("AI generation error:", error);
//     res.status(500).json({ error: "AI generation failed" });
//   }
// };
