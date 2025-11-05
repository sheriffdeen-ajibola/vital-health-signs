// Modal Management System
class ModalManager {
  constructor() {
    this.overlay = document.getElementById("modalOverlay");
    this.activeModal = null;
    this.bindEvents();
  }

  bindEvents() {
    // Overlay click to close
    this.overlay.addEventListener("click", () => {
      this.closeActiveModal();
    });

    // Close button clicks
    document.querySelectorAll(".modal-close").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const modalType = e.target.dataset.modal;
        this.closeModal(modalType);
      });
    });

    // Cancel button clicks
    document.querySelectorAll("[data-modal]").forEach((btn) => {
      if (btn.textContent.trim() === "Cancel") {
        btn.addEventListener("click", (e) => {
          const modalType = e.target.dataset.modal;
          this.closeModal(modalType);
        });
      }
    });

    // Escape key to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.activeModal) {
        this.closeActiveModal();
      }
    });

    // Prevent modal content clicks from closing modal
    document.querySelectorAll(".modal-content").forEach((content) => {
      content.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    });
  }

  openModal(modalType) {
    const modal = document.getElementById(`${modalType}Modal`);
    if (!modal) {
      console.error(`Modal ${modalType} not found`);
      return;
    }

    // Close any existing modal first
    if (this.activeModal) {
      this.closeActiveModal();
    }

    // Show overlay
    this.overlay.classList.add("active");

    // Show modal with slight delay for smooth animation
    setTimeout(() => {
      modal.classList.add("active");
      this.activeModal = modalType;

      // Focus first input in modal
      const firstInput = modal.querySelector("input, select, textarea");
      if (firstInput) {
        firstInput.focus();
      }
    }, 50);

    // Prevent body scroll
    document.body.style.overflow = "hidden";
  }

  closeModal(modalType) {
    const modal = document.getElementById(`${modalType}Modal`);
    if (!modal) {
      console.error(`Modal ${modalType} not found`);
      return;
    }

    // Hide modal
    modal.classList.remove("active");

    // Hide overlay after modal animation
    setTimeout(() => {
      this.overlay.classList.remove("active");
      this.activeModal = null;

      // Restore body scroll
      document.body.style.overflow = "";
    }, 250);

    // Clear form data
    this.clearModalForm(modal);
  }

  closeActiveModal() {
    if (this.activeModal) {
      this.closeModal(this.activeModal);
    }
  }

  clearModalForm(modal) {
    const form = modal.querySelector("form");
    if (form) {
      form.reset();

      // Clear any validation states
      const inputs = form.querySelectorAll("input, select, textarea");
      inputs.forEach((input) => {
        input.classList.remove("error", "valid");
      });
    }
  }

  showValidationError(inputId, message) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.classList.add("error");

    // Remove existing error message
    const existingError = input.parentNode.querySelector(".error-message");
    if (existingError) {
      existingError.remove();
    }

    // Add new error message
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
            color: #ef4444;
            font-size: 0.75rem;
            margin-top: 0.25rem;
        `;

    input.parentNode.appendChild(errorDiv);

    // Remove error state when user starts typing
    input.addEventListener(
      "input",
      () => {
        input.classList.remove("error");
        const errorMsg = input.parentNode.querySelector(".error-message");
        if (errorMsg) {
          errorMsg.remove();
        }
      },
      { once: true }
    );
  }

  validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    let isValid = true;
    const requiredInputs = form.querySelectorAll("[required]");

    requiredInputs.forEach((input) => {
      if (!input.value.trim()) {
        this.showValidationError(input.id, "This field is required");
        isValid = false;
      }
    });

    // Specific validations based on form type
    if (formId === "bmiForm") {
      isValid = this.validateBMIForm() && isValid;
    } else if (formId === "bloodPressureForm") {
      isValid = this.validateBloodPressureForm() && isValid;
    }

    return isValid;
  }

  validateBMIForm() {
    const height = parseFloat(document.getElementById("height").value);
    const weight = parseFloat(document.getElementById("weight").value);
    let isValid = true;

    if (height <= 0) {
      this.showValidationError("height", "Height must be greater than 0");
      isValid = false;
    }

    if (weight <= 0) {
      this.showValidationError("weight", "Weight must be greater than 0");
      isValid = false;
    }

    return isValid;
  }

  validateBloodPressureForm() {
    const systolic = parseInt(document.getElementById("systolic").value);
    const diastolic = parseInt(document.getElementById("diastolic").value);
    let isValid = true;

    if (systolic <= diastolic) {
      this.showValidationError(
        "systolic",
        "Systolic pressure must be higher than diastolic"
      );
      this.showValidationError(
        "diastolic",
        "Diastolic pressure must be lower than systolic"
      );
      isValid = false;
    }

    if (systolic < 70 || systolic > 250) {
      this.showValidationError(
        "systolic",
        "Systolic pressure should be between 70-250 mmHg"
      );
      isValid = false;
    }

    if (diastolic < 40 || diastolic > 150) {
      this.showValidationError(
        "diastolic",
        "Diastolic pressure should be between 40-150 mmHg"
      );
      isValid = false;
    }

    return isValid;
  }

  validateTemperatureForm() {
    const temperature = parseFloat(
      document.getElementById("temperatureValue").value
    );
    let isValid = true;

    if (isNaN(temperature)) {
      this.showValidationError("temperature", "Enter a valid temperature");
      isValid = false;
    }

    return isValid;
  }

  validateRespiratoryForm() {
    const respiratory = parseFloat(
      document.getElementById("respiratoryValue").value
    );
    let isValid = true;

    if (isNaN(respiratory)) {
      this.showValidationError(
        "respiratoryValue",
        "Enter a valid respiratory rate"
      );
      isValid = false;
    }

    return isValid;
  }

  validateOxygenForm() {
    const oxygen = parseFloat(document.getElementById("oxygenValue").value);
    let isValid = true;

    if (isNaN(oxygen)) {
      this.showValidationError(
        "oxygenValue",
        "Enter a valid oxygen saturation"
      );
      isValid = false;
    }

    return isValid;
  }

  handleOxygenSubmit(event) {
    // event already prevented by delegation
    const valEl = document.getElementById("oxygenValue");
    const notesEl = document.getElementById("oxygenNotes");

    const value = valEl ? parseFloat(valEl.value) : NaN;
    if (isNaN(value)) {
      this.showValidationError(
        "oxygenValue",
        "Enter a valid oxygen saturation"
      );
      return;
    }

    const reading = {
      type: "oxygen",
      value: value,
      unit: "%",
      notes: notesEl ? notesEl.value.trim() : "",
      timestamp: new Date().toISOString(),
    };

    try {
      // Use existing global storage instance if available; create if missing
      const storage =
        window.vitalSignsStorage ||
        (window.vitalSignsStorage = new VitalSignsStorage());
      const saved = storage.saveReading(reading);

      if (!saved) {
        console.error("Failed to save oxygen reading");
      } else {
        // Update dashboard UI immediately
        const latestEl = document.getElementById("latestOxygen");
        const statusEl = document.getElementById("oxygenStatus");
        if (latestEl) latestEl.textContent = `${value}`;
        if (statusEl) {
          if (value >= 95) statusEl.textContent = "Normal";
          else if (value >= 90) statusEl.textContent = "Low";
          else statusEl.textContent = "Critical";
        }

        // If app exposes a refresh function, call it to repopulate tables/charts
        if (typeof window.refreshDashboard === "function") {
          window.refreshDashboard();
        }
      }
    } catch (err) {
      console.error("Failed to save oxygen reading:", err);
    }

    // Close the modal after handling
    this.closeModal("oxygen");
  }
}
