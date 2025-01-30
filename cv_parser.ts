import fs from "fs";
import pdfParse from "pdf-parse";

// Step 1: Read PDF and Extract Text
const parseCV = async (pdfPath: string) => {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(dataBuffer);
  const text = data.text;

  console.log("✅ Extracted Raw Text:\n", text);

  // Step 2: Extract Key Sections
  const sections = extractSections(text);
  console.log("✅ Parsed Resume Data:\n", JSON.stringify(sections, null, 2));
};

// Step 2: Extract Resume Sections with Improved Logic
const extractSections = (text: string) => {
  const sections: Record<string, string[]> = {
    education: [],
    experience: [],
    certifications: [],
    skills: [],
    projects: [],
    extracurricular: [],
  };

  const lines = text.split("\n").map((line) => line.trim()).filter(line => line !== "");

  let currentSection = "";
  let buffer: string[] = [];

  for (let line of lines) {
    if (/education/i.test(line)) {
      saveBuffer(sections, currentSection, buffer);
      currentSection = "education";
      buffer = [];
    } else if (/work experience/i.test(line)) {
      saveBuffer(sections, currentSection, buffer);
      currentSection = "experience";
      buffer = [];
    } else if (/certifications?/i.test(line)) {
      saveBuffer(sections, currentSection, buffer);
      currentSection = "certifications";
      buffer = [];
    } else if (/skills?/i.test(line)) {
      saveBuffer(sections, currentSection, buffer);
      currentSection = "skills";
      buffer = [];
    } else if (/projects?/i.test(line)) {
      saveBuffer(sections, currentSection, buffer);
      currentSection = "projects";
      buffer = [];
    } else if (/extracurricular|activities/i.test(line)) {
      saveBuffer(sections, currentSection, buffer);
      currentSection = "extracurricular";
      buffer = [];
    } else if (currentSection) {
      // 🔹 FIX: Remove bullet points and extra formatting issues
      line = line.replace(/^•\s*/, "").replace(/\s{2,}/g, " ");
      if (line !== "") buffer.push(line);
    }
  }

  // Save the last section
  saveBuffer(sections, currentSection, buffer);
  return sections;
};

// 🔹 Helper Function to Save Section Data
const saveBuffer = (sections: Record<string, string[]>, section: string, buffer: string[]) => {
  if (section && buffer.length > 0) {
    sections[section].push(...buffer);
  }
};

// Run Parser on Sample Resume
parseCV("sample_resume.pdf");
