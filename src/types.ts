/**
 * ZATCA TLV Encoding Utility
 */
export function generateZatcaQRData(
  sellerName: string,
  vatNumber: string,
  dateTime: string,
  totalWithVat: string,
  vatAmount: string
): string {
  function createTLV(tag: number, value: string): Uint8Array {
    const encoder = new TextEncoder();
    const valueBytes = encoder.encode(value);
    const length = valueBytes.length;
    const buffer = new Uint8Array(2 + length);
    buffer[0] = tag;
    buffer[1] = length;
    buffer.set(valueBytes, 2);
    return buffer;
  }

  const tlv1 = createTLV(1, sellerName);
  const tlv2 = createTLV(2, vatNumber);
  const tlv3 = createTLV(3, dateTime);
  const tlv4 = createTLV(4, totalWithVat);
  const tlv5 = createTLV(5, vatAmount);

  const totalLength = tlv1.length + tlv2.length + tlv3.length + tlv4.length + tlv5.length;
  const combinedBuffer = new Uint8Array(totalLength);
  let offset = 0;
  combinedBuffer.set(tlv1, offset); offset += tlv1.length;
  combinedBuffer.set(tlv2, offset); offset += tlv2.length;
  combinedBuffer.set(tlv3, offset); offset += tlv3.length;
  combinedBuffer.set(tlv4, offset); offset += tlv4.length;
  combinedBuffer.set(tlv5, offset);

  let binaryString = '';
  combinedBuffer.forEach(byte => {
    binaryString += String.fromCharCode(byte);
  });
  return btoa(binaryString);
}

export interface Company {
  id: string;
  nameAr: string;
  nameEn: string;
  vat: string;
  address: string;
  postal: string;
  cr: string;
  logo: string;
  currency: string;
  email?: string;
  phone?: string;
}

export interface Contact {
  id: string;
  companyId: string;
  name: string;
  vat: string;
  cr: string;
  address: string;
  phone: string;
  email: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  unit: string;
  price: number;
  tax: number;
}

export interface InvoiceItem {
  id: string;
  name: string;
  sku: string;
  qty: number;
  unit: string;
  price: number;
  discount: number;
  tax: number;
}

export interface Invoice {
  id: string;
  companyId: string;
  companyName: string;
  contactId?: string;
  contactName?: string;
  invoiceNumber: string;
  date: string;
  time: string;
  items: InvoiceItem[];
  subtotalBefore: number;
  discountValue: number;
  discountType: 'fixed' | 'percentage';
  afterDiscount: number;
  tax: number;
  total: number;
  qrData: string;
  signature?: string;
  currency: string;
  invoiceType: 'simple' | 'complex';
  options: {
    poNumber?: string;
    dueDate?: string;
    purchaseDate?: string;
    deliveryDate?: string;
    period?: string;
    reference?: string;
  };
}

export interface RecurringInvoice {
  id: string;
  companyId: string;
  contactId?: string;
  invoiceNumber: string;
  amount: number;
  frequency: 'daily' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  lastGenerated?: string;
}
