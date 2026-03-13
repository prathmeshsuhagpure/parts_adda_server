module.exports = [
  {
    name: "Engine Parts",
    children: [
      {
        name: "Filters",
        children: ["Oil Filter", "Air Filter", "Fuel Filter", "Cabin Filter"],
      },
      {
        name: "Engine Components",
        children: [
          "Spark Plug",
          "Glow Plug",
          "Piston",
          "Cylinder Head",
          "Camshaft",
        ],
      },
      {
        name: "Cooling",
        children: ["Radiator", "Water Pump", "Thermostat"],
      },
    ],
  },

  {
    name: "Brake System",
    children: [
      {
        name: "Brake Pads",
        children: ["Front Brake Pads", "Rear Brake Pads"],
      },
      {
        name: "Brake Discs",
        children: ["Front Brake Disc", "Rear Brake Disc"],
      },
      {
        name: "Brake Components",
        children: ["Brake Caliper", "Brake Shoes", "ABS Sensor"],
      },
    ],
  },

  {
    name: "Suspension",
    children: [
      {
        name: "Shock Absorbers",
        children: ["Front Shock Absorber", "Rear Shock Absorber"],
      },
      {
        name: "Suspension Components",
        children: ["Struts", "Control Arm", "Ball Joint"],
      },
    ],
  },

  {
    name: "Electrical",
    children: [
      {
        name: "Battery",
        children: ["Car Battery", "Battery Terminal"],
      },
      {
        name: "Lighting",
        children: ["Headlights", "Tail Lights", "Fog Lights"],
      },
      {
        name: "Sensors",
        children: ["Oxygen Sensor", "MAF Sensor", "MAP Sensor"],
      },
    ],
  },

  {
    name: "Body Parts",
    children: [
      {
        name: "Exterior",
        children: ["Front Bumper", "Rear Bumper", "Fender", "Bonnet", "Door"],
      },
      {
        name: "Glass",
        children: ["Windshield", "Rear Windshield", "Side Glass"],
      },
    ],
  },

  {
    name: "Interior",
    children: [
      {
        name: "Seats",
        children: ["Seat Covers", "Seat Cushion"],
      },
      {
        name: "Dashboard",
        children: ["Instrument Cluster", "AC Vents"],
      },
      {
        name: "Infotainment",
        children: ["Car Stereo", "Speakers", "Reverse Camera"],
      },
    ],
  },

  {
    name: "Wheels & Tyres",
    children: [
      {
        name: "Tyres",
        children: ["All Season Tyres", "Performance Tyres"],
      },
      {
        name: "Wheels",
        children: ["Alloy Wheels", "Steel Wheels"],
      },
    ],
  },
];
