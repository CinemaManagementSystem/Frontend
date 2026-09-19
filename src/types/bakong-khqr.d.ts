declare module 'bakong-khqr' {
  export const khqrData: {
    currency: {
      usd: number;
      khr: number;
    };
  };

  export class IndividualInfo {
    constructor(
      bakongAccountId: string,
      merchantName: string,
      merchantCity: string,
      optional?: {
        currency?: number;
        amount?: number;
        billNumber?: string;
        storeLabel?: string;
        terminalLabel?: string;
        expirationTimestamp?: number;
        merchantCategoryCode?: string;
      },
    );
  }

  export class BakongKHQR {
    generateIndividual(info: IndividualInfo): {
      status?: { code: number; message?: string | null };
      data?: {
        qr?: string;
        md5?: string;
      };
    };
  }
}
