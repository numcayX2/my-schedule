import React from 'react';

export default function Schedule() {
  const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์'];

  // Updated to match the specific time ranges in the provided image
  const times = [
    '9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00',
    '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00', '18:00-19:00'
  ];

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white p-4 md:p-8 font-sans antialiased overflow-x-auto">

      {/* Header */}
      <div className="mb-6 border-l-4 border-[#ff5c00] pl-3">
        <h1 className="text-xl font-bold uppercase tracking-widest text-white">
          Schedule <span className="text-[#ff5c00]">2569/1</span>
        </h1>
      </div>

      {/* Schedule Grid Container */}
      <div className="min-w-[1000px] relative border border-[#333333]">
        <div className="grid grid-cols-[80px_repeat(10,1fr)] gap-[1px] bg-[#333333]">

          {/* Timeline Header Row */}
          <div className="bg-[#1a1a1a] p-2 flex items-center justify-center text-xs font-semibold text-[#8c8c8c]">
            Day/Time
          </div>
          {times.map((time, idx) => (
            <div key={idx} className="bg-[#1a1a1a] p-2 flex items-center justify-center text-[11px] font-bold text-[#8c8c8c] whitespace-nowrap tracking-wide">
              {time}
            </div>
          ))}

          {/* Base Layer: Day Headers and Empty Cells */}
          {days.map((day, rowIdx) => (
            <React.Fragment key={day}>
              {/* Day Name Column */}
              <div
                className="bg-[#1a1a1a] text-[#ff5c00] font-bold text-sm flex items-center justify-center p-2"
                style={{ gridRowStart: rowIdx + 2, gridColumnStart: 1 }}
              >
                {day}
              </div>

              {/* Empty Slots Filler */}
              {times.map((_, colIdx) => (
                <div
                  key={colIdx}
                  className="bg-[#0d0d0d]"
                  style={{ gridRowStart: rowIdx + 2, gridColumnStart: colIdx + 2 }}
                />
              ))}
            </React.Fragment>
          ))}

          {/* Class Data Layer */}

          {/* Monday */}
          <ClassCard name="วิทยาการข้อมูล" code="10301351" detail="บรรยาย คอม 6 | 105" row={2} colStart={3} colEnd={5} />
          <ClassCard name="ตรรกศาสตร์เชิงดิจิทัลและอุปกรณ์อัจฉริยะ" code="10301364" detail="Lab คอม 2 | 105" row={2} colStart={6} colEnd={8} />
          <ClassCard name="ภาษาอังกฤษเพื่อการศึกษาต่อและการประกอบอาชีพ" code="10700320" detail="80-501 | 147" row={2} colStart={8} colEnd={10} />

          {/* Tuesday */}
          <ClassCard name="ปัญญาประดิษฐ์" code="10301371" detail="3203 | 141" row={3} colStart={3} colEnd={5} />
          <ClassCard name="วิทยาการข้อมูล" code="10301351" detail="Lab คอม 2 | 105" row={3} colStart={6} colEnd={9} />
          <ClassCard name="วิทยาศาสตร์เพื่อชีวิต" code="10300411" detail="3102 | 141" row={3} colStart={10} colEnd={12} />

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
      className="bg-[#1a1a1a] border-l-[3px] border-[#ff5c00] p-3 flex flex-col justify-center transition-colors duration-200 hover:bg-[#262626] z-10 cursor-default"
      style={{
        gridRowStart: row,
        gridColumnStart: colStart,
        gridColumnEnd: colEnd
      }}
    >
      <div className="text-[13px] font-bold text-white mb-1 leading-snug">{name}</div>
      <div className="text-[11px] text-[#ff5c00] font-semibold mb-[2px]">{code}</div>
      <div className="text-[11px] text-[#8c8c8c]">{detail}</div>
    </div>
  );
}