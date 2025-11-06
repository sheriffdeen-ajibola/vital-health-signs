// Authentication Service
class AuthService {
  constructor() {
    this.auth = firebase.auth();
    this.currentUser = null;
    this.authStateChangeHandlers = new Set();

    // Listen for auth state changes
    this.auth.onAuthStateChanged((user) => {
      this.currentUser = user;
      this.notifyAuthStateChange(user);
    });
  }

  // Sign up with email and password
  async signUp(email, password, displayName) {
    try {
      const userCredential = await this.auth.createUserWithEmailAndPassword(
        email,
        password
      );
      await userCredential.user.updateProfile({ displayName });
      return userCredential.user;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  }

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  }

  // Sign out
  async signOut() {
    try {
      await this.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Add auth state change listener
  onAuthStateChanged(handler) {
    this.authStateChangeHandlers.add(handler);
    // Initial call with current state
    if (this.currentUser) {
      handler(this.currentUser);
    }
    return () => this.authStateChangeHandlers.delete(handler);
  }

  // Notify all listeners of auth state change
  notifyAuthStateChange(user) {
    this.authStateChangeHandlers.forEach((handler) => handler(user));
  }
}
