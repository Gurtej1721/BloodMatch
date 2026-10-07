const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// ---------- In-memory "database" ----------
const db = {
  donors: [],
  requests: [],
  inventory: {},           // { "A+": units, ... }
  hospitals: [
    { id: 1, name: "City Trauma Center", city: "Mumbai", icuBeds: 12 },
    { id: 2, name: "Apollo Emergency",   city: "Delhi",  icuBeds: 8  },
  ],
  stats: { activeDonors: 0, livesSaved: 0 },
};

// ---------- Helpers ----------
const BLOOD_TYPES = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
const isCompatible = (donor, recipient) => {
  const map = {
    "O-": ["A+","A-","B+","B-","AB+","AB-","O+","O-"],
    "O+": ["A+","B+","AB+","O+"],
    "A-": ["A+","A-","AB+","AB-"],
    "A+": ["A+","AB+"],
    "B-": ["B+","B-","AB+","AB-"],
    "B+": ["B+","AB+"],
    "AB-":["AB+","AB-"],
    "AB+":["AB+"],
  };
  return map[donor]?.includes(recipient) ?? false;
};

const mask = (donor) =>
  donor.isPrivate
    ? { ...donor, phone: "****", email: "****", name: donor.name[0] + "***" }
    : donor;

// ---------- Routes ----------
app.get("/api/stats", (req, res) => {
  res.json({
    ...db.stats,
    activeDonors: db.donors.length,
    openRequests: db.requests.filter(r => r.status === "open").length,
  });
});

app.get("/api/donors", (req, res) => {
  res.json(db.donors.map(mask));
});

app.post("/api/donors", (req, res) => {
  const { name, bloodType, phone, city, isPrivate = false } = req.body || {};
  if (!name || !bloodType || !phone || !city) {
    return res.status(400).json({ error: "name, bloodType, phone, city are required" });
  }
  if (!BLOOD_TYPES.includes(bloodType)) {
    return res.status(400).json({ error: "Invalid bloodType" });
  }
  const donor = {
    id: db.donors.length + 1,
    name, bloodType, phone, city,
    isPrivate: Boolean(isPrivate),
    createdAt: new Date().toISOString(),
  };
  db.donors.push(donor);
  res.status(201).json(mask(donor));
});

app.get("/api/requests", (req, res) => {
  res.json(db.requests);
});

app.post("/api/requests", (req, res) => {
  const { bloodType, units = 1, hospital, city, urgency = "normal" } = req.body || {};
  if (!bloodType || !hospital || !city) {
    return res.status(400).json({ error: "bloodType, hospital, city are required" });
  }
  const request = {
    id: db.requests.length + 1,
    bloodType, units, hospital, city, urgency,
    status: "open",
    createdAt: new Date().toISOString(),
  };
  db.requests.push(request);
  res.status(201).json(request);
});

app.post("/api/match", (req, res) => {
  const { bloodType, city } = req.body || {};
  if (!bloodType) return res.status(400).json({ error: "bloodType is required" });

  const matches = db.donors.filter(
    d => isCompatible(d.bloodType, bloodType) && (!city || d.city === city)
  );
  res.json({ count: matches.length, matches: matches.map(mask) });
});

app.post("/api/match/connect", (req, res) => {
  const { donorId, requestId } = req.body || {};
  const donor = db.donors.find(d => d.id === donorId);
  const request = db.requests.find(r => r.id === requestId);
  if (!donor || !request) return res.status(404).json({ error: "Donor or request not found" });

  request.status = "matched";
  db.stats.livesSaved += 1;
  res.json({ ok: true, message: `Dispatch signal sent to donor #${donorId}` });
});

app.get("/api/inventory", (req, res) => {
  res.json(db.inventory);
});

app.post("/api/inventory/update", (req, res) => {
  const { bloodType, units, action } = req.body || {}; // action: "deposit" | "dispense"
  if (!bloodType || !units || !["deposit", "dispense"].includes(action)) {
    return res.status(400).json({ error: "bloodType, units, action(deposit|dispense) required" });
  }
  db.inventory[bloodType] = db.inventory[bloodType] || 0;
  if (action === "deposit") db.inventory[bloodType] += units;
  else {
    if (db.inventory[bloodType] < units) {
      return res.status(400).json({ error: "Insufficient inventory" });
    }
    db.inventory[bloodType] -= units;
  }
  res.json({ bloodType, units: db.inventory[bloodType] });
});

app.get("/api/hospitals", (req, res) => {
  res.json(db.hospitals);
});

app.get("/api/hospitals/cities", (req, res) => {
  res.json([...new Set(db.hospitals.map(h => h.city))]);
});

// ---------- Error handling ----------
app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Dynamic Emergency Blood Matcher API running on port ${PORT}`);
});