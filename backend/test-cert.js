// test-cert.js
const { generateCertificate } = require("./services/certificate.service");
const fs = require("fs");

async function test() {
  console.log("Testing certificate generation...");

  // Test with current date
  const pdfBuffer = await generateCertificate({
    userName: "Ahmed Mohamed",
    courseTitle: "Clinical Nutrition Course",
    completionDate: new Date(), // Pass as Date object
    instructorName: "Dr. Ahmed Elkhateeb",
  });

  fs.writeFileSync("certificate.pdf", pdfBuffer);
  console.log("✅ Certificate saved to: certificate.pdf");
  console.log("File size:", pdfBuffer.length, "bytes");

  // Test with specific date
  const pdfBuffer2 = await generateCertificate({
    userName: "Sara Ali",
    courseTitle: "Advanced Nutrition Course",
    completionDate: "2024-01-15", // String format also works
    instructorName: "Dr. Ahmed Elkhateeb",
  });

  fs.writeFileSync("certificate2.pdf", pdfBuffer2);
  console.log("✅ Second certificate saved to: certificate2.pdf");
}

test().catch(console.error);
