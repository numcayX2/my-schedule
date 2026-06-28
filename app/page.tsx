"use client"
import React, { useEffect } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ClassCardProps {
  name: string;
  code: string;
  detail: string;
  row: number;
  colStart: number;
  colEnd: number;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const DAYS = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์'];

const TIMES = [
  '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00',
  '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00', '18:00-19:00',
];

const CLASSES: ClassCardProps[] = [
  // Monday (row 2)
  { name: 'วิทยาการข้อมูล',                               code: '10301351', detail: 'บรรยาย คอม 6 | 105', row: 2, colStart: 3,  colEnd: 5  },
  { name: 'ตรรกศาสตร์เชิงดิจิทัลและอุปกรณ์อัจฉริยะ',    code: '10301364', detail: 'Lab คอม 2 | 105',    row: 2, colStart: 6,  colEnd: 8  },
  { name: 'ภาษาอังกฤษเพื่อการศึกษาต่อและการประกอบอาชีพ', code: '10700320', detail: '80-501 | 147',        row: 2, colStart: 8,  colEnd: 10 },

  // Tuesday (row 3)
  { name: 'ปัญญาประดิษฐ์',                               code: '10301371', detail: '3203 | 141',          row: 3, colStart: 3,  colEnd: 5  },
  { name: 'วิทยาการข้อมูล',                               code: '10301351', detail: 'Lab คอม 2 | 105',    row: 3, colStart: 6,  colEnd: 9  },
  { name: 'วิทยาศาสตร์เพื่อชีวิต',                       code: '10300411', detail: '3102 | 141',          row: 3, colStart: 10, colEnd: 12 },

  // Wednesday (row 4) — empty

  // Thursday (row 5)
  { name: 'ตรรกศาสตร์เชิงดิจิทัลและอุปกรณ์อัจฉริยะ',    code: '10301364', detail: 'Lab คอม 2 | 105',    row: 5, colStart: 2,  colEnd: 5  },
  { name: 'การประมวลผลภาษาธรรมชาติ',                      code: '10301374', detail: 'บรรยาย คอม 8 | 105', row: 5, colStart: 6,  colEnd: 8  },
  { name: 'ภาษาอังกฤษเพื่อการศึกษาต่อและการประกอบอาชีพ', code: '10700320', detail: '80-501 | 147',        row: 5, colStart: 8,  colEnd: 10 },

  // Friday (row 6)
  { name: 'การประมวลผลภาษาธรรมชาติ',                      code: '10301374', detail: 'Lab คอม 2 | 105',    row: 6, colStart: 2,  colEnd: 5  },
  { name: 'ปัญญาประดิษฐ์',                               code: '10301371', detail: 'Lab คอม 2 | 105',    row: 6, colStart: 6,  colEnd: 9  },
  { name: 'วิทยาศาสตร์เพื่อชีวิต',                       code: '10300411', detail: '3102 | 141',          row: 6, colStart: 10, colEnd: 12 },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function ClassCard({ name, code, detail, row, colStart, colEnd }: ClassCardProps) {
  return (
    <div
      className="bg-[#181818] group relative overflow-hidden flex flex-col justify-center p-4 transition-all duration-300 hover:bg-[#202020] cursor-crosshair z-10"
      style={{ gridRowStart: row, gridColumnStart: colStart, gridColumnEnd: colEnd }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#ff5c00] transition-all duration-300 group-hover:w-[6px]" />

      <div className="pl-2">
        <span className="block text-[#ff5c00] text-[12px] font-black tracking-widest mb-1">{code}</span>
        <p className="text-[14px] font-bold text-[#e0e0e0] leading-tight mb-2 pr-2">{name}</p>
        <div className="text-[12px] text-[#666] font-medium tracking-wide flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-[#333]" />
          {detail}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Schedule() {
  // Load Prompt font via DOM injection (Tailwind arbitrary font values require JIT compiler)
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;700;900&display=swap';
    document.head.appendChild(link);
  }, []);

  return (
    <div
      className="min-h-screen bg-[#090909] text-[#e0e0e0] p-6 md:p-12 antialiased selection:bg-[#ff5c00] selection:text-white"
      style={{ fontFamily: "'Prompt', sans-serif" }}
    >
      {/* ── Header ── */}
      <header className="max-w-[1400px] mx-auto mb-8 pb-4 border-b-2 border-[#222] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-[#ff5c00] text-[10px] font-bold tracking-[0.3em] uppercase mb-2 flex items-center gap-2">
            <span className="w-4 h-[2px] bg-[#ff5c00] inline-block" />
            Network_Sync // Active
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-white">
            Schedule<span className="text-[#ff5c00]">.</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#666] tracking-widest uppercase">Semester</span>
          <div className="bg-[#e0e0e0] text-[#090909] font-black text-sm px-3 py-1 skew-x-[-10deg]">
            <div className="skew-x-[10deg]">2569 / 1</div>
          </div>
        </div>
      </header>

      {/* ── Grid ── */}
      <main className="max-w-[1400px] mx-auto overflow-x-auto pb-8">
        <div className="min-w-[1100px] bg-[#121212] border border-[#222] shadow-[8px_8px_0px_0px_rgba(255,92,0,0.05)]">
          <div className="grid grid-cols-[80px_repeat(10,1fr)] gap-[1px] bg-[#222]">

            {/* Corner */}
            <div className="bg-[#121212] p-3 flex items-end justify-end border-b-2 border-[#ff5c00]">
              <span className="text-[9px] text-[#666] font-bold uppercase tracking-widest">Day/Time</span>
            </div>

            {/* Time Headers */}
            {TIMES.map((time) => (
              <div key={time} className="bg-[#121212] p-3 flex items-end justify-center border-b-2 border-[#2a2a2a]">
                <span className="text-[#a0a0a0] text-[11px] font-bold tracking-wider">{time}</span>
              </div>
            ))}

            {/* Day Rows + Empty Cells */}
            {DAYS.map((day, rowIdx) => (
              <React.Fragment key={day}>
                <div
                  className="bg-[#181818] text-white font-bold text-sm flex items-center justify-center p-3 relative group"
                  style={{ gridRowStart: rowIdx + 2, gridColumnStart: 1 }}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#333] group-hover:bg-[#ff5c00] transition-colors" />
                  {day}
                </div>

                {TIMES.map((_, colIdx) => (
                  <div
                    key={colIdx}
                    className="bg-[#0f0f0f] relative"
                    style={{ gridRowStart: rowIdx + 2, gridColumnStart: colIdx + 2 }}
                  >
                    <div className="absolute inset-0 m-auto w-[2px] h-[2px] bg-[#1f1f1f]" />
                  </div>
                ))}
              </React.Fragment>
            ))}

            {/* Class Cards */}
            {CLASSES.map((cls) => (
              <ClassCard key={`${cls.code}-${cls.row}-${cls.colStart}`} {...cls} />
            ))}

          </div>
        </div>
      </main>
    </div>
  );
}