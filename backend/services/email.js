const { Resend } = require('resend');

const FROM = 'OpenSpace <onboarding@resend.dev>';

async function sendWelcomeEmail({ name, email, verifyToken }) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verifyToken}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Welcome to OpenSpace 🏠',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:2rem;color:#111">
        <h1 style="font-size:1.6rem;margin-bottom:0.5rem">Welcome, ${name}!</h1>
        <p style="color:#555;margin-bottom:1.5rem">
          You've joined <strong>OpenSpace</strong> — the easiest way to find and list rentals across Windhoek, Namibia.
        </p>
        <p style="color:#555;margin-bottom:1.5rem">
          Please verify your email address to complete your account setup.
        </p>
        <a href="${verifyUrl}"
           style="display:inline-block;background:#111;color:#fff;padding:0.75rem 1.75rem;text-decoration:none;border-radius:2px;font-size:0.9rem;font-weight:500">
          Verify my email
        </a>
        <p style="color:#aaa;font-size:0.75rem;margin-top:2rem">
          This link expires in 24 hours. If you didn't create an account, ignore this email.
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:2rem 0"/>
        <p style="color:#aaa;font-size:0.75rem">OpenSpace · Windhoek, Namibia</p>
      </div>
    `,
  });
}

async function sendViewRequestStatusEmail({ renterName, renterEmail, listingTitle, status }) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const isAccepted = status === 'accepted';
  const subject = isAccepted
    ? `Your viewing request was accepted — ${listingTitle}`
    : `Update on your viewing request — ${listingTitle}`;

  await resend.emails.send({
    from: FROM,
    to: renterEmail,
    subject,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:2rem;color:#111">
        <h1 style="font-size:1.4rem;margin-bottom:0.5rem">
          ${isAccepted ? 'Viewing request accepted' : 'Viewing request update'}
        </h1>
        <p style="color:#555;margin-bottom:1rem">Hi ${renterName || 'there'},</p>
        ${isAccepted
          ? `<p style="color:#555;margin-bottom:1.5rem">
              Great news — the landlord has <strong style="color:#16a34a">accepted</strong> your viewing request for
              <strong>${listingTitle}</strong>.
              They will be in touch shortly to arrange a time.
             </p>`
          : `<p style="color:#555;margin-bottom:1.5rem">
              Unfortunately the landlord has <strong style="color:#dc2626">declined</strong> your viewing request for
              <strong>${listingTitle}</strong>.
              Don't be discouraged — there are many other great listings available.
             </p>`
        }
        <a href="${process.env.CLIENT_URL}/my-requests"
           style="display:inline-block;background:#111;color:#fff;padding:0.75rem 1.75rem;text-decoration:none;border-radius:2px;font-size:0.9rem;font-weight:500">
          View my requests
        </a>
        <hr style="border:none;border-top:1px solid #eee;margin:2rem 0"/>
        <p style="color:#aaa;font-size:0.75rem">OpenSpace · Windhoek, Namibia</p>
      </div>
    `,
  });
}

module.exports = { sendWelcomeEmail, sendViewRequestStatusEmail };
