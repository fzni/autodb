'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from './AuthContext';
import { Domain, Vehicle, SpecRevision } from '@/lib/types';
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
  FileCode,
  Layers,
  Wind,
  Link2,
  ExternalLink,
  X,
  FileJson,
  GitPullRequest,
  Clock,
  User as UserIcon,
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

  // Extended Aerodynamics & Source Citation
  const [sourceUrl, setSourceUrl] = useState('');
  const [aeroDownforceKg, setAeroDownforceKg] = useState<string>('');
  const [aeroDownforceSpeedKmh, setAeroDownforceSpeedKmh] = useState<string>('200');
  const [aeroDragCd, setAeroDragCd] = useState<string>('');
  const [aeroFrontalAreaM2, setAeroFrontalAreaM2] = useState<string>('');

  // Fast-Entry Modals
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedJson, setPastedJson] = useState('');
  const [pasteError, setPasteError] = useState<string | null>(null);

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkJson, setBulkJson] = useState('');
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkSummary, setBulkSummary] = useState<{
    message?: string;
    imported?: number;
    skipped?: number;
    skippedSlugs?: string[];
    errors?: string[];
  } | null>(null);

  // Studio Mode: 'editor' | 'proposals'
  const [activeStudioTab, setActiveStudioTab] = useState<'editor' | 'proposals'>('editor');
  const [pendingProposals, setPendingProposals] = useState<SpecRevision[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [adminAdjustedValues, setAdminAdjustedValues] = useState<Record<string, string>>({});
  const [proposalFeedback, setProposalFeedback] = useState<{ id: string; type: 'success' | 'error'; message: string } | null>(null);
  const [processingProposalId, setProcessingProposalId] = useState<string | null>(null);

  const loadPendingProposals = async () => {
    try {
      setLoadingProposals(true);
      const res = await fetch('/api/revisions?status=pending');
      if (res.ok) {
        const data = await res.json();
        setPendingProposals(data.revisions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProposals(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadPendingProposals();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (searchParams.get('tab') === 'revisions') {
      setActiveStudioTab('proposals');
    }
  }, [searchParams]);

  const extractProposedValue = (changesJson: string): string => {
    try {
      const changes = JSON.parse(changesJson);
      if (changes.powertrain?.hp !== undefined) return String(changes.powertrain.hp);
      if (changes.chassis?.curb_weight_kg !== undefined) return String(changes.chassis.curb_weight_kg);
      if (changes.drag_coefficient !== undefined) return String(changes.drag_coefficient);
      if (changes.downforce_kg !== undefined) return String(changes.downforce_kg);
      if (changes.source_url !== undefined) return String(changes.source_url);
      if (changes.summary !== undefined) return String(changes.summary);
      const firstKey = Object.keys(changes)[0];
      if (firstKey) {
        const val = changes[firstKey];
        return typeof val === 'object' ? JSON.stringify(val) : String(val);
      }
    } catch {}
    return '';
  };

  const handleReviewProposal = async (id: string, action: 'approved' | 'rejected', proposal: SpecRevision) => {
    setProcessingProposalId(id);
    setProposalFeedback(null);

    let modifiedChanges: Record<string, any> | undefined = undefined;

    if (action === 'approved') {
      try {
        const originalChanges = JSON.parse(proposal.changes_json);
        const adjustedValue = adminAdjustedValues[id];
        if (adjustedValue !== undefined && adjustedValue.trim() !== '') {
          const targetChanges: Record<string, any> = { ...originalChanges };
          if (targetChanges.powertrain?.hp !== undefined) {
            targetChanges.powertrain = { ...targetChanges.powertrain, hp: parseFloat(adjustedValue) || targetChanges.powertrain.hp };
          } else if (targetChanges.chassis?.curb_weight_kg !== undefined) {
            targetChanges.chassis = { ...targetChanges.chassis, curb_weight_kg: parseFloat(adjustedValue) || targetChanges.chassis.curb_weight_kg };
          } else if (targetChanges.drag_coefficient !== undefined) {
            targetChanges.drag_coefficient = parseFloat(adjustedValue) || targetChanges.drag_coefficient;
          } else if (targetChanges.downforce_kg !== undefined) {
            targetChanges.downforce_kg = parseFloat(adjustedValue) || targetChanges.downforce_kg;
          } else if (targetChanges.source_url !== undefined) {
            targetChanges.source_url = adjustedValue.trim();
          } else if (targetChanges.summary !== undefined) {
            targetChanges.summary = adjustedValue.trim();
          } else {
            const firstKey = Object.keys(targetChanges)[0];
            if (firstKey) targetChanges[firstKey] = adjustedValue;
          }
          modifiedChanges = targetChanges;
        }
      } catch (err) {
        console.error('Error preparing modified changes:', err);
      }
    }

    try {
      const res = await fetch(`/api/revisions/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, modifiedChanges }),
      });

      const data = await res.json();
      if (res.ok) {
        setPendingProposals((prev) => prev.filter((p) => p.id !== id));
        setProposalFeedback({
          id,
          type: 'success',
          message:
            action === 'approved'
              ? `Proposal approved and applied! Contributor ${proposal.proposer_handle} credited on the vehicle dossier.`
              : 'Proposal rejected.',
        });
      } else {
        setProposalFeedback({
          id,
          type: 'error',
          message: data.error || 'Failed to review proposal',
        });
      }
    } catch (err: any) {
      setProposalFeedback({
        id,
        type: 'error',
        message: err.message || 'Error processing review',
      });
    } finally {
      setProcessingProposalId(null);
    }
  };

  // Form submission feedback
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loadingEditData, setLoadingEditData] = useState(false);

  // Dynamic HP/Ton calculation
  const liveHpPerTon = useMemo(() => {
    if (!curbWeightKg || curbWeightKg <= 0 || !hp || hp <= 0) return '—';
    return (hp / (curbWeightKg / 1000)).toFixed(1);
  }, [hp, curbWeightKg]);

  // Live Aero & L/D preview calculation
  const liveAeroTelemetry = useMemo(() => {
    const cd = parseFloat(aeroDragCd);
    const area = parseFloat(aeroFrontalAreaM2);
    const speed = parseFloat(aeroDownforceSpeedKmh) || 200;
    const dfKg = parseFloat(aeroDownforceKg);

    if (isNaN(cd) || isNaN(area) || cd <= 0 || area <= 0) return null;

    const vMs = speed / 3.6;
    const rho = 1.225; // kg/m^3 air density at sea level
    const dragForceN = 0.5 * rho * Math.pow(vMs, 2) * cd * area;
    const downforceN = !isNaN(dfKg) && dfKg > 0 ? dfKg * 9.80665 : 0;
    const liftToDragRatio = dragForceN > 0 && downforceN > 0 ? (downforceN / dragForceN).toFixed(2) : null;

    return {
      speedKmh: speed,
      dragForceN: Math.round(dragForceN),
      downforceN: Math.round(downforceN),
      liftToDragRatio,
    };
  }, [aeroDragCd, aeroFrontalAreaM2, aeroDownforceSpeedKmh, aeroDownforceKg]);

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

          if (v.source_url) setSourceUrl(v.source_url);
          if (v.downforce_kg !== undefined && v.downforce_kg !== null) setAeroDownforceKg(String(v.downforce_kg));
          if (v.downforce_speed_kmh !== undefined && v.downforce_speed_kmh !== null) setAeroDownforceSpeedKmh(String(v.downforce_speed_kmh));
          if (v.drag_coefficient !== undefined && v.drag_coefficient !== null) setAeroDragCd(String(v.drag_coefficient));
          if (v.frontal_area_m2 !== undefined && v.frontal_area_m2 !== null) setAeroFrontalAreaM2(String(v.frontal_area_m2));
        }
      })
      .catch((err) => {
        setFormError('Failed to load existing vehicle telemetry data');
      })
      .finally(() => {
        setLoadingEditData(false);
      });
  }, [editSlug]);

  const applyPastedJson = (raw: string) => {
    try {
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object') {
        throw new Error('Pasted content is not a valid JSON object.');
      }
      if (data.make) setMake(String(data.make));
      if (data.model) setModel(String(data.model));
      if (data.generation) setGeneration(String(data.generation));
      if (data.year) setYear(Number(data.year) || 2024);
      if (data.domain && DOMAINS.includes(data.domain)) setDomain(data.domain);
      if (data.sub_category) setSubCategory(String(data.sub_category));
      if (data.hero_image) setHeroImage(String(data.hero_image));
      if (data.summary) setSummary(String(data.summary));

      if (data.source_url) setSourceUrl(String(data.source_url));
      if (data.downforce_kg !== undefined) setAeroDownforceKg(String(data.downforce_kg));
      if (data.downforce_speed_kmh !== undefined) setAeroDownforceSpeedKmh(String(data.downforce_speed_kmh));
      if (data.drag_coefficient !== undefined) setAeroDragCd(String(data.drag_coefficient));
      if (data.frontal_area_m2 !== undefined) setAeroFrontalAreaM2(String(data.frontal_area_m2));

      const pt = data.powertrain || {};
      if (pt.engine_type) setEngineType(String(pt.engine_type));
      if (pt.displacement_l !== undefined) setDisplacementL(String(pt.displacement_l));
      if (pt.layout) setLayout(String(pt.layout));
      if (pt.aspiration) setAspiration(String(pt.aspiration));
      if (pt.hp !== undefined) setHp(Number(pt.hp));
      if (pt.kw !== undefined) setKw(Number(pt.kw));
      if (pt.torque_nm !== undefined) setTorqueNm(Number(pt.torque_nm));
      if (pt.transmission) setTransmission(String(pt.transmission));
      if (pt.drivetrain) setDrivetrain(String(pt.drivetrain));
      if (pt.fuel_type) setFuelType(String(pt.fuel_type));
      if (pt.redline_rpm !== undefined) setRedlineRpm(String(pt.redline_rpm));
      if (pt.battery_kwh !== undefined) setBatteryKwh(String(pt.battery_kwh));
      if (pt.motors !== undefined) setMotors(String(pt.motors));

      const ch = data.chassis || {};
      if (ch.curb_weight_kg !== undefined) setCurbWeightKg(Number(ch.curb_weight_kg));
      if (ch.length_mm !== undefined) setLengthMm(String(ch.length_mm));
      if (ch.width_mm !== undefined) setWidthMm(String(ch.width_mm));
      if (ch.height_mm !== undefined) setHeightMm(String(ch.height_mm));
      if (ch.wheelbase_mm !== undefined) setWheelbaseMm(String(ch.wheelbase_mm));
      if (ch.chassis_type) setChassisType(String(ch.chassis_type));
      if (ch.suspension_front) setSuspensionFront(String(ch.suspension_front));
      if (ch.suspension_rear) setSuspensionRear(String(ch.suspension_rear));
      if (ch.brakes_front) setBrakesFront(String(ch.brakes_front));
      if (ch.brakes_rear) setBrakesRear(String(ch.brakes_rear));
      if (ch.wheels_tires) setWheelsTires(String(ch.wheels_tires));

      const ds = data.domain_specific || {};
      if (ds.zero_to_hundred_sec !== undefined) setZeroToHundred(String(ds.zero_to_hundred_sec));
      if (ds.top_speed_kmh !== undefined) setTopSpeed(String(ds.top_speed_kmh));
      if (ds.drag_coefficient !== undefined && !data.drag_coefficient) setAeroDragCd(String(ds.drag_coefficient));
      if (ds.design_lead) setDesignLead(String(ds.design_lead));
      if (ds.status) setStatus(String(ds.status));
      if (ds.signature_feature) setSignatureFeature(String(ds.signature_feature));
      if (ds.payload_capacity_kg !== undefined) setPayloadKg(String(ds.payload_capacity_kg));
      if (ds.gvw_kg !== undefined) setGvwKg(String(ds.gvw_kg));
      if (ds.towing_capacity_kg !== undefined) setTowingKg(String(ds.towing_capacity_kg));
      if (ds.axle_configuration) setAxleConfig(String(ds.axle_configuration));
      if (ds.cargo_volume_m3 !== undefined) setCargoVolM3(String(ds.cargo_volume_m3));
      if (ds.operational_duty_cycle) setDutyCycle(String(ds.operational_duty_cycle));
      if (ds.aero_downforce_kg !== undefined && !data.downforce_kg) setAeroDownforceKg(String(ds.aero_downforce_kg));
      if (ds.ballast_kg !== undefined) setBallastKg(String(ds.ballast_kg));
      if (ds.telemetry_class) setTelemetryClass(String(ds.telemetry_class));
      if (ds.fuel_capacity_l !== undefined) setFuelCapacityL(String(ds.fuel_capacity_l));
      if (ds.regulation_category) setRegulationCategory(String(ds.regulation_category));
      if (ds.ers_hybrid_power_kw !== undefined) setErsPowerKw(String(ds.ers_hybrid_power_kw));

      setShowPasteModal(false);
      setPastedJson('');
      setPasteError(null);
    } catch (err: any) {
      setPasteError(err.message || 'Failed to parse JSON. Please verify syntax.');
    }
  };

  const handleBulkImport = async () => {
    setBulkSummary(null);
    let parsed: any;
    try {
      parsed = JSON.parse(bulkJson);
    } catch (err) {
      setBulkSummary({ errors: ['Invalid JSON format. Please verify valid array syntax.'] });
      return;
    }

    const vehiclesArray = Array.isArray(parsed) ? parsed : parsed.vehicles;
    if (!Array.isArray(vehiclesArray) || vehiclesArray.length === 0) {
      setBulkSummary({ errors: ['JSON must be an array of vehicle objects (or have a "vehicles" array).'] });
      return;
    }

    setBulkSubmitting(true);
    try {
      const res = await fetch('/api/vehicles/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicles: vehiclesArray }),
      });
      const result = await res.json();
      if (!res.ok) {
        setBulkSummary({ errors: [result.error || 'Bulk import failed'] });
      } else {
        setBulkSummary(result);
      }
    } catch (err: any) {
      setBulkSummary({ errors: [err.message || 'Failed to connect to bulk import endpoint'] });
    } finally {
      setBulkSubmitting(false);
    }
  };

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
      source_url: sourceUrl.trim() || undefined,
      downforce_kg: aeroDownforceKg ? parseFloat(aeroDownforceKg) : undefined,
      downforce_speed_kmh: aeroDownforceSpeedKmh ? parseFloat(aeroDownforceSpeedKmh) : undefined,
      drag_coefficient: aeroDragCd ? parseFloat(aeroDragCd) : undefined,
      frontal_area_m2: aeroFrontalAreaM2 ? parseFloat(aeroFrontalAreaM2) : undefined,
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
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0B1220]">
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-500">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E11D48] animate-ping" />
          <span>Loading Studio...</span>
        </div>
      </div>
    );
  }

  // ADMIN GATE: If not admin, require the secret key
  if (!isAdmin) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 bg-[#F8FAFC] dark:bg-[#0B1220]">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] shadow-lg text-center space-y-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] flex items-center justify-center text-slate-800 dark:text-[#E11D48]">
            <Lock className="w-6 h-6 text-[#E11D48]" />
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
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E11D48] font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={keyVerifying}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-black hover:bg-slate-800 dark:hover:bg-[#141B2A] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-2 border border-slate-700 dark:border-[#E11D48]/30 disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5 text-[#E11D48]" />
              <span>{keyVerifying ? 'Verifying...' : 'Unlock Studio'}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 dark:border-[#1A2435]">
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
    <div className="min-h-screen pb-24 bg-[#F8FAFC] dark:bg-[#0B1220]">
      {/* Top Banner */}
      <section className="bg-white dark:bg-[#080D18] border-b border-slate-200/80 dark:border-[#1A2435] py-6 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link
                href="/"
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-[#E11D48] mb-2 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Explorer</span>
              </Link>
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-slate-900 dark:bg-black text-[#E11D48] border border-slate-800 dark:border-[#E11D48]/40">
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

            {/* Studio Tools & Live Telemetry Preview Pill */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setPasteError(null);
                  setShowPasteModal(true);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-white dark:bg-[#0F1623] hover:bg-slate-50 dark:hover:bg-[#141B2A] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#1A2435] shadow-xs flex items-center space-x-2 transition-all cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5 text-[#E11D48]" />
                <span>Paste Spec JSON</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBulkSummary(null);
                  setShowBulkModal(true);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-[#E11D48]/10 hover:bg-[#E11D48]/20 text-[#BE123C] dark:text-[#E11D48] border border-[#E11D48]/30 shadow-xs flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-[#E11D48]" />
                <span>Bulk JSON Import</span>
              </button>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0F1623] border border-slate-200 dark:border-[#1A2435] flex items-center space-x-4 shadow-xs">
                <div className="text-left font-mono">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Calculated HP/Ton</span>
                  <span className="text-lg font-black text-[#BE123C] dark:text-[#E11D48]">
                    {liveHpPerTon} <span className="text-[10px] font-normal">HP/t</span>
                  </span>
                </div>
                <div className="h-8 w-px bg-slate-200 dark:bg-[#1A2435]" />
                <div className="text-left font-mono">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Output / Curb</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {hp} HP · {curbWeightKg} kg
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Studio Navigation Tabs */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center space-x-2 border-b border-slate-200/80 dark:border-[#1A2435] pb-3 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveStudioTab('editor')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 font-bold cursor-pointer ${
              activeStudioTab === 'editor'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0F1623]'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Vehicle Editor</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveStudioTab('proposals');
              loadPendingProposals();
            }}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 font-bold cursor-pointer ${
              activeStudioTab === 'proposals'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0F1623]'
            }`}
          >
            <GitPullRequest className="w-4 h-4 text-amber-500" />
            <span>Proposed Spec Edits</span>
            {pendingProposals.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-black animate-pulse">
                {pendingProposals.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* VIEW 1: Proposed Spec Edits Review Panel */}
      {activeStudioTab === 'proposals' ? (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-[#1A2435]">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Pending Spec Proposals ({pendingProposals.length})
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Review proposed edits submitted by key-authenticated members. You can adjust the value before approving.
              </p>
            </div>

            <button
              type="button"
              onClick={loadPendingProposals}
              disabled={loadingProposals}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-[#1A2435] bg-white dark:bg-[#0F1623] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-mono font-semibold transition-colors shadow-xs cursor-pointer self-start sm:self-auto disabled:opacity-50"
            >
              {loadingProposals ? 'Refreshing...' : 'Refresh Queue'}
            </button>
          </div>

          {proposalFeedback && (
            <div
              className={`p-4 rounded-xl text-xs font-mono border ${
                proposalFeedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                  : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400'
              }`}
            >
              {proposalFeedback.message}
            </div>
          )}

          {loadingProposals ? (
            <div className="py-16 text-center text-xs font-mono text-slate-400">
              Loading pending proposals...
            </div>
          ) : pendingProposals.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] shadow-xs space-y-3">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase">
                All Proposals Reviewed
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto font-sans">
                No pending spec edit proposals at this time. When members submit corrections on vehicle pages, they will appear here with live notification alerts.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingProposals.map((proposal) => {
                const currentProposedVal =
                  adminAdjustedValues[proposal.id] !== undefined
                    ? adminAdjustedValues[proposal.id]
                    : extractProposedValue(proposal.changes_json);

                return (
                  <div
                    key={proposal.id}
                    className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] shadow-xs space-y-4"
                  >
                    {/* Proposal Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#1A2435]">
                      <div className="flex items-center space-x-3">
                        {proposal.vehicle_hero_image && (
                          <img
                            src={proposal.vehicle_hero_image}
                            alt={proposal.vehicle_name || proposal.vehicle_slug}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-[#1A2435] shrink-0"
                          />
                        )}
                        <div>
                          <Link
                            href={`/vehicles/${proposal.vehicle_slug}`}
                            target="_blank"
                            className="text-sm font-bold text-slate-900 dark:text-white hover:text-[#E11D48] transition-colors flex items-center space-x-1"
                          >
                            <span>{proposal.vehicle_name || proposal.vehicle_slug}</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </Link>
                          <div className="flex flex-wrap items-center gap-x-2 text-xs font-mono text-slate-500 mt-0.5">
                            <span>Proposed by</span>
                            <Link
                              href={`/u/${proposal.proposer_handle.replace('@', '')}`}
                              target="_blank"
                              className="text-[#BE123C] dark:text-[#E11D48] font-semibold hover:underline"
                            >
                              {proposal.proposer_handle}
                            </Link>
                            <span>·</span>
                            <span>{new Date(proposal.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 self-start sm:self-auto shrink-0">
                        Pending Review
                      </span>
                    </div>

                    {/* Change Summary & Contributor Rationale */}
                    <div className="space-y-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200/80 dark:border-[#1A2435] space-y-1">
                        <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">
                          Contributor Proposal & Citation
                        </span>
                        <p className="text-slate-800 dark:text-slate-200 font-sans leading-relaxed">
                          {proposal.change_summary}
                        </p>
                      </div>

                      {/* Admin Override Input Field: Admin can change / modify the proposed value */}
                      <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-[#080D18] border border-slate-200 dark:border-[#1A2435] space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <label className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 uppercase">
                            Admin Value Adjustment
                          </label>
                          <span className="text-[10px] text-slate-400 font-mono">
                            You can edit this value before approving if needed
                          </span>
                        </div>
                        <input
                          type="text"
                          value={currentProposedVal}
                          onChange={(e) =>
                            setAdminAdjustedValues({
                              ...adminAdjustedValues,
                              [proposal.id]: e.target.value,
                            })
                          }
                          placeholder="Adjust proposed value before applying..."
                          className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-[#0F1623] border border-slate-200 dark:border-[#1A2435] text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-2.5 pt-2">
                      <button
                        type="button"
                        disabled={processingProposalId === proposal.id}
                        onClick={() => handleReviewProposal(proposal.id, 'rejected', proposal)}
                        className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Reject
                      </button>

                      <button
                        type="button"
                        disabled={processingProposalId === proposal.id}
                        onClick={() => handleReviewProposal(proposal.id, 'approved', proposal)}
                        className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-[#E11D48] hover:bg-[#BE123C] text-black shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          {processingProposalId === proposal.id ? 'Applying...' : 'Approve & Credit Contributor'}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* VIEW 2: Main Vehicle Studio Editor Form */
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {formError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs flex items-center space-x-2 font-mono">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Machine Identity */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-[#1A2435]">
              <Car className="w-4 h-4 text-[#E11D48]" />
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E11D48] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Domain *
                </label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value as Domain)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E11D48] font-bold"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
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
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E11D48] leading-relaxed font-sans"
              />
            </div>
          </div>

          {/* Section 2: Imagery */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1A2435]">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-[#E11D48]" />
                <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-900 dark:text-white">
                  2. Hero Photo
                </h2>
              </div>

              <div className="flex items-center bg-slate-100 dark:bg-[#0B1220] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono ${
                    imageMode === 'url' ? 'bg-white dark:bg-[#141B2A] text-slate-900 dark:text-white font-bold shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Direct URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono ${
                    imageMode === 'upload' ? 'bg-white dark:bg-[#141B2A] text-slate-900 dark:text-white font-bold shadow-xs' : 'text-slate-500'
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
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
                      className="px-4 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-[#E11D48] text-xs font-mono text-slate-700 dark:text-slate-300 flex items-center space-x-2"
                    >
                      <Upload className="w-4 h-4 text-[#E11D48]" />
                      <span>{uploadingImage ? 'Uploading image...' : 'Choose image file'}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="md:col-span-4">
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] flex items-center justify-center">
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
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-[#1A2435]">
              <Zap className="w-4 h-4 text-[#E11D48]" />
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E11D48] font-mono font-bold"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E11D48] font-mono"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E11D48] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Drivetrain *
                </label>
                <select
                  value={drivetrain}
                  onChange={(e) => setDrivetrain(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E11D48] font-mono font-bold"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Chassis */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-[#1A2435]">
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E11D48] font-mono font-bold"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E11D48] font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Aerodynamics & Downforce Telemetry (Optional) */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1A2435]">
              <div className="flex items-center space-x-2">
                <Wind className="w-4 h-4 text-[#E11D48]" />
                <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-900 dark:text-white">
                  5. Aerodynamics & Telemetry (Optional)
                </h2>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Wind-Tunnel & CFD Metrics</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Peak Downforce (kg)
                </label>
                <input
                  type="number"
                  step="any"
                  value={aeroDownforceKg}
                  onChange={(e) => setAeroDownforceKg(e.target.value)}
                  placeholder="e.g. 409, 860"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E11D48] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Ref Speed (km/h)
                </label>
                <input
                  type="number"
                  step="any"
                  value={aeroDownforceSpeedKmh}
                  onChange={(e) => setAeroDownforceSpeedKmh(e.target.value)}
                  placeholder="e.g. 200, 285"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E11D48] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Drag Coefficient (Cd)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={aeroDragCd}
                  onChange={(e) => setAeroDragCd(e.target.value)}
                  placeholder="e.g. 0.34, 0.23"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E11D48] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Frontal Area (m²)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={aeroFrontalAreaM2}
                  onChange={(e) => setAeroFrontalAreaM2(e.target.value)}
                  placeholder="e.g. 2.12, 1.95"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E11D48] font-mono"
                />
              </div>
            </div>

            {/* Live Aero Telemetry Preview if calculated */}
            {liveAeroTelemetry && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#080D18] border border-slate-200/80 dark:border-[#1A2435] flex flex-wrap items-center gap-6 text-xs font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Drag Force @ {liveAeroTelemetry.speedKmh} km/h</span>
                  <span className="font-bold text-slate-900 dark:text-white">{liveAeroTelemetry.dragForceN} N</span>
                </div>
                {liveAeroTelemetry.downforceN > 0 && (
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">Downforce</span>
                    <span className="font-bold text-slate-900 dark:text-white">{liveAeroTelemetry.downforceN} N</span>
                  </div>
                )}
                {liveAeroTelemetry.liftToDragRatio && (
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">Lift-to-Drag Ratio (L/D)</span>
                    <span className="font-black text-[#BE123C] dark:text-[#E11D48]">
                      {liveAeroTelemetry.liftToDragRatio}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 6: Verified Data Source Citation (Optional) */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0F1623] border border-slate-200/80 dark:border-[#1A2435] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1A2435]">
              <div className="flex items-center space-x-2">
                <Link2 className="w-4 h-4 text-[#E11D48]" />
                <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-900 dark:text-white">
                  6. Verified Data Source Citation (Optional)
                </h2>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">Citation Badge</span>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-1">
                Primary Source URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://press.porsche.com/... or official manufacturer homologation sheet"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E11D48] font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 font-sans">
                Providing an official OEM or FIA telemetry URL adds a <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">Verified Source</span> badge to this vehicle's public dossier.
              </p>
            </div>
          </div>

          {/* Submission Bar */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1A2435] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-black hover:bg-slate-800 text-white text-xs font-bold transition-all border border-slate-700 dark:border-[#E11D48]/40 shadow-sm flex items-center space-x-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#E11D48]" />
              <span>{submitting ? 'Saving to Database...' : editSlug ? 'Update Vehicle' : 'Publish to Fleet'}</span>
            </button>
          </div>
        </form>
      </div>
      )}

      {/* MODAL 1: Paste Spec JSON Drawer/Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0F1623] border border-slate-200 dark:border-[#1A2435] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-[#1A2435] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-[#E11D48]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  Paste Vehicle Spec JSON
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-sans">
                  Paste a full or partial vehicle telemetry JSON object to auto-populate form fields.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const sample = {
                      make: "Porsche",
                      model: "911 GT3 RS",
                      generation: "992.1",
                      year: 2023,
                      domain: "Road",
                      sub_category: "Track-Focused Supercar",
                      hero_image: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1600&q=80",
                      summary: "4.0L flat-six with DRS active aerodynamics producing 860 kg downforce.",
                      source_url: "https://press.porsche.com",
                      downforce_kg: 860,
                      downforce_speed_kmh: 285,
                      drag_coefficient: 0.39,
                      frontal_area_m2: 2.12,
                      powertrain: {
                        engine_type: "4.0L Naturally Aspirated Boxer-6",
                        displacement_l: 4.0,
                        layout: "Rear-Engine Longitudinal",
                        aspiration: "Naturally Aspirated",
                        hp: 518,
                        kw: 386,
                        torque_nm: 465,
                        transmission: "7-Speed Dual-Clutch PDK",
                        drivetrain: "RWD",
                        fuel_type: "Petrol 98 RON",
                        redline_rpm: 9000
                      },
                      chassis: {
                        curb_weight_kg: 1450,
                        length_mm: 4572,
                        width_mm: 1900,
                        height_mm: 1322,
                        wheelbase_mm: 2457,
                        chassis_type: "Aluminium-Steel Hybrid Monocoque"
                      },
                      domain_specific: {
                        zero_to_hundred_sec: 3.2,
                        top_speed_kmh: 296,
                        signature_feature: "Central radiator layout with DRS active aero"
                      }
                    };
                    setPastedJson(JSON.stringify(sample, null, 2));
                    setPasteError(null);
                  }}
                  className="text-xs font-mono text-[#BE123C] dark:text-[#E11D48] hover:underline flex items-center space-x-1"
                >
                  <FileJson className="w-3.5 h-3.5" />
                  <span>Load Sample JSON</span>
                </button>
              </div>

              {pasteError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs font-mono">
                  {pasteError}
                </div>
              )}

              <textarea
                rows={14}
                value={pastedJson}
                onChange={(e) => setPastedJson(e.target.value)}
                placeholder='{\n  "make": "McLaren",\n  "model": "Senna",\n  "year": 2019,\n  "domain": "Road",\n  "powertrain": { "hp": 789, ... }\n}'
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
              />
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-[#1A2435] flex items-center justify-end space-x-3 bg-slate-50/50 dark:bg-[#0B1220]/50">
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1A2435]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => applyPastedJson(pastedJson)}
                disabled={!pastedJson.trim()}
                className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-black hover:bg-slate-800 text-white text-xs font-bold transition-all border border-slate-700 dark:border-[#E11D48]/40 shadow-xs flex items-center space-x-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#E11D48]" />
                <span>Apply Spec to Form</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Bulk JSON Import Drawer/Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0F1623] border border-slate-200 dark:border-[#1A2435] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-[#1A2435] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#E11D48]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  Bulk Vehicle JSON Import
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-sans">
                  Accepts a JSON array of vehicles. Existing slugs are safely skipped non-destructively.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const sample = [
                      {
                        make: "Ferrari",
                        model: "F40",
                        generation: "Type F120",
                        year: 1987,
                        domain: "Road",
                        sub_category: "Analogue Supercar",
                        hero_image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1600&q=80",
                        summary: "Twin-turbocharged 2.9L Tipo F120A V8 with Kevlar bodywork.",
                        powertrain: {
                          engine_type: "2.9L Twin-Turbo V8",
                          displacement_l: 2.9,
                          layout: "Rear Mid-Engine Longitudinal",
                          aspiration: "Twin-Turbocharged",
                          hp: 471,
                          kw: 352,
                          torque_nm: 577,
                          transmission: "5-Speed Manual Gated",
                          drivetrain: "RWD",
                          fuel_type: "Petrol"
                        },
                        chassis: {
                          curb_weight_kg: 1254,
                          chassis_type: "Tubular Steel Spaceframe with Kevlar Panels"
                        }
                      }
                    ];
                    setBulkJson(JSON.stringify(sample, null, 2));
                    setBulkSummary(null);
                  }}
                  className="text-xs font-mono text-[#BE123C] dark:text-[#E11D48] hover:underline flex items-center space-x-1"
                >
                  <FileJson className="w-3.5 h-3.5" />
                  <span>Load Array Template</span>
                </button>
              </div>

              {/* Import Summary Results Banner */}
              {bulkSummary && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] space-y-2 text-xs font-mono">
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                      +{bulkSummary.imported ?? 0} Imported
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                      {bulkSummary.skipped ?? 0} Skipped Duplicates
                    </span>
                  </div>

                  {bulkSummary.skippedSlugs && bulkSummary.skippedSlugs.length > 0 && (
                    <p className="text-[11px] text-slate-400">
                      Skipped existing: {bulkSummary.skippedSlugs.join(', ')}
                    </p>
                  )}

                  {bulkSummary.errors && bulkSummary.errors.length > 0 && (
                    <div className="mt-2 text-rose-500 space-y-1">
                      {bulkSummary.errors.map((err, i) => (
                        <p key={i}>• {err}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <textarea
                rows={12}
                value={bulkJson}
                onChange={(e) => setBulkJson(e.target.value)}
                placeholder='[\n  { "make": "Ferrari", "model": "F40", "year": 1987, "domain": "Road", ... },\n  { "make": "Bugatti", "model": "EB110 GT", "year": 1991, "domain": "Road", ... }\n]'
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#1A2435] text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
              />
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-[#1A2435] flex items-center justify-between bg-slate-50/50 dark:bg-[#0B1220]/50">
              <span className="text-[11px] text-slate-400 font-mono">
                {bulkJson.trim() ? `${bulkJson.length} bytes loaded` : 'Ready for JSON array'}
              </span>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1A2435]"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleBulkImport}
                  disabled={bulkSubmitting || !bulkJson.trim()}
                  className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-black hover:bg-slate-800 text-white text-xs font-bold transition-all border border-slate-700 dark:border-[#E11D48]/40 shadow-xs flex items-center space-x-2 disabled:opacity-50"
                >
                  <Layers className="w-3.5 h-3.5 text-[#E11D48]" />
                  <span>{bulkSubmitting ? 'Importing Fleet...' : 'Run Bulk Import'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
