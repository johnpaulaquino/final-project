'use client';

import React, { useState, useEffect } from 'react';
import { psgcService, GeoNode } from '../../services/serviceAddress';

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (addressData: any) => void;
}

export default function addressFormModal({ isOpen, onClose, onSave }: AddressFormModalProps) {
  const [regions, setRegions] = useState<GeoNode[]>([]);
  const [provinces, setProvinces] = useState<GeoNode[]>([]);
  const [cities, setCities] = useState<GeoNode[]>([]);
  const [barangays, setBarangays] = useState<GeoNode[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedCodes, setSelectedCodes] = useState({
    region: '', province: '', city: ''
  });

  const [formData, setFormData] = useState({
    fullName: '', phone: '', region: '', province: '', city: '', 
    barangay: '', street: '', houseNumber: '', buildingName: '', postalCode: ''
  });

  // api calls to load regions, provinces, cities, barangays based on selection
  useEffect(() => {
    if (isOpen) psgcService.getRegions().then(setRegions).catch(console.error);
  }, [isOpen]);

  useEffect(() => {
    if (!selectedCodes.region) return;
    psgcService.getProvincesByRegion(selectedCodes.region).then(data => {
      if (data && data.length > 0) {
        setProvinces(data);
        setCities([]); 
      } else {
        setProvinces([]);
        psgcService.getCitiesByRegion(selectedCodes.region).then(setCities);
      }
    }).catch(console.error);
  }, [selectedCodes.region]);

  useEffect(() => {
    if (!selectedCodes.province) return;
    psgcService.getCitiesByProvince(selectedCodes.province).then(setCities).catch(console.error);
  }, [selectedCodes.province]);

  useEffect(() => {
    if (!selectedCodes.city) return;
    psgcService.getBarangaysByCity(selectedCodes.city).then(setBarangays).catch(console.error);
  }, [selectedCodes.city]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, level: string) => {
    const code = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;

    if (level === 'region') {
      setSelectedCodes({ region: code, province: '', city: '' });
      setFormData(prev => ({ ...prev, region: name, province: '', city: '', barangay: '' }));
      setBarangays([]);
    } else if (level === 'province') {
      setSelectedCodes(prev => ({ ...prev, province: code, city: '' }));
      setFormData(prev => ({ ...prev, province: name, city: '', barangay: '' }));
    } else if (level === 'city') {
      setSelectedCodes(prev => ({ ...prev, city: code }));
      setFormData(prev => ({ ...prev, city: name, barangay: '' }));
    } else if (level === 'barangay') {
      setFormData(prev => ({ ...prev, barangay: name }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Form submitted! Data is:", formData);

    if (isSubmitting) return; 
    setIsSubmitting(true);

    onSave(formData); // Send data back to parent
    
    // Reset form
    setFormData({ fullName: '', phone: '', region: '', province: '', city: '', barangay: '', street: '', houseNumber: '', buildingName: '', postalCode: '' });
    setSelectedCodes({ region: '', province: '', city: '' });
    setTimeout(() => setIsSubmitting(false), 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-[#0B1527]/60 backdrop-blur-md transition-opacity">
      <div className="bg-white rounded-[20px] w-full max-w-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center p-5 sm:p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#0B1527]">New Delivery Address</h2>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-[#800000] transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Form Body */}
        <form id="addressForm" onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-grow flex flex-col gap-5 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
              <input required type="text" name="fullName" value={formData.fullName} onChange={handleTextChange} placeholder="Full Name" className="border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000] transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
              <input required type="text" name="phone" value={formData.phone} onChange={handleTextChange} placeholder="+63 123 456 7890" className="border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000] transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Region</label>
              <select required value={selectedCodes.region} onChange={(e) => handleSelectChange(e, 'region')} className="border border-gray-200 rounded-lg p-3 text-sm text-gray-600 bg-white focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]">
                <option value="" disabled>Select Region</option>
                {regions.map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Province</label>
              <select required={provinces.length > 0} disabled={!selectedCodes.region || (provinces.length === 0 && cities.length > 0)} value={selectedCodes.province} onChange={(e) => handleSelectChange(e, 'province')} className="border border-gray-200 rounded-lg p-3 text-sm text-gray-600 bg-white focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000] disabled:bg-gray-50 disabled:text-gray-400">
                <option value="" disabled>{provinces.length === 0 && cities.length > 0 ? "Not Applicable (NCR)" : "Select Province"}</option>
                {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">City / Municipality</label>
              <select required disabled={!selectedCodes.province && !selectedCodes.region} value={selectedCodes.city} onChange={(e) => handleSelectChange(e, 'city')} className="border border-gray-200 rounded-lg p-3 text-sm text-gray-600 bg-white focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000] disabled:bg-gray-50 disabled:text-gray-400">
                <option value="" disabled>Select City</option>
                {cities.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Barangay</label>
              <select required disabled={!selectedCodes.city} value={formData.barangay ? "selected" : ""} onChange={(e) => handleSelectChange(e, 'barangay')} className="border border-gray-200 rounded-lg p-3 text-sm text-gray-600 bg-white focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000] disabled:bg-gray-50 disabled:text-gray-400">
                <option value="" disabled>Select Barangay</option>
                {barangays.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div className="border-t border-gray-100 my-2"></div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Street Name</label>
            <input required type="text" name="street" value={formData.street} onChange={handleTextChange} placeholder="e.g. Purok 1" className="border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000] transition-colors" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">House / Lot Number</label>
              <input required type="text" name="houseNumber" value={formData.houseNumber} onChange={handleTextChange} placeholder="e.g. Blk 4 Lot 12" className="border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000] transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Building Name <span className="font-normal text-gray-400 text-[9px]">(OPTIONAL)</span></label>
              <input type="text" name="buildingName" value={formData.buildingName} onChange={handleTextChange} placeholder="e.g. Biskota Tower" className="border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000] transition-colors" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 w-full md:w-[calc(50%-10px)] pb-4">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Postal Code</label>
            <input required type="text" name="postalCode" value={formData.postalCode} onChange={handleTextChange} placeholder="e.g. 1000" className="border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000] transition-colors" />
          </div>
        </form>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t border-gray-100 flex gap-4 bg-white flex-shrink-0">
          <button type="button" onClick={onClose} className="px-8 py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
          <button 
            type="submit" 
            form="addressForm" 
            disabled={isSubmitting}
            className="flex-grow px-8 py-3 rounded-xl font-bold text-white bg-[#800000] hover:bg-red-900 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-wait"
          >
            {isSubmitting ? 'Saving...' : 'Save Address'}
          </button>
        </div>

      </div>
    </div>
  );
}