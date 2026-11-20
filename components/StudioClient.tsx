'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from './AuthContext';
import { Domain, Vehicle } from '@/lib/types';
import {
  Upload,
  Save,
  ArrowLeft,
  AlertTriangle,
  Zap,
  Weight,
  Car,
  Image as ImageIcon,
  Lock,
  Crown,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

const DOMAINS: Domain[] = ['Road', 'Commercial', 'Motorsport', 'Concept'];
const DRIVETRAINS = ['RWD', 'AWD', 'FWD', '4WD', '6x4', '6x6'];

export default function StudioClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get('edit');

  const { user, isAdmin, loading: authLoading, loginWithSecretKey } = useAuth();

  // Admin secret key form for gated screen
  const [secretKeyInput, setSecretKeyInput] = useState('');
  const [keyVerifying, setKeyVerifying] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);

  // Form State
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [generation, setGeneration] = useState('');
  const [year, setYear] = useState<number>(2024);
  const [domain, setDomain] = useState<Domain>('Road');
  const [subCategory, setSubCategory] = useState('');
  const [summary, setSummary] = useState('');

  // Image State
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const [heroImage, setHeroImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Powertrain State
  const [engineType, setEngineType] = useState('4.0L Naturally Aspirated Boxer-6');
  const [displacementL, setDisplacementL] = useState<string>('4.0');
  const [layout, setLayout] = useState('Rear-Engine Longitudinal');
  const [aspiration, setAspiration] = useState('Naturally Aspirated');
  const [hp, setHp] = useState<number>(502);
  const [kw, setKw] = useState<number>(375);
  const [torqueNm, setTorqueNm] = useState<number>(470);
  const [transmission, setTransmission] = useState('7-Speed Dual-Clutch PDK');
  const [drivetrain, setDrivetrain] = useState('RWD');
  const [fuelType, setFuelType] = useState('Petrol 98 RON');
  const [redlineRpm, setRedlineRpm] = useState<string>('9000');
  const [batteryKwh, setBatteryKwh] = useState<string>('');
  const [motors, setMotors] = useState<string>('');

  // Chassis State
  const [curbWeightKg, setCurbWeightKg] = useState<number>(1435);
  const [lengthMm, setLengthMm] = useState<string>('4573');
  const [widthMm, setWidthMm] = useState<string>('1852');
  const [heightMm, setHeightMm] = useState<string>('1279');
  const [wheelbaseMm, setWheelbaseMm] = useState<string>('2457');
  const [chassisType, setChassisType] = useState('Aluminium-Steel Hybrid Monocoque');
  const [suspensionFront, setSuspensionFront] = useState('Double-Wishbone with integrated helper springs');
  const [suspensionRear, setSuspensionRear] = useState('Multi-Link with active rear-axle steering');
  const [brakesFront, setBrakesFront] = useState('408mm cast iron / 6-piston monobloc');
  const [brakesRear, setBrakesRear] = useState('380mm 4-piston calipers');
  const [wheelsTires, setWheelsTires] = useState('Front: 255/35 ZR20 | Rear: 315/30 ZR21');

  // Domain-Specific State
  const [zeroToHundred, setZeroToHundred] = useState<string>('3.4');
  const [topSpeed, setTopSpeed] = useState<string>('318');
  const [dragCd, setDragCd] = useState<string>('0.34');
  const [designLead, setDesignLead] = useState<string>('Andreas Preuninger');
  const [status, setStatus] = useState<string>('Production');
  const [signatureFeature, setSignatureFeature] = useState<string>('Swan-neck suspended rear wing & 9,000 RPM valvetrain');

  // Commercial Specific
  const [payloadKg, setPayloadKg] = useState<string>('');
  const [gvwKg, setGvwKg] = useState<string>('');
  const [towingKg, setTowingKg] = useState<string>('');
  const [axleConfig, setAxleConfig] = useState<string>('4x2');
  const [cargoVolM3, setCargoVolM3] = useState<string>('');
  const [dutyCycle, setDutyCycle] = useState<string>('');

  // Motorsport Specific
  const [downforceKg, setDownforceKg] = useState<string>('');
  const [ballastKg, setBallastKg] = useState<string>('');
  const [telemetryClass, setTelemetryClass] = useState<string>('');
  const [fuelCapacityL, setFuelCapacityL] = useState<string>('');
  const [regulationCategory, setRegulationCategory] = useState<string>('');
  const [ersPowerKw, setErsPowerKw] = useState<string>('');

  // Form submission feedback
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loadingEditData, setLoadingEditData] = useState(false);

  // Dynamic HP/Ton calculation
  const liveHpPerTon = useMemo(() => {
    if (!curbWeightKg || curbWeightKg <= 0 || !hp || hp <= 0) return '—';
    return (hp / (curbWeightKg / 1000)).toFixed(1);
  }, [hp, curbWeightKg]);

  // Load existing data if editing
  useEffect(() => {
    if (!editSlug) return;
    setLoadingEditData(true);
    fetch(`/api/vehicles/${editSlug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.vehicle) {
          const v: Vehicle = data.vehicle;
          setMake(v.make);
          setModel(v.model);
          setGeneration(v.generation);
          setYear(v.year);
          setDomain(v.domain);
          setSubCategory(v.sub_category);
          setHeroImage(v.hero_image);
          setSummary(v.summary);

          if (v.powertrain) {
            setEngineType(v.powertrain.engine_type || '');
            setDisplacementL(v.powertrain.displacement_l?.toString() || '');
            setLayout(v.powertrain.layout || '');
            setAspiration(v.powertrain.aspiration || '');
            setHp(v.powertrain.hp || 0);
            setKw(v.powertrain.kw || 0);
            setTorqueNm(v.powertrain.torque_nm || 0);
            setTransmission(v.powertrain.transmission || '');
            setDrivetrain(v.powertrain.drivetrain || 'RWD');
            setFuelType(v.powertrain.fuel_type || '');
            setRedlineRpm(v.powertrain.redline_rpm?.toString() || '');
            setBatteryKwh(v.powertrain.battery_kwh?.toString() || '');
            setMotors(v.powertrain.motors?.toString() || '');
          }

          if (v.chassis) {
            setCurbWeightKg(v.chassis.curb_weight_kg || 0);
            setLengthMm(v.chassis.length_mm?.toString() || '');
            setWidthMm(v.chassis.width_mm?.toString() || '');
            setHeightMm(v.chassis.height_mm?.toString() || '');
            setWheelbaseMm(v.chassis.wheelbase_mm?.toString() || '');
            setChassisType(v.chassis.chassis_type || '');
            setSuspensionFront(v.chassis.suspension_front || '');
            setSuspensionRear(v.chassis.suspension_rear || '');
            setBrakesFront(v.chassis.brakes_front || '');
            setBrakesRear(v.chassis.brakes_rear || '');
            setWheelsTires(v.chassis.wheels_tires || '');
          }

          if (v.domain_specific) {
            setZeroToHundred(v.domain_specific.zero_to_hundred_sec?.toString() || '');
            setTopSpeed(v.domain_specific.top_speed_kmh?.toString() || '');
            setDragCd(v.domain_specific.drag_coefficient?.toString() || '');
            setDesignLead(v.domain_specific.design_lead || '');
            setStatus(v.domain_specific.status || '');
            setSignatureFeature(v.domain_specific.signature_feature || '');
            setPayloadKg(v.domain_specific.payload_capacity_kg?.toString() || '');
            setGvwKg(v.domain_specific.gvw_kg?.toString() || '');
            setTowingKg(v.domain_specific.towing_capacity_kg?.toString() || '');
            setAxleConfig(v.domain_specific.axle_configuration || '4x2');
            setCargoVolM3(v.domain_specific.cargo_volume_m3?.toString() || '');
            setDutyCycle(v.domain_specific.operational_duty_cycle || '');
            setDownforceKg(v.domain_specific.aero_downforce_kg?.toString() || '');
            setBallastKg(v.domain_specific.ballast_kg?.toString() || '');
            setTelemetryClass(v.domain_specific.telemetry_class || '');
            setFuelCapacityL(v.domain_specific.fuel_capacity_l?.toString() || '');
            setRegulationCategory(v.domain_specific.regulation_category || '');
            setErsPowerKw(v.domain_specific.ers_hybrid_power_kw?.toString() || '');
          }
        }
      })
      .catch((err) => {
        setFormError('Failed to load existing vehicle telemetry data');
      })
      .finally(() => {
        setLoadingEditData(false);
      });
  }, [editSlug]);

  const handleSecretKeyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretKeyInput.trim()) {
      setKeyError('Please enter the administrator secret key.');
      return;
    }

    setKeyVerifying(true);
    setKeyError(null);

    const res = await loginWithSecretKey(secretKeyInput.trim());
    setKeyVerifying(false);

    if (!res.ok) {
      setKeyError(res.error || 'Invalid secret key. Access denied.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setFormError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to upload photo');
      } else {
        setHeroImage(data.url);
      }
    } catch (err: any) {
      setFormError(err.message || 'Error uploading image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isAdmin) {
      setFormError('Forbidden: Only verified administrators can publish or modify vehicles.');
      return;
    }

    if (!make.trim() || !model.trim() || !year || !heroImage.trim()) {
      setFormError('Make, Model, Year, and Hero Image are required.');
      return;
    }

    setSubmitting(true);

    const payload = {
      make: make.trim(),
      model: model.trim(),
      generation: generation.trim() || 'Series 1',
      year: Number(year),
      domain,
      sub_category: subCategory.trim() || `${domain} Vehicle`,
      hero_image: heroImage.trim(),
      summary: summary.trim() || `${year} ${make} ${model} specification dossier.`,
      powertrain: {
        engine_type: engineType.trim(),
        displacement_l: displacementL ? parseFloat(displacementL) : undefined,
        layout: layout.trim(),
        aspiration: aspiration.trim(),
        hp: Number(hp) || 0,
        kw: Number(kw) || 0,
        torque_nm: Number(torqueNm) || 0,
        transmission: transmission.trim(),
        drivetrain,
        fuel_type: fuelType.trim(),
        redline_rpm: redlineRpm ? parseInt(redlineRpm) : undefined,
        battery_kwh: batteryKwh ? parseFloat(batteryKwh) : undefined,
        motors: motors ? parseInt(motors) : undefined,
      },
      chassis: {
        curb_weight_kg: Number(curbWeightKg) || 1500,
        length_mm: lengthMm ? parseInt(lengthMm) : undefined,
        width_mm: widthMm ? parseInt(widthMm) : undefined,
        height_mm: heightMm ? parseInt(heightMm) : undefined,
        wheelbase_mm: wheelbaseMm ? parseInt(wheelbaseMm) : undefined,
        chassis_type: chassisType.trim(),
        suspension_front: suspensionFront.trim() || undefined,
        suspension_rear: suspensionRear.trim() || undefined,
        brakes_front: brakesFront.trim() || undefined,
        brakes_rear: brakesRear.trim() || undefined,
        wheels_tires: wheelsTires.trim() || undefined,
      },
      domain_specific: {
        zero_to_hundred_sec: zeroToHundred ? parseFloat(zeroToHundred) : undefined,
        top_speed_kmh: topSpeed ? parseInt(topSpeed) : undefined,
        drag_coefficient: dragCd ? parseFloat(dragCd) : undefined,
        design_lead: designLead.trim() || undefined,
        status: status.trim() || undefined,
        signature_feature: signatureFeature.trim() || undefined,

        payload_capacity_kg: payloadKg ? parseInt(payloadKg) : undefined,
        gvw_kg: gvwKg ? parseInt(gvwKg) : undefined,
        towing_capacity_kg: towingKg ? parseInt(towingKg) : undefined,
        axle_configuration: axleConfig.trim() || undefined,
        cargo_volume_m3: cargoVolM3 ? parseFloat(cargoVolM3) : undefined,
        operational_duty_cycle: dutyCycle.trim() || undefined,

        aero_downforce_kg: downforceKg ? parseInt(downforceKg) : undefined,
        ballast_kg: ballastKg ? parseInt(ballastKg) : undefined,
        telemetry_class: telemetryClass.trim() || undefined,
        fuel_capacity_l: fuelCapacityL ? parseInt(fuelCapacityL) : undefined,
        regulation_category: regulationCategory.trim() || undefined,
        ers_hybrid_power_kw: ersPowerKw ? parseInt(ersPowerKw) : undefined,
      },
    };

    try {
      const url = editSlug ? `/api/vehicles/${editSlug}` : '/api/vehicles';
      const method = editSlug ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to save vehicle');
      } else {
        router.push(`/vehicles/${data.vehicle?.slug || editSlug}`);
        router.refresh();
      }
    } catch (err: any) {
      setFormError(err.message || 'Error saving vehicle dossier');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loadingEditData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0A0E17]">
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-500">
          <div className="w-2.5 h-2.5 rounded-full bg-[#31bacc] animate-ping" />
          <span>Loading Studio...</span>
        </div>
      </div>
    );
  }

  // ADMIN GATE: If not admin, require the secret key
  if (!isAdmin) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 bg-[#F8FAFC] dark:bg-[#0A0E17]">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-[#101623] border border-slate-200/80 dark:border-[#1E293B] shadow-lg text-center space-y-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1E293B] flex items-center justify-center text-slate-800 dark:text-[#31bacc]">
            <Lock className="w-6 h-6 text-[#31bacc]" />
          </div>

          <div>
            <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold mb-2">
              <Crown className="w-3.5 h-3.5" />
              <span>ADMIN CLEARANCE ONLY</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Vehicle Studio Access
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2 font-sans">
              Only verified administrators with the secret key have write clearance to author new vehicles or edit specifications.
            </p>
          </div>

          {/* Secret Key Input Form */}
          <form onSubmit={handleSecretKeyLogin} className="space-y-4 text-left">
            {keyError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs">
                {keyError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-500 uppercase font-semibold">
                Admin Secret Key
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={secretKeyInput}
                  onChange={(e) => setSecretKeyInput(e.target.value)}
                  placeholder="Enter secret key..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1E293B] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#31bacc] font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={keyVerifying}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-black hover:bg-slate-800 dark:hover:bg-[#151D2E] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-2 border border-slate-700 dark:border-[#31bacc]/30 disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5 text-[#31bacc]" />
              <span>{keyVerifying ? 'Verifying...' : 'Unlock Studio'}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 dark:border-[#1E293B]">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center space-x-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Fleet Explorer</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN IS AUTHORIZED: Render Full Studio Form
  return (
    <div className="min-h-screen pb-24 bg-[#F8FAFC] dark:bg-[#0A0E17]">
      {/* Top Banner */}
      <section className="bg-white dark:bg-[#06090F] border-b border-slate-200/80 dark:border-[#1E293B] py-6 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link
                href="/"
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-[#31bacc] mb-2 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Explorer</span>
              </Link>
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-slate-900 dark:bg-black text-[#31bacc] border border-slate-800 dark:border-[#31bacc]/40">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {editSlug ? `Edit Vehicle: ${make} ${model}` : 'Vehicle Studio Manager'}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Admin Clearance Active (@admin)
                  </p>
                </div>
              </div>
            </div>

            {/* Live Telemetry Preview Pill */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#101623] border border-slate-200 dark:border-[#1E293B] flex items-center space-x-4 shadow-xs">
              <div className="text-left font-mono">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Calculated HP/Ton</span>
                <span className="text-lg font-black text-[#177f8d] dark:text-[#31bacc]">
                  {liveHpPerTon} <span className="text-[10px] font-normal">HP/t</span>
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-[#1E293B]" />
              <div className="text-left font-mono">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Output / Curb</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {hp} HP · {curbWeightKg} kg
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Studio Form */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {formError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs flex items-center space-x-2 font-mono">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Machine Identity */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#101623] border border-slate-200/80 dark:border-[#1E293B] shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-[#1E293B]">
              <Car className="w-4 h-4 text-[#31bacc]" />
              <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-900 dark:text-white">
                1. Vehicle Identity & Domain
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Manufacturer / Make *
                </label>
                <input
                  type="text"
                  required
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  placeholder="e.g. Porsche, Scania, Red Bull"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1E293B] text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#31bacc]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Model Name *
                </label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. 911 GT3, R770, RB19"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1E293B] text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#31bacc]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Generation / Chassis Code
                </label>
                <input
                  type="text"
                  value={generation}
                  onChange={(e) => setGeneration(e.target.value)}
                  placeholder="e.g. 992.1, FL5, NTG"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1E293B] text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#31bacc]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Model Year *
                </label>
                <input
                  type="number"
                  required
                  min={1900}
                  max={2035}
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value) || 2024)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1E293B] text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#31bacc] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Domain *
                </label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value as Domain)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1E293B] text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#31bacc] font-bold"
                >
                  {DOMAINS.map((d) => (
                    <option key={d} value={d}>
                      {d} Domain
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Sub-Category
                </label>
                <input
                  type="text"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  placeholder="e.g. Track-Focused Sports Car"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1E293B] text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#31bacc]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-1">
                Summary & Technical Highlights
              </label>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Breakthroughs in powertrain acoustics, chassis dynamics, or heritage..."
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1E293B] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#31bacc] leading-relaxed font-sans"
              />
            </div>
          </div>

          {/* Section 2: Imagery */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#101623] border border-slate-200/80 dark:border-[#1E293B] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E293B]">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-[#31bacc]" />
                <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-900 dark:text-white">
                  2. Hero Photo
                </h2>
              </div>

              <div className="flex items-center bg-slate-100 dark:bg-[#0A0E17] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono ${
                    imageMode === 'url' ? 'bg-white dark:bg-[#151D2E] text-slate-900 dark:text-white font-bold shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Direct URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono ${
                    imageMode === 'upload' ? 'bg-white dark:bg-[#151D2E] text-slate-900 dark:text-white font-bold shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Upload File
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 space-y-3">
                {imageMode === 'url' ? (
                  <div>
                    <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-1">
                      Image URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={heroImage}
                      onChange={(e) => setHeroImage(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1E293B] text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#31bacc]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-1">
                      Upload from Computer
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-[#31bacc] text-xs font-mono text-slate-700 dark:text-slate-300 flex items-center space-x-2"
                    >
                      <Upload className="w-4 h-4 text-[#31bacc]" />
                      <span>{uploadingImage ? 'Uploading image...' : 'Choose image file'}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="md:col-span-4">
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1E293B] flex items-center justify-center">
                  {heroImage ? (
                    <img src={heroImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-slate-400 font-mono">No Image Preview</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Powertrain */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#101623] border border-slate-200/80 dark:border-[#1E293B] shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-[#1E293B]">
              <Zap className="w-4 h-4 text-[#31bacc]" />
              <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-900 dark:text-white">
                3. Powertrain & Output
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Engine / Motor Type *
                </label>
                <input
                  type="text"
                  required
                  value={engineType}
                  onChange={(e) => setEngineType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1E293B] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#31bacc]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Output Horsepower (HP) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={hp}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setHp(val);
                    setKw(Math.round(val * 0.7457));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1E293B] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#31bacc] font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Output Kilowatts (kW)
                </label>
                <input
                  type="number"
                  min={1}
                  value={kw}
                  onChange={(e) => setKw(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1E293B] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#31bacc] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Torque (Nm) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={torqueNm}
                  onChange={(e) => setTorqueNm(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1E293B] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#31bacc] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Drivetrain *
                </label>
                <select
                  value={drivetrain}
                  onChange={(e) => setDrivetrain(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1E293B] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#31bacc] font-mono font-bold"
                >
                  {DRIVETRAINS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Transmission
                </label>
                <input
                  type="text"
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1E293B] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#31bacc]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Aspiration
                </label>
                <input
                  type="text"
                  value={aspiration}
                  onChange={(e) => setAspiration(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1E293B] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#31bacc]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Fuel / Energy Source
                </label>
                <input
                  type="text"
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1E293B] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#31bacc]"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Chassis */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#101623] border border-slate-200/80 dark:border-[#1E293B] shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-[#1E293B]">
              <Weight className="w-4 h-4 text-emerald-500" />
              <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-900 dark:text-white">
                4. Chassis & Weight Dynamics
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Curb Weight (kg) *
                </label>
                <input
                  type="number"
                  required
                  min={100}
                  value={curbWeightKg}
                  onChange={(e) => setCurbWeightKg(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1E293B] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#31bacc] font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Chassis Construction
                </label>
                <input
                  type="text"
                  value={chassisType}
                  onChange={(e) => setChassisType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1E293B] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#31bacc]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Wheelbase (mm)
                </label>
                <input
                  type="text"
                  value={wheelbaseMm}
                  onChange={(e) => setWheelbaseMm(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-[#1E293B] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#31bacc] font-mono"
                />
              </div>
            </div>
          </div>

          {/* Submission Bar */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-black hover:bg-slate-800 text-white text-xs font-bold transition-all border border-slate-700 dark:border-[#31bacc]/40 shadow-sm flex items-center space-x-2"
            >
              <Save className="w-4 h-4 text-[#31bacc]" />
              <span>{submitting ? 'Saving to Database...' : editSlug ? 'Update Vehicle' : 'Publish to Fleet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
