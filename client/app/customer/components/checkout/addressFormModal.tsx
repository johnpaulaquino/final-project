"use client";

import React, { useState, useEffect, useRef } from "react";
import { psgcService, GeoNode } from "../../services/serviceAddress";

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (addressData: any) => Promise<void> | void;
  initialData?: any; // Allows passing in address data for Editing
}

export default function AddressFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: AddressFormModalProps) {
  const [regions, setRegions] = useState<GeoNode[]>([]);
  const [provinces, setProvinces] = useState<GeoNode[]>([]);
  const [cities, setCities] = useState<GeoNode[]>([]);
  const [barangays, setBarangays] = useState<GeoNode[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [selectedCodes, setSelectedCodes] = useState({
    region: "",
    province: "",
    city: "",
  });

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    region: "",
    province: "",
    city: "",
    barangay: "",
    street: "",
    houseNumber: "", // OPTIONAL
    buildingName: "", // REQUIRED
    postalCode: "",
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Hydration Flag: True while we are loading edit data, False otherwise.
  const isHydrating = useRef(false);

  // --- 1. Hydration Logic (Runs ONCE when modal opens) ---
  useEffect(() => {
    if (!isOpen) return;

    setStatusMessage(null);
    setSubmitAttempted(false);
    setTouched({});
    setErrors({});

    const initializeModal = async () => {
      isHydrating.current = true; // LOCK cascading effects

      try {
        const fetchedRegions = (await psgcService.getRegions()) || [];
        setRegions(fetchedRegions);

        if (initialData) {
          const rCode =
            fetchedRegions.find((r) => r.name === initialData.region)?.code ||
            "";

          let pCode = "";
          let fetchedProvinces: GeoNode[] = [];
          if (rCode) {
            fetchedProvinces =
              (await psgcService.getProvincesByRegion(rCode)) || [];
            setProvinces(fetchedProvinces);
            pCode =
              fetchedProvinces.find((p) => p.name === initialData.province)
                ?.code || "";
          }

          let cCode = "";
          let fetchedCities: GeoNode[] = [];
          if (pCode) {
            fetchedCities =
              (await psgcService.getCitiesByProvince(pCode)) || [];
          } else if (rCode && fetchedProvinces.length === 0) {
            fetchedCities = (await psgcService.getCitiesByRegion(rCode)) || []; // NCR Edge Case
          }
          setCities(fetchedCities);
          cCode =
            fetchedCities.find((c) => c.name === initialData.city)?.code || "";

          let fetchedBarangays: GeoNode[] = [];
          if (cCode) {
            fetchedBarangays =
              (await psgcService.getBarangaysByCity(cCode)) || [];
            setBarangays(fetchedBarangays);
          }

          // Set all codes at once
          setSelectedCodes({ region: rCode, province: pCode, city: cCode });

          // Set text data
          setFormData({
            fullName: initialData.fullname || "",
            phone: initialData.phone || "",
            region: initialData.region || "",
            province: initialData.province || "",
            city: initialData.city || "",
            barangay: initialData.barangay || "",
            street: initialData.st_bd_hno?.street || "",
            houseNumber: initialData.st_bd_hno?.house_no || "",
            buildingName: initialData.st_bd_hno?.building_name || "",
            postalCode: initialData.postal_code || "",
          });
        } else {
          // --- ADD NEW MODE ---
          setProvinces([]);
          setCities([]);
          setBarangays([]);
          setSelectedCodes({ region: "", province: "", city: "" });
          setFormData({
            fullName: "",
            phone: "",
            region: "",
            province: "",
            city: "",
            barangay: "",
            street: "",
            houseNumber: "",
            buildingName: "",
            postalCode: "",
          });
        }
      } catch (err) {
        console.error("Hydration error:", err);
      } finally {
        // UNLOCK cascading effects, but give React a tiny gap to finish rendering
        setTimeout(() => {
          isHydrating.current = false;
        }, 50);
      }
    };

    initializeModal();
  }, [isOpen, initialData]);

  // --- 2. Safe Cascading Effects (Only run on USER interaction) ---
  useEffect(() => {
    if (isHydrating.current || !selectedCodes.region) return;

    psgcService
      .getProvincesByRegion(selectedCodes.region)
      .then((data) => {
        if (data && data.length > 0) {
          setProvinces(data);
          setCities([]);
          setBarangays([]);
        } else {
          setProvinces([]);
          psgcService.getCitiesByRegion(selectedCodes.region).then(setCities);
        }
      })
      .catch(console.error);
  }, [selectedCodes.region]);

  useEffect(() => {
    if (isHydrating.current || !selectedCodes.province) return;
    psgcService
      .getCitiesByProvince(selectedCodes.province)
      .then((data) => {
        setCities(data);
        setBarangays([]);
      })
      .catch(console.error);
  }, [selectedCodes.province]);

  useEffect(() => {
    if (isHydrating.current || !selectedCodes.city) return;
    psgcService
      .getBarangaysByCity(selectedCodes.city)
      .then(setBarangays)
      .catch(console.error);
  }, [selectedCodes.city]);

  // Validation Engine
  useEffect(() => {
    const newErrors: Record<string, boolean> = {};
    if (!formData.fullName.trim()) newErrors.fullName = true;
    if (!formData.phone.trim()) newErrors.phone = true;
    if (!selectedCodes.region) newErrors.region = true;
    if (provinces.length > 0 && !selectedCodes.province)
      newErrors.province = true;
    if (!selectedCodes.city) newErrors.city = true;
    if (!formData.barangay) newErrors.barangay = true;
    if (!formData.street.trim()) newErrors.street = true;
    if (!formData.buildingName.trim()) newErrors.buildingName = true;
    if (!formData.postalCode.trim()) newErrors.postalCode = true;
    setErrors(newErrors);
  }, [formData, selectedCodes, provinces]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    level: string,
  ) => {
    const code = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;

    if (level === "region") {
      setSelectedCodes({ region: code, province: "", city: "" });
      setFormData((prev) => ({
        ...prev,
        region: name,
        province: "",
        city: "",
        barangay: "",
      }));
    } else if (level === "province") {
      setSelectedCodes((prev) => ({ ...prev, province: code, city: "" }));
      setFormData((prev) => ({
        ...prev,
        province: name,
        city: "",
        barangay: "",
      }));
    } else if (level === "city") {
      setSelectedCodes((prev) => ({ ...prev, city: code }));
      setFormData((prev) => ({ ...prev, city: name, barangay: "" }));
    } else if (level === "barangay") {
      setFormData((prev) => ({ ...prev, barangay: name }));
    }
  };

  const handleInteraction = (
    e:
      | React.FocusEvent<HTMLInputElement | HTMLSelectElement>
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const getInputClass = (fieldName: string) => {
    const isInvalid =
      errors[fieldName] && (touched[fieldName] || submitAttempted);
    const baseClass =
      "border rounded-lg p-3 text-sm focus:outline-none focus:ring-1 transition-colors w-full disabled:bg-gray-50 disabled:text-gray-400";
    if (isInvalid) {
      return `${baseClass} border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/30 text-red-900`;
    }
    return `${baseClass} border-gray-200 focus:border-[#800000] focus:ring-[#800000] bg-white text-gray-800`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (Object.keys(errors).length > 0) {
      setStatusMessage({
        type: "error",
        text: "Please fill out all required fields marked in red.",
      });
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      await onSave(formData);
      setStatusMessage({
        type: "success",
        text: "Address saved successfully!",
      });

      setTouched({});
      setSubmitAttempted(false);

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error("Save error:", error);
      setStatusMessage({
        type: "error",
        text: error?.message || "Failed to save address. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-[#0B1527]/60 backdrop-blur-md transition-opacity">
      <div className="bg-white rounded-[20px] w-full max-w-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-5 sm:p-6 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-xl font-bold text-[#0B1527]">
            {initialData ? "Edit Delivery Address" : "New Delivery Address"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-[#800000] transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* STATUS MESSAGE BANNER */}
        {statusMessage && (
          <div className="px-5 sm:px-6 pt-4 pb-0 flex-shrink-0 animate-in slide-in-from-top-2 duration-200">
            <div
              className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${
                statusMessage.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {statusMessage.type === "success" ? (
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              {statusMessage.text}
            </div>
          </div>
        )}

        {/* Form Body */}
        <form
          id="addressForm"
          onSubmit={handleSubmit}
          noValidate
          className="p-5 sm:p-6 overflow-y-auto flex-grow flex flex-col gap-5 custom-scrollbar"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleTextChange}
                onFocus={handleInteraction}
                onBlur={handleInteraction}
                placeholder="Full Name"
                className={getInputClass("fullName")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleTextChange}
                onFocus={handleInteraction}
                onBlur={handleInteraction}
                placeholder="+63 123 456 7890"
                className={getInputClass("phone")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Region
              </label>
              <select
                name="region"
                value={selectedCodes.region}
                onChange={(e) => {
                  handleSelectChange(e, "region");
                  handleInteraction(e);
                }}
                onFocus={handleInteraction}
                onBlur={handleInteraction}
                className={getInputClass("region")}
              >
                <option value="" disabled>
                  Select Region
                </option>
                {regions.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Province
              </label>
              <select
                name="province"
                disabled={
                  !selectedCodes.region ||
                  (provinces.length === 0 && cities.length > 0)
                }
                value={selectedCodes.province}
                onChange={(e) => {
                  handleSelectChange(e, "province");
                  handleInteraction(e);
                }}
                onFocus={handleInteraction}
                onBlur={handleInteraction}
                className={getInputClass("province")}
              >
                <option value="" disabled>
                  {provinces.length === 0 && cities.length > 0
                    ? "Not Applicable (NCR)"
                    : "Select Province"}
                </option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                City / Municipality
              </label>
              <select
                name="city"
                disabled={!selectedCodes.province && !selectedCodes.region}
                value={selectedCodes.city}
                onChange={(e) => {
                  handleSelectChange(e, "city");
                  handleInteraction(e);
                }}
                onFocus={handleInteraction}
                onBlur={handleInteraction}
                className={getInputClass("city")}
              >
                <option value="" disabled>
                  Select City
                </option>
                {cities.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Barangay
              </label>
              <select
                name="barangay"
                disabled={!selectedCodes.city}
                value={formData.barangay || ""}
                onChange={(e) => {
                  handleSelectChange(e, "barangay");
                  handleInteraction(e);
                }}
                onFocus={handleInteraction}
                onBlur={handleInteraction}
                className={getInputClass("barangay")}
              >
                <option value="" disabled>
                  Select Barangay
                </option>
                {barangays.map((b) => (
                  <option key={b.code} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-gray-100 my-2"></div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Street Name
            </label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleTextChange}
              onFocus={handleInteraction}
              onBlur={handleInteraction}
              placeholder="e.g. Purok 1"
              className={getInputClass("street")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                House / Lot Number{" "}
                <span className="font-normal text-gray-400 text-[9px]">
                  (OPTIONAL)
                </span>
              </label>
              <input
                type="text"
                name="houseNumber"
                value={formData.houseNumber}
                onChange={handleTextChange}
                placeholder="e.g. Blk 4 Lot 12"
                className="border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000] transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Building Name
              </label>
              <input
                type="text"
                name="buildingName"
                value={formData.buildingName}
                onChange={handleTextChange}
                onFocus={handleInteraction}
                onBlur={handleInteraction}
                placeholder="e.g. Biskota Tower"
                className={getInputClass("buildingName")}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 w-full md:w-[calc(50%-10px)] pb-4">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Postal Code
            </label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleTextChange}
              onFocus={handleInteraction}
              onBlur={handleInteraction}
              placeholder="e.g. 1000"
              className={getInputClass("postalCode")}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t border-gray-100 flex gap-4 bg-white flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="addressForm"
            disabled={isSubmitting}
            className="flex-grow px-8 py-3 rounded-xl font-bold text-white bg-[#800000] hover:bg-red-900 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-wait"
          >
            {isSubmitting ? "Saving..." : "Save Address"}
          </button>
        </div>
      </div>
    </div>
  );
}
