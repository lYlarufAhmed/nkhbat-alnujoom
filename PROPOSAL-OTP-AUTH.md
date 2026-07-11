# Technical Proposal: Admin Authentication Flow Upgrade — Email OTP

This proposal outlines the transition of the admin authentication flow from the current hardcoded local PIN system to a secure **One-Time Password (OTP) via Email** system.

---

## 1. Current State Analysis
* **Protected Routes:** Checked via `isAuthenticated` in `src/pages/admin/AdminLayout.jsx`.
* **State Management:** Handled by Zustand inside `src/stores/useAuthStore.js`, persisting status in `admin-auth-storage` under browser local storage.
* **Verification Logic:** Simple client-side check of user-entered PIN against `import.meta.env.VITE_ADMIN_PIN` (fallback to `'1234'`) inside `LoginPage.jsx`.
* **Backend:** Single-page app (React/Vite) talking directly to Firebase Firestore and Realtime Database. No cloud functions or external API backends are currently configured.

---

## 2. Comparison of OTP via Email Implementations

We analyze three primary paths to achieve email-based authentication from the current state:

### Option A: Firebase Passwordless Sign-In (Email Link) — ⭐ RECOMMENDED (Easiest & Most Secure)
This is an out-of-the-box feature provided by Firebase Authentication. Instead of a numeric code, the user enters their email and receives a secure, expiring sign-in link.
* **How it works:**
  1. Admin enters their email in the UI.
  2. Client calls `sendSignInLinkToEmail(auth, email, settings)`.
  3. Firebase sends the email automatically.
  4. Clicking the link redirects the user back to `/admin/login` (or `/admin/callback`) where the client completes verification using `signInWithEmailLink()`.
* **Complexity:** Extremely Low (Frontend changes only, ~50 lines of code).
* **Cost:** 100% Free (Firebase Auth covers unlimited email link deliveries on the Spark/free tier).
* **Security:** Extremely High (No exposed verification tokens; industry-standard security).

### Option B: Frontend-Only 6-Digit OTP (Firestore + EmailJS / Resend) — (Medium Ease, Security Risks)
If you specifically want a numeric 6-digit OTP code without deploying backend code:
* **How it works:**
  1. Client generates a random 6-digit code: `Math.floor(100000 + Math.random() * 900000)`.
  2. Client writes a document under a private Firestore collection (e.g., `/otps/{email}` or a randomly generated doc ID) with `{ code: "123456", expiresAt: Timestamp }`.
  3. Client sends the OTP email directly via **EmailJS** or **Resend API**.
  4. The user inputs the 6-digit code, and the client fetches the document to verify the match.
* **Complexity:** Medium (Frontend changes + custom Firestore rules).
* **Security:** Low to Medium. Hard to protect the OTP verification document securely without backend/server rules, leaving it vulnerable to tech-savvy users inspecting Firestore operations.

### Option C: Firebase Cloud Functions + Resend/Nodemailer — (High Security, High Complexity)
The gold standard for numeric 6-digit OTP systems.
* **How it works:**
  1. Create a Firebase Cloud Function (e.g., `sendEmailOtp`). It generates the OTP, stores it securely, and sends the email using Nodemailer/SMTP.
  2. Create a second Function `verifyEmailOtp`. It checks the code and returns a custom Firebase Auth token on success.
* **Complexity:** High (Requires Cloud Functions codebase, billing enabled for Blaze plan, outbound HTTP calls configuration).
* **Security:** Extremely High.

---

## 3. Recommended Implementation Plan (Option A: Email Link)

Since this is a client-only static app, **Option A** is the most elegant, easiest, and most secure solution. It requires zero backend servers or billing setups.

### Step 1: Enable Firebase Email Link
1. Go to the **Firebase Console** -> **Authentication** -> **Sign-in method**.
2. Enable the **Email/Password** provider and check **Email link (passwordless sign-in)**.

### Step 2: Update Firebase Config (`src/config/firebase.js`)
Initialize and export the Firebase Auth instance:
```javascript
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth' // Add this

const firebaseConfig = { ... };

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const rtdb = getDatabase(app)
export const auth = getAuth(app) // Export auth instance

export default app
```

### Step 3: Update Auth Store (`src/stores/useAuthStore.js`)
Update the store to manage authentication state based on the verified email:
```javascript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      adminEmail: null,
      setAuthenticated: (status, email = null) => set({ isAuthenticated: status, adminEmail: email }),
      logout: () => set({ isAuthenticated: false, adminEmail: null }),
    }),
    {
      name: 'admin-auth-storage',
    }
  )
)
```

### Step 4: Redesign the Login Page (`src/pages/admin/LoginPage.jsx`)
Change the PIN code view to support:
1. **Request Screen:** Admin enters their email.
2. **Success Screen:** Displays "An authentication link has been sent to your email!"

Example submit handler:
```javascript
import { auth } from '../../config/firebase'
import { sendSignInLinkToEmail } from 'firebase/auth'

const handleSendLink = async (e) => {
  e.preventDefault()
  setLoading(true)
  
  const actionCodeSettings = {
    url: `${window.location.origin}/admin/login`, // Redirect back to this same login page
    handleCodeInApp: true,
  }
  
  try {
    // Optional: whitelist emails here or check Firestore if you want only specific admins to log in
    await sendSignInLinkToEmail(auth, email, actionCodeSettings)
    window.localStorage.setItem('emailForSignIn', email) // Save email locally to complete login later
    setLinkSent(true)
  } catch (error) {
    setError(error.message)
  } finally {
    setLoading(false)
  }
}
```

### Step 5: Handle Callback on Landing
Add a `useEffect` on `LoginPage.jsx` to check if the user is loading the page via the magic link:
```javascript
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth'

useEffect(() => {
  const completeSignIn = async () => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn')
      
      if (!email) {
        // Fallback if browser localstorage was cleared
        email = window.prompt('Please enter your email again for verification:')
      }
      
      try {
        const result = await signInWithEmailLink(auth, email, window.location.href)
        window.localStorage.removeItem('emailForSignIn')
        
        // Final authorization whitelist check (e.g., only your email)
        const allowedAdmins = [import.meta.env.VITE_ALLOWED_ADMIN_EMAIL, 'ahmedmaruf474@gmail.com']
        if (allowedAdmins.includes(result.user.email)) {
          useAuthStore.getState().setAuthenticated(true, result.user.email)
          navigate('/admin/dashboard')
        } else {
          setError('Unauthorized email address.')
        }
      } catch (err) {
        setError('Failed to complete sign-in. Link may have expired.')
      }
    }
  }
  
  completeSignIn()
}, [navigate])
```
