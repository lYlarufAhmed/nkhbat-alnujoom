---
name: Upgrading Admin Auth Flow to Email OTP
about: Shift admin login from hardcoded local PIN to secure, passwordless email OTP.
title: 'feat: Upgrading Admin Auth Flow to Email OTP/Link'
labels: ['enhancement', 'security']
assignees: []
---

## Description
To enhance security and eliminate the hardcoded local PIN authentication (`VITE_ADMIN_PIN=1234`), we want to upgrade the admin authentication flow to a secure, passwordless **OTP / Email Link** authentication system utilizing Firebase Auth.

---

## Easiest Implementation Path: Firebase Email Link
Using the official Firebase Auth passwordless sign-in is the easiest path. It requires zero cloud functions, zero backend, and zero third-party subscription costs.

### Tasks to Accomplish
1. [ ] **Firebase Setup:** Enable **Email Link (passwordless sign-in)** under Sign-In Methods in the Firebase Authentication console.
2. [ ] **Update Config:** Install and export the Firebase Auth SDK instance from `src/config/firebase.js`.
3. [ ] **Update State Management:** Modify `src/stores/useAuthStore.js` to store the authenticated admin email and manage status.
4. [ ] **UI Redesign:** Update `src/pages/admin/LoginPage.jsx`:
   - Replace the PIN field with a modern Email Input form.
   - Implement link sending with `sendSignInLinkToEmail`.
   - Add a landing callback using `isSignInWithEmailLink` and `signInWithEmailLink` to verify the incoming magic token.
5. [ ] **Email Whitelisting:** Ensure only authorized admin emails (such as `ahmedmaruf474@gmail.com`) can proceed to `/admin/dashboard` after successful verification.

---

## References & Design
We have committed a comprehensive technical blueprint directly inside the repository at **`PROPOSAL-OTP-AUTH.md`**. Please refer to this file for complete code snippets and step-by-step guides!
