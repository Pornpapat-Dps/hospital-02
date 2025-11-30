import Link from 'next/link';
import { 
  Activity, 
  Heart, 
  Thermometer, 
  Users, 
  TrendingUp, 
  Shield, 
  Clock, 
  Bell,
  ArrowRight,
  Zap,
  CheckCircle2,
  LogIn,
  UserPlus
} from 'lucide-react';

export default function Main() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      
      {/* 🎯 Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
        
        {/* 🔐 Top Navigation Bar (เพิ่มใหม่) */}
        <div className="absolute top-0 right-0 p-6 z-10">
          <div className="flex items-center gap-3">
            <Link 
              href="/uth/Login" 
              className="inline-flex items-center gap-2 px-6 py-2.5 text-slate-700 font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all duration-200"
            >
              <LogIn className="w-4 h-4" />
              <span>เข้าสู่ระบบ</span>
            </Link>
            <Link 
              href="/uth/Register" 
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200"
            >
              <UserPlus className="w-4 h-4" />
              <span>สมัครสมาชิก</span>
            </Link>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-sm font-medium">
                <Zap className="w-4 h-4" />
                <span>Real-time Patient Monitoring System</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                ระบบติดตาม<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  สุขภาพผู้ป่วย
                </span><br />
                แบบเรียลไทม์
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed">
                ติดตามสัญญาณชีพของผู้ป่วยได้แบบเรียลไทม์ พร้อมระบบแจ้งเตือนอัจฉริยะ 
                เพื่อการดูแลที่มีประสิทธิภาพสูงสุด
              </p>
              
              <div className="flex flex-wrap gap-4">
                {/* 🔐 ปุ่มเดิม - เอาไว้ทดสอบก่อน Auth */}
                <Link 
                  href="/PatientMonitor" 
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200"
                >
                  <Activity className="w-5 h-5" />
                  <span>ทดลองใช้งาน</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link 
                  href="/auth/login" 
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-700 font-semibold rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                >
                  <LogIn className="w-5 h-5" />
                  <span>เข้าสู่ระบบ</span>
                </Link>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200">
                <div>
                  <div className="text-3xl font-bold text-blue-600">24/7</div>
                  <div className="text-sm text-slate-600 mt-1">ติดตามตลอดเวลา</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-600">99.9%</div>
                  <div className="text-sm text-slate-600 mt-1">ความแม่นยำ</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-emerald-600">&lt;1s</div>
                  <div className="text-sm text-slate-600 mt-1">เวลาตอบสนอง</div>
                </div>
              </div>
            </div>
            
            {/* Right Visual */}
            <div className="relative lg:h-[600px] hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-indigo-600/10 rounded-3xl transform rotate-3"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                
                {/* Mini Dashboard Preview */}
                <div className="space-y-6">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                        <Activity className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">Live Monitor</div>
                        <div className="text-sm text-slate-500">Real-time Data</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Active</span>
                    </div>
                  </div>
                  
                  {/* Vital Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Heart Rate */}
                    <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-4 border border-red-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Heart className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium text-slate-700">Heart Rate</span>
                      </div>
                      <div className="text-3xl font-bold text-red-600">72</div>
                      <div className="text-xs text-slate-600 mt-1">bpm</div>
                      <div className="mt-3 flex items-center gap-1 text-xs text-emerald-600">
                        <TrendingUp className="w-3 h-3" />
                        <span>Normal</span>
                      </div>
                    </div>
                    
                    {/* Temperature */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Thermometer className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-slate-700">Temperature</span>
                      </div>
                      <div className="text-3xl font-bold text-blue-600">36.5</div>
                      <div className="text-xs text-slate-600 mt-1">°C</div>
                      <div className="mt-3 flex items-center gap-1 text-xs text-emerald-600">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Stable</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chart Preview */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-slate-700">24h Trend</span>
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="h-24 flex items-end gap-1">
                      {[40, 65, 45, 80, 60, 70, 55, 75, 85, 65, 70, 60].map((height, i) => (
                        <div 
                          key={i} 
                          className="flex-1 bg-gradient-to-t from-blue-400 to-indigo-400 rounded-t opacity-70 hover:opacity-100 transition-opacity"
                          style={{ height: `${height}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>
      
      {/* 🎯 Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              ฟีเจอร์หลัก
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              ระบบที่ออกแบบมาเพื่อการดูแลผู้ป่วยอย่างมีประสิทธิภาพ
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Feature 1 */}
            <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Real-time Monitoring</h3>
              <p className="text-slate-600">
                ติดตามสัญญาณชีพแบบเรียลไทม์ อัพเดททุกวินาที
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="group bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border border-red-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Bell className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Smart Alerts</h3>
              <p className="text-slate-600">
                แจ้งเตือนอัจฉริยะเมื่อพบค่าผิดปกติ
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="group bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Trend Analysis</h3>
              <p className="text-slate-600">
                วิเคราะห์แนวโน้มสุขภาพระยะยาว
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="group bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Secure System</h3>
              <p className="text-slate-600">
                ระบบความปลอดภัยระดับสูง ปกป้องข้อมูล
              </p>
            </div>
            
          </div>
        </div>
      </section>
      
      {/* 🎯 CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm font-medium mb-6">
            <Clock className="w-4 h-4" />
            <span>พร้อมให้บริการตลอด 24 ชั่วโมง</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            เริ่มต้นดูแลผู้ป่วยของคุณวันนี้
          </h2>
          
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            ระบบที่ทันสมัย ใช้งานง่าย และให้ผลลัพธ์ที่แม่นยำ
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/PatientMonitor" 
              className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              <Activity className="w-5 h-5" />
              <span>ไปที่ระบบติดตาม</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              href="/PatientInfo" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all duration-200"
            >
              <Users className="w-5 h-5" />
              <span>ดูข้อมูลผู้ป่วย</span>
            </Link>
          </div>
        </div>
      </section>
      
    </div>
  );
}