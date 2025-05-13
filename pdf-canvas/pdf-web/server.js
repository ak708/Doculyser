const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer");
const { exec } = require("child_process");
const fs = require("fs").promises;
const cors = require("cors");

app.use(
    cors({
        origin: "http://localhost:8080",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
    })
);

app.use(express.static("public"));
app.use(express.json());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "uploaded-" + uniqueSuffix + ".pdf");
    },
});
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed!"), false);
        }
    },
});
const uploadsDir = path.join(__dirname, "public/uploads");
fs.mkdir(uploadsDir, { recursive: true });

app.post("/process-pdf", upload.single("pdf"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No PDF file uploaded" });
        }

        const pdfPath = req.file.path;
        const extractScript = path.join(__dirname, "extract.py");
        const outputJson = path.join(__dirname, "public/ocr.json");

        await new Promise((resolve, reject) => {
            exec(
                `python "${extractScript}" "${pdfPath}"`,
                (error, stdout, stderr) => {
                    if (error) {
                        console.error("Python script error:", stderr);
                        reject(new Error("Failed to process PDF"));
                        return;
                    }
                    resolve();
                }
            );
        });

        const ocrData = await fs.readFile(outputJson, "utf-8");
        res.json(JSON.parse(ocrData));

        await fs
            .unlink(pdfPath)
            .catch((err) =>
                console.error("Failed to delete uploaded PDF:", err)
            );
    } catch (error) {
        console.error("Error processing PDF:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/selected-text", (req, res) => {
    const selectedText = req.body.text;
    console.log("Selected text:", selectedText);
    res.sendStatus(200);
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
