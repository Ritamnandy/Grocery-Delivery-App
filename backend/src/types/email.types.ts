

type OrderEmailItem = {
    name: string;
    quantity: number;
    price: number; // unit price
};

type OrderConfirmedData = {
    orderId: string;
    items: OrderEmailItem[];
    subtotal: number;
    deliveryFee: number;
    tax: number;
    total: number;
    address: { label: string; address: string; city: string; state: string; zip: string };
    deliveryOtp?: string;
    currency?: string;
}


type DeliveryConfirmedData = {
    orderId: string;
    deliveredAt: string | Date;
    total: number;
    partnerName?: string;
    itemCount?: number;
    currency?: string;
}


type WellcomeMail = {
    toEmail: string;
    name: string;

};

type VerifyEmail = {
    toEmail: string;
    name: string
    otp: string;
};

type ResetPassword = {
    toEmail: string;
    name: string
    link: string;
};

type ChangedPasswordConfirmation = {
    toEmail: string;
    name: string
};

export type {
    OrderEmailItem,
    OrderConfirmedData,
    DeliveryConfirmedData,
    WellcomeMail,
    VerifyEmail,
    ResetPassword,
    ChangedPasswordConfirmation
}