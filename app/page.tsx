import React from 'react';
import { useEffect } from 'react';

export default function Schedule() {
  const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์'];

  const times = [
    '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00',
    '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00', '18:00-19:00'
  ];

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;700;900&display=swap';
    document.head.appendChild(link);
  }, []);

  return (
    <>
      <div className="min-h-screen bg-[#090909] text-[#e0e0e0] p-6 md:p-12 antialiased selection:bg-[#ff5c00] selection:text-white" style={{ fontFamily: "'Prompt', sans-serif" }}>
        {/* Header */}
        <div className="max-w-[1400px] mx-auto mb-8 border-b-2 border-[#222222] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-[#ff5c00] text-[10px] font-bold tracking-[0.3em] uppercase mb-2 flex items-center gap-2">
              <span className="w-4 h-[2px] bg-[#ff5c00] inline-block"></span>
              Network_Sync // Active
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tight text-white">
              Schedule<span className="text-[#ff5c00]">.</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-[10px] text-[#666666] tracking-widest uppercase">Semester</div>
            <div className="bg-[#e0e0e0] text-[#090909] font-black text-sm px-3 py-1 skew-x-[-10deg]">
              <div className="skew-x-[10deg]">2569 / 1</div>
            </div>
          </div>
        </div>

        {/* Schedule Container */}
        <div className="max-w-[1400px] mx-auto overflow-x-auto pb-8">
          <div className="min-w-[1100px] relative bg-[#121212] border border-[#222222] shadow-[8px_8px_0px_0px_rgba(255,92,0,0.05)]">

            {/* Main Grid */}
            <div className="grid grid-cols-[80px_repeat(10,1fr)] gap-[1px] bg-[#222222]">

              {/* Top Left Corner */}
              <div className="bg-[#121212] p-3 flex items-end justify-end border-b-2 border-[#ff5c00]">
                <span className="text-[9px] text-[#666] font-bold uppercase tracking-widest">Day/Time</span>
              </div>

              {/* Timeline Headers */}
              {times.map((time, idx) => (
                <div key={idx} className="bg-[#121212] p-3 flex flex-col items-center justify-end border-b-2 border-[#2a2a2a]">
                  <span className="text-[#a0a0a0] text-[11px] font-bold tracking-wider">{time}</span>
                </div>
              ))}

              {/* Base Grid Pattern */}
              {days.map((day, rowIdx) => (
                <React.Fragment key={day}>
                  {/* Day Axis */}
                  <div
                    className="bg-[#181818] text-white font-bold text-sm flex items-center justify-center p-3 relative group"
                    style={{ gridRowStart: rowIdx + 2, gridColumnStart: 1 }}
                  >
                    {/* Highlight marker */}
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#333] group-hover:bg-[#ff5c00] transition-colors"></div>
                    <span className="writing-vertical-lr rotate-180 md:rotate-0 md:writing-horizontal-tb tracking-widest">{day}</span>
                  </div>

                  {/* Empty Cells */}
                  {times.map((_, colIdx) => (
                    <div
                      key={colIdx}
                      className="bg-[#0f0f0f] relative"
                      style={{ gridRowStart: rowIdx + 2, gridColumnStart: colIdx + 2 }}
                    >
                      {/* Grid marker */}
                      <div className="absolute inset-0 m-auto w-[2px] h-[2px] bg-[#1f1f1f]"></div>
                    </div>
                  ))}
                </React.Fragment>
              ))}

              {/* Monday */}
              <ClassCard name="วิทยาการข้อมูล" code="10301351" detail="บรรยาย คอม 6 | 105" row={2} colStart={3} colEnd={5} />
              <ClassCard name="ตรรกศาสตร์เชิงดิจิทัลและอุปกรณ์อัจฉริยะ" code="10301364" detail="Lab คอม 2 | 105" row={2} colStart={6} colEnd={8} />
              <ClassCard name="ภาษาอังกฤษเพื่อการศึกษาต่อและการประกอบอาชีพ" code="10700320" detail="80-501 | 147" row={2} colStart={8} colEnd={10} />

              {/* Tuesday */}
              <ClassCard name="ปัญญาประดิษฐ์" code="10301371" detail="3203 | 141" row={3} colStart={3} colEnd={5} />
              <ClassCard name="วิทยาการข้อมูล" code="10301351" detail="Lab คอม 2 | 105" row={3} colStart={6} colEnd={9} />
              <ClassCard name="วิทยาศาสตร์เพื่อชีวิต" code="10300411" detail="3102 | 141" row={3} colStart={10} colEnd={12} />

              {/* Wednesday is empty */}

              {/* Thursday */}
              <ClassCard name="ตรรกศาสตร์เชิงดิจิทัลและอุปกรณ์อัจฉริยะ" code="10301364" detail="Lab คอม 2 | 105" row={5} colStart={2} colEnd={5} />
              <ClassCard name="การประมวลผลภาษาธรรมชาติ" code="10301374" detail="บรรยาย คอม 8 | 105" row={5} colStart={6} colEnd={8} />
              <ClassCard name="ภาษาอังกฤษเพื่อการศึกษาต่อและการประกอบอาชีพ" code="10700320" detail="80-501 | 147" row={5} colStart={8} colEnd={10} />

              {/* Friday */}
              <ClassCard name="การประมวลผลภาษาธรรมชาติ" code="10301374" detail="Lab คอม 2 | 105" row={6} colStart={2} colEnd={5} />
              <ClassCard name="ปัญญาประดิษฐ์" code="10301371" detail="Lab คอม 2 | 105" row={6} colStart={6} colEnd={9} />
              <ClassCard name="วิทยาศาสตร์เพื่อชีวิต" code="10300411" detail="3102 | 141" row={6} colStart={10} colEnd={12} />

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Reusable Class Card Component
interface ClassCardProps {
  name: string;
  code: string;
  detail: string;
  row: number;
  colStart: number;
  colEnd: number;
}

function ClassCard({ name, code, detail, row, colStart, colEnd }: ClassCardProps) {
  return (
    <div
      className="bg-[#181818] group relative overflow-hidden flex flex-col justify-center p-4 transition-all duration-300 hover:bg-[#202020] cursor-crosshair z-10"
      style={{
        gridRowStart: row,
        gridColumnStart: colStart,
        gridColumnEnd: colEnd
      }}
    >
      {/* Accent Border Indicator */}
      <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#ff5c00] transition-all duration-300 group-hover:w-[6px]"></div>

      <div className="pl-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[#ff5c00] text-[12px] font-black tracking-widest">{code}</span>
        </div>
        <div className="text-[14px] font-bold text-[#e0e0e0] leading-tight mb-2 pr-2">{name}</div>
        <div className="text-[12px] text-[#666666] font-medium tracking-wide flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-[#333]"></span>
          {detail}
        </div>
      </div>
    </div>
  );
}