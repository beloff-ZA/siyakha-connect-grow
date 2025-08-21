import { supabase } from "@/integrations/supabase/client";

export interface FormSubmissionPayload {
  full_name: string;
  email: string;
  contact_number?: string;
  phone?: string;
  whatsapp_number?: string;
  category: string;
  description: string;
  preferred_channel?: string;
}

export interface SubmissionResult {
  success: boolean;
  method: 'log-support-call' | 'send-email' | 'mailto';
  error?: any;
  id?: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function tryLogSupportCall(payload: FormSubmissionPayload, retries = 2): Promise<SubmissionResult> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`Attempting log-support-call (attempt ${attempt + 1}/${retries + 1})`);
      
      const { data, error } = await supabase.functions.invoke("log-support-call", {
        body: payload,
      });

      if (error) {
        console.error(`log-support-call attempt ${attempt + 1} failed:`, error);
        if (attempt < retries) {
          await delay(1000 * (attempt + 1)); // Progressive delay
          continue;
        }
        throw error;
      }

      console.log(`log-support-call succeeded on attempt ${attempt + 1}`);
      return {
        success: true,
        method: 'log-support-call',
        id: data?.id
      };
    } catch (error) {
      console.error(`log-support-call attempt ${attempt + 1} failed:`, error);
      if (attempt < retries) {
        await delay(1000 * (attempt + 1)); // Progressive delay
        continue;
      }
      return {
        success: false,
        method: 'log-support-call',
        error
      };
    }
  }

  return {
    success: false,
    method: 'log-support-call',
    error: new Error('All retries failed')
  };
}

async function trySendEmail(payload: FormSubmissionPayload): Promise<SubmissionResult> {
  try {
    console.log('Attempting fallback to send-email function');
    
    const emailPayload = {
      to: ["nikita@siyakhatechnology.co.za"],
      subject: `New Support Request: ${payload.category} — ${payload.full_name}`,
      text: `New support request\n\n` +
            `Full name: ${payload.full_name}\nEmail: ${payload.email}\n` +
            `Contact number: ${payload.contact_number || payload.phone || 'Not provided'}\n` +
            `WhatsApp: ${payload.whatsapp_number || 'Not provided'}\n` +
            `Category: ${payload.category}\n` +
            `Preferred channel: ${payload.preferred_channel || 'unspecified'}\n\n` +
            `Description:\n${payload.description}`,
    };

    const { data, error } = await supabase.functions.invoke("send-email", {
      body: emailPayload,
    });

    if (error) {
      console.error('send-email failed:', error);
      throw error;
    }

    console.log('send-email succeeded');
    return {
      success: true,
      method: 'send-email',
      id: data?.id
    };
  } catch (error) {
    console.error('send-email fallback failed:', error);
    return {
      success: false,
      method: 'send-email',
      error
    };
  }
}

function createMailtoFallback(payload: FormSubmissionPayload): SubmissionResult {
  console.log('Using mailto fallback');
  
  const subject = encodeURIComponent(`Support Request: ${payload.category} — ${payload.full_name}`);
  const body = encodeURIComponent(
    `Full name: ${payload.full_name}\n` +
    `Email: ${payload.email}\n` +
    `Contact number: ${payload.contact_number || payload.phone || 'Not provided'}\n` +
    `WhatsApp: ${payload.whatsapp_number || 'Not provided'}\n` +
    `Category: ${payload.category}\n` +
    `Preferred channel: ${payload.preferred_channel || 'unspecified'}\n\n` +
    `Description:\n${payload.description}`
  );
  
  const mailtoUrl = `mailto:nikita@siyakhatechnology.co.za?subject=${subject}&body=${body}`;
  
  // Open mailto link
  window.location.href = mailtoUrl;
  
  return {
    success: true,
    method: 'mailto'
  };
}

export async function submitSupportForm(payload: FormSubmissionPayload): Promise<SubmissionResult> {
  console.log('Starting robust form submission with payload:', payload);
  
  // Normalize payload - ensure we have contact_number
  const normalizedPayload = {
    ...payload,
    contact_number: payload.contact_number || payload.phone || '',
  };

  // Step 1: Try log-support-call with retries
  const logResult = await tryLogSupportCall(normalizedPayload);
  if (logResult.success) {
    return logResult;
  }

  // Step 2: Try send-email fallback
  const emailResult = await trySendEmail(normalizedPayload);
  if (emailResult.success) {
    return emailResult;
  }

  // Step 3: Final fallback to mailto
  console.log('All automated methods failed, using mailto fallback');
  return createMailtoFallback(normalizedPayload);
}