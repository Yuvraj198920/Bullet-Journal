# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The Bullet Journal team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings, and will make every effort to acknowledge your contributions.

### How to Report a Security Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **GitHub Security Advisory** (Preferred)
   - Go to the [Security tab](https://github.com/Yuvraj198920/Bullet-Journal/security) of this repository
   - Click "Report a vulnerability"
   - Fill in the details using the provided template

2. **Email**
   - Send an email to the project maintainers (you can find contact info in the repository)
   - Include the word "SECURITY" in the subject line
   - Provide a detailed description of the issue

### What to Include in Your Report

To help us better understand the nature and scope of the potential issue, please include as much of the following information as possible:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### What to Expect

After submitting a vulnerability report, you can expect:

- **Initial Response**: Within 48 hours acknowledging receipt of your report
- **Assessment**: Within 7 days providing an assessment of the issue
- **Regular Updates**: Progress updates every 7-14 days until resolved
- **Resolution**: Fix released as soon as possible, depending on complexity

### Safe Harbor

We support safe harbor for security researchers who:

- Make a good faith effort to avoid privacy violations, destruction of data, and interruption or degradation of our services
- Only interact with accounts you own or with explicit permission of the account holder
- Do not exploit a security issue for purposes other than verification
- Report the vulnerability promptly
- Keep vulnerability details confidential until we've had a chance to fix it

We will not pursue legal action against researchers who follow these guidelines.

## Security Best Practices for Users

### Environment Variables

- **Never commit** `.env` or `.env.local` files to version control
- **Never share** your Supabase service role key publicly
- **Use environment variables** for all sensitive configuration
- **Rotate keys** if you suspect they may have been exposed

### Authentication

- Use **strong passwords** (minimum 12 characters, mix of letters, numbers, symbols)
- Enable **two-factor authentication** when available
- **Never share** your login credentials
- **Log out** when using shared computers

### Data Protection

- Regularly **back up** your journal data
- Be cautious about what **personal information** you include in entries
- Review **privacy settings** in your Supabase dashboard
- Use HTTPS only (never HTTP) when accessing the application

### Deployment Security

If you're self-hosting this application:

- Always use **HTTPS** in production
- Keep dependencies **up to date** (`npm audit` regularly)
- Enable **Supabase Row Level Security (RLS)** policies
- Configure **CORS** properly to restrict origins
- Use **strong database passwords**
- Implement **rate limiting** on API endpoints
- Regular security audits and dependency scanning

## Known Security Considerations

### Current Architecture

This application uses:
- **Supabase** for backend (authentication, database, storage)
- **Client-side storage** (localStorage) for offline functionality
- **JWT tokens** for authentication

### Important Security Notes

1. **Service Role Key**: The Supabase service role key must NEVER be exposed to the frontend. It should only be used in server-side code (Edge Functions).

2. **Row Level Security**: Ensure RLS policies are properly configured in Supabase to prevent unauthorized data access.

3. **Client-Side Storage**: Data stored in localStorage is accessible to JavaScript on the same origin. Do not store sensitive unencrypted data.

4. **Token Management**: Access tokens are stored in memory and sessionStorage. They have automatic expiration and refresh mechanisms.

## Security Updates

Security updates will be released as:
- **Critical**: Immediate patch release
- **High**: Patch release within 7 days
- **Medium**: Included in next minor release
- **Low**: Included in next major release

Users will be notified via:
- GitHub Security Advisories
- Release notes
- Repository README notice

## Third-Party Dependencies

We regularly monitor and update dependencies for security vulnerabilities using:
- GitHub Dependabot alerts
- npm audit
- Snyk (planned)

## Compliance

This project aims to comply with:
- OWASP Top 10 security guidelines
- GDPR requirements (for user data handling)
- Secure coding best practices

## Questions?

If you have questions about this security policy, please open a Discussion in the repository.

## Acknowledgments

We would like to thank the following security researchers who have responsibly disclosed vulnerabilities:

- (List will be updated as researchers report issues)

---

**Note**: This security policy is subject to change. Please check back regularly for updates.

Last updated: October 16, 2025
