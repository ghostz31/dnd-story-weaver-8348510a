---
name: Data Security & Protection
description: Comprehensive security skill for protecting user data in web applications. Implements multi-layer security controls including authentication hardening, data encryption, input validation, session management, and privacy compliance.
---

# Data Security & Protection Skill

This skill provides essential security measures to protect user data in web applications. Follow these imperative guidelines when building or reviewing security-sensitive features.

---

## 🔐 1. Authentication Hardening

### Multi-Factor Authentication (MFA)
- **Always offer MFA** for user accounts, especially for sensitive operations
- Support multiple MFA methods: TOTP (authenticator apps), SMS (fallback), email verification
- Implement MFA challenges for:
  - First login on new devices
  - High-risk operations (password changes, data exports, account deletion)
  - After extended inactivity

### Password Security
```typescript
// Minimum password requirements
const passwordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true, // Check against haveibeenpwned API
  preventReuse: 5 // Prevent reusing last 5 passwords
};
```

- **Never store passwords in plain text** - use bcrypt or Argon2id
- Implement account lockout after 5 failed attempts (configurable)
- Add CAPTCHA after 3 failed attempts

### Session Management
```typescript
const sessionConfig = {
  maxAge: 3600000, // 1 hour for sensitive apps
  httpOnly: true,
  secure: true, // HTTPS only
  sameSite: 'strict',
  regenerateOnLogin: true,
  maxConcurrentSessions: 3
};
```

---

## 🛡️ 2. Data Encryption

### Encryption At Rest
- **Sensitive fields** (PII, health data, financial info) MUST be encrypted using AES-256-GCM
- Store encryption keys in environment variables or a secrets manager (never in code)
- Use separate encryption keys per data category

```typescript
// Example encryption pattern
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

function encryptSensitiveData(data: string, key: Buffer): EncryptedData {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag();
  return { encrypted, iv: iv.toString('base64'), authTag: authTag.toString('base64') };
}
```

### Encryption In Transit
- **Force HTTPS** for all connections
- Configure TLS 1.3 minimum (disable TLS 1.0, 1.1, 1.2)
- Use HSTS headers with minimum 1-year max-age

```typescript
// Security headers configuration
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};
```

---

## 🔍 3. Input Validation & Sanitization

### Critical: Prevent Injection Attacks

```typescript
// Input validation patterns
const validationRules = {
  // User input sanitization
  sanitizeHTML: (input: string) => DOMPurify.sanitize(input),
  
  // SQL/NoSQL injection prevention
  escapeString: (input: string) => input.replace(/['"\\]/g, '\\$&'),
  
  // XSS prevention
  encodeOutput: (input: string) => he.encode(input),
  
  // Path traversal prevention
  sanitizePath: (path: string) => path.replace(/\.\./g, '').replace(/^\/+/, '')
};
```

### Validation Checklist
- [ ] Validate all user inputs on BOTH client AND server side
- [ ] Use parameterized queries/prepared statements for databases
- [ ] Whitelist allowed characters, don't just blacklist dangerous ones
- [ ] Validate file uploads: check MIME types, file extensions, magic bytes
- [ ] Limit input lengths to prevent DoS attacks
- [ ] Sanitize all output before rendering in HTML

---

## 📊 4. Data Minimization & Privacy

### Principle of Least Data
```typescript
interface UserDataPolicy {
  // Only collect what you NEED
  requiredFields: ['email', 'passwordHash'];
  optionalFields: ['displayName', 'avatar'];
  prohibitedFields: ['ssn', 'creditCard']; // Never store these
  
  // Data retention
  retentionPolicies: {
    sessionLogs: '30 days',
    activityHistory: '1 year',
    accountData: 'until deletion',
    backups: '90 days'
  };
}
```

### GDPR/CCPA Compliance
- Implement right to data export (JSON/CSV download)
- Implement right to deletion (complete data wipe)
- Track consent for each data processing purpose
- Maintain data processing logs

```typescript
// Example consent tracking
interface ConsentRecord {
  userId: string;
  purpose: 'marketing' | 'analytics' | 'thirdParty';
  granted: boolean;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}
```

---

## 🚨 5. Rate Limiting & Abuse Prevention

### API Rate Limiting
```typescript
const rateLimits = {
  public: {
    requests: 100,
    window: '15 minutes',
    keyBy: 'ip'
  },
  authenticated: {
    requests: 1000,
    window: '15 minutes',
    keyBy: 'userId'
  },
  sensitive: { // Login, password reset, etc.
    requests: 5,
    window: '15 minutes',
    keyBy: 'ip'
  }
};
```

### Anti-Automation Measures
- Implement CAPTCHA for public forms
- Add honeypot fields to detect bots
- Monitor for unusual patterns (rapid submissions, sequential IDs)

---

## 🔒 6. Firebase/Firestore Security Rules

### Mandatory Rules Pattern
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isValidData() {
      return request.resource.data.keys().hasOnly(['field1', 'field2', 'updatedAt'])
             && request.resource.data.field1 is string
             && request.resource.data.field1.size() < 1000;
    }
    
    // User data: owner-only access
    match /users/{userId}/{document=**} {
      allow read, write: if isOwner(userId);
    }
    
    // Always block unmatched paths
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 🕵️ 7. Audit Logging & Monitoring

### Security Events to Log
```typescript
enum SecurityEvent {
  LOGIN_SUCCESS = 'auth.login.success',
  LOGIN_FAILURE = 'auth.login.failure',
  LOGOUT = 'auth.logout',
  PASSWORD_CHANGE = 'auth.password.change',
  MFA_ENABLED = 'auth.mfa.enabled',
  PERMISSION_DENIED = 'access.denied',
  DATA_EXPORT = 'data.export',
  DATA_DELETE = 'data.delete',
  SUSPICIOUS_ACTIVITY = 'security.suspicious'
}

interface AuditLog {
  event: SecurityEvent;
  userId: string | null;
  ip: string;
  userAgent: string;
  timestamp: Date;
  metadata: Record<string, unknown>;
}
```

### Alerting Thresholds
- 5+ failed login attempts from same IP: Alert
- Login from new country/device: Notify user
- Bulk data access: Review manually
- Admin actions: Always log and alert

---

## 🧪 8. Security Testing Checklist

### Before Every Deploy
- [ ] Run SAST (Static Application Security Testing) tools
- [ ] Check dependencies for known vulnerabilities (`npm audit`)
- [ ] Verify all API endpoints require authentication
- [ ] Test rate limiting is enforced
- [ ] Confirm security headers are present

### Periodic (Monthly)
- [ ] Review Firestore security rules
- [ ] Audit user permissions and roles
- [ ] Check for unused dependencies
- [ ] Review error logs for anomalies
- [ ] Test backup restoration

### Annual
- [ ] Full penetration testing
- [ ] Third-party security audit
- [ ] Privacy policy review
- [ ] Employee security training

---

## 📁 Resources

### Recommended Dependencies
```json
{
  "helmet": "^7.0.0",           // Security headers
  "express-rate-limit": "^7.0.0", // Rate limiting
  "dompurify": "^3.0.0",        // HTML sanitization
  "bcrypt": "^5.1.0",           // Password hashing
  "jsonwebtoken": "^9.0.0",     // JWT handling
  "express-validator": "^7.0.0" // Input validation
}
```

### Reference Links
- [OWASP Top 10](https://owasp.org/Top10/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Firebase Security Rules Reference](https://firebase.google.com/docs/firestore/security/get-started)
- [GDPR Compliance Checklist](https://gdpr.eu/checklist/)

---

## 🚀 Quick Start: Implementing Security

1. **Immediate Actions** (Day 1)
   - Enable HTTPS everywhere
   - Set up security headers
   - Configure rate limiting
   - Review Firestore rules

2. **Short Term** (Week 1)
   - Implement input validation layer
   - Add audit logging
   - Set up dependency vulnerability scanning

3. **Medium Term** (Month 1)
   - Add MFA support
   - Implement data encryption at rest
   - Build privacy controls (export/delete)

4. **Ongoing**
   - Regular security audits
   - Monitor for new vulnerabilities
   - Update dependencies promptly
