import dns from 'dns';

// Popular disposable / temporary email domains to reject
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  '10minutemail.com',
  'tempmail.com',
  'guerrillamail.com',
  'sharklasers.com',
  'throwawaymail.com',
  'yopmail.com',
  'getairmail.com',
  'dispostable.com',
  'mytemp.email',
  'trashmail.com',
  'temp-mail.org',
  'nada.ltd',
  'burnermail.io',
  'inboxkitten.com',
  'maildrop.cc',
  'fakemailgenerator.com',
  'tempail.com',
  'mohmal.com',
  'crazymailing.com',
]);

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates that an email has valid syntax, does not use a disposable domain,
 * and possesses active DNS MX (or RFC 5321 fallback A) records to receive emails.
 */
export async function validateEmailExistence(
  email: string,
  timeoutMs: number = 4000
): Promise<EmailValidationResult> {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email address is required.' };
  }

  const trimmed = email.trim().toLowerCase();

  // Basic RFC 5322 regex check
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email format.' };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Invalid email address structure.' };
  }

  const domain = parts[1];

  // Block disposable email domains
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error: 'Temporary or disposable email addresses are not allowed. Please use a real email address.',
    };
  }

  // Reject domains without a dot or obvious test/invalid TLDs
  if (!domain.includes('.') || domain.endsWith('.invalid') || domain.endsWith('.test') || domain.endsWith('.example')) {
    return {
      isValid: false,
      error: 'The email domain does not exist. Please enter a valid email address.',
    };
  }

  // Helper with timeout
  const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('DNS_TIMEOUT'));
      }, ms);

      promise
        .then((res) => {
          clearTimeout(timer);
          resolve(res);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  };

  // Perform DNS MX lookup
  try {
    const mxRecords = await withTimeout(dns.promises.resolveMx(domain), timeoutMs);

    if (Array.isArray(mxRecords) && mxRecords.length > 0) {
      // Sort by priority and ensure at least one exchange target is valid
      const validMx = mxRecords.some(
        (rec) => rec.exchange && rec.exchange.trim().length > 0 && rec.exchange !== '.'
      );
      if (validMx) {
        return { isValid: true };
      }
    }
  } catch (err: any) {
    const code = err?.code;

    // In case MX resolution fails, check RFC 5321 fallback: check A/AAAA record
    if (code === 'ENODATA' || code === 'ENOTFOUND') {
      try {
        const aRecords = await withTimeout(dns.promises.resolve4(domain), timeoutMs / 2);
        if (Array.isArray(aRecords) && aRecords.length > 0) {
          return { isValid: true };
        }
      } catch (fallbackErr: any) {
        // Fallback also failed
      }
      return {
        isValid: false,
        error: `The email domain "${domain}" does not exist or cannot receive mail. Please use a real email address.`,
      };
    }

    if (err?.message === 'DNS_TIMEOUT') {
      // In case of DNS timeout, don't strictly block legitimate users, but warn
      console.warn(`DNS lookup timed out for domain: ${domain}`);
      return { isValid: true };
    }

    return {
      isValid: false,
      error: `Could not verify the email domain "${domain}". Please ensure it exists and can receive emails.`,
    };
  }

  return {
    isValid: false,
    error: `The email domain "${domain}" does not have active mail servers. Please enter a valid email address.`,
  };
}
