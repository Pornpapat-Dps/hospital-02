// ใช้ 'use client' เนื่องจากมีการจัดการ State และการโต้ตอบกับผู้ใช้
"use client";

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

export default function AssignSensorModal({ devices, onAssign, isOpen, onClose }) {
  const [selectedDevice, setSelectedDevice] = useState('');
  const [patientName, setPatientName] = useState('');
  const [hn, setHn] = useState('');
  const [loading, setLoading] = useState(false);

  const availableDevices = devices.filter(d => d.status === 'available').map(d => d.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDevice || !patientName || !hn) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setLoading(true);
    
    // เรียกใช้ฟังก์ชันที่ถูกส่งมาจาก Parent Component (PatientMonitor)
    await onAssign({ deviceId: selectedDevice, patientName, hn });

    setLoading(false);
    onClose(); // ปิด Modal หลังจากสำเร็จ
    
    // Clear Form
    setSelectedDevice('');
    setPatientName('');
    setHn('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            กำหนดผู้ป่วยให้กับเซนเซอร์
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          
          <div className="mb-4">
            <label htmlFor="device" className="block text-sm font-medium text-gray-700 mb-1">
              เลือกเซนเซอร์ว่าง (Device ID)
            </label>
            <select
              id="device"
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="" disabled>-- เลือก Hospital ID --</option>
              {availableDevices.length === 0 ? (
                <option disabled>ไม่มีเซนเซอร์ว่าง</option>
              ) : (
                availableDevices.map(id => (
                  <option key={id} value={id}>{id}</option>
                ))
              )}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="hn" className="block text-sm font-medium text-gray-700 mb-1">
              HN (Hospital Number)
            </label>
            <input
              type="text"
              id="hn"
              value={hn}
              onChange={(e) => setHn(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="เช่น 12345"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อผู้ป่วย (ชื่อ-สกุล)
            </label>
            <input
              type="text"
              id="patientName"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="เช่น นายสมชาย ใจดี"
            />
          </div>

          <button
            type="submit"
            disabled={loading || availableDevices.length === 0}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                กำลังกำหนด...
              </>
            ) : (
              `กำหนดผู้ป่วยให้กับ ${selectedDevice || 'เซนเซอร์'}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}