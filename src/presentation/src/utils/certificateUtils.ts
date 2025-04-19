import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Generates and downloads a course completion certificate
 * @param containerElementId The ID of the certificate container element
 * @param fileName The name of the PDF file to download
 */
export const generateCertificatePDF = async (
  containerElementId: string,
  fileName: string = 'certificate.pdf'
): Promise<void> => {
  try {
    const certificateElement = document.getElementById(containerElementId);
    
    if (!certificateElement) {
      throw new Error(`Element with ID "${containerElementId}" not found`);
    }
    
    // Wait for fonts and images to load
    await document.fonts.ready;
    
    // Create canvas from the certificate element
    const canvas = await html2canvas(certificateElement, {
      scale: 2, // Higher resolution
      useCORS: true, // Allow loading images from other domains
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    // Calculate dimensions to maintain aspect ratio
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Add the canvas as an image
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // Save the PDF
    pdf.save(fileName);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating certificate PDF:', error);
    return Promise.reject(error);
  }
};

/**
 * Format a date for display in the certificate
 * @param date Date to format
 * @returns Formatted date string (e.g., "15th August, 2023")
 */
export const formatCertificateDate = (date: Date | string): string => {
  const d = new Date(date);
  
  // Get day with suffix (1st, 2nd, 3rd, etc.)
  const day = d.getDate();
  const suffix = getDaySuffix(day);
  
  // Get month name and year
  const month = d.toLocaleString('default', { month: 'long' });
  const year = d.getFullYear();
  
  return `${day}${suffix} ${month}, ${year}`;
};

/**
 * Get the suffix for a day number (st, nd, rd, th)
 */
const getDaySuffix = (day: number): string => {
  if (day > 3 && day < 21) return 'th';
  
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}; 