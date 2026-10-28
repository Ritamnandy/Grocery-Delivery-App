
// ---------- Brand (matches the InstantMart site) ----------

import type { DeliveryConfirmedData, OrderConfirmedData } from "../types/email.types.js";

// If your Tailwind tokens (app-green, app-orange, app-cream) use different hex values, paste them here.
const APP_NAME = 'InstantMart';
const APP_URL = process.env.APP_URL;
const SUPPORT_EMAIL = 'support@instantmart.com';

const GREEN = '#1f3d2b'; // app-green
const ORANGE = '#f97316'; // app-orange
const ORANGE_DARK = '#ea580c'; // app-orange-dark
const CREAM = '#faf7f2'; // app-cream (page background)
const BORDER = '#ebe6dc'; // app-border
const TEXT = '#374151';
const TEXT_LIGHT = '#6b7280';
const SUCCESS = '#16a34a';

const FONT = `'Outfit',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif`;

export const escapeHtml = ( value = '' ): string =>
    value
        .replace( /&/g, '&amp;' )
        .replace( /</g, '&lt;' )
        .replace( />/g, '&gt;' )
        .replace( /"/g, '&quot;' )
        .replace( /'/g, '&#39;' );

const money = ( amount: number, currency = '$' ) => `${ currency }${ amount.toFixed( 2 ) }`;

const shortId = ( id: string ) => id.slice( -8 ).toUpperCase(); // same format as the site: #98D67DAC

const formatDate = ( value: string | Date ) =>
    new Date( value ).toLocaleDateString( 'en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    } );

// ---------- Building blocks ----------

const button = ( href: string, label: string, color = ORANGE ) => `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0;">
    <tr>
      <td align="center" bgcolor="${ color }" style="border-radius:12px;">
        <a href="${ escapeHtml( href ) }" target="_blank"
           style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;
                  color:#ffffff;text-decoration:none;border-radius:12px;">
          ${ label }
        </a>
      </td>
    </tr>
  </table>`;

// single-code box for OTPs (verify email)
const otpBox = ( otp: string ) => `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:28px 0;">
    <tr>
      <td align="center" style="background:${ CREAM };border:1px dashed ${ ORANGE };border-radius:12px;padding:20px;">
        <span style="font-family:'Courier New',monospace;font-size:34px;font-weight:700;
                     letter-spacing:10px;color:${ GREEN };">${ otp }</span>
      </td>
    </tr>
  </table>`;

// one green tile per digit, like the Delivery OTP card on the tracking page
const otpDigits = ( otp: string ) => `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:14px 0 0;">
    <tr>
      ${ otp
        .split( '' )
        .map(
            ( d ) => `<td align="center" width="40" height="44"
              style="background:${ GREEN };border-radius:10px;color:#ffffff;font-size:20px;font-weight:700;
                     font-family:'Courier New',monospace;">${ escapeHtml( d ) }</td><td width="6"></td>`,
        )
        .join( '' ) }
    </tr>
  </table>`;

const pill = ( text: string, bg: string, color: string ) =>
    `<span style="display:inline-block;padding:5px 14px;border-radius:999px;background:${ bg };color:${ color };
                  font-size:12px;font-weight:600;">${ text }</span>`;

const badge = ( symbol: string, bg: string ) => `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 20px;">
    <tr>
      <td align="center" width="72" height="72" bgcolor="${ bg }"
          style="border-radius:36px;color:#ffffff;font-size:34px;font-weight:700;line-height:72px;">${ symbol }</td>
    </tr>
  </table>`;

const infoRow = ( label: string, value: string ) => `
  <tr>
    <td style="padding:8px 0;font-size:14px;color:${ TEXT_LIGHT };">${ label }</td>
    <td align="right" style="padding:8px 0;font-size:14px;font-weight:600;color:${ GREEN };">${ value }</td>
  </tr>`;

const card = ( inner: string ) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0;">
    <tr>
      <td style="background:${ CREAM };border-radius:12px;padding:16px 18px;">${ inner }</td>
    </tr>
  </table>`;

const layout = ( title: string, preheader: string, content: string ) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${ escapeHtml( title ) }</title>
</head>
<body style="margin:0;padding:0;background:${ CREAM };font-family:${ FONT };">
  <!-- Hidden preheader text shown in inbox preview -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${ escapeHtml( preheader ) }</div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${ CREAM };padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
               style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;
                      box-shadow:0 2px 12px rgba(31,61,43,0.08);">
          <!-- Header -->
          <tr>
            <td align="center" bgcolor="${ GREEN }" style="background:${ GREEN };padding:28px 24px;">
              <span style="font-size:26px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">
                Instant<span style="color:#fdba74;">Mart</span>
              </span>
              <div style="margin-top:4px;font-size:12px;color:rgba(255,255,255,0.65);letter-spacing:1px;">
                FRESH GROCERIES, DELIVERED
              </div>
            </td>
          </tr>
          <!-- Orange accent line -->
          <tr><td height="4" bgcolor="${ ORANGE }" style="font-size:0;line-height:0;">&nbsp;</td></tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;color:${ TEXT };font-size:15px;line-height:1.65;">
              ${ content }
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid ${ BORDER };color:#9ca3af;font-size:12px;line-height:1.7;text-align:center;">
              Need help? Contact us at
              <a href="mailto:${ SUPPORT_EMAIL }" style="color:${ ORANGE_DARK };text-decoration:none;">${ SUPPORT_EMAIL }</a><br />
              <a href="${ APP_URL }" style="color:#9ca3af;text-decoration:underline;">${ APP_NAME }</a>
              &middot; &copy; ${ new Date().getFullYear() } ${ APP_NAME }. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const h1 = ( text: string ) =>
    `<h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:${ GREEN };">${ text }</h1>`;
const p = ( text: string ) => `<p style="margin:0 0 16px;">${ text }</p>`;
const muted = ( text: string ) =>
    `<p style="margin:0;font-size:13px;color:${ TEXT_LIGHT };">${ text }</p>`;

// ---------- Account templates ----------

const welcomeTemplate = ( name?: string ) =>
    layout(
        `Welcome to ${ APP_NAME }`,
        `Your account is ready. Welcome aboard!`,
        `${ h1( `Welcome, ${ escapeHtml( name ) || 'there' }! 🎉` ) }
     ${ p( `Thanks for joining <strong style="color:${ GREEN };">${ APP_NAME }</strong>. Your account is ready, so you can start filling your basket with farm-fresh groceries right away.` ) }
     ${ p( `If you have any questions, just reply to this email. We're happy to help.` ) }
     ${ button( `${ APP_URL }/products`, 'Start shopping' ) }`,
    );

const verifyEmailTemplate = (
    otp: string,
    name?: string,
    expiresInMinutes = 10,
) =>
    layout(
        'Verify your email',
        `Your verification code is ${ otp }`,
        `${ h1( 'Verify your email address' ) }
     ${ p( `Hi ${ escapeHtml( name ) || 'there' },` ) }
     ${ p( `Use the code below to verify your email address. It expires in <strong>${ expiresInMinutes } minutes</strong>.` ) }
     ${ otpBox( escapeHtml( otp ) ) }
     ${ muted( `Never share this code with anyone. If you didn't create an account, you can safely ignore this email.` ) }`,
    );



const resetPasswordTemplate = (
    link: string,
    name?: string,
    expiresInMinutes = 15,
) =>
    layout(
        'Reset your password',
        `Use this link to reset your password`,
        `${ h1( 'Reset your password' ) }
     ${ p( `Hi ${ escapeHtml( name ) || 'there' },` ) }
     ${ p( `We received a request to reset your password. Click the button below to choose a new one. This link expires in <strong>${ expiresInMinutes } minutes</strong>.` ) }
     ${ button( link, 'Reset Password' ) }
     ${ muted( `If the button doesn't work, copy and paste this link into your browser:<br />
       <a href="${ escapeHtml( link ) }" style="color:${ ORANGE_DARK };word-break:break-all;">${ escapeHtml( link ) }</a>` ) }
     <p style="margin:24px 0 0;font-size:13px;color:${ TEXT_LIGHT };">If you didn't request this, you can safely ignore this email. Your password won't change.</p>`,
    );




const passwordChangedTemplate = ( name?: string ) =>
    layout(
        'Your password was changed',
        `Your password was just changed`,
        `${ h1( 'Password changed successfully' ) }
     ${ p( `Hi ${ escapeHtml( name ) || 'there' },` ) }
     ${ p( `This is a confirmation that the password for your ${ APP_NAME } account was just changed.` ) }
     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0;">
       <tr>
         <td style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:4px;padding:14px 16px;font-size:14px;color:#991b1b;">
           <strong>Didn't do this?</strong> Contact us immediately at
           <a href="mailto:${ SUPPORT_EMAIL }" style="color:#991b1b;">${ SUPPORT_EMAIL }</a>
           so we can secure your account.
         </td>
       </tr>
     </table>`,
    );

// ---------- Order templates ----------


// Sent when the order is placed
const orderConfirmedTemplate = ( data: OrderConfirmedData, name?: string ) =>
{
    const c = data.currency ?? '$';
    const orderUrl = `${ APP_URL }/myorders/${ data.orderId }`;

    const itemRows = data.items
        .map(
            ( it ) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid ${ BORDER };font-size:14px;color:${ TEXT };">
          ${ escapeHtml( it.name ) }
          <span style="color:${ TEXT_LIGHT };"> &times; ${ it.quantity }</span>
        </td>
        <td align="right" style="padding:12px 0;border-bottom:1px solid ${ BORDER };font-size:14px;font-weight:600;color:${ GREEN };">
          ${ money( it.price * it.quantity, c ) }
        </td>
      </tr>`,
        )
        .join( '' );

    const addr = data.address;

    return layout(
        'Your order is confirmed',
        `Order #${ shortId( data.orderId ) } is confirmed. We're getting it ready!`,
        `${ badge( '&#10003;', SUCCESS ) }
     <div style="text-align:center;">
       ${ h1( 'Order confirmed! 🎉' ) }
       ${ pill( `Order #${ shortId( data.orderId ) }`, '#e8f1ec', GREEN ) }
     </div>
     <p style="margin:20px 0 16px;text-align:center;">
       Hi ${ escapeHtml( name ) || 'there' }, thanks for your order! We're packing your groceries and a delivery partner will be on the way soon.
     </p>

     <!-- Items -->
     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:8px;">
       ${ itemRows }
     </table>

     <!-- Totals -->
     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:8px;">
       ${ infoRow( 'Subtotal', money( data.subtotal, c ) ) }
       ${ infoRow(
            'Delivery',
            data.deliveryFee > 0
                ? money( data.deliveryFee, c )
                : `<span style="color:${ SUCCESS };">Free</span>`,
        ) }
       ${ infoRow( 'Tax', money( data.tax, c ) ) }
       <tr>
         <td style="padding:12px 0 0;border-top:1px solid ${ BORDER };font-size:16px;font-weight:700;color:${ GREEN };">Total</td>
         <td align="right" style="padding:12px 0 0;border-top:1px solid ${ BORDER };font-size:18px;font-weight:700;color:${ GREEN };">
           ${ money( data.total, c ) }
         </td>
       </tr>
     </table>

     <!-- Address -->
     ${ card( `
       <div style="font-size:12px;font-weight:700;letter-spacing:0.5px;color:${ TEXT_LIGHT };text-transform:uppercase;margin-bottom:6px;">
         Delivering to
       </div>
       <div style="font-size:14px;color:${ TEXT };line-height:1.6;">
         <strong style="color:${ GREEN };">${ escapeHtml( addr.label ) }</strong><br />
         ${ escapeHtml( addr.address ) }<br />
         ${ escapeHtml( addr.city ) }, ${ escapeHtml( addr.state ) } ${ escapeHtml( addr.zip ) }
       </div>` ) }

     ${ data.deliveryOtp
            ? card( `
       <div style="font-size:12px;font-weight:700;letter-spacing:0.5px;color:${ TEXT_LIGHT };text-transform:uppercase;">
         Delivery OTP
       </div>
       <div style="font-size:13px;color:${ TEXT_LIGHT };margin-top:2px;">Share this with your delivery partner when your order arrives.</div>
       ${ otpDigits( data.deliveryOtp ) }` )
            : '' }

     <div style="text-align:center;">
       ${ button( orderUrl, 'Track your order' ) }
     </div>
     ${ muted( `Questions about your order? Just reply to this email.` ) }`,
    );
};



// Sent when the order status becomes "Delivered"
const deliveryConfirmedTemplate = ( data: DeliveryConfirmedData, name?: string ) =>
{
    const c = data.currency ?? '$';
    const orderUrl = `${ APP_URL }/myorders/${ data.orderId }`;

    return layout(
        'Your order was delivered',
        `Order #${ shortId( data.orderId ) } has been delivered. Enjoy!`,
        `${ badge( '&#10003;', GREEN ) }
     <div style="text-align:center;">
       ${ h1( 'Delivered! Enjoy your groceries 🥬' ) }
       ${ pill( 'Delivered', '#dcfce7', SUCCESS ) }
     </div>
     <p style="margin:20px 0 4px;text-align:center;">
       Hi ${ escapeHtml( name ) || 'there' }, your order has been delivered successfully. We hope everything is fresh and just right.
     </p>

     ${ card( `
       <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
         ${ infoRow( 'Order', `#${ shortId( data.orderId ) }` ) }
         ${ infoRow( 'Delivered on', escapeHtml( formatDate( data.deliveredAt ) ) ) }
         ${ data.partnerName ? infoRow( 'Delivered by', escapeHtml( data.partnerName ) ) : '' }
         ${ data.itemCount ? infoRow( 'Items', String( data.itemCount ) ) : '' }
         ${ infoRow( 'Total paid', money( data.total, c ) ) }
       </table>` ) }

     <div style="text-align:center;">
       ${ button( orderUrl, 'View order details', GREEN ) }
       <a href="${ APP_URL }/products" style="font-size:14px;font-weight:600;color:${ ORANGE_DARK };text-decoration:none;">
         Shop again &rarr;
       </a>
     </div>

     <p style="margin:28px 0 0;font-size:13px;color:${ TEXT_LIGHT };text-align:center;">
       Something missing or not right? Contact us at
       <a href="mailto:${ SUPPORT_EMAIL }" style="color:${ ORANGE_DARK };">${ SUPPORT_EMAIL }</a>
       and we'll make it right.
     </p>`,
    );
};

export
{
    welcomeTemplate,
    verifyEmailTemplate,
    resetPasswordTemplate,
    passwordChangedTemplate,
    orderConfirmedTemplate,
    deliveryConfirmedTemplate,
};
