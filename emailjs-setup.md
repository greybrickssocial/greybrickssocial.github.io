# Contact form → Email — setup guide

The form on `contact.html` now sends mail through **EmailJS** (no backend, works
on GitHub Pages and Hostinger). Submitter's details arrive as a formatted email at
your address, with one-tap Reply straight to the visitor.

## How it fits together

| File            | Role                                                                |
| --------------- | ------------------------------------------------------------------- |
| `js/config.js`  | Your credentials + recipient address. **The only file you edit.**   |
| `contact.html`  | Form markup, field `name`s = template variable names.               |
| `js/main.js`    | Validation, spam trap, loading/success/error states, the send call. |
| `css/style.css` | Styling for invalid fields and the status message.                  |

---

## Step 1 — Create the account

1. Go to <https://www.emailjs.com/> → **Sign Up Free**.
2. Verify your email address when prompted.
3. Free tier allows **200 emails/month**. That is per account, and every enquiry
   costs one send.

## Step 2 — Connect your mailbox (Email Services)

1. Dashboard → **Email Services** → **Add New Service**.
2. Pick your provider:
   - **Gmail** → sign in with the address that should receive enquiries.
   - **Outlook / Hotmail / Yahoo / Office 365** → choose the provider, sign in.
   - **Other SMTP / custom domain mail** → choose **SMTP** and enter
     `smtp.yourhost.com`, port `465` (SSL) or `587` (STARTTLS), username =
     full email address, password = the mailbox password or app password.
3. **Save**, then copy the **Service ID** shown on the card (looks like
   `service_abc123`). You need it in step 6.

> If you use Hostinger mail, use the **SMTP** option, not a provider preset.

## Step 3 — Create the email template

1. Dashboard → **Email Templates** → **Create New Template**.
2. Select your service from Step 2, then copy the HTML in the section at the
   bottom of this file and paste it into the editor (strip the surrounding
   ` ```html ` fences).
3. Click **Save**.

## Step 4 — Template settings

With the template open, in the **Settings** panel:

| Field        | Value                                             |
| ------------ | ------------------------------------------------- |
| Subject Line | `{{email_subject}}`                               |
| To Email     | your enquiry address, e.g. `sales@yourdomain.com` |
| From Name    | `Grey Bricks Website`                             |
| From Email   | leave as the service default                      |
| Reply To     | `{{email}}`                                       |
| Auto-Reply   | see note below                                    |

Then click **Advanced Settings → Security** and add the template variables the
editor may have missed: `fullname`, `mobile`, `email`, `project`,
`enquiry_type`, `message`, `submitted_at`, `source_page`, `email_subject`,
`recipient`, `company_website`. None of them need to be marked required.

**Auto-Reply note:** EmailJS sends the _same_ template to the visitor, and its
templates support no conditional logic, so you cannot have two different bodies
in one template. Leave Auto-Reply off initially; turn it on later if you accept
receiving the enquiry card as the visitor's confirmation.

## Step 5 — Copy your Public Key

1. Dashboard → **Account** → **General**.
2. Copy the **Public Key** (starts with `user_`).

## Step 6 — Lock it to your domains (do this before going live)

1. **Account** → **Security** → **Domain Restrictions**.
2. Add one entry per domain you serve the site from:

   ```
   https://greybrickssocial.github.io
   https://www.yourdomain.com
   https://yourdomain.com
   ```

3. Leave the list non-empty. An empty list means _anyone_ can use your key to
   send mail as you.

When you move to Hostinger, add that domain here too. Both can be active at once.

## Step 7 — Fill in `js/config.js`

```js
emailjsPublicKey: 'user_XXXXXXX',
emailjsServiceId: 'service_abc123',
emailjsTemplateId: 'template_xyz789',
contactEmail:    'sales@yourdomain.com',
```

`contactEmail` is only informational in the email; the real destination is the
template's **To Email** field in Step 4.

## Step 8 — Deploy and test

1. Commit and push.
2. Submit the form with a real address you can read.
3. Confirm you got the email and that **Reply** goes to the visitor.
4. Check the spam folder once — mark it as not spam so future mail is not
   filtered.

## Step 9 — After moving to Hostinger

1. Upload the folder as the site's document root (`public_html`).
2. HTTPS is required — enable the free SSL certificate in hPanel.
3. Add the Hostinger domain to Domain Restrictions (Step 6).
4. Update the `To Email` in the template if the address changed.

---

## What the code does

- **Validation** — name ≥ 3 chars, phone 7–15 digits, real email shape, message
  ≥ 10 chars. Failures highlight the field and show a message under the button.
- **Spam trap** — an off-screen `company_website` field. Bots fill it, humans
  never see it; when it is filled the form shows success and sends nothing.
- **Project pre-fill** — project cards link to `contact.html?project=Time+Square`,
  and the dropdown now selects that project automatically.
- **Context** — each email carries the submission timestamp and the page the
  visitor came from.
- **Failure behaviour** — if EmailJS is unreachable or the key is missing, the
  visitor is told to phone instead, and the error is logged to the console.

## Field → template variable map

| Form field         | Template variable                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| Full Name          | `{{fullname}}`                                                                                  |
| Mobile Number      | `{{mobile}}`                                                                                    |
| Email              | `{{email}}`                                                                                     |
| Interested Project | `{{project}}`                                                                                   |
| Message            | `{{message}}`                                                                                   |
| — (computed)       | `{{enquiry_type}}`, `{{email_subject}}`, `{{submitted_at}}`, `{{source_page}}`, `{{recipient}}` |

---

## Email template HTML

Paste this into the EmailJS template editor.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New enquiry</title>
  </head>
  <body style="margin:0; padding:0; background:#efebe1;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
      New enquiry from {{fullname}} about {{enquiry_type}}
    </div>
    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="background:#efebe1; padding:24px 12px;"
    >
      <tr>
        <td align="center">
          <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="max-width:640px; background:#ffffff; border:1px solid rgba(34,31,27,0.12);"
          >
            <!-- header -->
            <tr>
              <td
                style="background:#221f1b; padding:28px 32px; border-top:4px solid #a9814a;"
              >
                <p
                  style="margin:0 0 6px; font-family:Helvetica,Arial,sans-serif; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#c39b5e;"
                >
                  New enquiry
                </p>
                <h1
                  style="margin:0; font-family:Helvetica,Arial,sans-serif; font-size:22px; line-height:1.3; color:#f6f4ee; font-weight:700;"
                >
                  {{enquiry_type}}
                </h1>
              </td>
            </tr>

            <!-- quick actions -->
            <tr>
              <td style="padding:20px 32px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td
                      style="background:#a9814a; border-radius:3px; padding:11px 22px; font-family:Helvetica,Arial,sans-serif; font-size:14px; font-weight:700;"
                    >
                      <a
                        href="mailto:{{email}}?subject=Re:%20{{email_subject}}"
                        style="color:#141210; text-decoration:none;"
                        >Reply to {{fullname}}</a
                      >
                    </td>
                    <td style="width:10px;"></td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- details -->
            <tr>
              <td style="padding:24px 32px 0;">
                <table
                  role="presentation"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  style="border-top:1px solid rgba(34,31,27,0.12);"
                >
                  <tr>
                    <td
                      width="130"
                      style="padding:14px 12px 14px 0; border-bottom:1px solid rgba(34,31,27,0.08); font-family:Helvetica,Arial,sans-serif; font-size:11px; letter-spacing:1.2px; text-transform:uppercase; color:#8b8477;"
                    >
                      Name
                    </td>
                    <td
                      style="padding:14px 0; border-bottom:1px solid rgba(34,31,27,0.08); font-family:Helvetica,Arial,sans-serif; font-size:15px; color:#141210; font-weight:700;"
                    >
                      {{fullname}}
                    </td>
                  </tr>
                  <tr>
                    <td
                      width="130"
                      style="padding:14px 12px 14px 0; border-bottom:1px solid rgba(34,31,27,0.08); font-family:Helvetica,Arial,sans-serif; font-size:11px; letter-spacing:1.2px; text-transform:uppercase; color:#8b8477;"
                    >
                      Mobile
                    </td>
                    <td
                      style="padding:14px 0; border-bottom:1px solid rgba(34,31,27,0.08); font-family:Helvetica,Arial,sans-serif; font-size:15px; color:#141210;"
                    >
                      <a
                        href="tel:{{mobile}}"
                        style="color:#a9814a; text-decoration:none; font-weight:700;"
                        >{{mobile}}</a
                      >
                    </td>
                  </tr>
                  <tr>
                    <td
                      width="130"
                      style="padding:14px 12px 14px 0; border-bottom:1px solid rgba(34,31,27,0.08); font-family:Helvetica,Arial,sans-serif; font-size:11px; letter-spacing:1.2px; text-transform:uppercase; color:#8b8477;"
                    >
                      Email
                    </td>
                    <td
                      style="padding:14px 0; border-bottom:1px solid rgba(34,31,27,0.08); font-family:Helvetica,Arial,sans-serif; font-size:15px;"
                    >
                      <a
                        href="mailto:{{email}}"
                        style="color:#a9814a; text-decoration:none;"
                        >{{email}}</a
                      >
                    </td>
                  </tr>
                  <tr>
                    <td
                      width="130"
                      style="padding:14px 12px 14px 0; border-bottom:1px solid rgba(34,31,27,0.08); font-family:Helvetica,Arial,sans-serif; font-size:11px; letter-spacing:1.2px; text-transform:uppercase; color:#8b8477;"
                    >
                      Project
                    </td>
                    <td
                      style="padding:14px 0; border-bottom:1px solid rgba(34,31,27,0.08); font-family:Helvetica,Arial,sans-serif; font-size:15px; color:#141210;"
                    >
                      {{enquiry_type}}
                    </td>
                  </tr>
                  <tr>
                    <td
                      width="130"
                      style="padding:14px 12px 14px 0; border-bottom:1px solid rgba(34,31,27,0.08); font-family:Helvetica,Arial,sans-serif; font-size:11px; letter-spacing:1.2px; text-transform:uppercase; color:#8b8477;"
                    >
                      Received
                    </td>
                    <td
                      style="padding:14px 0; border-bottom:1px solid rgba(34,31,27,0.08); font-family:Helvetica,Arial,sans-serif; font-size:15px; color:#141210;"
                    >
                      {{submitted_at}}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- message -->
            <tr>
              <td style="padding:24px 32px 0;">
                <p
                  style="margin:0 0 8px; font-family:Helvetica,Arial,sans-serif; font-size:11px; letter-spacing:1.2px; text-transform:uppercase; color:#8b8477;"
                >
                  Message
                </p>
                <table
                  role="presentation"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  style="background:#f6f4ee; border-left:3px solid #a9814a;"
                >
                  <tr>
                    <td
                      style="padding:18px 20px; font-family:Helvetica,Arial,sans-serif; font-size:15px; line-height:1.6; color:#221f1b;"
                    >
                      {{message}}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- footer -->
            <tr>
              <td style="padding:26px 32px 32px;">
                <p
                  style="margin:0 0 4px; font-family:Helvetica,Arial,sans-serif; font-size:12px; color:#8b8477;"
                >
                  Sent from the Grey Bricks website contact form.
                </p>
              </td>
            </tr>
          </table>

          <p
            style="max-width:640px; margin:16px auto 0; font-family:Helvetica,Arial,sans-serif; font-size:11px; line-height:1.6; color:#8b8477; text-align:center;"
          >
            Grey Bricks — Kolhapur &amp; Pune<br />
            +91 91727 32323
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
```
