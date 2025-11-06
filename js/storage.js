// Firestore Storage Management for Vital Signs Data
class VitalSignsStorage {
  constructor() {
    this.db = window.firebaseDb;
    this.auth = window.firebaseAuth;
    this.settingsKey = "vitalSignsSettings";
    this.cachedReadings = [];
    this.cachedSettings = null;
  }

  // Get current user's collection reference
  getUserReadingsRef() {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }
    return this.db.collection("users").doc(user.uid).collection("readings");
  }

  // Get user settings reference
  getUserSettingsRef() {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }
    return this.db.collection("users").doc(user.uid);
  }

  // Initialize user data
  async initializeUserData() {
    try {
      const userRef = this.getUserSettingsRef();
      const doc = await userRef.get();

      if (!doc.exists) {
        // Create default settings for new user
        const defaultSettings = {
          temperatureUnit: "F",
          weightUnit: "lbs",
          heightUnit: "ft",
          dateFormat: "MM/DD/YYYY",
          notifications: true,
          dataRetentionDays: 365,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        };
        await userRef.set(defaultSettings);
      }

      // Load initial data
      await this.loadAllReadings();
      return true;
    } catch (error) {
      console.error("Error initializing user data:", error);
      return false;
    }
  }

  // Load all readings from Firestore
  async loadAllReadings() {
    try {
      const snapshot = await this.getUserReadingsRef()
        .orderBy("timestamp", "desc")
        .get();

      this.cachedReadings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return this.cachedReadings;
    } catch (error) {
      console.error("Error loading readings:", error);
      return [];
    }
  }

  // Save reading to Firestore
  async saveReading(reading) {
    try {
      // Add timestamp if not provided
      if (!reading.timestamp) {
        reading.timestamp = new Date().toISOString();
      }

      // Remove id if it exists (Firestore will generate one)
      const { id, ...readingData } = reading;

      // Save to Firestore
      const docRef = await this.getUserReadingsRef().add({
        ...readingData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      // Update cache
      const newReading = { id: docRef.id, ...readingData };
      this.cachedReadings.unshift(newReading);

      return true;
    } catch (error) {
      console.error("Error saving reading:", error);
      return false;
    }
  }

  // Get all readings (from cache)
  getAllReadings() {
    return this.cachedReadings;
  }

  // Get readings by type
  getReadingsByType(type) {
    return this.cachedReadings.filter((reading) => reading.type === type);
  }

  // Get readings by date range
  getReadingsByDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return this.cachedReadings.filter((reading) => {
      const readingDate = new Date(reading.timestamp);
      return readingDate >= start && readingDate <= end;
    });
  }

  // Get latest reading by type
  getLatestReading(type) {
    const readings = this.getReadingsByType(type);
    if (readings.length === 0) return null;

    return readings.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    )[0];
  }

  // Update reading in Firestore
  async updateReading(id, updatedData) {
    try {
      await this.getUserReadingsRef().doc(id).update(updatedData);

      // Update cache
      const index = this.cachedReadings.findIndex(
        (reading) => reading.id === id
      );
      if (index !== -1) {
        this.cachedReadings[index] = {
          ...this.cachedReadings[index],
          ...updatedData,
        };
      }

      return true;
    } catch (error) {
      console.error("Error updating reading:", error);
      return false;
    }
  }

  // Delete reading from Firestore
  async deleteReading(id) {
    try {
      await this.getUserReadingsRef().doc(id).delete();

      // Update cache
      this.cachedReadings = this.cachedReadings.filter(
        (reading) => reading.id !== id
      );

      return true;
    } catch (error) {
      console.error("Error deleting reading:", error);
      return false;
    }
  }

  // Get settings from Firestore
  async getSettings() {
    try {
      if (this.cachedSettings) {
        return this.cachedSettings;
      }

      const doc = await this.getUserSettingsRef().get();
      if (doc.exists) {
        this.cachedSettings = doc.data();
        return this.cachedSettings;
      }

      return {};
    } catch (error) {
      console.error("Error retrieving settings:", error);
      return {};
    }
  }

  // Update settings in Firestore
  async updateSettings(newSettings) {
    try {
      await this.getUserSettingsRef().update(newSettings);

      // Update cache
      this.cachedSettings = { ...this.cachedSettings, ...newSettings };

      return true;
    } catch (error) {
      console.error("Error updating settings:", error);
      return false;
    }
  }

  // Real-time listener for readings
  subscribeToReadings(callback) {
    try {
      return this.getUserReadingsRef()
        .orderBy("timestamp", "desc")
        .onSnapshot((snapshot) => {
          this.cachedReadings = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          callback(this.cachedReadings);
        });
    } catch (error) {
      console.error("Error subscribing to readings:", error);
      return null;
    }
  }

  // Data Analysis Methods
  getStatistics(type, days = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const readings = this.getReadingsByDateRange(startDate, endDate)
      .filter((reading) => reading.type === type)
      .map((reading) => parseFloat(reading.value));

    if (readings.length === 0) {
      return {
        count: 0,
        average: null,
        min: null,
        max: null,
        trend: null,
      };
    }

    const sum = readings.reduce((a, b) => a + b, 0);
    const average = sum / readings.length;
    const min = Math.min(...readings);
    const max = Math.max(...readings);
    const trend = this.calculateTrend(readings);

    return {
      count: readings.length,
      average: Math.round(average * 100) / 100,
      min: min,
      max: max,
      trend: trend,
    };
  }

  calculateTrend(values) {
    if (values.length < 2) return 0;

    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumXX = values.reduce((sum, _, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return Math.round(slope * 100) / 100;
  }

  // Export data
  async exportData() {
    const readings = this.getAllReadings();
    const settings = await this.getSettings();

    const data = {
      readings: readings,
      settings: settings,
      exportDate: new Date().toISOString(),
      version: "2.0",
      userId: this.auth.currentUser?.uid,
    };

    return JSON.stringify(data, null, 2);
  }

  // Import data
  async importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);

      if (!data.readings || !Array.isArray(data.readings)) {
        throw new Error("Invalid data format");
      }

      // Import readings
      const batch = this.db.batch();
      const readingsRef = this.getUserReadingsRef();

      data.readings.forEach((reading) => {
        const { id, ...readingData } = reading;
        const docRef = readingsRef.doc();
        batch.set(docRef, {
          ...readingData,
          importedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();

      // Import settings if available
      if (data.settings) {
        await this.updateSettings(data.settings);
      }

      // Reload data
      await this.loadAllReadings();

      return true;
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  }

  // Clean up old data
  async cleanupOldData() {
    try {
      const settings = await this.getSettings();
      const retentionDays = settings.dataRetentionDays || 365;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const oldReadings = await this.getUserReadingsRef()
        .where("timestamp", "<", cutoffDate.toISOString())
        .get();

      if (oldReadings.empty) return;

      const batch = this.db.batch();
      oldReadings.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      console.log(`Cleaned up ${oldReadings.size} old readings`);
      await this.loadAllReadings();
    } catch (error) {
      console.error("Error cleaning up old data:", error);
    }
  }

  // Search functionality
  searchReadings(query, searchFields = ["type", "notes"]) {
    const lowercaseQuery = query.toLowerCase();

    return this.cachedReadings.filter((reading) => {
      return searchFields.some((field) => {
        const fieldValue = reading[field];
        return (
          fieldValue &&
          fieldValue.toString().toLowerCase().includes(lowercaseQuery)
        );
      });
    });
  }

  // Get readings for specific date
  getReadingsForDate(date) {
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    return this.getReadingsByDateRange(startOfDay, endOfDay);
  }

  // Clear all user data
  async clearAllData() {
    try {
      // Delete all readings
      const snapshot = await this.getUserReadingsRef().get();
      const batch = this.db.batch();

      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      // Clear cache
      this.cachedReadings = [];
      this.cachedSettings = null;

      return true;
    } catch (error) {
      console.error("Error clearing data:", error);
      return false;
    }
  }
}
