export interface PayableOrder {
  id: string;
  orderNumber: string;
  amount: number;
  currency: "CLP";
  customerEmail: string;
}

export interface OrderLookupPort {
  getPayableOrder(orderId: string): Promise<PayableOrder | null>;
}
