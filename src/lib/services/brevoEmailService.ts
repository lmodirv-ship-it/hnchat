const BREVO_BASE_URL = 'https://api.brevo.com/v3';
const BREVO_API_KEY = process.env.BREVO_API_KEY || '';

const SENDER = { name: 'hnChat', email: 'noreply@hnchat.net' };

// Email tags for tracking per type
export const EMAIL_TAGS = {
  welcome: 'welcome_email',
  reengagement: 'reengagement_email',
  weeklyDigest: 'weekly_digest',
  trendingAlert: 'trending_alert',
  notificationDigest: 'notification_digest',
  postInteraction: 'post_interaction',
  purchaseConfirmation: 'purchase_confirmation',
  messageReceived: 'message_received',
};

// ─── Contact Management ───────────────────────────────────────────────────────

export async function syncContactToBrevo(
  email: string,
  name: string,
  attributes: Record<string, any> = {}
): Promise<boolean> {
  try {
    const res = await fetch(`${BREVO_BASE_URL}/contacts`, {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        email,
        attributes: {
          FIRSTNAME: name?.split(' ')[0] || '',
          LASTNAME: name?.split(' ').slice(1).join(' ') || '',
          ...attributes,
        },
        listIds: [2], // Default list ID — update to your Brevo list ID
        updateEnabled: true,
      }),
    });
    return res.ok || res.status === 204;
  } catch {
    return false;
  }
}

export async function updateContactAttributes(
  email: string,
  attributes: Record<string, any>
): Promise<boolean> {
  try {
    const res = await fetch(`${BREVO_BASE_URL}/contacts/${encodeURIComponent(email)}`, {
      method: 'PUT',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({ attributes }),
    });
    return res.ok || res.status === 204;
  } catch {
    return false;
  }
}

// ─── Core Email Sender ────────────────────────────────────────────────────────

async function sendEmail(payload: object): Promise<{ success: boolean; messageId?: string }> {
  try {
    const res = await fetch(`${BREVO_BASE_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, messageId: data.messageId };
    }
    return { success: false };
  } catch {
    return { success: false };
  }
}

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  const firstName = name?.split(' ')[0] || 'there';
  // Sync contact to Brevo list on welcome
  syncContactToBrevo(email, name, { SIGNUP_DATE: new Date().toISOString(), SOURCE: 'web' }).catch(() => {});
  const result = await sendEmail({
    sender: SENDER,
    to: [{ email, name }],
    subject: 'مرحبا بك في hnChat 🚀 أنت دابا جزء من المستقبل',
    tags: [EMAIL_TAGS.welcome],
    htmlContent: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050508;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:linear-gradient(135deg,#00d2ff,#9b59ff);border-radius:16px;padding:12px 20px;">
        <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">hnChat</span>
      </div>
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:40px 32px;">
      <h1 style="color:#e2e8f0;font-size:28px;font-weight:800;margin:0 0 8px;line-height:1.2;">
        مرحبا ${firstName}! 🎉
      </h1>
      <p style="color:#94a3b8;font-size:16px;margin:0 0 8px;line-height:1.6;">
        أنت دابا جزء من المستقبل 💎
      </p>
      <p style="color:#94a3b8;font-size:15px;margin:0 0 28px;line-height:1.6;">
        ابدأ واستكشف أقوى المحتوى! أنت من بين أوائل المنضمين لـ hnChat — Early Access مفتوح لك الآن.
      </p>
      <div style="background:rgba(0,210,255,0.06);border:1px solid rgba(0,210,255,0.15);border-radius:16px;padding:24px;margin-bottom:28px;">
        <p style="color:#00d2ff;font-size:13px;font-weight:700;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">اللي ينتظرك</p>
        <ul style="color:#cbd5e1;font-size:14px;margin:0;padding:0 0 0 16px;line-height:2;">
          <li>🎬 فيديوهات قصيرة وبث مباشر</li>
          <li>💬 دردشة ومجتمعات حية</li>
          <li>🤖 AI Hub (GPT-4, Claude, Gemini)</li>
          <li>🛍️ Marketplace وتداول العملات</li>
          <li>🎁 ادعو أصدقاءك واربح مكافآت</li>
        </ul>
      </div>
      <a href="https://hnchat.net/home-feed" style="display:block;text-align:center;background:linear-gradient(135deg,#00d2ff,#9b59ff);color:#050508;font-size:16px;font-weight:700;padding:16px 32px;border-radius:14px;text-decoration:none;margin-bottom:20px;">
        👉 ادخل الآن: hnchat.net
      </a>
      <p style="color:#475569;font-size:13px;text-align:center;margin:0;">
        أي سؤال؟ رد على هذا الإيميل — نقرأ كل رسالة.
      </p>
    </div>
    <p style="color:#334155;font-size:12px;text-align:center;margin-top:24px;">
      © 2026 hnChat · <a href="https://hnchat.net" style="color:#475569;">hnchat.net</a>
      · <a href="https://hnchat.net/preferences" style="color:#475569;">إدارة الإشعارات</a>
    </p>
  </div>
</body>
</html>`,
  });
  return result.success;
}

export async function sendReEngagementEmail(email: string, name: string): Promise<boolean> {
  const firstName = name?.split(' ')[0] || 'there';
  const result = await sendEmail({
    sender: SENDER,
    to: [{ email, name }],
    subject: 'فين غبرت؟ 😏 كاين محتوى طالع دابا ما تفوتوش 🔥',
    tags: [EMAIL_TAGS.reengagement],
    htmlContent: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050508;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:linear-gradient(135deg,#00d2ff,#9b59ff);border-radius:16px;padding:12px 20px;">
        <span style="font-size:22px;font-weight:800;color:#fff;">hnChat</span>
      </div>
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:40px 32px;">
      <h1 style="color:#e2e8f0;font-size:26px;font-weight:800;margin:0 0 8px;">
        ${firstName}، رجع الآن! 🔥
      </h1>
      <p style="color:#94a3b8;font-size:15px;margin:0 0 24px;line-height:1.6;">
        المجتمع كان نشيطاً وأنت غايب. محتوى جديد، منشئون جدد، محادثات جديدة — كلها تنتظرك.
      </p>
      <div style="background:rgba(155,89,255,0.06);border:1px solid rgba(155,89,255,0.15);border-radius:16px;padding:20px;margin-bottom:28px;">
        <p style="color:#9b59ff;font-size:13px;font-weight:700;margin:0 0 10px;text-transform:uppercase;letter-spacing:1px;">🔥 Trending الآن</p>
        <p style="color:#cbd5e1;font-size:14px;margin:0;line-height:1.8;">
          🎬 فيديوهات قصيرة جديدة تنتشر بسرعة<br>
          💬 محادثات نشطة في مجتمعاتك<br>
          🤖 ميزات AI جديدة تم إطلاقها<br>
          🎁 مكافآت الدعوة تنتظر المطالبة بها
        </p>
      </div>
      <a href="https://hnchat.net/home-feed" style="display:block;text-align:center;background:linear-gradient(135deg,#00d2ff,#9b59ff);color:#050508;font-size:16px;font-weight:700;padding:16px 32px;border-radius:14px;text-decoration:none;">
        👉 رجع الآن
      </a>
    </div>
    <p style="color:#334155;font-size:12px;text-align:center;margin-top:24px;">
      © 2026 hnChat · <a href="https://hnchat.net" style="color:#475569;">hnchat.net</a>
      · <a href="https://hnchat.net/preferences" style="color:#475569;">إلغاء الاشتراك</a>
    </p>
  </div>
</body>
</html>`,
  });
  return result.success;
}

export async function sendWeeklyDigestEmail(
  email: string,
  name: string,
  trendingVideos?: Array<{ title: string; views: number }>
): Promise<boolean> {
  const firstName = name?.split(' ')[0] || 'there';
  const weekLabel = new Date().toLocaleDateString('ar-MA', { month: 'long', day: 'numeric' });

  const trendingHtml = trendingVideos && trendingVideos.length > 0
    ? trendingVideos.slice(0, 3).map((v, i) => `
      <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
        <span style="color:#00d2ff;font-weight:700;font-size:16px;">${i + 1}</span>
        <div>
          <p style="color:#e2e8f0;font-size:14px;font-weight:600;margin:0;">${v.title}</p>
          <p style="color:#64748b;font-size:12px;margin:4px 0 0;">${v.views.toLocaleString()} مشاهدة</p>
        </div>
      </div>`).join('')
    : `<p style="color:#cbd5e1;font-size:14px;margin:0;line-height:1.8;">
        🎬 فيديوهات قصيرة جديدة تنتشر هذا الأسبوع<br>
        💬 محادثاتك النشطة تنتظرك<br>
        🎁 مكافآت الدعوة — مقاعد محدودة
      </p>`;

  const result = await sendEmail({
    sender: SENDER,
    to: [{ email, name }],
    subject: `أفضل ما فاتك هذا الأسبوع 🔥 شوف أقوى الفيديوهات والمحتوى الرائج 💎`,
    tags: [EMAIL_TAGS.weeklyDigest],
    htmlContent: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050508;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:linear-gradient(135deg,#00d2ff,#9b59ff);border-radius:16px;padding:12px 20px;">
        <span style="font-size:22px;font-weight:800;color:#fff;">hnChat</span>
      </div>
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:40px 32px;">
      <div style="display:inline-block;background:rgba(0,210,255,0.1);border:1px solid rgba(0,210,255,0.2);border-radius:100px;padding:6px 16px;margin-bottom:20px;">
        <span style="color:#00d2ff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">الملخص الأسبوعي · ${weekLabel}</span>
      </div>
      <h1 style="color:#e2e8f0;font-size:26px;font-weight:800;margin:0 0 8px;">
        هذا الأسبوع على hnChat، ${firstName} 📈
      </h1>
      <p style="color:#94a3b8;font-size:15px;margin:0 0 28px;line-height:1.6;">
        إليك أبرز ما كان رائجاً في مجتمعك هذا الأسبوع.
      </p>
      <div style="gap:12px;margin-bottom:28px;">
        <div style="background:rgba(0,210,255,0.05);border:1px solid rgba(0,210,255,0.12);border-radius:14px;padding:18px;margin-bottom:12px;">
          <p style="color:#00d2ff;font-size:12px;font-weight:700;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">🔥 الفيديوهات الرائجة</p>
          ${trendingHtml}
        </div>
        <div style="background:rgba(155,89,255,0.05);border:1px solid rgba(155,89,255,0.12);border-radius:14px;padding:18px;margin-bottom:12px;">
          <p style="color:#9b59ff;font-size:12px;font-weight:700;margin:0 0 6px;text-transform:uppercase;letter-spacing:1px;">💬 المحادثات الساخنة</p>
          <p style="color:#cbd5e1;font-size:14px;margin:0;line-height:1.7;">مجتمعاتك نشطة. انضم للمحادثات قبل أن تبرد.</p>
        </div>
        <div style="background:rgba(232,121,249,0.05);border:1px solid rgba(232,121,249,0.12);border-radius:14px;padding:18px;">
          <p style="color:#e879f9;font-size:12px;font-weight:700;margin:0 0 6px;text-transform:uppercase;letter-spacing:1px;">🎁 مكافآت الدعوة</p>
          <p style="color:#cbd5e1;font-size:14px;margin:0;line-height:1.7;">ادعو أصدقاءك هذا الأسبوع وافتح مكافآت Early Access حصرية. مقاعد محدودة.</p>
        </div>
      </div>
      <a href="https://hnchat.net/home-feed" style="display:block;text-align:center;background:linear-gradient(135deg,#00d2ff,#9b59ff);color:#050508;font-size:16px;font-weight:700;padding:16px 32px;border-radius:14px;text-decoration:none;">
        📊 شوف Trending هذا الأسبوع
      </a>
    </div>
    <p style="color:#334155;font-size:12px;text-align:center;margin-top:24px;">
      © 2026 hnChat · <a href="https://hnchat.net" style="color:#475569;">hnchat.net</a>
      · <a href="https://hnchat.net/preferences" style="color:#475569;">إدارة تفضيلات الإيميل</a>
    </p>
  </div>
</body>
</html>`,
  });
  return result.success;
}

export async function sendTrendingAlertEmail(
  email: string,
  name: string,
  videoTitle: string,
  videoUrl: string
): Promise<boolean> {
  const firstName = name?.split(' ')[0] || 'there';
  const result = await sendEmail({
    sender: SENDER,
    to: [{ email, name }],
    subject: `🔥 هذا الفيديو كيدوز بزاف دابا — لا تفوته!`,
    tags: [EMAIL_TAGS.trendingAlert],
    htmlContent: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050508;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:linear-gradient(135deg,#00d2ff,#9b59ff);border-radius:16px;padding:12px 20px;">
        <span style="font-size:22px;font-weight:800;color:#fff;">hnChat</span>
      </div>
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:40px 32px;">
      <div style="display:inline-block;background:rgba(255,87,34,0.1);border:1px solid rgba(255,87,34,0.3);border-radius:100px;padding:6px 16px;margin-bottom:20px;">
        <span style="color:#ff5722;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">🔥 Trending الآن</span>
      </div>
      <h1 style="color:#e2e8f0;font-size:24px;font-weight:800;margin:0 0 12px;">
        ${firstName}، هذا الفيديو كيدوز! ⚡
      </h1>
      <div style="background:rgba(0,210,255,0.05);border:1px solid rgba(0,210,255,0.15);border-radius:16px;padding:20px;margin-bottom:24px;">
        <p style="color:#00d2ff;font-size:13px;font-weight:700;margin:0 0 8px;">الفيديو الرائج</p>
        <p style="color:#e2e8f0;font-size:16px;font-weight:600;margin:0;">${videoTitle}</p>
      </div>
      <a href="${videoUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#ff5722,#ff9800);color:#fff;font-size:16px;font-weight:700;padding:16px 32px;border-radius:14px;text-decoration:none;">
        🔥 شوف الفيديو الآن
      </a>
    </div>
    <p style="color:#334155;font-size:12px;text-align:center;margin-top:24px;">
      © 2026 hnChat · <a href="https://hnchat.net/preferences" style="color:#475569;">إلغاء الاشتراك</a>
    </p>
  </div>
</body>
</html>`,
  });
  return result.success;
}

// ─── Notification Digest Email ────────────────────────────────────────────────

export async function sendNotificationDigestEmail(
  email: string,
  name: string,
  notifications: Array<{ type: string; message: string; time: string }>
): Promise<boolean> {
  const firstName = name?.split(' ')[0] || 'there';
  const notifHtml = notifications.slice(0, 5).map(n => `
    <div style="display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
      <div style="width:8px;height:8px;border-radius:50%;background:#00d2ff;margin-top:6px;flex-shrink:0;"></div>
      <div>
        <p style="color:#e2e8f0;font-size:14px;margin:0 0 2px;">${n.message}</p>
        <p style="color:#475569;font-size:12px;margin:0;">${n.time}</p>
      </div>
    </div>`).join('');

  const result = await sendEmail({
    sender: SENDER,
    to: [{ email, name }],
    subject: `🔔 لديك ${notifications.length} إشعار جديد على hnChat`,
    tags: [EMAIL_TAGS.notificationDigest],
    htmlContent: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050508;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:linear-gradient(135deg,#00d2ff,#9b59ff);border-radius:16px;padding:12px 20px;">
        <span style="font-size:22px;font-weight:800;color:#fff;">hnChat</span>
      </div>
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:40px 32px;">
      <h1 style="color:#e2e8f0;font-size:24px;font-weight:800;margin:0 0 8px;">
        ${firstName}، لديك إشعارات جديدة 🔔
      </h1>
      <p style="color:#94a3b8;font-size:15px;margin:0 0 24px;line-height:1.6;">
        إليك ملخص آخر تفاعلاتك على hnChat.
      </p>
      <div style="background:rgba(0,210,255,0.04);border:1px solid rgba(0,210,255,0.1);border-radius:16px;padding:16px 20px;margin-bottom:24px;">
        ${notifHtml}
      </div>
      <a href="https://hnchat.net/notifications" style="display:block;text-align:center;background:linear-gradient(135deg,#00d2ff,#9b59ff);color:#050508;font-size:16px;font-weight:700;padding:16px 32px;border-radius:14px;text-decoration:none;">
        👁️ شوف كل الإشعارات
      </a>
    </div>
    <p style="color:#334155;font-size:12px;text-align:center;margin-top:24px;">
      © 2026 hnChat · <a href="https://hnchat.net/preferences" style="color:#475569;">إدارة الإشعارات</a>
    </p>
  </div>
</body>
</html>`,
  });
  return result.success;
}

// ─── Post Interaction Email ───────────────────────────────────────────────────

export async function sendPostInteractionEmail(
  email: string,
  name: string,
  interactionType: 'like' | 'comment' | 'share',
  actorName: string,
  postPreview: string
): Promise<boolean> {
  const firstName = name?.split(' ')[0] || 'there';
  const emojiMap = { like: '❤️', comment: '💬', share: '🔁' };
  const labelMap = { like: 'أعجب بمنشورك', comment: 'علق على منشورك', share: 'شارك منشورك' };
  const emoji = emojiMap[interactionType];
  const label = labelMap[interactionType];

  const result = await sendEmail({
    sender: SENDER,
    to: [{ email, name }],
    subject: `${emoji} ${actorName} ${label} على hnChat`,
    tags: [EMAIL_TAGS.postInteraction],
    htmlContent: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050508;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:linear-gradient(135deg,#00d2ff,#9b59ff);border-radius:16px;padding:12px 20px;">
        <span style="font-size:22px;font-weight:800;color:#fff;">hnChat</span>
      </div>
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:40px 32px;">
      <div style="font-size:48px;text-align:center;margin-bottom:16px;">${emoji}</div>
      <h1 style="color:#e2e8f0;font-size:22px;font-weight:800;margin:0 0 8px;text-align:center;">
        ${actorName} ${label}!
      </h1>
      <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:16px;margin:20px 0;border-left:3px solid #00d2ff;">
        <p style="color:#94a3b8;font-size:14px;margin:0;line-height:1.6;font-style:italic;">"${postPreview}"</p>
      </div>
      <a href="https://hnchat.net/home-feed" style="display:block;text-align:center;background:linear-gradient(135deg,#00d2ff,#9b59ff);color:#050508;font-size:16px;font-weight:700;padding:16px 32px;border-radius:14px;text-decoration:none;">
        👀 شوف المنشور
      </a>
    </div>
    <p style="color:#334155;font-size:12px;text-align:center;margin-top:24px;">
      © 2026 hnChat · <a href="https://hnchat.net/preferences" style="color:#475569;">إدارة الإشعارات</a>
    </p>
  </div>
</body>
</html>`,
  });
  return result.success;
}

// ─── Purchase Confirmation Email ──────────────────────────────────────────────

export async function sendPurchaseConfirmationEmail(
  email: string,
  name: string,
  orderId: string,
  items: Array<{ name: string; price: number; quantity: number }>,
  total: number
): Promise<boolean> {
  const firstName = name?.split(' ')[0] || 'there';

  // Update contact attribute to track last purchase
  updateContactAttributes(email, {
    LAST_PURCHASE_DATE: new Date().toISOString(),
    TOTAL_ORDERS: 1,
  }).catch(() => {});

  const itemsHtml = items
    .map(
      (item) => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
      <div>
        <p style="color:#e2e8f0;font-size:14px;font-weight:600;margin:0;">${item.name}</p>
        <p style="color:#64748b;font-size:12px;margin:3px 0 0;">x${item.quantity}</p>
      </div>
      <span style="color:#00d2ff;font-size:14px;font-weight:700;">$${(item.price * item.quantity).toFixed(2)}</span>
    </div>`
    )
    .join('');

  const result = await sendEmail({
    sender: SENDER,
    to: [{ email, name }],
    subject: `✅ تأكيد طلبك #${orderId} على hnChat Marketplace`,
    tags: [EMAIL_TAGS.purchaseConfirmation],
    htmlContent: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050508;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:linear-gradient(135deg,#00d2ff,#9b59ff);border-radius:16px;padding:12px 20px;">
        <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">hnChat</span>
      </div>
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:40px 32px;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:50%;background:rgba(52,211,153,0.12);border:2px solid rgba(52,211,153,0.3);margin-bottom:16px;">
          <span style="font-size:28px;">✅</span>
        </div>
        <h1 style="color:#e2e8f0;font-size:26px;font-weight:800;margin:0 0 6px;">تم تأكيد طلبك!</h1>
        <p style="color:#94a3b8;font-size:15px;margin:0;">شكراً ${firstName}، طلبك قيد المعالجة.</p>
      </div>
      <div style="background:rgba(0,210,255,0.05);border:1px solid rgba(0,210,255,0.12);border-radius:14px;padding:16px 20px;margin-bottom:24px;">
        <p style="color:#64748b;font-size:12px;font-weight:700;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">رقم الطلب</p>
        <p style="color:#00d2ff;font-size:18px;font-weight:800;margin:0;letter-spacing:1px;">#${orderId}</p>
      </div>
      <div style="margin-bottom:24px;">
        <p style="color:#94a3b8;font-size:13px;font-weight:700;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">تفاصيل الطلب</p>
        ${itemsHtml}
        <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 0 0;">
          <span style="color:#e2e8f0;font-size:15px;font-weight:700;">المجموع الكلي</span>
          <span style="color:#34d399;font-size:18px;font-weight:800;">$${total.toFixed(2)}</span>
        </div>
      </div>
      <div style="background:rgba(155,89,255,0.06);border:1px solid rgba(155,89,255,0.15);border-radius:14px;padding:16px 20px;margin-bottom:24px;">
        <p style="color:#9b59ff;font-size:13px;font-weight:700;margin:0 0 6px;">📦 الخطوات التالية</p>
        <p style="color:#cbd5e1;font-size:14px;margin:0;line-height:1.7;">
          سيتم مراجعة دفعتك خلال 24 ساعة. ستتلقى إشعاراً فور تأكيد الطلب.
        </p>
      </div>
      <a href="https://hnchat.net/marketplace" style="display:block;text-align:center;background:linear-gradient(135deg,#00d2ff,#9b59ff);color:#050508;font-size:16px;font-weight:700;padding:16px 32px;border-radius:14px;text-decoration:none;">
        🛍️ تصفح المزيد من المنتجات
      </a>
    </div>
    <p style="color:#334155;font-size:12px;text-align:center;margin-top:24px;">
      © 2026 hnChat · <a href="https://hnchat.net" style="color:#475569;">hnchat.net</a>
      · <a href="https://hnchat.net/preferences" style="color:#475569;">إدارة الإشعارات</a>
    </p>
  </div>
</body>
</html>`,
  });
  return result.success;
}

// ─── Message Received Email ───────────────────────────────────────────────────

export async function sendMessageReceivedEmail(
  email: string,
  name: string,
  senderName: string,
  messagePreview: string
): Promise<boolean> {
  const firstName = name?.split(' ')[0] || 'there';
  const preview =
    messagePreview.length > 120 ? messagePreview.slice(0, 120) + '…' : messagePreview;

  const result = await sendEmail({
    sender: SENDER,
    to: [{ email, name }],
    subject: `💬 ${senderName} أرسل لك رسالة على hnChat`,
    tags: [EMAIL_TAGS.messageReceived],
    htmlContent: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050508;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:linear-gradient(135deg,#00d2ff,#9b59ff);border-radius:16px;padding:12px 20px;">
        <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">hnChat</span>
      </div>
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:40px 32px;">
      <div style="display:inline-block;background:rgba(0,210,255,0.1);border:1px solid rgba(0,210,255,0.2);border-radius:100px;padding:6px 16px;margin-bottom:20px;">
        <span style="color:#00d2ff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">💬 رسالة جديدة</span>
      </div>
      <h1 style="color:#e2e8f0;font-size:24px;font-weight:800;margin:0 0 6px;">
        ${firstName}، لديك رسالة جديدة!
      </h1>
      <p style="color:#94a3b8;font-size:15px;margin:0 0 24px;line-height:1.6;">
        <strong style="color:#e2e8f0;">${senderName}</strong> أرسل لك رسالة على hnChat.
      </p>
      <div style="background:rgba(255,255,255,0.04);border-radius:16px;padding:20px 24px;margin-bottom:28px;border-left:3px solid #00d2ff;">
        <p style="color:#64748b;font-size:12px;font-weight:700;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">${senderName}</p>
        <p style="color:#cbd5e1;font-size:15px;margin:0;line-height:1.7;font-style:italic;">"${preview}"</p>
      </div>
      <a href="https://hnchat.net/chats-messaging" style="display:block;text-align:center;background:linear-gradient(135deg,#00d2ff,#9b59ff);color:#050508;font-size:16px;font-weight:700;padding:16px 32px;border-radius:14px;text-decoration:none;margin-bottom:16px;">
        💬 رد الآن
      </a>
      <p style="color:#475569;font-size:13px;text-align:center;margin:0;">
        لا تترك ${senderName} ينتظر! 😊
      </p>
    </div>
    <p style="color:#334155;font-size:12px;text-align:center;margin-top:24px;">
      © 2026 hnChat · <a href="https://hnchat.net" style="color:#475569;">hnchat.net</a>
      · <a href="https://hnchat.net/preferences" style="color:#475569;">إدارة الإشعارات</a>
    </p>
  </div>
</body>
</html>`,
  });
  return result.success;
}

// ─── Metrics / Tracking ───────────────────────────────────────────────────────

export interface EmailAggregatedStats {
  requests: number;
  delivered: number;
  opens: number;
  uniqueOpens: number;
  clicks: number;
  uniqueClicks: number;
  hardBounces: number;
  softBounces: number;
  spamReports: number;
  unsubscribed: number;
  blocked: number;
  range: string;
}

export interface EmailDailyReport {
  date: string;
  requests: number;
  delivered: number;
  opens: number;
  uniqueOpens: number;
  clicks: number;
  uniqueClicks: number;
  hardBounces: number;
  softBounces: number;
  spamReports: number;
  unsubscribed: number;
  blocked: number;
}

export async function getEmailAggregatedStats(
  tag?: string,
  days: number = 30
): Promise<EmailAggregatedStats | null> {
  try {
    const params = new URLSearchParams({ days: String(days) });
    if (tag) params.set('tag', tag);
    const res = await fetch(
      `${BREVO_BASE_URL}/smtp/statistics/aggregatedReport?${params.toString()}`,
      {
        headers: { 'api-key': BREVO_API_KEY, accept: 'application/json' },
        cache: 'no-store',
      }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getEmailDailyReports(
  tag?: string,
  days: number = 14
): Promise<EmailDailyReport[]> {
  try {
    const params = new URLSearchParams({ days: String(days), limit: '30', sort: 'asc' });
    if (tag) params.set('tag', tag);
    const res = await fetch(
      `${BREVO_BASE_URL}/smtp/statistics/reports?${params.toString()}`,
      {
        headers: { 'api-key': BREVO_API_KEY, accept: 'application/json' },
        cache: 'no-store',
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.reports || [];
  } catch {
    return [];
  }
}
