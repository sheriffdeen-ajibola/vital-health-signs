// Authentication Manager
class AuthManager {
  constructor() {
    this.auth = window.firebaseAuth;
    this.currentUser = null;
    this.authStateListeners = [];
  }

  // Initialize auth state listener
  init() {
    return new Promise((resolve) => {
      this.auth.onAuthStateChanged((user) => {
        this.currentUser = user;
        this.notifyAuthStateChange(user);

        if (user) {
          this.hideAuthUI();
          this.showApp();
          this.updateUserProfile(user);
        } else {
          this.showAuthUI();
          this.hideApp();
        }

        resolve(user);
      });
    });
  }

  // Register auth state change listener
  onAuthStateChange(callback) {
    this.authStateListeners.push(callback);
  }

  // Notify all listeners of auth state change
  notifyAuthStateChange(user) {
    this.authStateListeners.forEach((callback) => callback(user));
  }

  // Sign up with email and password
  async signUp(email, password, displayName) {
    try {
      const userCredential = await this.auth.createUserWithEmailAndPassword(
        email,
        password
      );

      // Update profile with display name
      if (displayName) {
        await userCredential.user.updateProfile({
          displayName: displayName,
        });
      }

      this.showNotification("Account created successfully!", "success");
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error("Sign up error:", error);
      this.showNotification(this.getErrorMessage(error.code), "error");
      return { success: false, error: error.message };
    }
  }

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(
        email,
        password
      );
      this.showNotification("Welcome back!", "success");
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error("Sign in error:", error);
      this.showNotification(this.getErrorMessage(error.code), "error");
      return { success: false, error: error.message };
    }
  }

  // Sign out
  async signOut() {
    try {
      await this.auth.signOut();
      this.showNotification("Signed out successfully", "success");
      return { success: true };
    } catch (error) {
      console.error("Sign out error:", error);
      this.showNotification("Error signing out", "error");
      return { success: false, error: error.message };
    }
  }

  // Password reset
  async resetPassword(email) {
    try {
      await this.auth.sendPasswordResetEmail(email);
      this.showNotification("Password reset email sent!", "success");
      return { success: true };
    } catch (error) {
      console.error("Password reset error:", error);
      this.showNotification(this.getErrorMessage(error.code), "error");
      return { success: false, error: error.message };
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Get user ID
  getUserId() {
    return this.currentUser ? this.currentUser.uid : null;
  }

  // Update user profile in header
  updateUserProfile(user) {
    const profileContainer = document.getElementById("userProfile");
    if (!profileContainer) return;

    const displayName = user.displayName || user.email.split("@")[0];
    const email = user.email;

    profileContainer.innerHTML = `
      <div class="user-profile">
        <div class="user-avatar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div class="user-info">
          <div class="user-name">${displayName}</div>
          <div class="user-email">${email}</div>
        </div>
        <button class="btn btn-secondary btn-sm" id="signOutBtn">Sign Out</button>
      </div>
    `;

    // Bind sign out button
    document.getElementById("signOutBtn").addEventListener("click", () => {
      this.signOut();
    });
  }

  // Show authentication UI
  showAuthUI() {
    const authContainer = document.getElementById("authContainer");
    const appContainer = document.querySelector(".app-container");

    if (authContainer) {
      authContainer.style.display = "flex";
    }
    if (appContainer) {
      appContainer.style.display = "none";
    }
  }

  // Hide authentication UI
  hideAuthUI() {
    const authContainer = document.getElementById("authContainer");
    if (authContainer) {
      authContainer.style.display = "none";
    }
  }

  // Show main app
  showApp() {
    const appContainer = document.querySelector(".app-container");
    if (appContainer) {
      appContainer.style.display = "block";
    }
  }

  // Hide main app
  hideApp() {
    const appContainer = document.querySelector(".app-container");
    if (appContainer) {
      appContainer.style.display = "none";
    }
  }

  // Get user-friendly error messages
  getErrorMessage(errorCode) {
    const errorMessages = {
      "auth/email-already-in-use":
        "This email is already registered. Please sign in instead.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/weak-password": "Password should be at least 6 characters long.",
      "auth/user-not-found": "No account found with this email.",
      "auth/wrong-password": "Incorrect password. Please try again.",
      "auth/too-many-requests":
        "Too many failed attempts. Please try again later.",
      "auth/network-request-failed":
        "Network error. Please check your connection.",
      "auth/user-disabled": "This account has been disabled.",
      "auth/requires-recent-login":
        "Please sign in again to complete this action.",
    };

    return errorMessages[errorCode] || "An error occurred. Please try again.";
  }

  // Show notification
  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    Object.assign(notification.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      padding: "12px 24px",
      borderRadius: "8px",
      color: "white",
      fontWeight: "500",
      zIndex: "9999",
      transform: "translateX(100%)",
      transition: "transform 0.3s ease-in-out",
    });

    const colors = {
      success: "#10b981",
      error: "#ef4444",
      warning: "#f59e0b",
      info: "#06b6d4",
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}

// Initialize auth manager
window.authManager = new AuthManager();
