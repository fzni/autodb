import { UnitSystem } from './types';

export function convertPower(hp: number, kw: number, system: UnitSystem): { value: number; unit: string; label: string } {
  if (system === 'metric') {
    // In SI/Metric, show kW as primary or HP (with kW)
    // The prompt specifically asks: live-converts HP ↔ kW
    return {
      value: kw || Math.round(hp * 0.7457),
      unit: 'kW',
      label: `${kw || Math.round(hp * 0.7457)} kW`,
    };
  }
  // Imperial: HP
  return {
    value: hp,
    unit: 'HP',
    label: `${hp} HP`,
  };
}

export function formatPowerString(hp: number, kw: number, system: UnitSystem): string {
  if (system === 'metric') {
    const val = kw || Math.round(hp * 0.7457);
    return `${val} kW (${hp} HP)`;
  }
  return `${hp} HP`;
}

export function convertTorque(nm: number, system: UnitSystem): { value: number; unit: string; label: string } {
  if (system === 'metric') {
    return {
      value: nm,
      unit: 'Nm',
      label: `${nm} Nm`,
    };
  }
  // 1 Nm = 0.737562 lb-ft
  const lbFt = Math.round(nm * 0.737562);
  return {
    value: lbFt,
    unit: 'lb-ft',
    label: `${lbFt} lb-ft`,
  };
}

export function convertWeight(kg: number, system: UnitSystem): { value: number; unit: string; label: string } {
  if (system === 'metric') {
    if (kg >= 10000) {
      return { value: Number((kg / 1000).toFixed(1)), unit: 't', label: `${(kg / 1000).toFixed(0)}t` };
    }
    return { value: kg, unit: 'kg', label: `${kg.toLocaleString()} kg` };
  }
  // 1 kg = 2.20462 lbs
  const lbs = Math.round(kg * 2.20462);
  return {
    value: lbs,
    unit: 'lbs',
    label: `${lbs.toLocaleString()} lbs`,
  };
}

export function convertSpeed(kmh: number, system: UnitSystem): { value: number; unit: string; label: string } {
  if (system === 'metric') {
    return {
      value: kmh,
      unit: 'km/h',
      label: `${kmh} km/h`,
    };
  }
  // 1 km/h = 0.621371 mph
  const mph = Math.round(kmh * 0.621371);
  return {
    value: mph,
    unit: 'mph',
    label: `${mph} mph`,
  };
}

export function convertLength(mm: number, system: UnitSystem): { value: number; unit: string; label: string } {
  if (system === 'metric') {
    return {
      value: mm,
      unit: 'mm',
      label: `${mm} mm`,
    };
  }
  // 1 mm = 0.0393701 in
  const inches = Number((mm * 0.0393701).toFixed(1));
  return {
    value: inches,
    unit: 'in',
    label: `${inches} in`,
  };
}

export function convertDisplacement(litres: number, system: UnitSystem): { value: number; unit: string; label: string } {
  if (system === 'metric') {
    return {
      value: litres,
      unit: 'L',
      label: `${litres.toFixed(1)} L`,
    };
  }
  // 1 L = 61.0237 cu in
  const cuIn = Math.round(litres * 61.0237);
  return {
    value: cuIn,
    unit: 'ci',
    label: `${cuIn} cu in`,
  };
}
