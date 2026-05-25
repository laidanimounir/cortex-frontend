// EmailJS credentials required — see README for setup
// Sign up at https://www.emailjs.com/ for a free account

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export async function sendConversationEmail({ toEmail, conversation, language }) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    throw new Error('EmailJS not configured');
  }

  try {
    const emailjs = await import('@emailjs/browser');

    const conversationHtml = conversation
      .map((msg, i) => {
        const label = msg.type === 'user' ? 'User' : 'Cortex';
        const time = msg.id ? new Date(msg.id).toLocaleTimeString() : '';
        return `<div style="margin-bottom: 16px; ${
          msg.type === 'user'
            ? 'background: #1a1d24; padding: 12px; border-radius: 8px;'
            : 'padding: 12px; border-left: 3px solid #20C997;'
        }">
          <strong style="color: #20C997;">${label}</strong>
          <span style="color: #6B7280; font-size: 12px; margin-left: 8px;">${time}</span>
          <p style="color: #E8EAED; margin-top: 8px; white-space: pre-wrap;">${msg.text}</p>
        </div>`;
      })
      .join('');

    const templateParams = {
      to_email: toEmail,
      subject: `Cortex Chat Export — ${new Date().toLocaleDateString()}`,
      message_html: conversationHtml,
      language: language || 'en',
    };

    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
  } catch (error) {
    if (error.message && error.message.includes('not configured')) {
      throw error;
    }
    throw new Error('EmailJS not configured');
  }
}
