import QRCode from 'qrcode';

export function qrPng(text: string, width = 480): Promise<Buffer> {
  return QRCode.toBuffer(text, { type: 'png', errorCorrectionLevel: 'M', margin: 2, width, color: { dark: '#000000', light: '#ffffff' } });
}
