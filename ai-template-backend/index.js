// index.js

// ========================================================================
// 1. IMPORTS & INITIAL SETUP
// ========================================================================
const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');
const fs = require('fs'); // For file system access
const csv = require('csv-parser'); // For parsing CSV files
const path = require('path'); // For path manipulation
// REMOVED: const { PythonShell } = require('python-shell'); 

dotenv.config();
const app = express();

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());

const PORT = process.env.PORT || 3001;
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not defined in .env file. Please ensure it is set.");
} else {
    console.log("Gemini API Key loaded successfully.");
}

// REMOVED: Python script path constants
// const PYTHON_SCRIPTS_DIRECTORY = path.join(__dirname, 'scripts');
// const PYTHON_ANALYTICS_SCRIPT = 'analytics_engine.py';

// ========================================================================
// 2. DATA LOADING & CACHING FOR ANALYTICS AGENT (for general AI queries)
// ========================================================================
const dataCache = {};
// filePaths still points to CSVs inside the 'scripts' folder as general AI uses this data
const SCRIPTS_DATA_DIRECTORY = path.join(__dirname, 'scripts'); // Define for clarity
const filePaths = {
    applications: path.join(SCRIPTS_DATA_DIRECTORY, 'applications.csv'),
    categories:   path.join(SCRIPTS_DATA_DIRECTORY, 'categories.csv'),
    documents:    path.join(SCRIPTS_DATA_DIRECTORY, 'documents.csv'),
    entities:     path.join(SCRIPTS_DATA_DIRECTORY, 'entities.csv'),
    incidents:    path.join(SCRIPTS_DATA_DIRECTORY, 'incidents.csv'),
    licenses:     path.join(SCRIPTS_DATA_DIRECTORY, 'licenses.csv'),
    persons:      path.join(SCRIPTS_DATA_DIRECTORY, 'persons.csv'),
    products:     path.join(SCRIPTS_DATA_DIRECTORY, 'products.csv'),
    reports:      path.join(SCRIPTS_DATA_DIRECTORY, 'reports.csv'),
    staff:        path.join(SCRIPTS_DATA_DIRECTORY, 'staff.csv'),
    submissions:  path.join(SCRIPTS_DATA_DIRECTORY, 'submissions.csv')
};

async function loadData() {
    console.log('Starting data load into memory for general AI analytics agent (from ./scripts directory)...');
    for (const [name, filePath] of Object.entries(filePaths)) {
        const data = [];
        await new Promise((resolve, reject) => {
            if (!fs.existsSync(filePath)) {
                console.error(`\nERROR: The data file "${filePath}" for general AI analytics was not found in the scripts directory.`);
                return resolve(); 
            }
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (row) => data.push(row))
                .on('end', () => {
                    dataCache[name] = data;
                    console.log(`- Loaded ${data.length} rows from ${filePath} for general AI.`);
                    resolve();
                })
                .on('error', (err) => {
                    console.error(`Error loading ${filePath} for general AI:`, err)
                    resolve(); 
                });
        });
    }
    console.log('--- All data for general AI analytics loaded (or attempted from ./scripts). Analytics agent is ready. ---');
}

// ========================================================================
// 3. ORIGINAL: AI TEMPLATE GENERATION & MANAGEMENT ENDPOINTS (UNALTERED)
// ========================================================================
const aiGeneratedTemplates = [];
let nextTemplateIdCounter = 1;

app.post('/api/templates/generate-ai', async (req, res) => {
    console.log("SSE: Received request for /api/templates/generate-ai (streaming)");
    const { prompt: currentUserPrompt, templateType, history } = req.body;

    if (!currentUserPrompt) {
        return res.status(400).json({ error: "No prompt provided." });
    }
    if (!geminiApiKey) {
        console.error("SSE: Gemini API Key is missing.");
        return res.status(500).json({ error: "AI service configuration error." });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.flushHeaders();

    const modelName = 'gemini-2.0-flash-exp';
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?key=${geminiApiKey}&alt=sse`;

    let contextualInstruction = '';
    if (templateType && typeof templateType === 'string' && templateType.trim() !== '') {
        contextualInstruction = `\nSPECIFIC CONTEXT FOR THIS REQUEST: The user is attempting to create a template specifically for the type: "${templateType}". Please ensure the generated content is highly relevant to this template type. For example, if it's a "Compliance Checklist", format it as a list of checkable items. If "Communication Template", make it like an email. If "Policy Document", use formal sections. If "Risk Assessment Form", include fields for risk details. If "Procedural Document", make it step-by-step.`;
    }

    const systemInstruction = `\nINSTRUCTIONS: Generate ONLY the raw text content for the requested document template. Do NOT include any introductory/concluding remarks or markdown (unless the template type itself implies it, like "□" for checklists). Output directly.`;
    const fullPromptForCurrentTurn = contextualInstruction + systemInstruction + "\nUSER REQUEST:\n" + currentUserPrompt;

    const geminiContents = [];
    if (history && Array.isArray(history)) {
        history.forEach(turn => {
            if (turn.sender === 'user' && typeof turn.message === 'string') {
                geminiContents.push({ role: 'user', parts: [{ text: turn.message }] });
            } else if (turn.sender === 'ai' && typeof turn.message === 'string') {
                geminiContents.push({ role: 'model', parts: [{ text: turn.message }] });
            }
        });
    }
    geminiContents.push({ role: 'user', parts: [{ text: fullPromptForCurrentTurn }] });

    const requestPayload = { contents: geminiContents };

    try {
        console.log(`SSE: Connecting to Gemini stream for model: ${modelName}`);
        const source = axios.CancelToken.source();
        
        const geminiResponseStream = await axios.post(geminiApiUrl, requestPayload, {
            responseType: 'stream',
            headers: { 'Content-Type': 'application/json' },
            cancelToken: source.token,
            timeout: 60000 
        });

        req.on('close', () => {
            console.log('SSE: Client disconnected. Cancelling Gemini request.');
            source.cancel('Client disconnected, aborting Gemini request.');
            if (res.writable && !res.writableEnded) {
                res.end();
            }
        });

        let sseBuffer = '';
        geminiResponseStream.data.on('data', (chunk) => {
             if (res.writableEnded) return;
            const chunkText = chunk.toString();
            sseBuffer += chunkText;
            let eolIndex;
            while ((eolIndex = sseBuffer.indexOf('\n\n')) >= 0) {
                if (res.writableEnded) break;
                const message = sseBuffer.substring(0, eolIndex);
                sseBuffer = sseBuffer.substring(eolIndex + 2);
                if (message.startsWith('data: ')) {
                    const jsonDataString = message.substring(5).trim();
                    if (jsonDataString) {
                        try {
                            const jsonData = JSON.parse(jsonDataString);
                             if (jsonData.candidates && jsonData.candidates[0]?.content?.parts[0]?.text) {
                                const text = jsonData.candidates[0].content.parts[0].text;
                                res.write(`data: ${JSON.stringify({ textChunk: text })}\n\n`);
                            } else if (jsonData.error) {
                                if (!res.writableEnded) {
                                    res.write(`data: ${JSON.stringify({ error: jsonData.error.message || 'Error in AI stream' })}\n\n`);
                                }
                            }
                        } catch (e) {
                            console.warn('SSE: Error parsing JSON from Gemini SSE chunk:', e.message);
                        }
                    }
                }
            }
        });

        geminiResponseStream.data.on('end', () => {
            console.log("SSE: Gemini stream processing ended.");
            if (!res.writableEnded) {
                if (sseBuffer.trim().length > 0) {
                    const remainingLines = sseBuffer.trim().split('\n');
                    for (const line of remainingLines) {
                        if (line.startsWith('data: ')) {
                            const jsonDataString = line.substring(5).trim();
                            if (jsonDataString) {
                                try {
                                    const jsonData = JSON.parse(jsonDataString);
                                    if (jsonData.candidates && jsonData.candidates[0]?.content?.parts[0]?.text) {
                                        const text = jsonData.candidates[0].content.parts[0].text;
                                        res.write(`data: ${JSON.stringify({ textChunk: text })}\n\n`);
                                    }
                                } catch(e) { 
                                    console.warn("SSE: Error parsing final buffer content:", e.message, "Data:", jsonDataString); 
                                }
                            }
                        }
                    }
                }
                console.log("SSE: Sending 'done' event to client.");
                res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
                res.end();
            }
        });

        geminiResponseStream.data.on('error', (streamError) => {
            console.error('SSE: Error event in stream from Gemini:', streamError);
            if (!res.writableEnded) {
                res.write(`data: ${JSON.stringify({ error: 'Stream error from AI service.' })}\n\n`);
                res.end();
            }
        });

    } catch (error) {
        if (axios.isCancel(error)) {
            console.log('SSE: Request to Gemini was cancelled:', error.message);
        } else {
            console.error("SSE: Error establishing connection to Gemini streaming API:", error.response ? error.response.data : error.message);
            if (!res.headersSent) {
                res.status(500).json({ error: "Failed to connect to AI streaming service.", details: error.response ? error.response.data : error.message });
            } else if (res.writable && !res.writableEnded) {
                res.write(`data: ${JSON.stringify({ error: 'Failed to connect to AI streaming service.' })}\n\n`);
                res.end();
            }
        }
    }
});

app.post('/api/templates/save-ai-generated', (req, res) => {
    console.log("Received request for /api/templates/save-ai-generated");
    const { templateName, templateType, textContent, promptUsed, generatedBy } = req.body;
    if (!templateName || !templateType || !textContent) {
        return res.status(400).json({ error: "Missing required fields." });
    }
    const newTemplate = {
        id: `tpl_ai_${nextTemplateIdCounter++}`,
        name: templateName,
        type: templateType,
        version: "1.0 (AI Draft)",
        status: "Draft",
        lastUpdated: new Date().toISOString().split('T')[0],
        textContent: textContent,
        generatedBy: generatedBy || "AI Assistant",
        promptUsed: promptUsed || "N/A",
        description: `AI-generated template for ${templateName}`, 
        fileObject: null,
        originalFileName: null,
        contentLink: null,
    };
    aiGeneratedTemplates.push(newTemplate);
    console.log("Template saved (in-memory):", newTemplate.id, newTemplate.name);
    console.log("Current in-memory templates count:", aiGeneratedTemplates.length);
    res.status(201).json({ message: "Template saved successfully!", template: newTemplate });
});

app.get('/api/ai-templates', (req, res) => {
    console.log("Request received for /api/ai-templates");
    res.json(aiGeneratedTemplates);
});

app.post('/api/templates/download-pdf', async (req, res) => {
    console.log("Received request for PDF download");
    const { template, options = {} } = req.body;

    if (!template || !template.textContent) {
        return res.status(400).json({ error: "Template content is required" });
    }

    try {
        const doc = new PDFDocument({ margins: { top: 50, bottom: 50, left: 72, right: 72 }});
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${(template.name || 'template').replace(/[^a-z0-9]/gi, '_')}.pdf"`);
        doc.pipe(res);

        if (options.includeHeader !== false) {
            doc.fontSize(10).fillColor('#555').text('Central Bank Regulatory Template', { align: 'left' }).moveDown(0.5);
        }
        doc.fontSize(18).fillColor('#000').text(template.name, { align: 'center' }).moveDown(1);
        if (options.includeMetadata !== false) {
            doc.fontSize(9).fillColor('#333');
            const metaLine1 = `Type: ${template.type || 'N/A'}  |  Version: ${template.version || 'N/A'}  |  Status: ${template.status || 'N/A'}`;
            const metaLine2 = `Last Updated: ${template.lastUpdated || 'N/A'}  |  Generated By: ${template.generatedBy || 'N/A'}`;
            doc.text(metaLine1).text(metaLine2).moveDown(1);
        }
        doc.lineWidth(0.5).moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.x, doc.y).strokeColor('#ccc').stroke().moveDown(1);
        doc.fontSize(11).fillColor('#000');
        const isChecklist = template.type && (template.type.toLowerCase().includes('checklist') || template.textContent.includes('□') || template.textContent.includes('[ ]'));
        if (isChecklist) {
            const lines = template.textContent.split('\n');
            lines.forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('□') || trimmedLine.startsWith('[ ]') || trimmedLine.startsWith('- ')) {
                    doc.text(`☐ ${trimmedLine.replace(/^[\s□\[\]\-]+/, '').trim()}`, { indent: 20, lineGap: 4 });
                } else if (trimmedLine) {
                    doc.font('Helvetica-Bold').text(trimmedLine, { lineGap: 6 }).font('Helvetica');
                } else {
                    doc.moveDown(0.5); 
                }
            });
        } else {
            doc.text(template.textContent, { align: 'left', lineGap: 4 });
        }
        if (options.includeFooter !== false) {
            const pageCount = doc.bufferedPageRange().count;
            for (let i = 0; i < pageCount; i++) {
                doc.switchToPage(i);
                doc.fontSize(8).fillColor('#555').text(`Page ${i + 1} of ${pageCount}  |  Generated: ${new Date().toLocaleDateString()}`, 
                    doc.page.margins.left, doc.page.height - 40, 
                    { align: 'center', width: doc.page.width - doc.page.margins.left - doc.page.margins.right }
                );
            }
        }
        doc.end();
    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ error: "Failed to generate PDF" });
    }
});

app.post('/api/templates/download-docx', async (req, res) => {
    console.log("Received request for DOCX download");
    const { template, options = {} } = req.body;
    if (!template || !template.textContent) {
        return res.status(400).json({ error: "Template content is required" });
    }
    try {
        const children = [];
        if (options.includeHeader !== false) {
            children.push(new Paragraph({ text: "Central Bank Regulatory Template", alignment: "center", style: "Heading3", spacing: { after: 240 } }));
        }
        children.push(new Paragraph({ text: template.name, heading: HeadingLevel.HEADING_1, alignment: "center", spacing: { after: 360 } }));
        if (options.includeMetadata !== false) {
            children.push(new Paragraph({ children: [ new TextRun({ text: "Type: ", bold: true }), new TextRun(template.type || 'N/A'), new TextRun("  |  "), new TextRun({ text: "Version: ", bold: true }), new TextRun(template.version || 'N/A'), new TextRun("  |  "), new TextRun({ text: "Status: ", bold: true }), new TextRun(template.status || 'N/A'), ], spacing: { after: 120 }, style: "Caption"}));
            children.push(new Paragraph({ children: [ new TextRun({ text: "Last Updated: ", bold: true }), new TextRun(template.lastUpdated || 'N/A'), new TextRun("  |  "), new TextRun({ text: "Generated By: ", bold: true }), new TextRun(template.generatedBy || 'N/A'), ], spacing: { after: 240 }, style: "Caption"}));
        }
        const isChecklist = template.type && (template.type.toLowerCase().includes('checklist') || template.textContent.includes('□') || template.textContent.includes('[ ]'));
        if (isChecklist) {
            const lines = template.textContent.split('\n');
            lines.forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('□') || trimmedLine.startsWith('[ ]') || trimmedLine.startsWith('- ')) {
                    children.push(new Paragraph({ text: `☐ ${trimmedLine.replace(/^[\s□\[\]\-]+/, '').trim()}`, indent: { left: 720 }, spacing: { after: 80 } }));
                } else if (trimmedLine) {
                    children.push(new Paragraph({ text: trimmedLine, heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
                }
            });
        } else {
            template.textContent.split('\n').forEach(para => {
                if (para.trim()) { children.push(new Paragraph({ text: para.trim(), spacing: { after: 120 } }));
                } else { children.push(new Paragraph({text: ""})); }
            });
        }
        const doc = new Document({ creator: "RegulatorApp", title: template.name, description: template.description || "Generated regulatory template", styles: { paragraphStyles: [ { id: "Normal", name: "Normal", run: { size: 22, font: "Calibri" }, paragraph: { spacing: { after: 120 } } }, { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", run: { size: 32, bold: true }, paragraph: { spacing: { before: 240, after: 120 } } }, { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", run: { size: 26, bold: true }, paragraph: { spacing: { before: 200, after: 100 } } }, { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", run: { size: 24, bold: true, italics: true }, paragraph: { spacing: { before: 180, after: 80 } } }, { id: "Caption", name: "Caption", basedOn: "Normal", run: { size: 18, italics: true, color: "595959" } }, ] }, sections: [{ properties: {}, children: children }]});
        const buffer = await Packer.toBuffer(doc);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${(template.name || 'template').replace(/[^a-z0-9]/gi, '_')}.docx"`);
        res.send(buffer);
    } catch (error) {
        console.error("Error generating DOCX:", error);
        res.status(500).json({ error: "Failed to generate DOCX" });
    }
});

// ========================================================================
// 4. AI ANALYTICS AGENT ENDPOINT (PROMPT UPDATED FOR CHARTS)
// ========================================================================
app.post('/api/analytics/query', async (req, res) => {
    const { query } = req.body;
    console.log(`Received general analytics query: "${query}"`);

    if (!query) {
        return res.status(400).json({ error: "No query provided." });
    }
    if (Object.keys(dataCache).length === 0) { 
        console.warn("Data for general AI analytics has not been fully loaded yet. Query might be incomplete.");
    }

    let dataContext = '';
    for (const [name, data] of Object.entries(dataCache)) {
        if (data.length > 0) {
            const headers = Object.keys(data[0]).join(',');
            const rows = data.slice(0, 100).map(row => Object.values(row).join(',')).join('\n');
            dataContext += `\n--- Data from ${name}.csv (first 100 rows, loaded from ./scripts) ---\n${headers}\n${rows}\n`;
        }
    }

    const modelName = 'gemini-1.5-flash-latest';
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`;

    const metaPrompt = `
      You are an expert data analyst for a financial regulator.
      Your task is to answer the user's question based ONLY on the data provided below.
      The data is in CSV format. Do not use any external knowledge.
      Assume today's date is June 4, 2025.

      **Data Content:**
      ${dataContext}

      **Required Output Format:**
      You MUST respond with a single, valid JSON object and nothing else. Your response will be parsed as JSON.
      - For a single number or a short text answer, use: {"displayType": "scalar", "data": "Your calculated value or answer"}
      - For a list or table of results, use: {"displayType": "table", "data": {"headers": ["Header1", "Header2"], "rows": [["row1_val1", "row1_val2"], ["row2_val1", "row2_val2"]]}}
      - If the user asks for a chart (e.g., "show me a bar chart of X", "pie chart of Y"), use:
        {
          "displayType": "chart",
          "data": {
            "chartType": "bar", 
            "labels": ["Label A", "Label B", "Label C"], 
            "datasets": [
              {
                "label": "Dataset Name", 
                "data": [10, 20, 30],    
                "backgroundColor": ["rgba(255, 99, 132, 0.6)", "rgba(54, 162, 235, 0.6)", "rgba(255, 206, 86, 0.6)"],
                "borderColor": ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)", "rgba(255, 206, 86, 1)"],
                "borderWidth": 1
              }
            ],
            "options": { 
              "responsive": true,
              "plugins": {
                "legend": { "position": "top" },
                "title": { "display": true, "text": "Chart Title Suggested by AI" }
              }
            }
          }
        }

      If you cannot generate the requested data in the specified format, respond with:
      {"displayType": "scalar", "data": "I could not generate the data for that request in the required format."}

      **User Question:**
      "${query}"
    `;

    try {
        const response = await axios.post(geminiApiUrl, {
            contents: [{ parts: [{ text: metaPrompt }] }],
            generationConfig: {
                response_mime_type: "application/json",
            }
        });
        console.log("Received valid JSON response from Gemini API for general analytics query.");
        const responseData = response.data.candidates[0].content.parts[0].text;
        res.json(JSON.parse(responseData));

    } catch (error) {
        console.error("Error calling Gemini API for general analytics:", error.response ? (error.response.data.error ? error.response.data.error.message : error.response.data) : error.message);
        res.status(500).json({ error: "Failed to get response from AI service for general analytics." });
    }
});

// ========================================================================
// 5. SERVER STARTUP
// ========================================================================
app.get('/', (req, res) => {
  res.send('AI Backend Server is running! Both template and analytics endpoints are active.');
});

app.listen(PORT, () => {
  loadData().catch(err => { 
      console.error("FATAL: Failed to load data on startup for general AI. The general analytics agent might not work as expected.", err);
  });
  console.log(`AI Backend Server is listening on http://localhost:${PORT}`);
});