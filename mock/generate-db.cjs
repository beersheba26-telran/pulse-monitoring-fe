const fs = require("fs");
const path = require("path");

const PATIENT_COUNT = 50;
const DOCTOR_COUNT = 5;
const NOTIFICATION_COUNT = 200;

const firstNames = [
  "Liam", "Noah", "Oliver", "Elijah", "James", "William", "Benjamin", "Lucas", "Henry", "Theodore",
  "Olivia", "Emma", "Ava", "Sophia", "Isabella", "Mia", "Charlotte", "Amelia", "Harper", "Evelyn",
  "Michael", "Daniel", "Matthew", "Sebastian", "Jackson", "Aiden", "Logan", "Samuel", "David", "Joseph",
  "Emily", "Sofia", "Scarlett", "Grace", "Chloe", "Lily", "Aria", "Nora", "Hannah", "Ella",
  "Andrew", "Gabriel", "Carter", "Wyatt", "John", "Luke", "Julian", "Levi", "Isaac", "Anthony"
];

const lastNames = [
  "Smith", "Johnson", "Brown", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin",
  "Thompson", "Garcia", "Martinez", "Robinson", "Clark", "Lewis", "Lee", "Walker", "Hall", "Allen"
];

const doctorNames = [
  "Dr. Ethan Cole",
  "Dr. Maya Brooks",
  "Dr. Victor Hale",
  "Dr. Nina Ortiz",
  "Dr. Samuel Reed"
];

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const isPrimitive = (value) =>
  value === null || ["string", "number", "boolean"].includes(typeof value);

const compactJson = (value, level = 0) => {
  const indent = "  ".repeat(level);
  const childIndent = "  ".repeat(level + 1);

  if (isPrimitive(value)) {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "[]";
    }

    if (value.every(isPrimitive)) {
      return `[${value.map((item) => JSON.stringify(item)).join(", ")}]`;
    }

    const lines = value.map((item) => `${childIndent}${compactJson(item, level + 1)}`);
    return `[\n${lines.join(",\n")}\n${indent}]`;
  }

  const entries = Object.entries(value);
  if (entries.length === 0) {
    return "{}";
  }

  const inlineObject = entries.every(([, v]) => isPrimitive(v));
  if (inlineObject) {
    return `{ ${entries.map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(", ")} }`;
  }

  const lines = entries.map(
    ([key, val]) => `${childIndent}${JSON.stringify(key)}: ${compactJson(val, level + 1)}`
  );
  return `{\n${lines.join(",\n")}\n${indent}}`;
};

const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const pickDistinct = (pool, count) => {
  const copy = [...pool];
  shuffle(copy);
  return copy.slice(0, count);
};

const doctorIds = Array.from({ length: DOCTOR_COUNT }, (_, i) => String(i + 1));

const doctorCountDistribution = shuffle([
  ...Array(5).fill(1),
  ...Array(35).fill(2),
  ...Array(10).fill(3)
]);

const doctors = doctorIds.map((id, index) => ({
  id,
  name: doctorNames[index],
  patient_ids: []
}));

const doctorById = Object.fromEntries(doctors.map((doctor) => [doctor.id, doctor]));

const patients = Array.from({ length: PATIENT_COUNT }, (_, i) => {
  const id = String(i + 1);
  const assignedDoctorCount = doctorCountDistribution[i];
  const assignedDoctorIds = pickDistinct(doctorIds, assignedDoctorCount);

  assignedDoctorIds.forEach((doctorId) => {
    doctorById[doctorId].patient_ids.push(id);
  });

  return {
    id,
    name: `${firstNames[i % firstNames.length]} ${lastNames[(i * 3) % lastNames.length]}`,
    age: randInt(22, 84),
    doctor_ids: assignedDoctorIds,
    lastHeartRateValues: Array.from({ length: 5 }, () => randInt(58, 122)),
    weight: randInt(52, 110),
    height: randInt(152, 196)
  };
});

const abnormalCount = Math.round(NOTIFICATION_COUNT * 0.3);
const jumpCount = NOTIFICATION_COUNT - abnormalCount;

const notificationTypes = shuffle([
  ...Array(abnormalCount).fill("ABNORMAL_VALUE"),
  ...Array(jumpCount).fill("JUMP_RATE")
]);

const minorCount = Math.round(NOTIFICATION_COUNT * 0.6);
const majorCount = Math.round(NOTIFICATION_COUNT * 0.3);
const criticalCount = NOTIFICATION_COUNT - minorCount - majorCount;

const severities = shuffle([
  ...Array(minorCount).fill("MINOR"),
  ...Array(majorCount).fill("MAJOR"),
  ...Array(criticalCount).fill("CRITICAL")
]);

const now = Date.now();

const notifications = Array.from({ length: NOTIFICATION_COUNT }, (_, i) => {
  const type = notificationTypes[i];
  const severity = severities[i];
  const patientId = String(randInt(1, PATIENT_COUNT));

  let message;
  if (type === "ABNORMAL_VALUE") {
    const deviation = randInt(5, 65);
    message = `Abnormal value with deviation from center value is ${deviation} percent`;
  } else {
    const previous = randInt(55, 110);
    const delta = randInt(12, 35) * (Math.random() < 0.5 ? -1 : 1);
    const current = Math.max(35, Math.min(170, previous + delta));
    message = `ABnormal JUMP previous value ${previous} -> current value ${current}`;
  }

  return {
    id: String(i + 1),
    patientId,
    message,
    timestamp: new Date(now - i * 60000).toISOString(),
    type,
    severity,
    status: "CREATED"
  };
});

const db = {
  doctors,
  patients,
  notifications,
  notificationHistory: []
};

const formatted = compactJson(db);
const targetPath = path.join(__dirname, "db.json");
const tempPath = path.join(__dirname, "db.json.tmp");
fs.writeFileSync(tempPath, `${formatted}\n`);
fs.renameSync(tempPath, targetPath);
console.log("mock/db.json generated successfully");
