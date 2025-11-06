// Vital Signs Calculations and Status Determinations
class VitalSignsCalculator {
  constructor() {
    // Define normal ranges for different vital signs
    this.ranges = {
      heartRate: {
        normal: { min: 60, max: 100 },
        bradycardia: { max: 59 },
        tachycardia: { min: 101 },
      },
      bloodPressure: {
        normal: { systolic: { max: 119 }, diastolic: { max: 79 } },
        elevated: { systolic: { min: 120, max: 129 }, diastolic: { max: 79 } },
        stage1: {
          systolic: { min: 130, max: 139 },
          diastolic: { min: 80, max: 89 },
        },
        stage2: { systolic: { min: 140 }, diastolic: { min: 90 } },
      },
      temperature: {
        normal: { min: 97.0, max: 99.5 }, // Fahrenheit
        lowGrade: { min: 99.6, max: 102.0 },
        moderate: { min: 102.1, max: 104.0 },
        high: { min: 104.1 },
      },
      oxygenSaturation: {
        normal: { min: 95 },
        mild: { min: 90, max: 94 },
        moderate: { min: 85, max: 89 },
        severe: { max: 84 },
      },
      respiratoryRate: {
        normal: { min: 12, max: 20 },
        bradypnea: { max: 11 },
        tachypnea: { min: 21 },
      },
      bmi: {
        underweight: { max: 18.4 },
        normal: { min: 18.5, max: 24.9 },
        overweight: { min: 25.0, max: 29.9 },
        obese: { min: 30.0 },
      },
    };
  }

  // BMI Calculations
  calculateBMI(height, weight, heightUnit = "cm", weightUnit = "kg") {
    // Convert height to meters
    let heightInMeters;
    switch (heightUnit) {
      case "cm":
        heightInMeters = height / 100;
        break;
      case "ft":
        heightInMeters = height * 0.3048;
        break;
      case "in":
        heightInMeters = height * 0.0254;
        break;
      default:
        heightInMeters = height / 100; // Default to cm
    }

    // Convert weight to kg
    let weightInKg;
    switch (weightUnit) {
      case "kg":
        weightInKg = weight;
        break;
      case "lbs":
        weightInKg = weight * 0.453592;
        break;
      default:
        weightInKg = weight; // Default to kg
    }

    // Calculate BMI
    return weightInKg / (heightInMeters * heightInMeters);
  }

  getBMIStatus(bmi) {
    const ranges = this.ranges.bmi;

    if (bmi <= ranges.underweight.max) {
      return "Underweight";
    } else if (bmi >= ranges.normal.min && bmi <= ranges.normal.max) {
      return "Healthy Weight";
    } else if (bmi >= ranges.overweight.min && bmi <= ranges.overweight.max) {
      return "Overweight";
    } else if (bmi >= ranges.obese.min) {
      return "Obese";
    }

    return "Unknown";
  }

  getBMICategory(bmi) {
    const status = this.getBMIStatus(bmi);
    const categories = {
      Underweight: {
        color: "#f59e0b",
        recommendation:
          "Consider consulting with a healthcare provider about healthy weight gain strategies.",
      },
      "Healthy Weight": {
        color: "#10b981",
        recommendation:
          "Maintain your current healthy lifestyle with balanced diet and regular exercise.",
      },
      Overweight: {
        color: "#f59e0b",
        recommendation:
          "Consider lifestyle changes including diet modification and increased physical activity.",
      },
      Obese: {
        color: "#ef4444",
        recommendation:
          "Consult with a healthcare provider for a comprehensive weight management plan.",
      },
    };

    return (
      categories[status] || {
        color: "#64748b",
        recommendation: "Consult with a healthcare provider.",
      }
    );
  }

  // Heart Rate Status
  getHeartRateStatus(heartRate) {
    const ranges = this.ranges.heartRate;

    if (heartRate <= ranges.bradycardia.max) {
      return "Bradycardia";
    } else if (
      heartRate >= ranges.normal.min &&
      heartRate <= ranges.normal.max
    ) {
      return "Normal";
    } else if (heartRate >= ranges.tachycardia.min) {
      return "Tachycardia";
    }

    return "Unknown";
  }

  // Blood Pressure Status
  getBloodPressureStatus(systolic, diastolic) {
    const ranges = this.ranges.bloodPressure;

    // Check for hypertensive crisis first
    if (systolic >= 180 || diastolic >= 120) {
      return "Hypertensive Crisis";
    }

    // Stage 2 Hypertension
    if (
      systolic >= ranges.stage2.systolic.min ||
      diastolic >= ranges.stage2.diastolic.min
    ) {
      return "Stage 2 Hypertension";
    }

    // Stage 1 Hypertension
    if (
      (systolic >= ranges.stage1.systolic.min &&
        systolic <= ranges.stage1.systolic.max) ||
      (diastolic >= ranges.stage1.diastolic.min &&
        diastolic <= ranges.stage1.diastolic.max)
    ) {
      return "Stage 1 Hypertension";
    }

    // Elevated
    if (
      systolic >= ranges.elevated.systolic.min &&
      systolic <= ranges.elevated.systolic.max &&
      diastolic <= ranges.elevated.diastolic.max
    ) {
      return "Elevated";
    }

    // Normal
    if (
      systolic <= ranges.normal.systolic.max &&
      diastolic <= ranges.normal.diastolic.max
    ) {
      return "Normal";
    }

    return "Unknown";
  }

  // Temperature Status
  getTemperatureStatus(temperature) {
    const ranges = this.ranges.temperature;

    if (temperature < ranges.normal.min) {
      return "Hypothermia";
    } else if (
      temperature >= ranges.normal.min &&
      temperature <= ranges.normal.max
    ) {
      return "Normal";
    } else if (
      temperature >= ranges.lowGrade.min &&
      temperature <= ranges.lowGrade.max
    ) {
      return "Low Grade Fever";
    } else if (
      temperature >= ranges.moderate.min &&
      temperature <= ranges.moderate.max
    ) {
      return "Moderate Fever";
    } else if (temperature >= ranges.high.min) {
      return "High Fever";
    }

    return "Unknown";
  }

  // Oxygen Saturation Status
  getOxygenSaturationStatus(oxygenLevel) {
    const ranges = this.ranges.oxygenSaturation;

    if (oxygenLevel >= ranges.normal.min) {
      return "Normal Range";
    } else if (
      oxygenLevel >= ranges.mild.min &&
      oxygenLevel <= ranges.mild.max
    ) {
      return "Mild Hypoxemia";
    } else if (
      oxygenLevel >= ranges.moderate.min &&
      oxygenLevel <= ranges.moderate.max
    ) {
      return "Moderate Hypoxemia";
    } else if (oxygenLevel <= ranges.severe.max) {
      return "Severe Hypoxemia";
    }

    return "Unknown";
  }

  // Respiratory Rate Status
  getRespiratoryRateStatus(respiratoryRate) {
    const ranges = this.ranges.respiratoryRate;

    if (respiratoryRate <= ranges.bradypnea.max) {
      return "Bradypnea";
    } else if (
      respiratoryRate >= ranges.normal.min &&
      respiratoryRate <= ranges.normal.max
    ) {
      return "Normal";
    } else if (respiratoryRate >= ranges.tachypnea.min) {
      return "Tachypnea";
    }

    return "Unknown";
  }

  // Get recommendations based on vital sign status
  getRecommendations(type, status, value) {
    const recommendations = {
      "Heart Rate": {
        Bradycardia:
          "Consult with a healthcare provider. May be normal for athletes or could indicate underlying conditions.",
        Normal: "Maintain regular physical activity and healthy lifestyle.",
        Tachycardia:
          "Consider factors like stress, caffeine, or physical activity. Consult healthcare provider if persistent.",
      },
      "Blood Pressure": {
        Normal:
          "Maintain healthy diet, regular exercise, and stress management.",
        Elevated:
          "Lifestyle modifications recommended: reduce sodium, increase exercise, manage stress.",
        "Stage 1 Hypertension":
          "Consult healthcare provider. Lifestyle changes and possible medication may be needed.",
        "Stage 2 Hypertension":
          "Seek medical attention. Medication and lifestyle changes typically required.",
        "Hypertensive Crisis": "Seek immediate medical attention.",
      },
      Temperature: {
        Normal: "Temperature is within normal range.",
        "Low Grade Fever":
          "Monitor symptoms, stay hydrated, rest. Consult healthcare provider if persistent.",
        "Moderate Fever":
          "Seek medical attention, especially if accompanied by other symptoms.",
        "High Fever": "Seek immediate medical attention.",
        Hypothermia: "Seek immediate medical attention.",
      },
      "Oxygen Saturation": {
        "Normal Range": "Oxygen levels are adequate.",
        "Mild Hypoxemia": "Monitor closely, consult healthcare provider.",
        "Moderate Hypoxemia": "Seek medical attention.",
        "Severe Hypoxemia": "Seek immediate medical attention.",
      },
      "Respiratory Rate": {
        Normal: "Respiratory rate is within normal range.",
        Bradypnea:
          "Monitor for other symptoms, consult healthcare provider if concerned.",
        Tachypnea:
          "May indicate stress, fever, or respiratory issues. Consult healthcare provider if persistent.",
      },
    };

    return (
      recommendations[type]?.[status] ||
      "Consult with a healthcare provider for proper evaluation."
    );
  }

  // Calculate ideal weight range based on height
  calculateIdealWeightRange(height, heightUnit = "cm") {
    // Convert height to cm
    let heightInCm;
    switch (heightUnit) {
      case "cm":
        heightInCm = height;
        break;
      case "ft":
        heightInCm = height * 30.48;
        break;
      case "in":
        heightInCm = height * 2.54;
        break;
      default:
        heightInCm = height;
    }

    const heightInM = heightInCm / 100;

    // Calculate weight range for BMI 18.5-24.9
    const minWeight = 18.5 * (heightInM * heightInM);
    const maxWeight = 24.9 * (heightInM * heightInM);

    return {
      min: Math.round(minWeight * 10) / 10,
      max: Math.round(maxWeight * 10) / 10,
      unit: "kg",
    };
  }

  // Convert temperature between Celsius and Fahrenheit
  convertTemperature(temperature, fromUnit, toUnit) {
    if (fromUnit === toUnit) return temperature;

    if (fromUnit === "C" && toUnit === "F") {
      return (temperature * 9) / 5 + 32;
    } else if (fromUnit === "F" && toUnit === "C") {
      return ((temperature - 32) * 5) / 9;
    }

    return temperature;
  }
}
