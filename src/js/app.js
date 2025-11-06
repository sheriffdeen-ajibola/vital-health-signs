import { AuthService } from "./auth-service";
import { VitalSignsCalculator } from "./calculations";
import { ModalManager } from "./modals";
import { VitalSignsStorage } from "./storage";

// Main Application Controller
class VitalSignsApp {
  constructor() {
    this.storage = new VitalSignsStorage();
    this.modals = new ModalManager();
    this.calculator = new VitalSignsCalculator();
    this.auth = new AuthService();

    this.init();
  }

  init() {
    this.bindEvents();
    this.setupAuthListeners();
  }

  setupAuthListeners() {
    this.auth.onAuthStateChanged((user) => {
      const authButtons = document.getElementById("authButtons");
      const userActions = document.getElementById("userActions");
      const userName = document.getElementById("userName");
      const mainContent = document.querySelector(".main-content");

      if (user) {
        // User is signed in
        authButtons.style.display = "none";
        userActions.style.display = "flex";
        userName.textContent = user.displayName || user.email;
        mainContent.style.display = "block";

        // Load user data
        this.loadDashboard();
        this.loadRecentReadings();
      } else {
        // No user is signed in
        authButtons.style.display = "flex";
        userActions.style.display = "none";
        userName.textContent = "";
        mainContent.style.display = "none";
      }
    });
  }

  bindEvents() {
    // Auth related events
    document.getElementById("signInBtn").addEventListener("click", () => {
      this.modals.openModal("signIn");
    });

    document.getElementById("signUpBtn").addEventListener("click", () => {
      this.modals.openModal("signUp");
    });

    document.getElementById("signOutBtn").addEventListener("click", () => {
      this.auth.signOut();
    });

    document
      .getElementById("showSignUpModal")
      .addEventListener("click", (e) => {
        e.preventDefault();
        this.modals.closeModal("signIn");
        this.modals.openModal("signUp");
      });

    document
      .getElementById("showSignInModal")
      .addEventListener("click", (e) => {
        e.preventDefault();
        this.modals.closeModal("signUp");
        this.modals.openModal("signIn");
      });

    // Sign In Form
    document
      .getElementById("signInForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("signInEmail").value;
        const password = document.getElementById("signInPassword").value;

        try {
          await this.auth.signIn(email, password);
          this.modals.closeModal("signIn");
          this.showNotification("Successfully signed in!", "success");
        } catch (error) {
          this.showNotification(error.message, "error");
        }
      });

    // Sign Up Form
    document
      .getElementById("signUpForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("signUpName").value;
        const email = document.getElementById("signUpEmail").value;
        const password = document.getElementById("signUpPassword").value;

        try {
          await this.auth.signUp(email, password, name);
          this.modals.closeModal("signUp");
          this.showNotification("Account created successfully!", "success");
        } catch (error) {
          this.showNotification(error.message, "error");
        }
      });

    // Header actions
    document.getElementById("addReadingBtn").addEventListener("click", () => {
      this.showAddReadingMenu();
    });

    document.getElementById("exportBtn").addEventListener("click", () => {
      this.exportData();
    });

    // Quick action buttons
    document.querySelectorAll(".quick-action-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const modalType = e.currentTarget.dataset.modal;
        this.modals.openModal(modalType);
      });
    });

    // Form submissions
    this.bindFormEvents();
  }

  bindFormEvents() {
    // BMI Form
    document.getElementById("bmiForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleBMISubmission();
    });

    // Heart Rate Form
    document.getElementById("heartRateForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleVitalSignSubmission("heartRate");
    });

    // Blood Pressure Form
    document
      .getElementById("bloodPressureForm")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleBloodPressureSubmission();
      });

    // Temperature Form
    document
      .getElementById("temperatureForm")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleTemperatureSubmission();
      });

    // Oxygen Saturation Form
    document.getElementById("oxygenForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleVitalSignSubmission("oxygen");
    });

    // Respiratory Rate Form
    document
      .getElementById("respiratoryForm")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleVitalSignSubmission("respiratory");
      });
  }

  handleBMISubmission() {
    const height = parseFloat(document.getElementById("height").value);
    const weight = parseFloat(document.getElementById("weight").value);
    const heightUnit = document.getElementById("heightUnit").value;
    const weightUnit = document.getElementById("weightUnit").value;

    if (!height || !weight) {
      this.showNotification(
        "Please enter valid height and weight values",
        "error"
      );
      return;
    }

    const bmi = this.calculator.calculateBMI(
      height,
      weight,
      heightUnit,
      weightUnit
    );
    const status = this.calculator.getBMIStatus(bmi);

    const reading = {
      id: Date.now(),
      type: "BMI",
      value: bmi.toFixed(1),
      unit: "kg/m²",
      status: status,
      timestamp: new Date().toISOString(),
      notes: `Height: ${height}${heightUnit}, Weight: ${weight}${weightUnit}`,
    };

    this.storage.saveReading(reading);
    this.modals.closeModal("bmi");
    this.loadDashboard();
    this.loadRecentReadings();
    this.showNotification("BMI calculated and saved successfully", "success");

    // Reset form
    document.getElementById("bmiForm").reset();
  }

  handleBloodPressureSubmission() {
    const systolic = parseInt(document.getElementById("systolic").value);
    const diastolic = parseInt(document.getElementById("diastolic").value);
    const notes = document.getElementById("bloodPressureNotes").value;

    if (!systolic || !diastolic) {
      this.showNotification(
        "Please enter valid blood pressure values",
        "error"
      );
      return;
    }

    const status = this.calculator.getBloodPressureStatus(systolic, diastolic);

    const reading = {
      id: Date.now(),
      type: "Blood Pressure",
      value: `${systolic}/${diastolic}`,
      unit: "mmHg",
      status: status,
      timestamp: new Date().toISOString(),
      notes: notes,
    };

    this.storage.saveReading(reading);
    this.modals.closeModal("bloodPressure");
    this.loadDashboard();
    this.loadRecentReadings();
    this.showNotification("Blood pressure recorded successfully", "success");

    // Reset form
    document.getElementById("bloodPressureForm").reset();
  }

  handleTemperatureSubmission() {
    const temperature = parseFloat(
      document.getElementById("temperatureValue").value
    );
    const unit = document.getElementById("temperatureUnit").value;
    const notes = document.getElementById("temperatureNotes").value;

    if (!temperature) {
      this.showNotification("Please enter a valid temperature value", "error");
      return;
    }

    // Convert to Fahrenheit for status calculation
    const tempInF = unit === "C" ? (temperature * 9) / 5 + 32 : temperature;
    const status = this.calculator.getTemperatureStatus(tempInF);

    const reading = {
      id: Date.now(),
      type: "Temperature",
      value: temperature.toFixed(1),
      unit: `°${unit}`,
      status: status,
      timestamp: new Date().toISOString(),
      notes: notes,
    };

    this.storage.saveReading(reading);
    this.modals.closeModal("temperature");
    this.loadDashboard();
    this.loadRecentReadings();
    this.showNotification("Temperature recorded successfully", "success");

    // Reset form
    document.getElementById("temperatureForm").reset();
  }

  handleVitalSignSubmission(type) {
    let value, unit, status, notes, displayName;

    switch (type) {
      case "heartRate":
        value = parseInt(document.getElementById("heartRateValue").value);
        unit = "bpm";
        status = this.calculator.getHeartRateStatus(value);
        notes = document.getElementById("heartRateNotes").value;
        displayName = "Heart Rate";
        break;

      case "oxygen":
        value = parseInt(document.getElementById("oxygenValue").value);
        unit = "%";
        status = this.calculator.getOxygenSaturationStatus(value);
        notes = document.getElementById("oxygenNotes").value;
        displayName = "Oxygen Saturation";
        break;

      case "respiratory":
        value = parseInt(document.getElementById("respiratoryValue").value);
        unit = "breaths/min";
        status = this.calculator.getRespiratoryRateStatus(value);
        notes = document.getElementById("respiratoryNotes").value;
        displayName = "Respiratory Rate";
        break;
    }

    if (!value) {
      this.showNotification("Please enter a valid value", "error");
      return;
    }

    const reading = {
      id: Date.now(),
      type: displayName,
      value: value.toString(),
      unit: unit,
      status: status,
      timestamp: new Date().toISOString(),
      notes: notes,
    };

    this.storage.saveReading(reading);
    this.modals.closeModal(type);
    this.loadDashboard();
    this.loadRecentReadings();
    this.showNotification(`${displayName} recorded successfully`, "success");

    // Reset form
    document.getElementById(`${type}Form`).reset();
  }

  loadDashboard() {
    const readings = this.storage.getAllReadings();

    // Update each vital sign with latest reading
    this.updateDashboardCard("heartRate", "Heart Rate", readings);
    this.updateDashboardCard("bloodPressure", "Blood Pressure", readings);
    this.updateDashboardCard("temperature", "Temperature", readings);
    this.updateDashboardCard("bmi", "BMI", readings);
    this.updateDashboardCard("oxygen", "Oxygen Saturation", readings);
    this.updateDashboardCard("respiratory", "Respiratory Rate", readings);
  }

  updateDashboardCard(cardType, displayName, readings) {
    const latestReading = readings
      .filter((r) => r.type === displayName)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

    // Fix: handle inconsistent HTML IDs (BMI, Oxygen, Respiratory)
    const idMap = {
      bmi: "latestBMI",
      oxygen: "latestOxygen",
      respiratory: "latestRespiratory",
      heartRate: "latestHeartRate",
      bloodPressure: "latestBloodPressure",
      temperature: "latestTemperature",
    };

    const valueElement = document.getElementById(idMap[cardType]);
    const statusElement = document.getElementById(`${cardType}Status`);

    if (latestReading && valueElement && statusElement) {
      valueElement.textContent = latestReading.value;
      statusElement.textContent = latestReading.status;
      statusElement.className = `stat-status ${this.getStatusClass(
        latestReading.status
      )}`;
    } else if (valueElement && statusElement) {
      valueElement.textContent = "--";
      statusElement.textContent = "No data";
      statusElement.className = "stat-status no-data";
    }
  }

  getStatusClass(status) {
    const normalStatuses = ["Normal", "Healthy Weight", "Normal Range"];
    const warningStatuses = [
      "Elevated",
      "Stage 1 Hypertension",
      "Overweight",
      "Underweight",
      "Low Grade Fever",
    ];

    if (normalStatuses.includes(status)) return "normal";
    if (warningStatuses.includes(status)) return "warning";
    return "critical";
  }

  loadRecentReadings() {
    const readings = this.storage
      .getAllReadings()
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    const tbody = document.getElementById("readingsTableBody");

    if (readings.length === 0) {
      tbody.innerHTML = `
                <tr class="no-data-row">
                    <td colspan="5">No readings recorded yet. Start by adding your first vital sign measurement.</td>
                </tr>
            `;
      return;
    }

    tbody.innerHTML = readings
      .map(
        (reading) => `
            <tr>
                <td>${this.formatDateTime(reading.timestamp)}</td>
                <td>${reading.type}</td>
                <td>${reading.value} ${reading.unit}</td>
                <td><span class="status-badge ${this.getStatusClass(
                  reading.status
                )}">${reading.status}</span></td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="app.deleteReading(${
                      reading.id
                    })">Delete</button>
                </td>
            </tr>
        `
      )
      .join("");
  }

  deleteReading(id) {
    if (confirm("Are you sure you want to delete this reading?")) {
      this.storage.deleteReading(id);
      this.loadDashboard();
      this.loadRecentReadings();
      this.showNotification("Reading deleted successfully", "success");
    }
  }

  formatDateTime(timestamp) {
    const date = new Date(timestamp);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  }

  exportData() {
    const readings = this.storage.getAllReadings();
    const csvContent = this.generateCSV(readings);
    this.downloadCSV(csvContent, "vital-signs-data.csv");
    this.showNotification("Data exported successfully", "success");
  }

  generateCSV(readings) {
    const headers = [
      "Date",
      "Time",
      "Type",
      "Value",
      "Unit",
      "Status",
      "Notes",
    ];
    const csvRows = [headers.join(",")];

    readings.forEach((reading) => {
      const date = new Date(reading.timestamp);
      const row = [
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        reading.type,
        reading.value,
        reading.unit,
        reading.status,
        reading.notes || "",
      ];
      csvRows.push(row.map((field) => `"${field}"`).join(","));
    });

    return csvRows.join("\n");
  }

  downloadCSV(content, filename) {
    const blob = new Blob([content], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Add styles
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

    // Set background color based on type
    const colors = {
      success: "#10b981",
      error: "#ef4444",
      warning: "#f59e0b",
      info: "#06b6d4",
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  showAddReadingMenu() {
    // For now, just show a simple alert. In a real app, this could be a dropdown menu
    this.showNotification(
      "Use the quick action buttons below to add readings",
      "info"
    );
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.app = new VitalSignsApp();
});
