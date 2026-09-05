module.exports = (verificationLink, name = "there") => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Verify Your Email</title>
</head>

<body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,sans-serif;">

<div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">

    <div style="background:#2563eb;padding:30px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;">Game Distribution Platform</h1>
    </div>

    <div style="padding:40px;">

        <h2 style="margin-top:0;color:#111827;">
            Verify your email
        </h2>

        <p style="color:#4b5563;font-size:16px;">
            Hi <strong>${name}</strong>,
        </p>

        <p style="color:#4b5563;font-size:16px;line-height:1.7;">
            Thanks for creating an account.
            Please verify your email address by clicking the button below.
        </p>

        <div style="text-align:center;margin:40px 0;">
            <a
                href="${verificationLink}"
                style="
                    background:#2563eb;
                    color:white;
                    padding:15px 35px;
                    text-decoration:none;
                    border-radius:8px;
                    display:inline-block;
                    font-weight:bold;
                "
            >
                Verify Email
            </a>
        </div>

        <p style="color:#6b7280;font-size:14px;">
            If the button doesn't work, copy and paste this link into your browser:
        </p>

        <p style="word-break:break-all;color:#2563eb;font-size:14px;">
            ${verificationLink}
        </p>

        <hr style="margin:40px 0;border:none;border-top:1px solid #e5e7eb;">

        <p style="font-size:13px;color:#9ca3af;">
            If you didn't create this account, you can safely ignore this email.
        </p>

    </div>

</div>

</body>
</html>
`;