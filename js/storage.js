// Firebase Storage Management for Vital Signs Data
class VitalSignsStorage {
  constructor() {
    this.db = firebase.firestore();
    this.auth = firebase.auth();
    this.currentUser = null;

    // Listen for auth state changes
    this.auth.onAuthStateChanged((user) => {
      this.currentUser = user;
      if (user) {
        this.initializeStorage();
      }
    });
  }

  initializeStorage() {
    // Initialize storage if it doesn't exist
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }

    if (!localStorage.getItem(this.settingsKey)) {
      const defaultSettings = {
        temperatureUnit: "F",
        weightUnit: "lbs",
        heightUnit: "ft",
        dateFormat: "MM/DD/YYYY",
        notifications: true,
        dataRetentionDays: 365,
      };
      localStorage.setItem(this.settingsKey, JSON.stringify(defaultSettings));
    }
  }

  // Reading Management
  saveReading(reading) {
    try {
      const readings = this.getAllReadings();

      // Add timestamp if not provided
      if (!reading.timestamp) {
        reading.timestamp = new Date().toISOString();
      }

      // Add unique ID if not provided
      if (!reading.id) {
        reading.id = Date.now() + Math.random();
      }

      readings.push(reading);
      localStorage.setItem(this.storageKey, JSON.stringify(readings));

      // Clean up old data based on retention settings
      this.cleanupOldData();

      return true;
    } catch (error) {
      console.error("Error saving reading:", error);
      return false;
    }
  }

  getAllReadings() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error retrieving readings:", error);
      return [];
    }
  }

  getReadingsByType(type) {
    return this.getAllReadings().filter((reading) => reading.type === type);
  }

  getReadingsByDateRange(startDate, endDate) {
    const readings = this.getAllReadings();
    const start = new Date(startDate);
    const end = new Date(endDate);

    return readings.filter((reading) => {
      const readingDate = new Date(reading.timestamp);
      return readingDate >= start && readingDate <= end;
    });
  }

  getLatestReading(type) {
    const readings = this.getReadingsByType(type);
    if (readings.length === 0) return null;

    return readings.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    )[0];
  }

  updateReading(id, updatedData) {
    try {
      const readings = this.getAllReadings();
      const index = readings.findIndex((reading) => reading.id === id);

      if (index === -1) {
        console.error("Reading not found");
        return false;
      }

      readings[index] = { ...readings[index], ...updatedData };
      localStorage.setItem(this.storageKey, JSON.stringify(readings));
      return true;
    } catch (error) {
      console.error("Error updating reading:", error);
      return false;
    }
  }

  deleteReading(id) {
    try {
      const readings = this.getAllReadings();
      const filteredReadings = readings.filter((reading) => reading.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(filteredReadings));
      return true;
    } catch (error) {
      console.error("Error deleting reading:", error);
      return false;
    }
  }

  // Settings Management
  getSettings() {
    try {
      const settings = localStorage.getItem(this.settingsKey);
      return settings ? JSON.parse(settings) : {};
    } catch (error) {
      console.error("Error retrieving settings:", error);
      return {};
    }
  }

  updateSettings(newSettings) {
    try {
      const currentSettings = this.getSettings();
      const updatedSettings = { ...currentSettings, ...newSettings };
      localStorage.setItem(this.settingsKey, JSON.stringify(updatedSettings));
      return true;
    } catch (error) {
      console.error("Error updating settings:", error);
      return false;
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

    // Calculate trend (simple linear regression)
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
    const sumX = (n * (n - 1)) / 2; // Sum of indices 0, 1, 2, ..., n-1
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumXX = values.reduce((sum, _, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    // Return trend as percentage change per reading
    return Math.round(slope * 100) / 100;
  }

  // Data Export/Import
  exportData() {
    const data = {
      readings: this.getAllReadings(),
      settings: this.getSettings(),
      exportDate: new Date().toISOString(),
      version: "1.0",
    };

    return JSON.stringify(data, null, 2);
  }

  importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);

      if (!data.readings || !Array.isArray(data.readings)) {
        throw new Error("Invalid data format");
      }

      // Backup current data
      const backup = this.exportData();
      localStorage.setItem("vitalSignsBackup", backup);

      // Import new data
      localStorage.setItem(this.storageKey, JSON.stringify(data.readings));

      if (data.settings) {
        localStorage.setItem(this.settingsKey, JSON.stringify(data.settings));
      }

      return true;
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  }

  // Data Cleanup
  cleanupOldData() {
    const settings = this.getSettings();
    const retentionDays = settings.dataRetentionDays || 365;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const readings = this.getAllReadings();
    const filteredReadings = readings.filter((reading) => {
      const readingDate = new Date(reading.timestamp);
      return readingDate >= cutoffDate;
    });

    if (filteredReadings.length !== readings.length) {
      localStorage.setItem(this.storageKey, JSON.stringify(filteredReadings));
      console.log(
        `Cleaned up ${readings.length - filteredReadings.length} old readings`
      );
    }
  }

  // Storage Usage
  getStorageUsage() {
    const readings = JSON.stringify(this.getAllReadings());
    const settings = JSON.stringify(this.getSettings());

    return {
      readings: new Blob([readings]).size,
      settings: new Blob([settings]).size,
      total: new Blob([readings + settings]).size,
      readingsCount: this.getAllReadings().length,
    };
  }

  // Clear all data
  clearAllData() {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.settingsKey);
      this.initializeStorage();
      return true;
    } catch (error) {
      console.error("Error clearing data:", error);
      return false;
    }
  }

  // Search functionality
  searchReadings(query, searchFields = ["type", "notes"]) {
    const readings = this.getAllReadings();
    const lowercaseQuery = query.toLowerCase();

    return readings.filter((reading) => {
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
}
