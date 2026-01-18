export interface PdfOptions {
  margin?: number | [number, number] | [number, number, number, number];

  filename?: string;

  image?: {
    type?: 'jpeg' | 'png' | 'webp';
    quality?: number;
  };

  html2canvas?: {
    scale?: number;
    useCORS?: boolean;
  };

  jsPDF?: {
    unit?: 'pt' | 'mm' | 'cm' | 'in';
    format?: string | [number, number];
    orientation?: 'portrait' | 'landscape';
  };
}
