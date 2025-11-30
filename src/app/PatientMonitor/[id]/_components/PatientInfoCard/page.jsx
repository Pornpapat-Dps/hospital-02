import { User, Calendar, Hash, UserCircle } from 'lucide-react';

export default function PatientInfoCard({ deviceInfo }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('th-TH', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    return `${age} ปี`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 p-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-100 rounded-lg">
            <User className="w-5 h-5 text-slate-600" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">ข้อมูลผู้ป่วย</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        
        {/* Name */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
          <UserCircle className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 font-medium mb-0.5">ชื่อ-นามสกุล</p>
            <p className="text-base font-semibold text-slate-800 truncate">
              {deviceInfo?.patient_name || 'ไม่ระบุ'} {deviceInfo?.patient_lastname || ''}
            </p>
          </div>
        </div>

        {/* HN & Gender */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              <p className="text-xs text-slate-500 font-medium">HN</p>
            </div>
            <p className="font-mono text-sm font-semibold text-slate-700">{deviceInfo?.hn || '-'}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <p className="text-xs text-slate-500 font-medium">เพศ</p>
            </div>
            <p className="text-sm font-semibold text-slate-700">{deviceInfo?.gender || '-'}</p>
          </div>
        </div>

        {/* Birth Date & Age */}
        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-1.5 mb-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <p className="text-xs text-slate-500 font-medium">วันเกิด / อายุ</p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-sm text-slate-700">{formatDate(deviceInfo?.date_of_birth)}</p>
            <span className="text-slate-300">•</span>
            <p className="text-sm font-semibold text-slate-600">{calculateAge(deviceInfo?.date_of_birth)}</p>
          </div>
        </div>

      </div>
    </div>
  );
}