export interface PayableOrder {
  id: string;
  amount: number;
  currency: "CLP";
}

export interface OrderLookupPort {
  getPayableOrder(orderId: string): Promise<PayableOrder | null>;
}
