import { useState, useEffect, useCallback } from "react";
import "./App.css";

// Uses the live backend address when deployed (VITE_API_BASE_URL),
// and your local backend while developing.
const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

const TERRAIN_IMAGE_URL = `${API_BASE}/api/terrain/image`;

const navigation = [
  ["◈", "Overview"],
  ["◎", "Explore Mars"],
  ["▦", "Data Layers"],
  ["◉", "Geological Explorer"],
  ["⌁", "Terrain Analysis"],
  ["⌖", "Mission Planner"],
  ["▣", "Rover Information"],
  ["⚙", "Settings"],
];

// ---------- Mars Regions constants ----------
// Approximate central coordinates (planetocentric latitude, east longitude 0-360).
// Each entry: [name, category, latitude, longitude, description]
const MARS_REGION_DATA = [
  // Volcanoes
  [
    "Olympus Mons",
    "Volcano",
    18.65,
    226.2,
    "The largest known volcano in the solar system, a shield volcano about 22 km high.",
  ],
  [
    "Arsia Mons",
    "Volcano",
    -8.4,
    239.2,
    "The southernmost of the three Tharsis Montes volcanoes.",
  ],
  [
    "Pavonis Mons",
    "Volcano",
    0.8,
    247.0,
    "The middle Tharsis Montes volcano, sitting almost on the equator.",
  ],
  [
    "Ascraeus Mons",
    "Volcano",
    11.8,
    255.5,
    "The northernmost and tallest of the three Tharsis Montes volcanoes.",
  ],
  [
    "Alba Mons",
    "Volcano",
    40.5,
    250.4,
    "A very wide, low volcano with some of the largest lava flows on Mars.",
  ],
  [
    "Elysium Mons",
    "Volcano",
    25.0,
    147.2,
    "The main volcano of the Elysium volcanic region.",
  ],
  [
    "Hecates Tholus",
    "Volcano",
    32.1,
    150.2,
    "A volcanic dome northeast of Elysium Mons.",
  ],
  [
    "Albor Tholus",
    "Volcano",
    18.8,
    150.4,
    "The southernmost volcano of the Elysium region.",
  ],
  [
    "Syrtis Major Planum",
    "Volcano",
    8.4,
    69.5,
    "A broad volcanic plateau and one of the darkest regions seen from Earth.",
  ],

  // Canyons and channels
  [
    "Valles Marineris",
    "Canyon & Channel",
    -14.0,
    301.0,
    "The largest canyon system on Mars, over 4,000 km long.",
  ],
  [
    "Noctis Labyrinthus",
    "Canyon & Channel",
    -7.0,
    261.0,
    "A maze of deep valleys at the western end of Valles Marineris.",
  ],
  [
    "Kasei Valles",
    "Canyon & Channel",
    24.6,
    292.0,
    "One of the largest outflow channel systems, carved by ancient floods.",
  ],
  [
    "Nili Fossae",
    "Canyon & Channel",
    21.0,
    74.5,
    "A system of troughs rich in clay and carbonate minerals, next to Jezero Crater.",
  ],
  [
    "Cerberus Fossae",
    "Canyon & Channel",
    8.0,
    163.0,
    "Young fractures in the Elysium region, a source of recent marsquakes.",
  ],

  // Basins and craters
  [
    "Hellas Planitia",
    "Basin & Crater",
    -42.7,
    70.0,
    "The largest visible impact basin on Mars and its deepest region.",
  ],
  [
    "Argyre Planitia",
    "Basin & Crater",
    -49.7,
    316.0,
    "A large impact basin in the southern highlands.",
  ],
  [
    "Isidis Planitia",
    "Basin & Crater",
    13.0,
    87.0,
    "A large impact basin at the edge of the southern highlands.",
  ],
  [
    "Utopia Planitia",
    "Basin & Crater",
    46.7,
    117.5,
    "The largest recognized impact basin on Mars, in the northern lowlands.",
  ],
  [
    "Jezero Crater",
    "Basin & Crater",
    18.38,
    77.58,
    "An ancient lake bed with a river delta, explored by the Perseverance rover.",
  ],
  [
    "Gale Crater",
    "Basin & Crater",
    -5.4,
    137.8,
    "Home of Mount Sharp, explored by the Curiosity rover.",
  ],
  [
    "Lyot Crater",
    "Basin & Crater",
    50.5,
    29.3,
    "The deepest point of the northern lowlands, with signs of past water.",
  ],
  [
    "Korolev Crater",
    "Basin & Crater",
    73.0,
    164.5,
    "A well-preserved crater holding a mound of water ice.",
  ],
  [
    "Gusev Crater",
    "Basin & Crater",
    -14.6,
    175.5,
    "A large crater explored by the Spirit rover.",
  ],

  // Plains
  [
    "Chryse Planitia",
    "Plain",
    28.4,
    320.0,
    "A lowland plain where several outflow channels end.",
  ],
  [
    "Acidalia Planitia",
    "Plain",
    46.7,
    340.0,
    "A dark lowland plain in the northern hemisphere.",
  ],
  [
    "Arcadia Planitia",
    "Plain",
    47.2,
    192.0,
    "A smooth northern plain covered by young lava flows.",
  ],
  [
    "Amazonis Planitia",
    "Plain",
    24.8,
    196.0,
    "A smooth lowland plain west of the Tharsis volcanoes.",
  ],
  [
    "Elysium Planitia",
    "Plain",
    3.0,
    154.7,
    "A broad plain near the equator, with recent volcanic activity.",
  ],
  [
    "Meridiani Planum",
    "Plain",
    -2.0,
    354.0,
    "A flat plain rich in hematite, explored by the Opportunity rover.",
  ],
  [
    "Hesperia Planum",
    "Plain",
    -21.0,
    110.0,
    "A volcanic plain in the southern highlands.",
  ],

  // Highlands
  [
    "Arabia Terra",
    "Highland",
    21.0,
    7.0,
    "A large, heavily cratered upland region in the northern hemisphere.",
  ],
  [
    "Terra Sabaea",
    "Highland",
    2.0,
    42.0,
    "An ancient cratered highland region near the equator.",
  ],
  [
    "Terra Cimmeria",
    "Highland",
    -35.0,
    145.0,
    "An old, heavily cratered region of the southern highlands.",
  ],
  [
    "Tempe Terra",
    "Highland",
    40.0,
    290.0,
    "A highland region on the edge of the Tharsis bulge.",
  ],
  [
    "Cydonia Mensae",
    "Highland",
    40.8,
    350.0,
    "A region of mesas and knobs on the boundary between highlands and lowlands.",
  ],

  // Polar regions
  [
    "North Polar Cap (Planum Boreum)",
    "Polar",
    87.0,
    90.0,
    "The northern ice cap. Longitude is arbitrary this close to the pole.",
  ],
  [
    "South Polar Cap (Planum Australe)",
    "Polar",
    -87.0,
    0.0,
    "The southern ice cap. Longitude is arbitrary this close to the pole.",
  ],

  // Landing sites
  [
    "InSight Landing Site",
    "Landing Site",
    4.5,
    135.62,
    "Where the InSight lander studied marsquakes and the planet's interior.",
  ],
  [
    "Zhurong Landing Site",
    "Landing Site",
    25.1,
    109.9,
    "Landing site of China's Tianwen-1 Zhurong rover in southern Utopia Planitia.",
  ],
  [
    "Viking 2 Landing Site",
    "Landing Site",
    48.27,
    134.01,
    "Where the Viking 2 lander operated in Utopia Planitia.",
  ],
  [
    "Viking 1 Landing Site",
    "Landing Site",
    22.27,
    312.05,
    "Where the first successful Mars lander operated in Chryse Planitia.",
  ],
  [
    "Pathfinder Landing Site",
    "Landing Site",
    19.13,
    326.75,
    "Where Mars Pathfinder and the Sojourner rover landed in Ares Vallis.",
  ],
];

const MARS_REGIONS = MARS_REGION_DATA.map(
  ([name, category, latitude, longitude, description]) => ({
    name,
    category,
    latitude,
    longitude,
    description,
  }),
);
const MARS_REGION_CATEGORIES = Array.from(
  new Set(MARS_REGIONS.map((region) => region.category)),
);

// The current MOLA file supports latitude 0-90 and east longitude 0-180.
const isMolaSupported = (lat, lon) =>
  Number.isFinite(Number(lat)) &&
  Number.isFinite(Number(lon)) &&
  Number(lat) >= 0 &&
  Number(lat) <= 90 &&
  Number(lon) >= 0 &&
  Number(lon) <= 180;

const formatRegionCoordinates = (lat, lon) =>
  `${Math.abs(lat)}° ${lat < 0 ? "S" : "N"}, ${lon}° E`;

// ---------- Mission Planner constants ----------
const MISSIONS_STORAGE_KEY = "beyondEarthMissions";
const MISSION_PRIORITIES = ["Low", "Medium", "High", "Critical"];
const MISSION_STATUSES = ["Planned", "In Progress", "Completed", "On Hold"];
const PRIORITY_COLORS = {
  Low: "#72bc83",
  Medium: "#d5a46f",
  High: "#e49a75",
  Critical: "#e0604a",
};
const EMPTY_MISSION_FORM = {
  name: "",
  region: "",
  latitude: "",
  longitude: "",
  objective: "",
  priority: "Medium",
  duration: "",
};

const missionLabelStyle = {
  display: "block",
  marginBottom: "6px",
  color: "#aaa",
  fontSize: "12px",
};
const missionInputStyle = {
  width: "100%",
  padding: "10px",
  background: "#171a1d",
  color: "#fff",
  border: "1px solid #555",
  borderRadius: "5px",
  boxSizing: "border-box",
  fontFamily: "inherit",
};
const missionErrorStyle = {
  color: "#e49a75",
  fontSize: "11px",
  marginTop: "4px",
};
const missionButtonStyle = {
  padding: "9px 14px",
  cursor: "pointer",
  border: "1px solid #777",
  borderRadius: "5px",
  color: "#fff",
  background: "#292d31",
};
const missionSmallButtonStyle = {
  padding: "6px 9px",
  cursor: "pointer",
  border: "1px solid #777",
  borderRadius: "4px",
  color: "#fff",
  background: "#292d31",
};

// ---------- Safety Panel constants ----------
const SAFETY_STORAGE_KEY = "beyondEarthSafetyChecklist";
const SAFETY_MANUAL_ITEMS = [
  ["thermal", "Day / night thermal conditions reviewed"],
  ["radiation", "Radiation and space weather checked"],
  ["consumables", "Suit consumables and EVA duration confirmed"],
  ["support", "Crew partner and rover support confirmed"],
  ["returnPath", "Return path to the habitat confirmed"],
];
const EMPTY_SAFETY_CHECKS = {
  thermal: false,
  radiation: false,
  consumables: false,
  support: false,
  returnPath: false,
};

// ---------- Marswalk Route Planner constants ----------
const MARS_RADIUS_KM = 3389.5;
const ROUTE_SEGMENTS = 12;
const EVA_WALK_SPEED_KMH = 2; // planning assumption, not an official NASA value
const EVA_WINDOW_HOURS = 8; // planning assumption, not an official NASA value
const SLOPE_CAUTION_DEG = 10; // planning assumption
const SLOPE_HAZARD_DEG = 20; // planning assumption
const RATING_COLORS = {
  Safe: "#72bc83",
  Caution: "#d5a46f",
  Hazard: "#e0604a",
};

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (degrees) => (degrees * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * MARS_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
};

const slopeRating = (slopeDeg) =>
  slopeDeg >= SLOPE_HAZARD_DEG
    ? "Hazard"
    : slopeDeg >= SLOPE_CAUTION_DEG
      ? "Caution"
      : "Safe";

const ratingSpeedFactor = (rating) =>
  rating === "Hazard" ? 0.3 : rating === "Caution" ? 0.6 : 1;

const TAB_SUBTITLES = {
  Overview:
    "Mission overview: planetary map, key data and Mars surface statistics.",
  "Explore Mars":
    "Enter coordinates or pick a Mars region, then explore elevation, geology and imagery. Save and revisit locations.",
  "Data Layers":
    "Switch between NASA MOLA, THEMIS day, THEMIS night and day/night comparison layers.",
  "Geological Explorer":
    "Look up the USGS geological unit and terrain details for any coordinate.",
  "Terrain Analysis":
    "Compare locations, plan a Marswalk route and check astronaut safety.",
  "Mission Planner":
    "Plan missions, track their status and export an astronaut mission brief.",
  "Rover Information":
    "Learn about the Perseverance rover and its exploration region.",
  Settings: "Check backend status and manage data saved in this browser.",
};

function App() {
  const [active, setActive] = useState("Overview");

  const [latitude, setLatitude] = useState("18.38");
  const [longitude, setLongitude] = useState("77.58");

  const [coordinates, setCoordinates] = useState({
    latitude: 18.38,
    longitude: 77.58,
  });

  const [locationHistory, setLocationHistory] = useState(() => {
    try {
      const storedHistory = window.localStorage.getItem(
        "beyondEarthMarsLocationHistory",
      );
      const parsedHistory = storedHistory ? JSON.parse(storedHistory) : [];
      return Array.isArray(parsedHistory) ? parsedHistory.slice(0, 10) : [];
    } catch (error) {
      console.error("Could not load Mars location history:", error);
      return [];
    }
  });

  const [savedLocations, setSavedLocations] = useState(() => {
    try {
      const storedLocations = window.localStorage.getItem(
        "beyondEarthSavedMarsLocations",
      );
      const parsedLocations = storedLocations
        ? JSON.parse(storedLocations)
        : [];
      return Array.isArray(parsedLocations) ? parsedLocations : [];
    } catch (error) {
      console.error("Could not load saved Mars locations:", error);
      return [];
    }
  });

  // Mars Regions: search, category filter and message.
  const [regionSearch, setRegionSearch] = useState("");
  const [regionCategory, setRegionCategory] = useState("All");
  const [regionMessage, setRegionMessage] = useState("");

  // Mission Planner: saved missions, form fields and messages.
  const [missions, setMissions] = useState(() => {
    try {
      const storedMissions = window.localStorage.getItem(MISSIONS_STORAGE_KEY);
      const parsedMissions = storedMissions ? JSON.parse(storedMissions) : [];
      return Array.isArray(parsedMissions)
        ? parsedMissions.filter(
            (mission) => mission && typeof mission === "object" && mission.id,
          )
        : [];
    } catch (error) {
      console.error("Could not load Mars missions:", error);
      return [];
    }
  });
  const [missionForm, setMissionForm] = useState(EMPTY_MISSION_FORM);
  const [missionErrors, setMissionErrors] = useState({});
  const [missionMessage, setMissionMessage] = useState("");
  const [missionRegisterError, setMissionRegisterError] = useState("");

  // Astronaut Mission Brief
  const [briefMissionId, setBriefMissionId] = useState("");
  const [briefError, setBriefError] = useState("");

  // Safety Panel: manual pre-walk checklist saved in this browser.
  const [safetyChecks, setSafetyChecks] = useState(() => {
    try {
      const stored = window.localStorage.getItem(SAFETY_STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : {};
      return parsed && typeof parsed === "object"
        ? { ...EMPTY_SAFETY_CHECKS, ...parsed }
        : EMPTY_SAFETY_CHECKS;
    } catch (error) {
      console.error("Could not load safety checklist:", error);
      return EMPTY_SAFETY_CHECKS;
    }
  });

  // Marswalk Route Planner
  const [routeStartLat, setRouteStartLat] = useState("");
  const [routeStartLon, setRouteStartLon] = useState("");
  const [routeEndLat, setRouteEndLat] = useState("");
  const [routeEndLon, setRouteEndLon] = useState("");
  const [routeResult, setRouteResult] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");

  const [elevation, setElevation] = useState(null);
  const [geology, setGeology] = useState(null);
  const [geologyError, setGeologyError] = useState("");
  const [geologyLoading, setGeologyLoading] = useState(false);

  // MOLA statistics for the complete raster dataset.
  const [statistics, setStatistics] = useState(null);
  const [statisticsLoading, setStatisticsLoading] = useState(false);
  const [statisticsError, setStatisticsError] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [backendOnline, setBackendOnline] = useState(false);

  // Compare two Mars locations using the existing MOLA and geology endpoints.
  const [compareLatitudeA, setCompareLatitudeA] = useState("18.38");
  const [compareLongitudeA, setCompareLongitudeA] = useState("77.58");
  const [compareLatitudeB, setCompareLatitudeB] = useState("0");
  const [compareLongitudeB, setCompareLongitudeB] = useState("0");
  const [comparisonResult, setComparisonResult] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [locationComparisonError, setLocationComparisonError] = useState("");

  const [activeLayer, setActiveLayer] = useState("mola");
  const [terrainImageError, setTerrainImageError] = useState(false);
  const [themisDayImageError, setThemisDayImageError] = useState(false);
  const [themisNightImageError, setThemisNightImageError] = useState(false);
  const [themisDayLoaded, setThemisDayLoaded] = useState(false);
  const [themisNightLoaded, setThemisNightLoaded] = useState(false);

  // Automatically select THEMIS tiles from the currently selected coordinates.
  const THEMIS_DAY_URL =
    `${API_BASE}/api/wmts/themis_day/coordinate-tile` +
    `?latitude=${coordinates.latitude}` +
    `&longitude=${coordinates.longitude}` +
    `&zoom=5`;

  const THEMIS_NIGHT_URL =
    `${API_BASE}/api/wmts/themis_night/coordinate-tile` +
    `?latitude=${coordinates.latitude}` +
    `&longitude=${coordinates.longitude}` +
    `&zoom=5`;

  const fetchElevation = useCallback(async (lat, lon) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/api/terrain?latitude=${lat}&longitude=${lon}`,
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Unable to retrieve elevation.");
      }

      const data = await response.json();

      setBackendOnline(true);
      setElevation(data.elevation_meters);

      setCoordinates({
        latitude: data.latitude,
        longitude: data.longitude,
      });

      setLocationHistory((current) => {
        const entry = {
          id: `${data.latitude},${data.longitude}`,
          latitude: data.latitude,
          longitude: data.longitude,
          exploredAt: new Date().toISOString(),
        };
        return [
          entry,
          ...current.filter(
            (item) =>
              item.latitude !== data.latitude ||
              item.longitude !== data.longitude,
          ),
        ].slice(0, 10);
      });

      setThemisDayImageError(false);
      setThemisNightImageError(false);
      setThemisDayLoaded(false);
      setThemisNightLoaded(false);
    } catch (err) {
      setElevation(null);
      setError(err.message || "Could not connect to backend.");
      setBackendOnline(false);
      console.error("Elevation API error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch USGS geology information.
  const fetchGeology = useCallback(async (lat, lon) => {
    setGeologyError("");
    setGeologyLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/api/geology?latitude=${lat}&longitude=${lon}`,
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Unable to retrieve geology.");
      }

      const data = await response.json();
      setGeology(data);
    } catch (err) {
      setGeology(null);
      setGeologyError(
        err.message || "Could not retrieve geological information.",
      );
      console.error("Geology API error:", err);
    } finally {
      setGeologyLoading(false);
    }
  }, []);

  // Fetch highest, lowest and average elevation from the NASA MOLA raster.
  const fetchStatistics = useCallback(async () => {
    setStatisticsLoading(true);
    setStatisticsError("");

    try {
      const response = await fetch(`${API_BASE}/api/terrain/statistics`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Unable to retrieve MOLA statistics.");
      }

      const data = await response.json();
      setStatistics(data);
      setBackendOnline(true);
    } catch (err) {
      setStatistics(null);
      setStatisticsError(err.message || "Could not retrieve MOLA statistics.");
      console.error("MOLA statistics API error:", err);
    } finally {
      setStatisticsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchElevation(18.38, 77.58);
    fetchGeology(18.38, 77.58);
    fetchStatistics();
  }, [fetchElevation, fetchGeology, fetchStatistics]);

  // Keep the ten most recently explored coordinates after refresh.
  useEffect(() => {
    try {
      window.localStorage.setItem(
        "beyondEarthMarsLocationHistory",
        JSON.stringify(locationHistory),
      );
    } catch (error) {
      console.error("Could not save Mars location history:", error);
    }
  }, [locationHistory]);

  // Keep saved Mars locations after refresh or reopening the browser.
  useEffect(() => {
    try {
      window.localStorage.setItem(
        "beyondEarthSavedMarsLocations",
        JSON.stringify(savedLocations),
      );
    } catch (error) {
      console.error("Could not save Mars locations:", error);
    }
  }, [savedLocations]);

  // Keep Mars missions after refresh or reopening the browser.
  useEffect(() => {
    try {
      window.localStorage.setItem(
        MISSIONS_STORAGE_KEY,
        JSON.stringify(missions),
      );
    } catch (error) {
      console.error("Could not save Mars missions:", error);
    }
  }, [missions]);

  // Keep the safety checklist after refresh.
  useEffect(() => {
    try {
      window.localStorage.setItem(
        SAFETY_STORAGE_KEY,
        JSON.stringify(safetyChecks),
      );
    } catch (error) {
      console.error("Could not save safety checklist:", error);
    }
  }, [safetyChecks]);

  const toggleSafetyCheck = (key) =>
    setSafetyChecks((current) => ({ ...current, [key]: !current[key] }));

  // ---------- Mars Regions functions ----------
  // Explore a region in the existing Explore Mars section.
  const exploreRegion = (region) => {
    if (!isMolaSupported(region.latitude, region.longitude)) {
      setRegionMessage(
        `Elevation data is not available for ${region.name} (${formatRegionCoordinates(region.latitude, region.longitude)}). It is outside the coordinate range supported by the current MOLA file: latitude 0 to 90 and longitude 0 to 180.`,
      );
      return;
    }

    setRegionMessage("");
    setLatitude(String(region.latitude));
    setLongitude(String(region.longitude));
    setError("");
    fetchElevation(region.latitude, region.longitude);
    fetchGeology(region.latitude, region.longitude);
    setActive("Explore Mars");

    window.scrollTo({ top: 0, behavior: "smooth" });
    document.querySelectorAll(".app, .main, .content").forEach((element) => {
      if (typeof element.scrollTo === "function") {
        element.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  // Fill the Mission Planner form from a Mars region.
  const applyRegionToMissionForm = (region) => {
    const supported = isMolaSupported(region.latitude, region.longitude);

    setMissionForm((current) => ({
      ...current,
      region: region.name,
      latitude: supported ? String(region.latitude) : "",
      longitude: supported ? String(region.longitude) : "",
    }));
    setMissionErrors({});
    setMissionMessage(
      supported
        ? `Target region set to ${region.name}. Coordinates were filled in.`
        : `Target region set to ${region.name}, but its coordinates are outside the supported MOLA range. Enter a latitude from 0 to 90 and a longitude from 0 to 180 to continue.`,
    );
  };

  const useRegionInMission = (region) => {
    applyRegionToMissionForm(region);
    setActive("Mission Planner");

    window.scrollTo({ top: 0, behavior: "smooth" });
    document.querySelectorAll(".app, .main, .content").forEach((element) => {
      if (typeof element.scrollTo === "function") {
        element.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  // ---------- Mission Planner functions ----------
  const updateMissionField = (field, value) => {
    setMissionForm((current) => ({ ...current, [field]: value }));
    setMissionErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    setMissionMessage("");
  };

  const validateMissionForm = (form) => {
    const errors = {};
    const name = form.name.trim();
    const region = form.region.trim();
    const objective = form.objective.trim();
    const latText = String(form.latitude).trim();
    const lonText = String(form.longitude).trim();
    const durationText = String(form.duration).trim();

    if (!name) {
      errors.name = "Enter a mission name.";
    } else if (name.length < 3) {
      errors.name = "Mission name must be at least 3 characters.";
    } else if (name.length > 60) {
      errors.name = "Mission name must be 60 characters or fewer.";
    } else if (
      missions.some(
        (mission) =>
          String(mission.name).trim().toLowerCase() === name.toLowerCase(),
      )
    ) {
      errors.name = "A mission with this name already exists. Use a new name.";
    }

    if (!region) {
      errors.region = "Enter a target region, for example Jezero Crater.";
    } else if (region.length > 60) {
      errors.region = "Target region must be 60 characters or fewer.";
    }

    const lat = Number(latText);
    if (latText === "") {
      errors.latitude = "Enter a latitude.";
    } else if (!Number.isFinite(lat)) {
      errors.latitude = "Latitude must be a number.";
    } else if (lat < 0 || lat > 90) {
      errors.latitude =
        "Latitude must be between 0 and 90 (supported MOLA range).";
    }

    const lon = Number(lonText);
    if (lonText === "") {
      errors.longitude = "Enter a longitude.";
    } else if (!Number.isFinite(lon)) {
      errors.longitude = "Longitude must be a number.";
    } else if (lon < 0 || lon > 180) {
      errors.longitude =
        "Longitude must be between 0 and 180 (supported MOLA range).";
    }

    if (!objective) {
      errors.objective = "Describe the scientific objective of this mission.";
    } else if (objective.length < 10) {
      errors.objective =
        "Objective is too short. Write at least 10 characters.";
    } else if (objective.length > 500) {
      errors.objective = "Objective must be 500 characters or fewer.";
    }

    if (!MISSION_PRIORITIES.includes(form.priority)) {
      errors.priority = "Select a priority.";
    }

    const duration = Number(durationText);
    if (durationText === "") {
      errors.duration = "Enter the mission duration in sols.";
    } else if (!Number.isFinite(duration) || !Number.isInteger(duration)) {
      errors.duration = "Duration must be a whole number of sols.";
    } else if (duration < 1 || duration > 1000) {
      errors.duration = "Duration must be between 1 and 1000 sols.";
    }

    return errors;
  };

  const saveMission = () => {
    const errors = validateMissionForm(missionForm);
    setMissionErrors(errors);

    if (Object.keys(errors).length > 0) {
      setMissionMessage("");
      return;
    }

    const newMission = {
      id: `mission-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: missionForm.name.trim(),
      region: missionForm.region.trim(),
      latitude: Number(missionForm.latitude),
      longitude: Number(missionForm.longitude),
      objective: missionForm.objective.trim(),
      priority: missionForm.priority,
      durationSols: Number(missionForm.duration),
      status: "Planned",
      createdAt: new Date().toISOString(),
    };

    setMissions((current) => [newMission, ...current]);
    setMissionForm(EMPTY_MISSION_FORM);
    setMissionErrors({});
    setMissionRegisterError("");
    setMissionMessage(
      `Mission "${newMission.name}" was saved to the register.`,
    );
  };

  const useCurrentCoordinatesForMission = () => {
    setMissionForm((current) => ({
      ...current,
      latitude: String(coordinates.latitude),
      longitude: String(coordinates.longitude),
    }));
    setMissionErrors((current) => {
      const next = { ...current };
      delete next.latitude;
      delete next.longitude;
      return next;
    });
    setMissionMessage("");
  };

  const updateMissionStatus = (id, status) => {
    if (!MISSION_STATUSES.includes(status)) return;
    setMissions((current) =>
      current.map((mission) =>
        mission.id === id ? { ...mission, status } : mission,
      ),
    );
    setMissionRegisterError("");
  };

  const deleteMission = (mission) => {
    const confirmed = window.confirm(
      `Delete mission "${mission.name}"? This cannot be undone.`,
    );
    if (!confirmed) return;
    setMissions((current) => current.filter((item) => item.id !== mission.id));
    setMissionRegisterError("");
    setMissionMessage(`Mission "${mission.name}" was deleted.`);
  };

  const exportMissions = () => {
    if (missions.length === 0) {
      setMissionRegisterError("Save at least one mission before exporting.");
      return;
    }

    const payload = {
      export_title: "Beyond Earth — Mars Mission Register",
      exported_at: new Date().toISOString(),
      mission_count: missions.length,
      missions,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "beyond-earth-missions.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setMissionRegisterError("");
  };

  // Open the existing Explore Mars section with this mission's coordinates.
  const exploreMissionTarget = (mission) => {
    setLatitude(String(mission.latitude));
    setLongitude(String(mission.longitude));
    setError("");
    fetchElevation(mission.latitude, mission.longitude);
    fetchGeology(mission.latitude, mission.longitude);
    setActive("Explore Mars");

    window.scrollTo({ top: 0, behavior: "smooth" });
    document.querySelectorAll(".app, .main, .content").forEach((element) => {
      if (typeof element.scrollTo === "function") {
        element.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  // ---------- Marswalk Route Planner functions ----------
  const planRoute = async () => {
    const fields = [
      ["Start latitude", routeStartLat, 0, 90],
      ["Start longitude", routeStartLon, 0, 180],
      ["End latitude", routeEndLat, 0, 90],
      ["End longitude", routeEndLon, 0, 180],
    ];
    const problems = [];
    fields.forEach(([label, text, min, max]) => {
      const value = Number(text);
      if (String(text).trim() === "") {
        problems.push(`${label} is required.`);
      } else if (!Number.isFinite(value)) {
        problems.push(`${label} must be a number.`);
      } else if (value < min || value > max) {
        problems.push(`${label} must be between ${min} and ${max}.`);
      }
    });

    if (problems.length > 0) {
      setRouteError(problems.join(" "));
      setRouteResult(null);
      return;
    }

    const startLat = Number(routeStartLat);
    const startLon = Number(routeStartLon);
    const endLat = Number(routeEndLat);
    const endLon = Number(routeEndLon);

    if (haversineKm(startLat, startLon, endLat, endLon) < 0.05) {
      setRouteError(
        "Start and end points are too close together. Choose points at least 0.05 km apart.",
      );
      setRouteResult(null);
      return;
    }

    setRouteLoading(true);
    setRouteError("");
    setRouteResult(null);

    const points = Array.from({ length: ROUTE_SEGMENTS + 1 }, (_, index) => {
      const t = index / ROUTE_SEGMENTS;
      return {
        latitude: startLat + (endLat - startLat) * t,
        longitude: startLon + (endLon - startLon) * t,
      };
    });

    try {
      const elevations = await Promise.all(
        points.map(async (point) => {
          const response = await fetch(
            `${API_BASE}/api/terrain?latitude=${point.latitude}&longitude=${point.longitude}`,
          );
          if (!response.ok) {
            let detail = "";
            try {
              const data = await response.json();
              detail = data.detail || "";
            } catch (parseError) {
              detail = "";
            }
            throw new Error(
              detail || "Could not read MOLA elevation along the route.",
            );
          }
          const data = await response.json();
          const value = Number(data.elevation_meters);
          if (!Number.isFinite(value)) {
            throw new Error("MOLA returned no elevation for a route point.");
          }
          return value;
        }),
      );

      let cumulativeKm = 0;
      let gain = 0;
      let loss = 0;
      let maxSlope = 0;
      let hours = 0;
      const segments = [];
      const profile = [{ km: 0, elevation: elevations[0], rating: "Safe" }];

      for (let i = 0; i < ROUTE_SEGMENTS; i += 1) {
        const distanceKm = haversineKm(
          points[i].latitude,
          points[i].longitude,
          points[i + 1].latitude,
          points[i + 1].longitude,
        );
        const rise = elevations[i + 1] - elevations[i];
        const slopeDeg =
          distanceKm > 0
            ? (Math.atan2(Math.abs(rise), distanceKm * 1000) * 180) / Math.PI
            : 0;
        const rating = slopeRating(slopeDeg);

        if (rise > 0) gain += rise;
        else loss += Math.abs(rise);
        maxSlope = Math.max(maxSlope, slopeDeg);
        hours += distanceKm / (EVA_WALK_SPEED_KMH * ratingSpeedFactor(rating));

        segments.push({
          segment: i + 1,
          start_km: Number(cumulativeKm.toFixed(3)),
          end_km: Number((cumulativeKm + distanceKm).toFixed(3)),
          start_elevation_m: elevations[i],
          end_elevation_m: elevations[i + 1],
          slope_degrees: Number(slopeDeg.toFixed(2)),
          rating,
        });

        cumulativeKm += distanceKm;
        profile.push({
          km: cumulativeKm,
          elevation: elevations[i + 1],
          rating,
        });
      }

      const overall = segments.some((item) => item.rating === "Hazard")
        ? "Hazard"
        : segments.some((item) => item.rating === "Caution")
          ? "Caution"
          : "Safe";

      setRouteResult({
        generatedAt: new Date().toISOString(),
        start: { latitude: startLat, longitude: startLon },
        end: { latitude: endLat, longitude: endLon },
        totalKm: cumulativeKm,
        gain,
        loss,
        maxSlope,
        hours,
        overall,
        segments,
        profile,
      });
      setBackendOnline(true);
    } catch (err) {
      setRouteError(err.message || "Unable to plan this route.");
      console.error("Route planner error:", err);
    } finally {
      setRouteLoading(false);
    }
  };

  const exportRoute = () => {
    if (!routeResult) {
      setRouteError("Plan a route before exporting it.");
      return;
    }

    const report = {
      report_title: "Beyond Earth — Marswalk Route",
      generated_at: routeResult.generatedAt,
      start: routeResult.start,
      end: routeResult.end,
      summary: {
        total_distance_km: Number(routeResult.totalKm.toFixed(3)),
        elevation_gain_m: Math.round(routeResult.gain),
        elevation_loss_m: Math.round(routeResult.loss),
        steepest_slope_degrees: Number(routeResult.maxSlope.toFixed(2)),
        estimated_walking_time_hours: Number(routeResult.hours.toFixed(2)),
        overall_rating: routeResult.overall,
      },
      segments: routeResult.segments,
      data_source: "NASA MOLA elevation samples along a straight line",
      assumptions: {
        walking_speed_kmh: EVA_WALK_SPEED_KMH,
        eva_window_hours: EVA_WINDOW_HOURS,
        caution_slope_degrees: SLOPE_CAUTION_DEG,
        hazard_slope_degrees: SLOPE_HAZARD_DEG,
        note: "Planning assumptions for this app, not official NASA values. Slopes are regional estimates and do not detect boulders or small hazards.",
      },
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "beyond-earth-marswalk-route.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setRouteError("");
  };

  const planRouteFromMission = (mission) => {
    setRouteStartLat(String(mission.latitude));
    setRouteStartLon(String(mission.longitude));
    setRouteEndLat("");
    setRouteEndLon("");
    setRouteResult(null);
    setRouteError("");
    setActive("Terrain Analysis");
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.querySelectorAll(".app, .main, .content").forEach((element) => {
      if (typeof element.scrollTo === "function") {
        element.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  const exploreLocation = () => {
    const lat = Number(latitude);
    const lon = Number(longitude);

    if (
      latitude.trim() === "" ||
      longitude.trim() === "" ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      lat < 0 ||
      lat > 90 ||
      lon < 0 ||
      lon > 180
    ) {
      setError(
        "This MOLA dataset currently supports latitude 0–90 and longitude 0–180.",
      );
      return;
    }

    fetchElevation(lat, lon);
    fetchGeology(lat, lon);
  };

  const saveCurrentLocation = () => {
    const lat = Number(coordinates.latitude);
    const lon = Number(coordinates.longitude);

    const alreadySaved = savedLocations.some(
      (location) => location.latitude === lat && location.longitude === lon,
    );

    if (alreadySaved) {
      setError("This coordinate is already in your saved locations.");
      return;
    }

    setSavedLocations((current) => [
      ...current,
      {
        id: `${lat},${lon}`,
        latitude: lat,
        longitude: lon,
        label: `Location ${current.length + 1}`,
      },
    ]);
    setError("");
  };

  const removeSavedLocation = (id) => {
    setSavedLocations((current) =>
      current.filter((location) => location.id !== id),
    );
  };

  const renameSavedLocation = (location) => {
    const nextLabel = window.prompt(
      "Enter a name for this Mars location:",
      location.label,
    );
    if (nextLabel === null) return;

    const trimmedLabel = nextLabel.trim();
    if (!trimmedLabel) {
      setError("Location name cannot be empty.");
      return;
    }

    setSavedLocations((current) =>
      current.map((item) =>
        item.id === location.id ? { ...item, label: trimmedLabel } : item,
      ),
    );
    setError("");
  };

  const exportSavedLocations = () => {
    if (savedLocations.length === 0) {
      setError("Save at least one Mars location before exporting.");
      return;
    }

    const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const rows = [
      ["Name", "Latitude", "Longitude"],
      ...savedLocations.map((location) => [
        location.label,
        location.latitude,
        location.longitude,
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "beyond-earth-mars-locations.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setError("");
  };

  const compareMarsLocations = async () => {
    const latA = Number(compareLatitudeA);
    const lonA = Number(compareLongitudeA);
    const latB = Number(compareLatitudeB);
    const lonB = Number(compareLongitudeB);
    const validCoordinate = (lat, lon) =>
      Number.isFinite(lat) &&
      Number.isFinite(lon) &&
      lat >= 0 &&
      lat <= 90 &&
      lon >= 0 &&
      lon <= 180;

    if (
      compareLatitudeA.trim() === "" ||
      compareLongitudeA.trim() === "" ||
      compareLatitudeB.trim() === "" ||
      compareLongitudeB.trim() === "" ||
      !validCoordinate(latA, lonA) ||
      !validCoordinate(latB, lonB)
    ) {
      setLocationComparisonError(
        "Enter valid coordinates for both locations. Supported range: latitude 0–90 and longitude 0–180.",
      );
      setComparisonResult(null);
      return;
    }

    setComparisonLoading(true);
    setLocationComparisonError("");
    setComparisonResult(null);

    const loadLocation = async (lat, lon) => {
      const [elevationResponse, geologyResponse] = await Promise.all([
        fetch(`${API_BASE}/api/terrain?latitude=${lat}&longitude=${lon}`),
        fetch(`${API_BASE}/api/geology?latitude=${lat}&longitude=${lon}`),
      ]);
      if (!elevationResponse.ok) {
        const data = await elevationResponse.json();
        throw new Error(
          data.detail || "Could not load elevation for a comparison point.",
        );
      }
      const elevationData = await elevationResponse.json();
      let geologyData = null;
      if (geologyResponse.ok) geologyData = await geologyResponse.json();
      return { ...elevationData, geology: geologyData };
    };

    try {
      const [locationA, locationB] = await Promise.all([
        loadLocation(latA, lonA),
        loadLocation(latB, lonB),
      ]);
      setComparisonResult({ locationA, locationB });
      setBackendOnline(true);
    } catch (err) {
      setLocationComparisonError(
        err.message || "Unable to compare these Mars locations.",
      );
    } finally {
      setComparisonLoading(false);
    }
  };

  const exportTerrainReport = () => {
    if (elevation === null) {
      setError("Load a Mars location before exporting its terrain report.");
      return;
    }

    const report = {
      report_title: "Beyond Earth — Mars Terrain Report",
      generated_at: new Date().toISOString(),
      selected_location: {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        elevation_meters: elevation,
      },
      geology: geology || null,
      mola_global_statistics: statistics || null,
      data_sources: ["NASA MOLA", "USGS Geologic Map of Mars"],
      note: "Geological unit area refers to the mapped polygon area, not the area immediately surrounding the selected coordinate.",
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mars-terrain-report-${coordinates.latitude}-${coordinates.longitude}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setError("");
  };

  const clearLocationHistory = () => setLocationHistory([]);

  const openSavedLocation = (location) => {
    setLatitude(String(location.latitude));
    setLongitude(String(location.longitude));
    fetchElevation(location.latitude, location.longitude);
    fetchGeology(location.latitude, location.longitude);
  };

  const changeLayer = (layer) => {
    setActiveLayer(layer);

    if (layer === "themis_day" || layer === "compare") {
      setThemisDayImageError(false);
      setThemisDayLoaded(false);
    }

    if (layer === "themis_night" || layer === "compare") {
      setThemisNightImageError(false);
      setThemisNightLoaded(false);
    }
  };

  // Safety Panel readiness: automatic checks come from the planned route.
  const safetyAuto = [
    ["Route planned and analyzed", routeResult !== null],
    [
      "No hazard-rated route segments",
      routeResult !== null && routeResult.overall !== "Hazard",
    ],
    [
      `Walking time within ${EVA_WINDOW_HOURS}-hour EVA window`,
      routeResult !== null && routeResult.hours <= EVA_WINDOW_HOURS,
    ],
  ];
  const safetyTotal = safetyAuto.length + SAFETY_MANUAL_ITEMS.length;
  const safetyDone =
    safetyAuto.filter(([, passed]) => passed).length +
    SAFETY_MANUAL_ITEMS.filter(([key]) => safetyChecks[key]).length;
  const safetyReady = safetyDone === safetyTotal;

  // ---------- Astronaut Mission Brief ----------
  const briefMission =
    missions.find((mission) => mission.id === briefMissionId) ||
    missions[0] ||
    null;

  const briefMatchesLoadedData =
    briefMission !== null &&
    Math.abs(Number(briefMission.latitude) - Number(coordinates.latitude)) <
      0.01 &&
    Math.abs(Number(briefMission.longitude) - Number(coordinates.longitude)) <
      0.01;

  const buildMissionBrief = (mission) => ({
    brief_title: "Beyond Earth — Astronaut Mission Brief",
    generated_at: new Date().toISOString(),
    mission: {
      name: mission.name,
      target_region: mission.region,
      latitude: mission.latitude,
      longitude: mission.longitude,
      objective: mission.objective,
      priority: mission.priority,
      duration_sols: mission.durationSols,
      status: mission.status,
    },
    location_data: {
      loaded_for_latitude: coordinates.latitude,
      loaded_for_longitude: coordinates.longitude,
      matches_mission_target: briefMatchesLoadedData,
      mola_elevation_meters: elevation,
      geology_unit: geology?.geology_unit || null,
      geology_description: geology?.unit_description || null,
      geology_map_reference: geology?.map_reference || null,
      geology_source: geology?.source || null,
    },
    route: routeResult
      ? {
          start: routeResult.start,
          end: routeResult.end,
          total_distance_km: Number(routeResult.totalKm.toFixed(3)),
          elevation_gain_m: Math.round(routeResult.gain),
          elevation_loss_m: Math.round(routeResult.loss),
          steepest_slope_degrees: Number(routeResult.maxSlope.toFixed(2)),
          estimated_walking_time_hours: Number(routeResult.hours.toFixed(2)),
          overall_rating: routeResult.overall,
          segments: routeResult.segments,
        }
      : null,
    safety: {
      readiness: safetyReady ? "READY" : "NOT READY",
      checks_complete: `${safetyDone} / ${safetyTotal}`,
      automatic_checks: safetyAuto.map(([label, passed]) => ({
        check: label,
        done: passed,
      })),
      manual_checks: SAFETY_MANUAL_ITEMS.map(([key, label]) => ({
        check: label,
        done: Boolean(safetyChecks[key]),
      })),
    },
    radiation_note:
      "Approximate surface dose reference of about 0.6 to 0.7 mSv per day (Curiosity RAD). Live space weather is not connected; check current conditions before any walk.",
    thermal_note:
      "Large day/night surface temperature swing. Review THEMIS daytime and nighttime imagery for the target.",
    data_sources: [
      "NASA MOLA elevation",
      "NASA THEMIS day/night imagery",
      "USGS Geologic Map of Mars",
    ],
    disclaimer:
      "Planning aid for a student project. Slope limits, walking speed and EVA window are app assumptions, not official NASA values.",
  });

  const downloadBriefFile = (content, type, filename) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const briefFileName = (mission, extension) =>
    `mission-brief-${String(mission.name)
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()}.${extension}`;

  const exportBriefJson = () => {
    if (!briefMission) {
      setBriefError("Save a mission before exporting a brief.");
      return;
    }
    const brief = buildMissionBrief(briefMission);
    downloadBriefFile(
      JSON.stringify(brief, null, 2),
      "application/json;charset=utf-8;",
      briefFileName(briefMission, "json"),
    );
    setBriefError("");
  };

  const exportBriefHtml = () => {
    if (!briefMission) {
      setBriefError("Save a mission before exporting a brief.");
      return;
    }
    const brief = buildMissionBrief(briefMission);
    const esc = (value) =>
      String(value ?? "—").replace(
        /[&<>"']/g,
        (character) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[character],
      );
    const row = (label, value) =>
      `<tr><th>${esc(label)}</th><td>${esc(value)}</td></tr>`;

    const routeRows = brief.route
      ? [
          row("Overall rating", brief.route.overall_rating),
          row("Total distance", `${brief.route.total_distance_km} km`),
          row(
            "Elevation gain / loss",
            `+${brief.route.elevation_gain_m} m / -${brief.route.elevation_loss_m} m`,
          ),
          row("Steepest slope", `${brief.route.steepest_slope_degrees}°`),
          row(
            "Estimated walking time",
            `${brief.route.estimated_walking_time_hours} hours`,
          ),
        ].join("")
      : row("Route", "No route planned");

    const checkRows = [
      ...brief.safety.automatic_checks,
      ...brief.safety.manual_checks,
    ]
      .map((item) => row(item.check, item.done ? "Done" : "Pending"))
      .join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(brief.mission.name)} — Mission Brief</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 780px; margin: 32px auto; padding: 0 16px; color: #1b1b1b; }
  h1 { font-size: 22px; margin-bottom: 4px; }
  h2 { font-size: 15px; margin: 24px 0 6px; border-bottom: 2px solid #a85e36; padding-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; width: 38%; padding: 5px 8px 5px 0; vertical-align: top; color: #444; font-weight: 600; }
  td { padding: 5px 0; }
  p { line-height: 1.45; }
  .small { font-size: 12px; color: #555; }
</style>
</head>
<body>
<h1>Beyond Earth — Astronaut Mission Brief</h1>
<p class="small">Generated ${esc(new Date(brief.generated_at).toLocaleString())}</p>

<h2>Mission</h2>
<table>
${row("Name", brief.mission.name)}
${row("Target region", brief.mission.target_region)}
${row("Coordinates", `${brief.mission.latitude}°, ${brief.mission.longitude}°`)}
${row("Priority", brief.mission.priority)}
${row("Duration", `${brief.mission.duration_sols} sols`)}
${row("Status", brief.mission.status)}
</table>
<p><strong>Scientific objective:</strong> ${esc(brief.mission.objective)}</p>

<h2>Target location data</h2>
<table>
${row("Data loaded for", `${brief.location_data.loaded_for_latitude}°, ${brief.location_data.loaded_for_longitude}°`)}
${row("Matches mission target", brief.location_data.matches_mission_target ? "Yes" : "No")}
${row("MOLA elevation", brief.location_data.mola_elevation_meters === null ? "Unavailable" : `${brief.location_data.mola_elevation_meters} m`)}
${row("Geological unit", brief.location_data.geology_unit)}
${row("Map reference", brief.location_data.geology_map_reference)}
</table>
<p>${esc(brief.location_data.geology_description)}</p>

<h2>Planned route</h2>
<table>
${routeRows}
</table>

<h2>Safety readiness: ${esc(brief.safety.readiness)} (${esc(brief.safety.checks_complete)})</h2>
<table>
${checkRows}
</table>

<h2>Radiation</h2>
<p>${esc(brief.radiation_note)}</p>

<h2>Thermal</h2>
<p>${esc(brief.thermal_note)}</p>

<h2>Data sources</h2>
<p>${esc(brief.data_sources.join(", "))}</p>

<p class="small">${esc(brief.disclaimer)}</p>
</body>
</html>`;

    downloadBriefFile(
      html,
      "text/html;charset=utf-8;",
      briefFileName(briefMission, "html"),
    );
    setBriefError("");
  };

  // Decide which sections are visible for the selected sidebar item.
  const showTab = (...tabs) => tabs.includes(active);

  // Mars Regions: filtered list and the region matching the loaded coordinates.
  const regionSearchText = regionSearch.trim().toLowerCase();
  const filteredRegions = MARS_REGIONS.filter(
    (region) =>
      (regionCategory === "All" || region.category === regionCategory) &&
      (regionSearchText === "" ||
        region.name.toLowerCase().includes(regionSearchText) ||
        region.description.toLowerCase().includes(regionSearchText)),
  );
  const supportedRegionCount = MARS_REGIONS.filter((region) =>
    isMolaSupported(region.latitude, region.longitude),
  ).length;
  const matchedRegion =
    MARS_REGIONS.find(
      (region) =>
        Math.abs(region.latitude - Number(coordinates.latitude)) < 0.01 &&
        Math.abs(region.longitude - Number(coordinates.longitude)) < 0.01,
    ) || null;
  const matchedRegionName = matchedRegion
    ? matchedRegion.name
    : "Selected coordinates";

  const comparisonLoaded = themisDayLoaded && themisNightLoaded;
  const comparisonError = themisDayImageError || themisNightImageError;

  const activeThemisError =
    activeLayer === "themis_day" ? themisDayImageError : themisNightImageError;

  const activeThemisLoaded =
    activeLayer === "themis_day" ? themisDayLoaded : themisNightLoaded;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">BE</span>
          <div>
            BEYOND EARTH
            <small>MARTIAN MAP</small>
          </div>
        </div>

        <p className="nav-label">EXPLORATION</p>

        {navigation.map(([icon, name]) => (
          <button
            key={name}
            className={`nav-item ${active === name ? "selected" : ""}`}
            onClick={() => setActive(name)}
          >
            <span>{icon}</span>
            {name}
          </button>
        ))}

        <div className="sidebar-bottom">
          <span>PLANETARY EXPLORATION</span>
          <p>BEYOND EARTH v1.0</p>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="breadcrumb">MARS / </span>
            {active.toUpperCase()}
          </div>

          <div className="connection">
            <span
              style={{
                background: backendOnline ? "#72bc83" : "#d5a46f",
              }}
            ></span>
            {backendOnline ? "BACKEND ONLINE" : "CONNECTING TO BACKEND"}
          </div>
        </header>

        <section className="content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">PLANETARY EXPLORATION SYSTEM</p>
              <h1>{active}</h1>
              <p className="subtitle">
                {TAB_SUBTITLES[active] ||
                  "Explore the Martian surface and scientific mission data."}
              </p>
            </div>

            <div className="region-tag">
              MARS · {matchedRegionName.toUpperCase()}
            </div>
          </div>

          {active === "Mission Planner" && (
            <>
              <section className="search-panel">
                <h3>MISSION PLANNER</h3>

                <p className="muted">
                  Plan a Mars exploration mission. Coordinates use the range
                  supported by the current MOLA lookup: latitude 0–90 and
                  longitude 0–180.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "16px",
                  }}
                >
                  <div>
                    <label style={missionLabelStyle}>
                      Choose a Mars region (optional)
                    </label>
                    <select
                      value={
                        MARS_REGIONS.some(
                          (region) => region.name === missionForm.region,
                        )
                          ? missionForm.region
                          : ""
                      }
                      onChange={(event) => {
                        const selectedRegion = MARS_REGIONS.find(
                          (region) => region.name === event.target.value,
                        );
                        if (selectedRegion)
                          applyRegionToMissionForm(selectedRegion);
                      }}
                      style={missionInputStyle}
                    >
                      <option value="">Select a region to fill the form</option>
                      {MARS_REGION_CATEGORIES.map((category) => (
                        <optgroup key={category} label={category}>
                          {MARS_REGIONS.filter(
                            (region) => region.category === category,
                          ).map((region) => (
                            <option key={region.name} value={region.name}>
                              {region.name}
                              {isMolaSupported(
                                region.latitude,
                                region.longitude,
                              )
                                ? ""
                                : " (no MOLA data)"}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={missionLabelStyle}>Mission name</label>
                    <input
                      type="text"
                      maxLength={60}
                      placeholder="e.g. Jezero Delta Survey"
                      value={missionForm.name}
                      onChange={(event) =>
                        updateMissionField("name", event.target.value)
                      }
                      style={missionInputStyle}
                    />
                    {missionErrors.name && (
                      <p style={missionErrorStyle}>{missionErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label style={missionLabelStyle}>Target region</label>
                    <input
                      type="text"
                      maxLength={60}
                      placeholder="e.g. Jezero Crater"
                      value={missionForm.region}
                      onChange={(event) =>
                        updateMissionField("region", event.target.value)
                      }
                      style={missionInputStyle}
                    />
                    {missionErrors.region && (
                      <p style={missionErrorStyle}>{missionErrors.region}</p>
                    )}
                  </div>

                  <div>
                    <label style={missionLabelStyle}>Latitude (0 to 90)</label>
                    <input
                      type="number"
                      min="0"
                      max="90"
                      step="any"
                      value={missionForm.latitude}
                      onChange={(event) =>
                        updateMissionField("latitude", event.target.value)
                      }
                      style={missionInputStyle}
                    />
                    {missionErrors.latitude && (
                      <p style={missionErrorStyle}>{missionErrors.latitude}</p>
                    )}
                  </div>

                  <div>
                    <label style={missionLabelStyle}>
                      East longitude (0 to 180)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="180"
                      step="any"
                      value={missionForm.longitude}
                      onChange={(event) =>
                        updateMissionField("longitude", event.target.value)
                      }
                      style={missionInputStyle}
                    />
                    {missionErrors.longitude && (
                      <p style={missionErrorStyle}>{missionErrors.longitude}</p>
                    )}
                  </div>

                  <div>
                    <label style={missionLabelStyle}>Priority</label>
                    <select
                      value={missionForm.priority}
                      onChange={(event) =>
                        updateMissionField("priority", event.target.value)
                      }
                      style={missionInputStyle}
                    >
                      {MISSION_PRIORITIES.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                    {missionErrors.priority && (
                      <p style={missionErrorStyle}>{missionErrors.priority}</p>
                    )}
                  </div>

                  <div>
                    <label style={missionLabelStyle}>
                      Duration (Mars sols, 1 to 1000)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      step="1"
                      placeholder="e.g. 90"
                      value={missionForm.duration}
                      onChange={(event) =>
                        updateMissionField("duration", event.target.value)
                      }
                      style={missionInputStyle}
                    />
                    {missionErrors.duration && (
                      <p style={missionErrorStyle}>{missionErrors.duration}</p>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: "16px" }}>
                  <label style={missionLabelStyle}>
                    Scientific mission objective
                  </label>
                  <textarea
                    rows={3}
                    maxLength={500}
                    placeholder="e.g. Sample delta deposits to look for biosignatures in ancient lake sediments."
                    value={missionForm.objective}
                    onChange={(event) =>
                      updateMissionField("objective", event.target.value)
                    }
                    style={{ ...missionInputStyle, resize: "vertical" }}
                  />
                  {missionErrors.objective && (
                    <p style={missionErrorStyle}>{missionErrors.objective}</p>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginTop: "14px",
                  }}
                >
                  <button
                    onClick={saveMission}
                    style={{ ...missionButtonStyle, background: "#a85e36" }}
                  >
                    SAVE MISSION
                  </button>
                  <button
                    onClick={useCurrentCoordinatesForMission}
                    style={missionButtonStyle}
                  >
                    USE CURRENT COORDINATES
                  </button>
                  <button
                    onClick={() => {
                      setMissionForm(EMPTY_MISSION_FORM);
                      setMissionErrors({});
                      setMissionMessage("");
                    }}
                    style={missionButtonStyle}
                  >
                    CLEAR FORM
                  </button>
                </div>

                {Object.keys(missionErrors).length > 0 && (
                  <p style={{ ...missionErrorStyle, fontSize: "12px" }}>
                    Please fix the highlighted fields above and save again.
                  </p>
                )}

                {missionMessage && (
                  <p
                    style={{
                      color: "#72bc83",
                      fontSize: "12px",
                      marginTop: "10px",
                    }}
                  >
                    {missionMessage}
                  </p>
                )}
              </section>

              <section className="search-panel">
                <h3>MISSION REGISTER</h3>

                <p className="muted">
                  All saved missions are stored in this browser. Change a
                  mission's status, delete it, export the full register, or
                  explore its target coordinates.
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginBottom: "12px",
                  }}
                >
                  <button
                    onClick={exportMissions}
                    disabled={missions.length === 0}
                    style={{
                      ...missionButtonStyle,
                      cursor: missions.length === 0 ? "not-allowed" : "pointer",
                      opacity: missions.length === 0 ? 0.55 : 1,
                    }}
                  >
                    EXPORT MISSIONS (JSON)
                  </button>
                </div>

                <div className="data-row">
                  <span>Total missions</span>
                  <strong>{missions.length}</strong>
                </div>
                {MISSION_STATUSES.map((status) => (
                  <div className="data-row" key={status}>
                    <span>{status}</span>
                    <strong>
                      {
                        missions.filter((mission) => mission.status === status)
                          .length
                      }
                    </strong>
                  </div>
                ))}

                {missionRegisterError && (
                  <p style={{ ...missionErrorStyle, fontSize: "12px" }}>
                    {missionRegisterError}
                  </p>
                )}

                <div className="separator"></div>

                {missions.length === 0 ? (
                  <p className="muted">
                    No missions yet. Fill in the form above and select SAVE
                    MISSION.
                  </p>
                ) : (
                  missions.map((mission) => (
                    <div
                      key={mission.id}
                      style={{
                        border: "1px solid #3a3f44",
                        borderRadius: "6px",
                        padding: "12px",
                        marginBottom: "12px",
                        background: "#171a1d",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "10px",
                          flexWrap: "wrap",
                        }}
                      >
                        <p className="region-name" style={{ margin: 0 }}>
                          {mission.name}
                        </p>
                        <span
                          style={{
                            padding: "3px 8px",
                            border: `1px solid ${PRIORITY_COLORS[mission.priority] || "#777"}`,
                            borderRadius: "4px",
                            color: PRIORITY_COLORS[mission.priority] || "#fff",
                            fontSize: "11px",
                          }}
                        >
                          {String(mission.priority || "—").toUpperCase()}{" "}
                          PRIORITY
                        </span>
                      </div>

                      <div className="data-row">
                        <span>Target region</span>
                        <strong>{mission.region}</strong>
                      </div>
                      <div className="data-row">
                        <span>Coordinates</span>
                        <strong>
                          {mission.latitude}°, {mission.longitude}°
                        </strong>
                      </div>
                      <div className="data-row">
                        <span>Duration</span>
                        <strong>
                          {mission.durationSols}{" "}
                          {mission.durationSols === 1 ? "sol" : "sols"}
                        </strong>
                      </div>
                      <div className="data-row">
                        <span>Status</span>
                        <strong>{mission.status}</strong>
                      </div>

                      <p className="muted">Objective: {mission.objective}</p>
                      <p className="muted">
                        Created:{" "}
                        {mission.createdAt
                          ? new Date(mission.createdAt).toLocaleString()
                          : "—"}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                          alignItems: "center",
                          marginTop: "8px",
                        }}
                      >
                        <select
                          value={mission.status}
                          onChange={(event) =>
                            updateMissionStatus(mission.id, event.target.value)
                          }
                          aria-label={`Status for ${mission.name}`}
                          style={{
                            padding: "6px 9px",
                            background: "#292d31",
                            color: "#fff",
                            border: "1px solid #777",
                            borderRadius: "4px",
                          }}
                        >
                          {MISSION_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => exploreMissionTarget(mission)}
                          style={{
                            ...missionSmallButtonStyle,
                            background: "#a85e36",
                          }}
                        >
                          EXPLORE TARGET
                        </button>
                        <button
                          onClick={() => planRouteFromMission(mission)}
                          style={missionSmallButtonStyle}
                        >
                          PLAN ROUTE
                        </button>
                        <button
                          onClick={() => deleteMission(mission)}
                          style={missionSmallButtonStyle}
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </section>
            </>
          )}

          {active === "Rover Information" && (
            <section className="search-panel">
              <h3>PERSEVERANCE ROVER</h3>

              <p className="muted">
                NASA's Mars 2020 rover explores Jezero Crater, an ancient lake
                bed, searching for signs of past microbial life and collecting
                rock samples.
              </p>

              <div className="data-row">
                <span>Mission</span>
                <strong>Mars 2020</strong>
              </div>
              <div className="data-row">
                <span>Launch</span>
                <strong>30 July 2020</strong>
              </div>
              <div className="data-row">
                <span>Landing</span>
                <strong>18 February 2021</strong>
              </div>
              <div className="data-row">
                <span>Landing site</span>
                <strong>Jezero Crater</strong>
              </div>
              <div className="data-row">
                <span>Mobility</span>
                <strong>Six-wheel rover</strong>
              </div>
              <div className="data-row">
                <span>Companion</span>
                <strong>Ingenuity helicopter</strong>
              </div>
              <div className="data-row">
                <span>Dashboard reference point</span>
                <strong>18.38°, 77.58°</strong>
              </div>

              <p className="muted">
                Live rover position data is not connected yet, so the Rover
                locations layer stays marked PENDING.
              </p>

              <button
                onClick={() => {
                  setLatitude("18.38");
                  setLongitude("77.58");
                  fetchElevation(18.38, 77.58);
                  fetchGeology(18.38, 77.58);
                  setActive("Explore Mars");
                }}
                style={{ ...missionButtonStyle, background: "#a85e36" }}
              >
                EXPLORE JEZERO CRATER
              </button>
            </section>
          )}

          {active === "Settings" && (
            <section className="search-panel">
              <h3>SETTINGS & DATA</h3>

              <p className="muted">
                Your locations, history and missions are stored only in this
                browser. Use these buttons to clear them.
              </p>

              <div className="data-row">
                <span>Backend</span>
                <strong>{backendOnline ? "Online" : "Not connected"}</strong>
              </div>
              <div className="data-row">
                <span>Backend address</span>
                <strong>{API_BASE}</strong>
              </div>
              <div className="data-row">
                <span>Saved locations</span>
                <strong>{savedLocations.length}</strong>
              </div>
              <div className="data-row">
                <span>Recent history entries</span>
                <strong>{locationHistory.length}</strong>
              </div>
              <div className="data-row">
                <span>Missions</span>
                <strong>{missions.length}</strong>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "14px",
                }}
              >
                <button
                  onClick={() => {
                    if (window.confirm("Delete all saved Mars locations?")) {
                      setSavedLocations([]);
                    }
                  }}
                  style={missionButtonStyle}
                >
                  CLEAR SAVED LOCATIONS
                </button>
                <button
                  onClick={clearLocationHistory}
                  style={missionButtonStyle}
                >
                  CLEAR RECENT HISTORY
                </button>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Delete ALL missions? This cannot be undone.",
                      )
                    ) {
                      setMissions([]);
                    }
                  }}
                  style={missionButtonStyle}
                >
                  DELETE ALL MISSIONS
                </button>
              </div>
            </section>
          )}

          {showTab(
            "Explore Mars",
            "Geological Explorer",
            "Terrain Analysis",
          ) && (
            <section className="search-panel">
              <h3>COORDINATE EXPLORER</h3>

              <p className="muted">
                Enter a supported Mars location to retrieve NASA MOLA elevation,
                USGS geological information and coordinate-based THEMIS daytime
                and nighttime imagery.
              </p>

              <div className="search-fields">
                <label>
                  LATITUDE (0 TO 90)
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                </label>

                <label>
                  EAST LONGITUDE (0 TO 180)
                  <input
                    type="number"
                    min="0"
                    max="180"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                  />
                </label>

                <button onClick={exploreLocation} disabled={loading}>
                  {loading ? "LOADING..." : "EXPLORE LOCATION"}
                </button>
              </div>
            </section>
          )}

          {showTab("Explore Mars") && (
            <section className="search-panel">
              <h3>MARS REGIONS</h3>

              <p className="muted">
                {MARS_REGIONS.length} major named Mars regions with approximate
                central coordinates. {supportedRegionCount} of them fall inside
                the current NASA MOLA coverage (latitude 0–90, longitude 0–180)
                and can be explored here. The others are listed for reference
                and marked as having no elevation data yet.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "16px",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <label style={missionLabelStyle}>Search regions</label>
                  <input
                    type="text"
                    placeholder="e.g. Olympus, crater, polar"
                    value={regionSearch}
                    onChange={(event) => setRegionSearch(event.target.value)}
                    style={missionInputStyle}
                  />
                </div>
                <div>
                  <label style={missionLabelStyle}>Region type</label>
                  <select
                    value={regionCategory}
                    onChange={(event) => setRegionCategory(event.target.value)}
                    style={missionInputStyle}
                  >
                    <option value="All">All types</option>
                    {MARS_REGION_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {regionMessage && (
                <p
                  style={{
                    color: "#d5a46f",
                    fontSize: "12px",
                    marginBottom: "10px",
                  }}
                >
                  {regionMessage}
                </p>
              )}

              <p className="muted">
                Showing {filteredRegions.length} of {MARS_REGIONS.length}{" "}
                regions.
              </p>

              <div
                style={{
                  maxHeight: "520px",
                  overflowY: "auto",
                  paddingRight: "4px",
                }}
              >
                {filteredRegions.length === 0 ? (
                  <p className="muted">
                    No regions match your search. Clear the search or choose
                    another region type.
                  </p>
                ) : (
                  filteredRegions.map((region) => {
                    const supported = isMolaSupported(
                      region.latitude,
                      region.longitude,
                    );

                    return (
                      <div
                        key={region.name}
                        style={{
                          border: "1px solid #3a3f44",
                          borderRadius: "6px",
                          padding: "12px",
                          marginBottom: "10px",
                          background: "#171a1d",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "10px",
                            flexWrap: "wrap",
                          }}
                        >
                          <p className="region-name" style={{ margin: 0 }}>
                            {region.name}
                          </p>
                          <span
                            style={{
                              padding: "3px 8px",
                              border: `1px solid ${supported ? "#72bc83" : "#d5a46f"}`,
                              borderRadius: "4px",
                              color: supported ? "#72bc83" : "#d5a46f",
                              fontSize: "11px",
                            }}
                          >
                            {supported
                              ? "MOLA DATA AVAILABLE"
                              : "NO MOLA DATA YET"}
                          </span>
                        </div>

                        <div className="data-row">
                          <span>Type</span>
                          <strong>{region.category}</strong>
                        </div>
                        <div className="data-row">
                          <span>Approx. coordinates</span>
                          <strong>
                            {formatRegionCoordinates(
                              region.latitude,
                              region.longitude,
                            )}
                          </strong>
                        </div>

                        <p className="muted">{region.description}</p>

                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                            marginTop: "8px",
                          }}
                        >
                          <button
                            onClick={() => exploreRegion(region)}
                            disabled={!supported}
                            style={{
                              ...missionSmallButtonStyle,
                              background: supported ? "#a85e36" : "#292d31",
                              cursor: supported ? "pointer" : "not-allowed",
                              opacity: supported ? 1 : 0.55,
                            }}
                          >
                            EXPLORE REGION
                          </button>
                          <button
                            onClick={() => useRegionInMission(region)}
                            style={missionSmallButtonStyle}
                          >
                            USE IN MISSION
                          </button>
                          {!supported && (
                            <button
                              onClick={() => exploreRegion(region)}
                              style={missionSmallButtonStyle}
                            >
                              WHY NOT AVAILABLE?
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          )}

          {showTab("Overview", "Explore Mars", "Data Layers") && (
            <div className="overview-grid">
              <section className="map-panel">
                <div className="panel-heading">
                  <div>
                    <span className="orange-dot"></span>
                    PLANETARY MAP
                  </div>

                  <span className="map-status">
                    {activeLayer === "mola"
                      ? terrainImageError
                        ? "IMAGE UNAVAILABLE"
                        : "NASA MOLA TERRAIN"
                      : activeLayer === "compare"
                        ? comparisonError
                          ? "COMPARISON IMAGE UNAVAILABLE"
                          : comparisonLoaded
                            ? "THEMIS DAY / NIGHT COMPARISON"
                            : "LOADING DAY / NIGHT COMPARISON"
                        : activeThemisError
                          ? "IMAGE UNAVAILABLE"
                          : activeThemisLoaded
                            ? activeLayer === "themis_day"
                              ? "NASA THEMIS DAYTIME"
                              : "NASA THEMIS NIGHTTIME"
                            : activeLayer === "themis_day"
                              ? "LOADING THEMIS DAYTIME"
                              : "LOADING THEMIS NIGHTTIME"}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    padding: "12px",
                    background: "#171a1d",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={() => changeLayer("mola")}
                    style={{
                      padding: "9px 14px",
                      cursor: "pointer",
                      border: "1px solid #777",
                      borderRadius: "5px",
                      color: "#fff",
                      background:
                        activeLayer === "mola" ? "#a85e36" : "#292d31",
                    }}
                  >
                    MOLA Terrain
                  </button>

                  <button
                    onClick={() => changeLayer("themis_day")}
                    style={{
                      padding: "9px 14px",
                      cursor: "pointer",
                      border: "1px solid #777",
                      borderRadius: "5px",
                      color: "#fff",
                      background:
                        activeLayer === "themis_day" ? "#a85e36" : "#292d31",
                    }}
                  >
                    THEMIS Daytime
                  </button>

                  <button
                    onClick={() => changeLayer("themis_night")}
                    style={{
                      padding: "9px 14px",
                      cursor: "pointer",
                      border: "1px solid #777",
                      borderRadius: "5px",
                      color: "#fff",
                      background:
                        activeLayer === "themis_night" ? "#a85e36" : "#292d31",
                    }}
                  >
                    THEMIS Nighttime
                  </button>

                  <button
                    onClick={() => changeLayer("compare")}
                    style={{
                      padding: "9px 14px",
                      cursor: "pointer",
                      border: "1px solid #777",
                      borderRadius: "5px",
                      color: "#fff",
                      background:
                        activeLayer === "compare" ? "#a85e36" : "#292d31",
                    }}
                  >
                    Compare Day / Night
                  </button>
                </div>

                <div className="mars-map">
                  {activeLayer === "compare" ? (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        width: "100%",
                        height: "100%",
                        background: "#171a1d",
                      }}
                    >
                      <div
                        style={{
                          width: "50%",
                          height: "100%",
                          position: "relative",
                          borderRight: "1px solid #777",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: "8px",
                            left: "8px",
                            zIndex: 1,
                            padding: "5px 8px",
                            color: "#fff",
                            background: "rgba(20, 23, 26, 0.85)",
                            borderRadius: "4px",
                            fontSize: "11px",
                          }}
                        >
                          DAYTIME
                        </div>
                        {!themisDayImageError ? (
                          <img
                            key={THEMIS_DAY_URL}
                            src={THEMIS_DAY_URL}
                            alt="THEMIS daytime infrared image"
                            onLoad={() => setThemisDayLoaded(true)}
                            onError={() => {
                              setThemisDayImageError(true);
                              setThemisDayLoaded(false);
                            }}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                              position: "absolute",
                              inset: 0,
                            }}
                          />
                        ) : (
                          <div className="map-placeholder">
                            <h2>DAYTIME UNAVAILABLE</h2>
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          width: "50%",
                          height: "100%",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: "8px",
                            left: "8px",
                            zIndex: 1,
                            padding: "5px 8px",
                            color: "#fff",
                            background: "rgba(20, 23, 26, 0.85)",
                            borderRadius: "4px",
                            fontSize: "11px",
                          }}
                        >
                          NIGHTTIME
                        </div>
                        {!themisNightImageError ? (
                          <img
                            key={THEMIS_NIGHT_URL}
                            src={THEMIS_NIGHT_URL}
                            alt="THEMIS nighttime infrared image"
                            onLoad={() => setThemisNightLoaded(true)}
                            onError={() => {
                              setThemisNightImageError(true);
                              setThemisNightLoaded(false);
                            }}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                              position: "absolute",
                              inset: 0,
                            }}
                          />
                        ) : (
                          <div className="map-placeholder">
                            <h2>NIGHTTIME UNAVAILABLE</h2>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : activeLayer === "mola" ? (
                    !terrainImageError ? (
                      <img
                        src={TERRAIN_IMAGE_URL}
                        alt="Mars terrain visualization from NASA MOLA data"
                        onError={() => setTerrainImageError(true)}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          position: "absolute",
                          inset: 0,
                          background: "#171a1d",
                        }}
                      />
                    ) : (
                      <div className="map-placeholder">
                        <h2>MOLA IMAGE UNAVAILABLE</h2>
                        <p>Check the backend connection.</p>
                      </div>
                    )
                  ) : activeLayer === "themis_day" ? (
                    !themisDayImageError ? (
                      <img
                        key={THEMIS_DAY_URL}
                        src={THEMIS_DAY_URL}
                        alt="NASA Mars Odyssey THEMIS daytime infrared tile for selected coordinates"
                        onLoad={() => setThemisDayLoaded(true)}
                        onError={() => {
                          setThemisDayImageError(true);
                          setThemisDayLoaded(false);
                        }}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          position: "absolute",
                          inset: 0,
                          background: "#171a1d",
                        }}
                      />
                    ) : (
                      <div className="map-placeholder">
                        <h2>THEMIS DAYTIME IMAGE UNAVAILABLE</h2>
                        <p>Check the backend and NASA tile service.</p>
                      </div>
                    )
                  ) : !themisNightImageError ? (
                    <img
                      key={THEMIS_NIGHT_URL}
                      src={THEMIS_NIGHT_URL}
                      alt="NASA Mars Odyssey THEMIS nighttime infrared tile for selected coordinates"
                      onLoad={() => setThemisNightLoaded(true)}
                      onError={() => {
                        setThemisNightImageError(true);
                        setThemisNightLoaded(false);
                      }}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        position: "absolute",
                        inset: 0,
                        background: "#171a1d",
                      }}
                    />
                  ) : (
                    <div className="map-placeholder">
                      <h2>THEMIS NIGHTTIME IMAGE UNAVAILABLE</h2>
                      <p>Check the backend and NASA tile service.</p>
                    </div>
                  )}
                </div>

                <div className="map-footer">
                  <span>
                    DATA SOURCE:{" "}
                    {activeLayer === "mola" ? "NASA MOLA" : "NASA THEMIS"}
                  </span>

                  <span>
                    {activeLayer === "mola"
                      ? "TERRAIN ELEVATION"
                      : activeLayer === "compare"
                        ? `DAY / NIGHT COMPARISON · ZOOM 5 · ${coordinates.latitude}°, ${coordinates.longitude}°`
                        : `${activeLayer === "themis_day" ? "DAYTIME" : "NIGHTTIME"} INFRARED · ZOOM 5 · ${coordinates.latitude}°, ${coordinates.longitude}°`}
                  </span>
                </div>
              </section>

              <aside className="right-panel">
                {showTab("Overview", "Explore Mars") && (
                  <section className="data-panel">
                    <h3>EXPLORATION REGION</h3>

                    <p className="region-name">{matchedRegionName}</p>

                    <p className="muted">
                      {matchedRegion
                        ? matchedRegion.name === "Jezero Crater"
                          ? "Perseverance rover exploration region"
                          : matchedRegion.category
                        : "Custom Mars coordinates"}
                    </p>

                    <div className="separator"></div>

                    <div className="data-row">
                      <span>Latitude</span>
                      <strong>{coordinates.latitude}° N</strong>
                    </div>

                    <div className="data-row">
                      <span>Longitude</span>
                      <strong>{coordinates.longitude}° E</strong>
                    </div>

                    <div className="data-row">
                      <span>Elevation</span>
                      <strong>
                        {loading
                          ? "Loading..."
                          : elevation !== null
                            ? `${elevation.toLocaleString()} m`
                            : "Unavailable"}
                      </strong>
                    </div>

                    <div className="data-row">
                      <span>Terrain</span>
                      <strong>
                        {elevation !== null
                          ? "MOLA sample loaded"
                          : "Not connected"}
                      </strong>
                    </div>

                    <div className="separator"></div>

                    <p className="region-name">Geological Information</p>

                    <div className="data-row">
                      <span>Geology Unit</span>
                      <strong>
                        {geology
                          ? geology.geology_unit
                          : geologyLoading
                            ? "Loading..."
                            : "Unavailable"}
                      </strong>
                    </div>

                    <p className="muted">
                      {geology
                        ? geology.unit_description
                        : geologyLoading
                          ? "Retrieving geology information..."
                          : geologyError || "Geology information unavailable."}
                    </p>

                    <div className="data-row">
                      <span>Map Reference</span>
                      <strong>{geology?.map_reference || "—"}</strong>
                    </div>

                    <div className="data-row">
                      <span>Source</span>
                      <strong>{geology?.source || "—"}</strong>
                    </div>

                    {error && (
                      <p style={{ color: "#e49a75", fontSize: "11px" }}>
                        {error}
                      </p>
                    )}
                  </section>
                )}

                {showTab("Overview", "Data Layers") && (
                  <section className="data-panel">
                    <h3>SCIENTIFIC DATA LAYERS</h3>

                    {[
                      ["Optical imagery", "OFFLINE"],
                      ["Elevation", elevation !== null ? "ONLINE" : "OFFLINE"],
                      ["Surface roughness", "PENDING"],
                      [
                        "Geological formations",
                        geology
                          ? "ONLINE"
                          : geologyLoading
                            ? "LOADING"
                            : "ERROR",
                      ],
                      [
                        "THEMIS daytime",
                        themisDayLoaded
                          ? "ONLINE"
                          : themisDayImageError
                            ? "ERROR"
                            : "AVAILABLE",
                      ],
                      [
                        "THEMIS nighttime",
                        themisNightLoaded
                          ? "ONLINE"
                          : themisNightImageError
                            ? "ERROR"
                            : "AVAILABLE",
                      ],
                      ["Rover locations", "PENDING"],
                    ].map(([layer, status]) => (
                      <div className="layer-row" key={layer}>
                        <span>{layer}</span>
                        <span className="unavailable">{status}</span>
                      </div>
                    ))}
                  </section>
                )}
              </aside>
            </div>
          )}

          {showTab("Geological Explorer", "Terrain Analysis") && (
            <section className="search-panel">
              <h3>TERRAIN & GEOLOGY INSPECTOR</h3>

              <p className="muted">
                Detailed data returned for the currently selected coordinates.
                Change the location above and select EXPLORE LOCATION to refresh
                these values.
              </p>

              <div className="data-row">
                <span>MOLA elevation sample</span>
                <strong>
                  {loading
                    ? "Loading..."
                    : elevation !== null
                      ? `${elevation.toLocaleString()} m`
                      : "Unavailable"}
                </strong>
              </div>

              <div className="data-row">
                <span>Elevation data source</span>
                <strong>NASA MOLA</strong>
              </div>

              <div className="data-row">
                <span>Analyzed coordinates</span>
                <strong>
                  {coordinates.latitude}°, {coordinates.longitude}°
                </strong>
              </div>

              <div className="separator"></div>

              <div className="data-row">
                <span>Geological unit</span>
                <strong>
                  {geology
                    ? geology.geology_unit
                    : geologyError
                      ? "Unavailable"
                      : "Loading..."}
                </strong>
              </div>

              <p className="muted">
                {geology
                  ? geology.unit_description
                  : geologyError || "Retrieving geological information..."}
              </p>

              <div className="data-row">
                <span>Mapped unit area</span>
                <strong>
                  {geology?.area_km2 != null
                    ? `${Number(geology.area_km2).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })} km²`
                    : "Unavailable"}
                </strong>
              </div>

              <div className="data-row">
                <span>Geology map reference</span>
                <strong>{geology?.map_reference || "—"}</strong>
              </div>

              <div className="data-row">
                <span>Geology data source</span>
                <strong>{geology?.source || "—"}</strong>
              </div>

              <p className="muted">
                Note: mapped unit area is the area of the geological map
                polygon, not the area immediately surrounding the selected
                coordinate.
              </p>
            </section>
          )}

          {showTab("Overview", "Terrain Analysis") && (
            <section className="search-panel">
              <h3>MARS SURFACE STATISTICS</h3>

              <p className="muted">
                Elevation range and average calculated from the complete NASA
                MOLA raster dataset. The selected-coordinate reading is shown
                separately below.
              </p>

              <div className="data-row">
                <span>Selected elevation</span>
                <strong>
                  {loading
                    ? "Loading..."
                    : elevation !== null
                      ? `${elevation.toLocaleString()} m`
                      : "Unavailable"}
                </strong>
              </div>

              <div className="data-row">
                <span>Selected latitude</span>
                <strong>{coordinates.latitude}°</strong>
              </div>

              <div className="data-row">
                <span>Selected longitude</span>
                <strong>{coordinates.longitude}°</strong>
              </div>

              <div className="separator"></div>

              <div className="data-row">
                <span>Highest elevation (MOLA)</span>
                <strong>
                  {statisticsLoading
                    ? "Calculating..."
                    : statistics
                      ? `${Number(
                          statistics.highest_elevation_meters,
                        ).toLocaleString()} m`
                      : "Unavailable"}
                </strong>
              </div>

              <div className="data-row">
                <span>Lowest elevation (MOLA)</span>
                <strong>
                  {statisticsLoading
                    ? "Calculating..."
                    : statistics
                      ? `${Number(
                          statistics.lowest_elevation_meters,
                        ).toLocaleString()} m`
                      : "Unavailable"}
                </strong>
              </div>

              <div className="data-row">
                <span>Average elevation (MOLA)</span>
                <strong>
                  {statisticsLoading
                    ? "Calculating..."
                    : statistics
                      ? `${Number(
                          statistics.average_elevation_meters,
                        ).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })} m`
                      : "Unavailable"}
                </strong>
              </div>

              <div className="data-row">
                <span>Statistics source</span>
                <strong>{statistics?.source || "NASA MOLA"}</strong>
              </div>

              {statisticsError && (
                <p style={{ color: "#e49a75", fontSize: "11px" }}>
                  {statisticsError}
                </p>
              )}

              <p className="muted">
                Note: highest, lowest and average values are calculated across
                the complete MOLA raster, including areas outside the coordinate
                range currently supported by this app.
              </p>

              <button
                onClick={fetchStatistics}
                disabled={statisticsLoading}
                style={{
                  padding: "9px 14px",
                  cursor: statisticsLoading ? "not-allowed" : "pointer",
                  border: "1px solid #777",
                  borderRadius: "5px",
                  color: "#fff",
                  background: "#292d31",
                  marginTop: "8px",
                  opacity: statisticsLoading ? 0.7 : 1,
                }}
              >
                {statisticsLoading ? "REFRESHING..." : "REFRESH STATISTICS"}
              </button>
            </section>
          )}

          {showTab("Terrain Analysis") && (
            <section className="search-panel">
              <h3>MARS LOCATION COMPARISON</h3>
              <p className="muted">
                Compare MOLA elevation and mapped geology at two coordinates.
                Both points use the coordinate range supported by the current
                MOLA lookup.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "16px",
                }}
              >
                <div>
                  <p className="region-name">LOCATION A</p>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      color: "#aaa",
                      fontSize: "12px",
                    }}
                  >
                    Latitude (0 to 90)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    step="any"
                    value={compareLatitudeA}
                    onChange={(event) =>
                      setCompareLatitudeA(event.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginBottom: "9px",
                      background: "#171a1d",
                      color: "#fff",
                      border: "1px solid #555",
                      borderRadius: "5px",
                    }}
                  />
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      color: "#aaa",
                      fontSize: "12px",
                    }}
                  >
                    Longitude (0 to 180)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="180"
                    step="any"
                    value={compareLongitudeA}
                    onChange={(event) =>
                      setCompareLongitudeA(event.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      background: "#171a1d",
                      color: "#fff",
                      border: "1px solid #555",
                      borderRadius: "5px",
                    }}
                  />
                </div>
                <div>
                  <p className="region-name">LOCATION B</p>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      color: "#aaa",
                      fontSize: "12px",
                    }}
                  >
                    Latitude (0 to 90)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    step="any"
                    value={compareLatitudeB}
                    onChange={(event) =>
                      setCompareLatitudeB(event.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginBottom: "9px",
                      background: "#171a1d",
                      color: "#fff",
                      border: "1px solid #555",
                      borderRadius: "5px",
                    }}
                  />
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      color: "#aaa",
                      fontSize: "12px",
                    }}
                  >
                    Longitude (0 to 180)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="180"
                    step="any"
                    value={compareLongitudeB}
                    onChange={(event) =>
                      setCompareLongitudeB(event.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      background: "#171a1d",
                      color: "#fff",
                      border: "1px solid #555",
                      borderRadius: "5px",
                    }}
                  />
                </div>
              </div>

              <button
                onClick={compareMarsLocations}
                disabled={comparisonLoading}
                style={{
                  padding: "9px 14px",
                  marginTop: "14px",
                  cursor: comparisonLoading ? "not-allowed" : "pointer",
                  border: "1px solid #777",
                  borderRadius: "5px",
                  color: "#fff",
                  background: "#a85e36",
                  opacity: comparisonLoading ? 0.7 : 1,
                }}
              >
                {comparisonLoading
                  ? "COMPARING LOCATIONS..."
                  : "COMPARE LOCATIONS"}
              </button>

              {locationComparisonError && (
                <p
                  style={{
                    color: "#e49a75",
                    fontSize: "12px",
                    marginTop: "10px",
                  }}
                >
                  {locationComparisonError}
                </p>
              )}

              {comparisonResult && (
                <div style={{ marginTop: "16px", overflowX: "auto" }}>
                  <div className="data-row">
                    <span>Elevation difference</span>
                    <strong>
                      {Math.abs(
                        comparisonResult.locationA.elevation_meters -
                          comparisonResult.locationB.elevation_meters,
                      ).toLocaleString()}{" "}
                      m
                    </strong>
                  </div>
                  <div className="data-row">
                    <span>Higher location</span>
                    <strong>
                      {comparisonResult.locationA.elevation_meters ===
                      comparisonResult.locationB.elevation_meters
                        ? "Same elevation"
                        : comparisonResult.locationA.elevation_meters >
                            comparisonResult.locationB.elevation_meters
                          ? "Location A"
                          : "Location B"}
                    </strong>
                  </div>
                  <div className="data-row">
                    <span>Location A elevation</span>
                    <strong>
                      {Number(
                        comparisonResult.locationA.elevation_meters,
                      ).toLocaleString()}{" "}
                      m
                    </strong>
                  </div>
                  <div className="data-row">
                    <span>Location B elevation</span>
                    <strong>
                      {Number(
                        comparisonResult.locationB.elevation_meters,
                      ).toLocaleString()}{" "}
                      m
                    </strong>
                  </div>
                  <div className="data-row">
                    <span>Location A geology</span>
                    <strong>
                      {comparisonResult.locationA.geology?.geology_unit ||
                        "Unavailable"}
                    </strong>
                  </div>
                  <div className="data-row">
                    <span>Location B geology</span>
                    <strong>
                      {comparisonResult.locationB.geology?.geology_unit ||
                        "Unavailable"}
                    </strong>
                  </div>
                  <p className="muted" style={{ marginTop: "8px" }}>
                    Geology labels are returned from the USGS map service;
                    unavailable geology does not prevent the elevation
                    comparison.
                  </p>
                </div>
              )}
            </section>
          )}

          {showTab("Explore Mars") && (
            <section className="search-panel">
              <h3>SAVED MARS LOCATIONS</h3>

              <p className="muted">
                Save coordinates you want to revisit. Select a saved location to
                reload its elevation and geological information.
              </p>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  onClick={saveCurrentLocation}
                  style={{
                    padding: "9px 14px",
                    cursor: "pointer",
                    border: "1px solid #777",
                    borderRadius: "5px",
                    color: "#fff",
                    background: "#a85e36",
                    marginBottom: "12px",
                  }}
                >
                  SAVE CURRENT COORDINATES
                </button>
                <button
                  onClick={exportSavedLocations}
                  style={{
                    padding: "9px 14px",
                    cursor: "pointer",
                    border: "1px solid #777",
                    borderRadius: "5px",
                    color: "#fff",
                    background: "#292d31",
                    marginBottom: "12px",
                  }}
                >
                  EXPORT CSV
                </button>
                <button
                  onClick={exportTerrainReport}
                  disabled={elevation === null}
                  style={{
                    padding: "9px 14px",
                    cursor: elevation === null ? "not-allowed" : "pointer",
                    border: "1px solid #777",
                    borderRadius: "5px",
                    color: "#fff",
                    background: "#292d31",
                    marginBottom: "12px",
                    opacity: elevation === null ? 0.55 : 1,
                  }}
                >
                  EXPORT TERRAIN REPORT
                </button>
              </div>

              {savedLocations.length === 0 ? (
                <p className="muted">No saved locations yet.</p>
              ) : (
                savedLocations.map((location) => (
                  <div
                    className="data-row"
                    key={location.id}
                    style={{ gap: "10px", flexWrap: "wrap" }}
                  >
                    <span>
                      {location.label}: {location.latitude}°,{" "}
                      {location.longitude}°
                    </span>

                    <span style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => openSavedLocation(location)}
                        style={{
                          padding: "6px 9px",
                          cursor: "pointer",
                          border: "1px solid #777",
                          borderRadius: "4px",
                          color: "#fff",
                          background: "#292d31",
                        }}
                      >
                        OPEN
                      </button>
                      <button
                        onClick={() => renameSavedLocation(location)}
                        style={{
                          padding: "6px 9px",
                          cursor: "pointer",
                          border: "1px solid #777",
                          borderRadius: "4px",
                          color: "#fff",
                          background: "#292d31",
                        }}
                      >
                        RENAME
                      </button>
                      <button
                        onClick={() => removeSavedLocation(location.id)}
                        style={{
                          padding: "6px 9px",
                          cursor: "pointer",
                          border: "1px solid #777",
                          borderRadius: "4px",
                          color: "#fff",
                          background: "#292d31",
                        }}
                      >
                        REMOVE
                      </button>
                    </span>
                  </div>
                ))
              )}
            </section>
          )}

          {showTab("Explore Mars") && (
            <section className="search-panel">
              <h3>RECENTLY EXPLORED LOCATIONS</h3>
              <p className="muted">
                Your ten most recently explored coordinates are stored in this
                browser so you can quickly revisit them.
              </p>

              {locationHistory.length === 0 ? (
                <p className="muted">No exploration history yet.</p>
              ) : (
                <>
                  {locationHistory.map((location, index) => (
                    <div
                      className="data-row"
                      key={`${location.id}-${index}`}
                      style={{ gap: "10px", flexWrap: "wrap" }}
                    >
                      <span>
                        {location.latitude}°, {location.longitude}°
                        <span className="muted">
                          {" "}
                          · {new Date(location.exploredAt).toLocaleString()}
                        </span>
                      </span>
                      <button
                        onClick={() => {
                          setLatitude(String(location.latitude));
                          setLongitude(String(location.longitude));
                          fetchElevation(location.latitude, location.longitude);
                          fetchGeology(location.latitude, location.longitude);
                        }}
                        style={{
                          padding: "6px 9px",
                          cursor: "pointer",
                          border: "1px solid #777",
                          borderRadius: "4px",
                          color: "#fff",
                          background: "#292d31",
                        }}
                      >
                        REVISIT
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={clearLocationHistory}
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      border: "1px solid #777",
                      borderRadius: "5px",
                      color: "#fff",
                      background: "#292d31",
                      marginTop: "10px",
                    }}
                  >
                    CLEAR HISTORY
                  </button>
                </>
              )}
            </section>
          )}

          {showTab("Terrain Analysis", "Mission Planner") && (
            <section className="search-panel">
              <h3>MARSWALK ROUTE PLANNER</h3>

              <p className="muted">
                Plan a straight-line surface walk. The app reads NASA MOLA
                elevation at {ROUTE_SEGMENTS + 1} points along the route and
                rates each segment by slope. Supported range: latitude 0–90 and
                longitude 0–180.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "16px",
                }}
              >
                <div>
                  <p className="region-name">START POINT</p>
                  <label style={missionLabelStyle}>Latitude (0 to 90)</label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    step="any"
                    value={routeStartLat}
                    onChange={(event) => setRouteStartLat(event.target.value)}
                    style={{ ...missionInputStyle, marginBottom: "9px" }}
                  />
                  <label style={missionLabelStyle}>Longitude (0 to 180)</label>
                  <input
                    type="number"
                    min="0"
                    max="180"
                    step="any"
                    value={routeStartLon}
                    onChange={(event) => setRouteStartLon(event.target.value)}
                    style={missionInputStyle}
                  />
                </div>

                <div>
                  <p className="region-name">END POINT</p>
                  <label style={missionLabelStyle}>Latitude (0 to 90)</label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    step="any"
                    value={routeEndLat}
                    onChange={(event) => setRouteEndLat(event.target.value)}
                    style={{ ...missionInputStyle, marginBottom: "9px" }}
                  />
                  <label style={missionLabelStyle}>Longitude (0 to 180)</label>
                  <input
                    type="number"
                    min="0"
                    max="180"
                    step="any"
                    value={routeEndLon}
                    onChange={(event) => setRouteEndLon(event.target.value)}
                    style={missionInputStyle}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "14px",
                }}
              >
                <button
                  onClick={planRoute}
                  disabled={routeLoading}
                  style={{
                    ...missionButtonStyle,
                    background: "#a85e36",
                    cursor: routeLoading ? "not-allowed" : "pointer",
                    opacity: routeLoading ? 0.7 : 1,
                  }}
                >
                  {routeLoading ? "ANALYZING ROUTE..." : "PLAN ROUTE"}
                </button>
                <button
                  onClick={() => {
                    setRouteStartLat(String(coordinates.latitude));
                    setRouteStartLon(String(coordinates.longitude));
                  }}
                  style={missionButtonStyle}
                >
                  USE SELECTED AS START
                </button>
                <button
                  onClick={() => {
                    setRouteEndLat(String(coordinates.latitude));
                    setRouteEndLon(String(coordinates.longitude));
                  }}
                  style={missionButtonStyle}
                >
                  USE SELECTED AS END
                </button>
                <button
                  onClick={exportRoute}
                  disabled={!routeResult}
                  style={{
                    ...missionButtonStyle,
                    cursor: routeResult ? "pointer" : "not-allowed",
                    opacity: routeResult ? 1 : 0.55,
                  }}
                >
                  EXPORT ROUTE (JSON)
                </button>
                <button
                  onClick={() => {
                    setRouteStartLat("");
                    setRouteStartLon("");
                    setRouteEndLat("");
                    setRouteEndLon("");
                    setRouteResult(null);
                    setRouteError("");
                  }}
                  style={missionButtonStyle}
                >
                  CLEAR ROUTE
                </button>
              </div>

              {routeError && (
                <p style={{ ...missionErrorStyle, fontSize: "12px" }}>
                  {routeError}
                </p>
              )}

              {routeResult && (
                <div style={{ marginTop: "16px" }}>
                  <div className="data-row">
                    <span>Overall route rating</span>
                    <strong
                      style={{ color: RATING_COLORS[routeResult.overall] }}
                    >
                      {routeResult.overall.toUpperCase()}
                    </strong>
                  </div>
                  <div className="data-row">
                    <span>Total distance</span>
                    <strong>{routeResult.totalKm.toFixed(2)} km</strong>
                  </div>
                  <div className="data-row">
                    <span>Elevation gain / loss</span>
                    <strong>
                      +{Math.round(routeResult.gain).toLocaleString()} m / -
                      {Math.round(routeResult.loss).toLocaleString()} m
                    </strong>
                  </div>
                  <div className="data-row">
                    <span>Steepest segment</span>
                    <strong>{routeResult.maxSlope.toFixed(1)}°</strong>
                  </div>
                  <div className="data-row">
                    <span>Estimated walking time</span>
                    <strong>{routeResult.hours.toFixed(1)} hours</strong>
                  </div>
                  <div className="data-row">
                    <span>{EVA_WINDOW_HOURS}-hour EVA window check</span>
                    <strong
                      style={{
                        color:
                          routeResult.hours > EVA_WINDOW_HOURS
                            ? RATING_COLORS.Hazard
                            : RATING_COLORS.Safe,
                      }}
                    >
                      {routeResult.hours > EVA_WINDOW_HOURS
                        ? "ONE WAY EXCEEDS WINDOW"
                        : "WITHIN WINDOW"}
                    </strong>
                  </div>

                  {(() => {
                    const width = 600;
                    const height = 160;
                    const pad = 12;
                    const profile = routeResult.profile;
                    const elevationsOnly = profile.map(
                      (item) => item.elevation,
                    );
                    const minElevation = Math.min(...elevationsOnly);
                    const maxElevation = Math.max(...elevationsOnly);
                    const span = maxElevation - minElevation || 1;
                    const totalKm = routeResult.totalKm || 1;
                    const toX = (km) =>
                      pad + (km / totalKm) * (width - 2 * pad);
                    const toY = (value) =>
                      height -
                      pad -
                      ((value - minElevation) / span) * (height - 2 * pad);

                    return (
                      <div style={{ marginTop: "14px" }}>
                        <p className="region-name">ELEVATION PROFILE</p>
                        <svg
                          viewBox={`0 0 ${width} ${height}`}
                          style={{
                            width: "100%",
                            height: "auto",
                            background: "#171a1d",
                            borderRadius: "6px",
                          }}
                          role="img"
                          aria-label="Elevation profile along the planned route, colored by slope rating"
                        >
                          {profile.slice(1).map((item, index) => (
                            <line
                              key={index}
                              x1={toX(profile[index].km)}
                              y1={toY(profile[index].elevation)}
                              x2={toX(item.km)}
                              y2={toY(item.elevation)}
                              stroke={RATING_COLORS[item.rating]}
                              strokeWidth="3"
                              strokeLinecap="round"
                            />
                          ))}
                          {profile.map((item, index) => (
                            <circle
                              key={index}
                              cx={toX(item.km)}
                              cy={toY(item.elevation)}
                              r="3"
                              fill="#fff"
                            />
                          ))}
                        </svg>
                        <p className="muted">
                          Lowest {Math.round(minElevation).toLocaleString()} m ·
                          Highest {Math.round(maxElevation).toLocaleString()} m
                          · Line color shows the slope rating of each segment.
                        </p>
                      </div>
                    );
                  })()}

                  <div className="separator"></div>
                  <p className="region-name">SEGMENT BREAKDOWN</p>

                  {routeResult.segments.map((segment) => (
                    <div
                      className="data-row"
                      key={segment.segment}
                      style={{ gap: "10px", flexWrap: "wrap" }}
                    >
                      <span>
                        Segment {segment.segment}: {segment.start_km.toFixed(2)}
                        –{segment.end_km.toFixed(2)} km ·{" "}
                        {segment.slope_degrees}°
                      </span>
                      <strong style={{ color: RATING_COLORS[segment.rating] }}>
                        {segment.rating.toUpperCase()}
                      </strong>
                    </div>
                  ))}

                  <p className="muted" style={{ marginTop: "8px" }}>
                    Note: elevation is sampled from NASA MOLA along a straight
                    line, so slopes are regional estimates. They cannot detect
                    boulders, cliffs or small hazards between samples. Slope
                    limits ({SLOPE_CAUTION_DEG}° caution, {SLOPE_HAZARD_DEG}°
                    hazard), the {EVA_WALK_SPEED_KMH} km/h walking speed and the{" "}
                    {EVA_WINDOW_HOURS}-hour EVA window are planning assumptions
                    for this app, not official NASA values.
                  </p>
                </div>
              )}
            </section>
          )}

          {showTab("Terrain Analysis", "Mission Planner") && (
            <section className="search-panel">
              <h3>ASTRONAUT SAFETY PANEL</h3>

              <p className="muted">
                A planning aid that combines your route, terrain, geology,
                radiation and thermal notes into one pre-walk checklist. It is a
                decision aid for this project, not official NASA flight rules.
              </p>

              <p className="region-name">PRE-WALK READINESS</p>

              <div className="data-row">
                <span>Readiness</span>
                <strong
                  style={{
                    color: safetyReady
                      ? RATING_COLORS.Safe
                      : RATING_COLORS.Caution,
                  }}
                >
                  {safetyReady ? "READY" : "NOT READY"}
                </strong>
              </div>
              <div className="data-row">
                <span>Checks complete</span>
                <strong>
                  {safetyDone} / {safetyTotal}
                </strong>
              </div>

              {safetyAuto.map(([label, passed]) => (
                <div className="data-row" key={label}>
                  <span>{label}</span>
                  <strong
                    style={{
                      color: passed
                        ? RATING_COLORS.Safe
                        : RATING_COLORS.Caution,
                    }}
                  >
                    {passed ? "DONE" : "PENDING"}
                  </strong>
                </div>
              ))}

              {SAFETY_MANUAL_ITEMS.map(([key, label]) => (
                <div className="data-row" key={key}>
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(safetyChecks[key])}
                    onChange={() => toggleSafetyCheck(key)}
                    aria-label={label}
                    style={{ cursor: "pointer", width: "18px", height: "18px" }}
                  />
                </div>
              ))}

              <button
                onClick={() => setSafetyChecks(EMPTY_SAFETY_CHECKS)}
                style={{ ...missionButtonStyle, marginTop: "10px" }}
              >
                RESET CHECKLIST
              </button>

              <div className="separator"></div>
              <p className="region-name">
                TERRAIN AND GEOLOGY AT SELECTED POINT
              </p>

              <div className="data-row">
                <span>Selected coordinates</span>
                <strong>
                  {coordinates.latitude}°, {coordinates.longitude}°
                </strong>
              </div>
              <div className="data-row">
                <span>MOLA elevation</span>
                <strong>
                  {elevation !== null
                    ? `${elevation.toLocaleString()} m`
                    : "Unavailable"}
                </strong>
              </div>
              <div className="data-row">
                <span>Geological unit</span>
                <strong>{geology?.geology_unit || "Unavailable"}</strong>
              </div>
              <div className="data-row">
                <span>Planned route rating</span>
                <strong
                  style={{
                    color: routeResult
                      ? RATING_COLORS[routeResult.overall]
                      : undefined,
                  }}
                >
                  {routeResult
                    ? `${routeResult.overall.toUpperCase()} · steepest ${routeResult.maxSlope.toFixed(1)}°`
                    : "No route planned"}
                </strong>
              </div>

              <div className="separator"></div>
              <p className="region-name">RADIATION</p>

              <div className="data-row">
                <span>Surface dose reference</span>
                <strong>about 0.6 to 0.7 mSv per day</strong>
              </div>
              <div className="data-row">
                <span>Reference source</span>
                <strong>NASA Curiosity RAD instrument</strong>
              </div>
              <div className="data-row">
                <span>Atmospheric shielding at selected point</span>
                <strong>
                  {elevation === null
                    ? "Unavailable"
                    : elevation < 0
                      ? "Lower ground: more atmosphere overhead"
                      : "Higher ground: less atmosphere overhead"}
                </strong>
              </div>
              <p className="muted">
                The dose value is an approximate average from Curiosity
                measurements and should be confirmed against NASA sources. Solar
                particle events can raise the dose sharply. A live space weather
                feed is not connected yet, so check current conditions before
                any walk.
              </p>

              <div className="separator"></div>
              <p className="region-name">THERMAL</p>

              <div className="data-row">
                <span>Surface temperature swing</span>
                <strong>Very large between day and night</strong>
              </div>
              <div className="data-row">
                <span>Approximate Mars surface range</span>
                <strong>about -125 °C to +20 °C</strong>
              </div>
              <p className="muted">
                Compare THEMIS daytime and nighttime infrared imagery at the
                selected coordinates to see how the surface warms and cools.
              </p>
              <button
                onClick={() => {
                  changeLayer("compare");
                  setActive("Data Layers");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  document
                    .querySelectorAll(".app, .main, .content")
                    .forEach((element) => {
                      if (typeof element.scrollTo === "function") {
                        element.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    });
                }}
                style={{ ...missionButtonStyle, background: "#a85e36" }}
              >
                VIEW DAY / NIGHT COMPARISON
              </button>
            </section>
          )}

          {showTab("Mission Planner") && (
            <section className="search-panel">
              <h3>ASTRONAUT MISSION BRIEF</h3>

              <p className="muted">
                One summary of a mission: objective, target data, planned route,
                safety status and sources. Export it as JSON, or as a printable
                page you can save as PDF from your browser.
              </p>

              {missions.length === 0 ? (
                <p className="muted">
                  No missions yet. Save a mission in the Mission Planner above
                  to build its brief.
                </p>
              ) : (
                <>
                  <label style={missionLabelStyle}>Mission</label>
                  <select
                    value={briefMission ? briefMission.id : ""}
                    onChange={(event) => {
                      setBriefMissionId(event.target.value);
                      setBriefError("");
                    }}
                    style={missionInputStyle}
                  >
                    {missions.map((mission) => (
                      <option key={mission.id} value={mission.id}>
                        {mission.name} · {mission.region}
                      </option>
                    ))}
                  </select>

                  {briefMission && (
                    <div style={{ marginTop: "14px" }}>
                      <p className="region-name">{briefMission.name}</p>

                      <div className="data-row">
                        <span>Target region</span>
                        <strong>{briefMission.region}</strong>
                      </div>
                      <div className="data-row">
                        <span>Coordinates</span>
                        <strong>
                          {briefMission.latitude}°, {briefMission.longitude}°
                        </strong>
                      </div>
                      <div className="data-row">
                        <span>Priority / status</span>
                        <strong>
                          {briefMission.priority} · {briefMission.status}
                        </strong>
                      </div>
                      <div className="data-row">
                        <span>Duration</span>
                        <strong>{briefMission.durationSols} sols</strong>
                      </div>
                      <p className="muted">
                        Objective: {briefMission.objective}
                      </p>

                      <div className="separator"></div>

                      <div className="data-row">
                        <span>Target data loaded</span>
                        <strong
                          style={{
                            color: briefMatchesLoadedData
                              ? RATING_COLORS.Safe
                              : RATING_COLORS.Caution,
                          }}
                        >
                          {briefMatchesLoadedData
                            ? "MATCHES MISSION TARGET"
                            : "DIFFERENT LOCATION"}
                        </strong>
                      </div>
                      <div className="data-row">
                        <span>MOLA elevation</span>
                        <strong>
                          {elevation !== null
                            ? `${elevation.toLocaleString()} m`
                            : "Unavailable"}
                        </strong>
                      </div>
                      <div className="data-row">
                        <span>Geological unit</span>
                        <strong>
                          {geology?.geology_unit || "Unavailable"}
                        </strong>
                      </div>
                      <div className="data-row">
                        <span>Planned route</span>
                        <strong>
                          {routeResult
                            ? `${routeResult.overall.toUpperCase()} · ${routeResult.totalKm.toFixed(2)} km`
                            : "No route planned"}
                        </strong>
                      </div>
                      <div className="data-row">
                        <span>Safety readiness</span>
                        <strong
                          style={{
                            color: safetyReady
                              ? RATING_COLORS.Safe
                              : RATING_COLORS.Caution,
                          }}
                        >
                          {safetyReady ? "READY" : "NOT READY"} · {safetyDone} /{" "}
                          {safetyTotal}
                        </strong>
                      </div>

                      {!briefMatchesLoadedData && (
                        <p className="muted" style={{ color: "#e49a75" }}>
                          The elevation and geology above were loaded for{" "}
                          {coordinates.latitude}°, {coordinates.longitude}°, not
                          this mission's target. Select EXPLORE TARGET to load
                          the mission's own data, then come back here to export.
                        </p>
                      )}

                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          flexWrap: "wrap",
                          marginTop: "12px",
                        }}
                      >
                        <button
                          onClick={() => exploreMissionTarget(briefMission)}
                          style={missionButtonStyle}
                        >
                          EXPLORE TARGET
                        </button>
                        <button
                          onClick={exportBriefHtml}
                          style={{
                            ...missionButtonStyle,
                            background: "#a85e36",
                          }}
                        >
                          EXPORT PRINTABLE BRIEF
                        </button>
                        <button
                          onClick={exportBriefJson}
                          style={missionButtonStyle}
                        >
                          EXPORT BRIEF (JSON)
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {briefError && (
                <p style={{ ...missionErrorStyle, fontSize: "12px" }}>
                  {briefError}
                </p>
              )}

              <div className="separator"></div>
              <p className="region-name">SURFACE VIEWS AND MORE DATA</p>
              <p className="muted">
                See what the target looks like from the ground and explore more
                layers (opens NASA pages in a new tab):
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                {[
                  ["NASA Mars Trek", "https://trek.nasa.gov/mars/"],
                  [
                    "Perseverance raw images",
                    "https://mars.nasa.gov/mars2020/multimedia/raw-images/",
                  ],
                  [
                    "Curiosity raw images",
                    "https://mars.nasa.gov/msl/multimedia/raw-images/",
                  ],
                ].map(([label, url]) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      ...missionButtonStyle,
                      textDecoration: "none",
                      display: "inline-block",
                    }}
                  >
                    {label.toUpperCase()}
                  </a>
                ))}
              </div>
            </section>
          )}

          <footer>
            BEYOND EARTH · MARTIAN MAP
            <span>SCIENTIFIC VISUALIZATION PLATFORM</span>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default App;
