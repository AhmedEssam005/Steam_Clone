module.exports = (resetLink, name = "there") => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Reset Password</title>
</head>

<body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,sans-serif;">

<div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">

    <div style="background:#dc2626;padding:30px;text-align:center;">
        <h1 style="color:white;margin:0;">
            Password Reset
        </h1>
    </div>

    <div style="padding:40px;">

        <h2 style="margin-top:0;color:#111827;">
            Reset your password
        </h2>

        <p style="font-size:16px;color:#4b5563;">
            Hi <strong>${name}</strong>,
        </p>

        <p style="font-size:16px;color:#4b5563;line-height:1.7;">
            We received a request to reset your password.
            Click the button below to choose a new password.
        </p>

        <div style="text-align:center;margin:40px 0;">

            <a
                href="${resetLink}"
                style="
                    background:#dc2626;
                    color:white;
                    padding:15px 35px;
                    border-radius:8px;
                    text-decoration:none;
                    font-weight:bold;
                    display:inline-block;
                "
            >
                Reset Password
            </a>

        </div>

        <p style="font-size:14px;color:#6b7280;">
            This link expires in <strong>1 hour</strong>.
        </p>

        <p style="font-size:14px;color:#6b7280;">
            If the button doesn't work, use this link:
        </p>

        <p style="word-break:break-all;color:#dc2626;font-size:14px;">
            ${resetLink}
        </p>

        <hr style="margin:40px 0;border:none;border-top:1px solid #e5e7eb;">

        <p style="font-size:13px;color:#9ca3af;">
            If you didn't request a password reset, you can safely ignore this email.
            Your password will remain unchanged.
        </p>

    </div>

</div>

</body>
</html>
`;
