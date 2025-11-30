import { useMemo } from 'react';
import { Activity } from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ComposedChart 
} from 'recharts';

// ================================
// 1. Configs & Constants
// ================================

const POSTURE_MAP = {
  0: { text: 'นอน/นั่ง', color: '#64748b' },
  1: { text: 'ยืน/เดิน', color: '#10b981' },
  2: { text: 'เดินเร็ว/วิ่ง', color: '#f59e0b' },
  3: { text: 'ล้ม', color: '#dc2626' },
};

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;

// ✅ ตาราง Config ใหม่ ตาม Logic ของคุณ
const CHART_CONFIGS = [
  // --- 1. ระยะสั้น (เน้นข้อมูลละเอียด) ---
  { 
    max: 1 * HOUR,      
    ticks: 12,          
    interval: 5 * MIN,  // (1ชม./12จุด = 5นาที) *แก้ไขจาก 15 เพื่อให้ได้ 12 จุดจริง
    angle: -30          // อ่านง่าย
  },
  { 
    max: 6 * HOUR,      
    ticks: 18,          
    interval: 20 * MIN, 
    angle: -30 
  },
  { 
    max: 24 * HOUR,     
    ticks: 24,          // Ticks เยอะมาก
    interval: 1 * HOUR, 
    angle: -45          // *เอียงเยอะหน่อย กันทับกัน
  },
  { 
    max: 2 * DAY,       
    ticks: 16,          
    interval: 3 * HOUR, 
    angle: -30 
  },

  // --- 2. ระยะกลาง (ยืดหยุ่น) ---
  { 
    max: 7 * DAY,       
    ticks: 7,           // Ticks น้อย
    interval: 1 * DAY,  
    angle: 0            // *แนวนอนเลย อ่านง่ายสุด
  },
  { 
    max: 14 * DAY,      
    ticks: 14,          
    interval: 1 * DAY,  
    angle: -30 
  },
  { 
    max: 31 * DAY,      
    ticks: 15,          
    interval: 2 * DAY,  
    angle: -30 
  },
  { 
    max: 92 * DAY,      
    ticks: 12,          
    interval: 7 * DAY,  // ประมาณ 1 สัปดาห์
    angle: -30 
  },

  // --- 3. ระยะยาว (คงที่ 12 จุด) ---
  // ใช้มุม -45 เพราะมักจะมี ปี พ.ศ. เข้ามาด้วย (ข้อความยาว)
  { max: 183 * DAY,     ticks: 12, interval: 14 * DAY,   angle: -45 }, // 6 เดือน
  { max: 365 * DAY,     ticks: 12, interval: 1 * MONTH,  angle: -45 }, // 1 ปี
  { max: 730 * DAY,     ticks: 12, interval: 2 * MONTH,  angle: -45 }, // 2 ปี
  { max: 1825 * DAY,    ticks: 12, interval: 5 * MONTH,  angle: -45 }, // 5 ปี
  { max: Infinity,      ticks: 12, interval: 10 * MONTH, angle: -45 }, // 10 ปี+
];

// ================================
// 2. Helper Logic (คงเดิม)
// ================================

const getConfig = (data) => {
  if (!data || data.length === 0) return CHART_CONFIGS[0];
  const duration = new Date(data[data.length - 1]._time) - new Date(data[0]._time);
  return CHART_CONFIGS.find(c => duration <= c.max) || CHART_CONFIGS[CHART_CONFIGS.length - 1];
};

const processData = (data, interval) => {
  if (!data || data.length === 0) return [];
  // ถ้า Interval น้อยกว่า 1 ชม. ไม่ต้องย่อข้อมูล (เพื่อความละเอียด)
  if (interval < 1 * HOUR) return data;

  const grouped = [];
  let currentGroup = [];
  let startTime = new Date(data[0]._time).getTime();

  for (const point of data) {
    const time = new Date(point._time).getTime();
    if (time < startTime + interval) {
      currentGroup.push(point);
    } else {
      if (currentGroup.length) grouped.push(averageGroup(currentGroup));
      currentGroup = [point];
      startTime += interval;
      while (time >= startTime + interval) startTime += interval;
    }
  }
  if (currentGroup.length) grouped.push(averageGroup(currentGroup));
  return grouped;
};

const averageGroup = (group) => {
  const count = group.length;
  const sum = group.reduce((acc, cur) => ({
    hr: acc.hr + (cur.heart_rate || 0),
    temp: acc.temp + (cur.temperature || 0),
    bat: acc.bat + (cur.BatteryPercent || 0),
  }), { hr: 0, temp: 0, bat: 0 });

  return {
    _time: group[count - 1]._time,
    heart_rate: Number((sum.hr / count).toFixed(1)),
    temperature: Number((sum.temp / count).toFixed(1)),
    BatteryPercent: Number((sum.bat / count).toFixed(1)),
    posture: group[count - 1].posture 
  };
};

const getTickValues = (data, count) => {
  if (!data.length) return [];
  if (data.length <= count) return data.map(d => d._time);
  
  const step = (data.length - 1) / (count - 1);
  const ticks = [];
  for (let i = 0; i < count; i++) {
    const index = Math.round(i * step);
    if (data[index]) ticks.push(data[index]._time);
  }
  return [...new Set(ticks)];
};

// ================================
// 3. Components (คงเดิม)
// ================================

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 p-3 rounded-lg shadow-lg border border-slate-200 text-xs">
      <p className="font-semibold text-slate-600 mb-2">
        {new Date(label).toLocaleString('th-TH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </p>
      {payload.map((entry, i) => (
        <div key={i} className="flex justify-between gap-4 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-slate-600">
              {entry.dataKey === 'posture' ? 'Posture' : entry.name.split(' ')[0]}
            </span>
          </div>
          <span className="font-semibold">
            {entry.dataKey === 'posture' ? POSTURE_MAP[entry.value]?.text : entry.value}
            {entry.unit}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function MonitorCharts({ historyData, selectedChart, getYAxisDomain, formatTime }) {
  const config = useMemo(() => getConfig(historyData), [historyData]);
  const processedData = useMemo(() => processData(historyData, config.interval), [historyData, config]);
  const xAxisTicks = useMemo(() => getTickValues(processedData, config.ticks), [processedData, config]);

  if (!processedData.length) {
    return (
      <div className="h-[550px] flex flex-col items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 text-slate-400">
        <Activity className="w-12 h-12 mb-2 opacity-50" />
        <p>ไม่มีข้อมูลในช่วงเวลานี้</p>
      </div>
    );
  }

  const showAll = selectedChart === 'all';

  return (
    <div className="h-[550px] w-full bg-white rounded-lg p-4">
      <ResponsiveContainer>
        <ComposedChart data={processedData} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
          <defs>
            <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          
          <XAxis 
            dataKey="_time" 
            tickFormatter={formatTime} 
            stroke="#94a3b8" 
            fontSize={11} 
            ticks={xAxisTicks}
            angle={config.angle} // ✅ ใช้อัตโนมัติตามตาราง
            interval={0}
            height={70}
            tickMargin={10}
          />

          {(showAll || selectedChart === 'heart_rate') && (
            <YAxis yAxisId="hr" stroke="#f43f5e" fontSize={11} domain={getYAxisDomain('heart_rate')} label={{ value: 'BPM', angle: -90, position: 'insideLeft', fill: '#f43f5e', fontSize: 10 }} />
          )}
          {(showAll || selectedChart === 'temperature') && (
            <YAxis yAxisId="temp" orientation="right" stroke="#3b82f6" fontSize={11} domain={getYAxisDomain('temperature')} label={{ value: '°C', angle: 90, position: 'insideRight', fill: '#3b82f6', fontSize: 10 }} />
          )}
          {(showAll || selectedChart === 'battery') && (
            <YAxis yAxisId="bat" orientation={selectedChart === 'battery' ? 'left' : 'right'} stroke="#10b981" fontSize={11} domain={[0, 100]} />
          )}
          {(showAll || selectedChart === 'posture') && (
            <YAxis yAxisId="pos" orientation="right" stroke="#f59e0b" fontSize={11} domain={[0, 3]} ticks={[0,1,2,3]} />
          )}

          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} iconType="line" />

          {(showAll || selectedChart === 'heart_rate') && (
            <Area yAxisId="hr" type="monotone" dataKey="heart_rate" stroke="#f43f5e" fill="url(#colorHr)" name="Heart Rate" unit=" bpm" strokeWidth={2} activeDot={{ r: 5 }} />
          )}
          {(showAll || selectedChart === 'temperature') && (
            <Line yAxisId="temp" type="monotone" dataKey="temperature" stroke="#3b82f6" name="Temperature" unit=" °C" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
          )}
          {(showAll || selectedChart === 'battery') && (
            <Line yAxisId="bat" type="monotone" dataKey="BatteryPercent" stroke="#10b981" name="Battery" unit="%" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
          )}
          {(showAll || selectedChart === 'posture') && (
            <Line yAxisId="pos" type="stepAfter" dataKey="posture" stroke="#f59e0b" name="Posture" strokeWidth={2} dot={false} />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}