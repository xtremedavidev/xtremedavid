// Shared copy + asset lists for both REPS concepts. Facts are from reps.energy and the HCS launch material.
export const A = "/concepts/reps/";

export const NAV: [string, string][] = [
  ["Technology", "#technology"], ["Impact", "#impact"], ["Locations", "#locations"], ["Company", "#team"], ["News", "#press"],
];

export const CLIENTS: [string, string, number][] = [
  ["Hamburg Container Service", "logo-hcs.png", 38], ["Hamburg Port Authority", "logo-hpa.png", 38], ["Hansa Flex", "logo-hansa.png", 22],
  ["Dollinger", "logo-dollinger.png", 30], ["Econova", "logo-econova.png", 30], ["MR", "logo-mr.png", 34], ["TIWAG", "logo-tiwag.png", 34],
];

export const BACKERS: [string, string][] = [
  ["Climate-KIC", "logo-climatekic.png"], ["EWOR", "logo-ewor.png"], ["NTT", "logo-ntt.png"], ["Forbes", "logo-forbes.png"],
  ["WKO", "logo-wko.png"], ["ARGE", "logo-arge.png"], ["ioeb", "logo-ioeb.png"], ["Charta der Vielfalt", "logo-charta.png"],
];

export const PRESS_WALL: [string, string][] = [
  ["Associated Press", "press-ap.png"], ["Yahoo Finance", "press-yahoo.png"], ["Business Insider", "press-bi.svg"], ["Forbes", "logo-forbes.png"],
  ["Tech.eu", "press-techeu.svg"], ["brutkasten", "press-brutkasten.png"], ["Trending Topics", "press-tt.png"],
];

export const ARTICLES = [
  { src: "AP News", date: "22 May 2026", img: "plate-173.webp", title: "REPS: a patented road power plant that harvests energy from passing trucks and cars.", body: "Installs directly into existing road infrastructure without disrupting traffic flow or logistics operations." },
  { src: "Yahoo Finance", date: "22 May 2026", img: "plate-64.webp", title: "REPS announces a $23.6M equity round to scale its Road Energy Production System.", body: "A patented “road power plant” that converts vehicle traffic into electrical energy." },
];

export const STEPS = [
  { k: "Impulse capture", t: "27 trigger pairs feel every axle.", b: "As a vehicle brakes across the 12 × 3 m REPS plate, hydraulic cylinders under each trigger turn its momentum into vertical force. The heavier the axle, the more it gives back.", spec: [["Plate", "12 m × 3 m"], ["Road slabs", "9 × 3 pairs"], ["Output", "scales with axle load"]] },
  { k: "Hydraulic transmission", t: "Force travels. Fragile parts don’t.", b: "Each impulse moves through sealed, closed-loop lines to a central Energy Converter Module beside the road — so the sensitive hardware never sits under traffic.", spec: [["Lines", "closed loop, sealed"], ["Maintenance", "off the carriageway"]] },
  { k: "Frictionless conversion", t: "A shaft that floats on magnets.", b: "Permanent magnetic bearings levitate the generator shaft. No contact, no wear — and more than 90% of the captured energy converted to electricity.", spec: [["Efficiency", "90%+"], ["vs dynamo", "254×"], ["vs piezo", "13,000×"]] },
  { k: "Energy storage", t: "Traffic is spiky. Power shouldn’t be.", b: "On-site battery banks buffer rush hours and quiet nights, then condition the power for local use or grid feed-in.", spec: [["Buffer", "on-site battery bank"], ["Weather", "independent · day & night"]] },
  { k: "On-demand usage", t: "Light the gate. Charge the fleet.", b: "Use it where it’s made — EV chargers, terminal lighting, machinery, facilities — or sell it to the grid. Either way it offsets cost or creates revenue.", spec: [["Land needed", "0 m²"], ["Lifetime", "20–25 years"]] },
] as const;

export const LOCATIONS = [
  {
    name: "Ports & terminals", short: "Ports / Terminals", img: "loc-ports.webp",
    head: "High-frequency heavy trucks and defined traffic flows make ports ideal for clean on-site power.",
    best: "Terminal gates, entry and exit lanes, ramps, weigh stations and internal port roads with recurring stop-and-go.",
    traffic: "High frequency of heavy trucks, repeated braking zones and predictable daily patterns.",
    use: "Lighting, terminal infrastructure, charging systems, battery storage or grid feed-in.",
    pins: [["Terminal gate · braking zone", 44, 30], ["Weigh station", 18, 52]] as [string, number, number][],
  },
  {
    name: "Highways", short: "Highways", img: "loc-highways.jpg",
    head: "Toll plazas, exit ramps and interchanges slow traffic all day — power right where roadside systems need it.",
    best: "Toll stations, exit ramps, service areas, weigh stations and highway interchanges.",
    traffic: "Continuous flow with recurring deceleration, high daily volumes and mixed vehicle types.",
    use: "Lighting, traffic systems, service stations, EV charging or grid supply.",
    pins: [["Toll plaza · deceleration", 52, 38], ["Exit ramp", 22, 56]] as [string, number, number][],
  },
  {
    name: "Logistics hubs", short: "Logistics Hubs", img: "loc-hubs.jpg",
    head: "Concentrated truck traffic and stop-and-go yards make logistics hubs ideal for clean electricity.",
    best: "Entrance lanes and gates, internal logistics roads, loading zones and truck staging areas.",
    traffic: "Frequent truck movements, repeated stop-and-go and concentrated traffic in operating hours.",
    use: "Warehouse operations, charging infrastructure, facility demand, storage or local grid supply.",
    pins: [["Gate lane · stop-and-go", 40, 34], ["Staging area", 64, 58]] as [string, number, number][],
  },
];

export const VALUES = [
  { w: "Innovation through action", em: "", p: "We didn’t stop at a lab prototype — the first plate is carrying real trucks at the Port of Hamburg." },
  { w: "Ownership with ", em: "purpose", p: "Every plate we ship is measured against one goal: cleaner traffic. At HCS that means ~10% less port-traffic CO₂." },
  { w: "Human, honest, driven", em: "", p: "Real numbers, real sites, real people. No renders pretending to be reality." },
  { w: "Team first, always", em: "", p: "Nine engineers and operators, one system. Join us — open roles below." },
];

export const PEOPLE = [
  { n: "Alfons Huber", r: "Founder & CEO", img: "face-1.webp" },
  { n: "Laura Wiedmann", r: "COO", img: "face-2.webp" },
  { n: "Sai Kumar Konduru", r: "CTO", img: "face-3.webp" },
];
export const FACES = ["face-1.webp", "face-2.webp", "face-3.webp", "face-4.webp", "face-5.webp", "face-6.webp"];

export const FAQ: [string, string][] = [
  ["What makes REPS different from other energy harvesting?", "More than 250× the efficiency of existing harvesting technologies and a 20–25 year lifetime. It doesn’t depend on weather or daylight, and fits into existing roads without new sealed surfaces."],
  ["Where can REPS be deployed?", "Anywhere heavy traffic slows down anyway: port and terminal gates, toll plazas, exit ramps, weigh stations, logistics yards, car parks and urban corridors."],
  ["Can the system be scaled?", "Yes. Every trigger unit is a self-contained module, so a site can start with one plate and add plates lane by lane — the full HCS rollout is 229 plates."],
  ["How big is one system?", "One REPS street plate is 12 m long and 3 m wide: 9 road slabs with 3 trigger pairs each, set into a 12.5 cm steel or concrete foundation."],
  ["How durable is it — heat, frost, salt?", "The plate is engineered for continuous heavy-freight loads and outdoor conditions, with the hydraulics sealed in a closed loop and the electronics kept off the road."],
  ["What maintenance is required?", "An annual inspection. Sensitive components sit in the converter module beside the road, so servicing happens without closing lanes."],
];

/** Scales the HCS projection (229 plates, ~1,000 trucks/day → ~10 GWh/yr) linearly. Illustrative only. */
export function potential(trucks: number, plates: number) {
  const kwh = (10_000_000 / (229 * 1000)) * trucks * plates;
  return { mwh: kwh / 1000, co2: (kwh * 0.38) / 1000, charges: kwh / 400, homes: kwh / 3500 };
}
