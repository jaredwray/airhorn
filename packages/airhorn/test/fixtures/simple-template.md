---
name: simple-template
from: me@you.com
subject: Welcome to Our Service
requiredFields: firstName
---
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Welcome to Our Service</title>
  </head>
  <body style="font-family: Arial, sans-serif; background: #f9fafb; margin: 0; padding: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding: 40px 0;">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="background: #ffffff; border-radius: 8px; padding: 24px;">
            <tr>
              <td align="center" style="padding-bottom: 20px;">
                <h1 style="margin: 0; font-size: 24px; color: #111827;">Welcome, <%= firstName %> <%= lastName %>!</h1>
              </td>
            </tr>
            <tr>
              <td style="font-size: 16px; color: #374151; padding-bottom: 24px;">
                <p style="margin: 0;">We’re excited to have you on board. You can log in to your account using the button below:</p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom: 24px;">
                <a href="<%= loginUrl %>"
                   style="background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">
                  Log In
                </a>
              </td>
            </tr>
            <tr>
              <td style="font-size: 14px; color: #6b7280;">
                <p style="margin: 0;">If the button doesn’t work, copy and paste this link into your browser:</p>
                <p style="margin: 8px 0; word-break: break-all;">
                  <a href="<%= loginUrl %>" style="color: #2563eb;"><%= loginUrl %></a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding-top: 24px; font-size: 14px; color: #9ca3af; text-align: center;">
                &copy; <%= new Date().getFullYear() %> Your Company. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
