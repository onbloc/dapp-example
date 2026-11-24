import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

// Lets a desktop browser hand a request to a phone. Large payloads exceed QR capacity.
export const QrCode = ({ value }: { value: string }) => {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    QRCode.toString(value, { type: 'svg', margin: 1, errorCorrectionLevel: 'L', color: { dark: '#0b0d12', light: '#ffffff' } })
      .then(result => active && (setSvg(result), setError(null)))
      .catch(() => active && (setSvg(null), setError('This request is too large for a QR code. Use "Copy link" instead.')));
    return () => {
      active = false;
    };
  }, [value]);

  if (error) {
    return <p className="inline-error">{error}</p>;
  }

  return svg ? (
    <figure className="qr">
      <div dangerouslySetInnerHTML={{ __html: svg }} />
      <figcaption>Scan with the phone camera. The response returns to that phone&apos;s browser.</figcaption>
    </figure>
  ) : null;
};
