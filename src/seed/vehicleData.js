const brands = {
  Toyota: ["Corolla", "Camry", "Fortuner", "Hilux"],
  Honda: ["Civic", "City", "Amaze", "CRV"],
  Hyundai: ["i10", "i20", "Creta", "Verna"],
  Tata: ["Nexon", "Harrier", "Safari", "Altroz"],
  Mahindra: ["Thar", "Scorpio", "XUV300", "XUV700"],
  Ford: ["Figo", "EcoSport", "Endeavour", "Mustang"],
  BMW: ["3 Series", "5 Series", "7 Series", "X1"],
  Mercedes: ["A Class", "C Class", "E Class", "GLA"],
  Audi: ["A3", "A4", "A6", "Q3"],
  Volkswagen: ["Polo", "Vento", "Virtus", "Taigun"],
};

const fuelTypes = ["Petrol", "Diesel", "Hybrid", "Electric", "CNG"];

const engineOptions = {
  Petrol: [999, 1197, 1498, 1798, 1998],
  Diesel: [1248, 1497, 1995, 2198],
  Hybrid: [1798, 2494],
  Electric: [0],
  CNG: [1197, 1498],
};

const variants = ["Base", "S", "SX", "ZX", "Sport", "Premium"];

const startYear = 2015;
const endYear = 2025;

const vehicles = [];

for (const make in brands) {
  for (const model of brands[make]) {
    for (let year = startYear; year <= endYear; year++) {
      for (const fuel of fuelTypes) {
        const engines = engineOptions[fuel] || [];

        for (const engine of engines) {
          for (const variant of variants) {
            vehicles.push({
              make,
              model,
              year,
              fuelType: fuel,
              engineCC: engine,
              variant,
              variantCode: `${make.substring(0, 3).toUpperCase()}-${model.substring(0, 3).toUpperCase()}-${year}-${variant}`,
            });
          }
        }
      }
    }
  }
}

module.exports = vehicles;
