"use client";

import { useState } from 'react';
import { Plus, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function AssignSensorModal({ onAssign, isOpen, onClose }) {
  const [deviceNumber, setDeviceNumber] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientLastname, setPatientLastname] = useState('');
  const [hn, setHn] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [location, setLocation] = useState('');
  const [model, setModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingDevice, setCheckingDevice] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState(null);

  const getDeviceId = () => {
    if (!deviceNumber) return '';
    return `Hospital${deviceNumber.padStart(2, '0')}`;
  };

  // ✅ แก้ไขให้ใช้ /api/devices
  const checkDeviceAvailability = async (number) => {
    if (!number) {
      setDeviceStatus(null);
      return;
    }

    const deviceId = `Hospital${number.padStart(2, '0')}`;
    setCheckingDevice(true);
    setDeviceStatus(null);

    try {
      // ✅ เปลี่ยนไปใช้ /api/devices
      const response = await fetch(`/api/devices?device=${deviceId}&range=-5m`);
      const result = await response.json();

      console.log('🔍 Device Check Response:', result);

      // กรณีที่ 1: ไม่มีข้อมูลใน InfluxDB (success = false หรือ data ว่าง)
      if (!result.success || !result.data || result.data.length === 0) {
        setDeviceStatus('invalid');
        return;
      }

      // กรณีที่ 2: มีข้อมูลใน InfluxDB แล้ว
      // ต้องตรวจสอบเพิ่มว่าถูก assign แล้วหรือยัง
      const assignCheckResponse = await fetch(`/api/assign-device?device_id=${deviceId}`);
      const assignResult = await assignCheckResponse.json();

      console.log('🔍 Assignment Check:', assignResult);

      // ถ้าถูก assign แล้ว
      if (assignResult.success && assignResult.is_assigned === true) {
        setDeviceStatus('in-use');
        return;
      }

      // มีใน InfluxDB และยังไม่ถูก assign = พร้อมใช้งาน
      setDeviceStatus('valid');

    } catch (error) {
      console.error('❌ Error checking device:', error);
      setDeviceStatus('invalid');
    } finally {
      setCheckingDevice(false);
    }
  };

  const handleDeviceNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setDeviceNumber(value);
    
    clearTimeout(window.deviceCheckTimeout);
    if (value) {
      window.deviceCheckTimeout = setTimeout(() => {
        checkDeviceAvailability(value);
      }, 500);
    } else {
      setDeviceStatus(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!deviceNumber || !patientName || !hn) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (deviceStatus !== 'valid') {
      alert("กรุณาเลือกเซนเซอร์ที่สามารถใช้งานได้");
      return;
    }

    setLoading(true);
    
    try {
      await onAssign({ 
        deviceId: getDeviceId(), 
        patientName,
        patientLastname,
        hn,
        gender,
        dateOfBirth,
        location,
        model
      });

      setDeviceNumber('');
      setPatientName('');
      setPatientLastname('');
      setHn('');
      setGender('');
      setDateOfBirth('');
      setLocation('');
      setModel('');
      setDeviceStatus(null);
      
      onClose();
    } catch (error) {
      console.error('Error assigning device:', error);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            กำหนดผู้ป่วยให้กับเซนเซอร์
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          
          <div className="mb-4">
            <label htmlFor="deviceNumber" className="block text-sm font-medium text-gray-700 mb-1">
              หมายเลขเซนเซอร์ <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-l-lg font-mono">
                Hospital
              </span>
              <input
                type="text"
                id="deviceNumber"
                value={deviceNumber}
                onChange={handleDeviceNumberChange}
                className="flex-1 p-2 border border-gray-300 rounded-r-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="01, 02, 03"
                maxLength="2"
                required
              />
              {checkingDevice && (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              )}
              {deviceStatus === 'valid' && (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
              {deviceStatus === 'invalid' && (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              {deviceStatus === 'in-use' && (
                <AlertCircle className="w-5 h-5 text-orange-500" />
              )}
            </div>
            
            {deviceStatus === 'valid' && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                ✅ เซนเซอร์ {getDeviceId()} พร้อมใช้งาน
              </p>
            )}
            {deviceStatus === 'invalid' && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                ❌ ไม่พบเซนเซอร์ {getDeviceId()} ใน InfluxDB (กรุณาตรวจสอบว่าเปิดเครื่องแล้ว)
              </p>
            )}
            {deviceStatus === 'in-use' && (
              <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                ⚠️ เซนเซอร์ {getDeviceId()} กำลังถูกใช้งานอยู่
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="hn" className="block text-sm font-medium text-gray-700 mb-1">
                HN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="hn"
                value={hn}
                onChange={(e) => setHn(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="HN001"
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                เพศ
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- เลือก --</option>
                <option value="ชาย">ชาย</option>
                <option value="หญิง">หญิง</option>
                <option value="ไม่ระบุ">ไม่ระบุ</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="patientName"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="สมชาย"
              />
            </div>

            <div>
              <label htmlFor="patientLastname" className="block text-sm font-medium text-gray-700 mb-1">
                นามสกุล
              </label>
              <input
                type="text"
                id="patientLastname"
                value={patientLastname}
                onChange={(e) => setPatientLastname(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="ใจดี"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
              วันเกิด
            </label>
            <input
              type="date"
              id="dateOfBirth"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                ตำแหน่งติดตั้ง
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="ห้อง ICU 1"
              />
            </div>

            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                รุ่นเซนเซอร์
              </label>
              <input
                type="text"
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Patient Monitor X1"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || deviceStatus !== 'valid'}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                กำลังกำหนด...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                กำหนดผู้ป่วยให้กับ {getDeviceId() || 'เซนเซอร์'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}