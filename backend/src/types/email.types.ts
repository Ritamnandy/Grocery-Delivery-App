

type OrderEmailItem = {
    name: string;
    quantity: number;
    price: number; // unit price
};

type OrderConfirmedData = {
    toEmail: string;
    name?: string;
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
    toEmail: string;
    name?: string;
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


const QUEUE_NAME = 'EmailQueue'

enum MailJob
{
    Welcome = 'welcome',
    VerifyEmail = 'verify-email',
    ResetPassword = 'reset-password',
    PasswordChanged = 'password-changed',
    OrderConfirmed = 'order-confirmed',
    DeliveryConfirmed = 'delivery-confirmed',
}

interface MailPayloads
{
    [ MailJob.Welcome ]: WellcomeMail;
    [ MailJob.VerifyEmail ]: VerifyEmail;
    [ MailJob.ResetPassword ]: ResetPassword;
    [ MailJob.PasswordChanged ]: ChangedPasswordConfirmation;
    [ MailJob.OrderConfirmed ]: OrderConfirmedData;
    [ MailJob.DeliveryConfirmed ]: DeliveryConfirmedData;
}

interface MailContent
{
    to: string;
    subject: string;
    html: string;
}

export type {
    OrderEmailItem,
    OrderConfirmedData,
    DeliveryConfirmedData,
    WellcomeMail,
    VerifyEmail,
    ResetPassword,
    ChangedPasswordConfirmation,
    MailContent,
    MailPayloads
}

export
{
    QUEUE_NAME,
    MailJob
}