export const DAYS = [
  { id: "mon", short: "จ.", label: "MONDAY", name: "วันจันทร์", index: "01" },
  { id: "tue", short: "อ.", label: "TUESDAY", name: "วันอังคาร", index: "02" },
  { id: "wed", short: "พ.", label: "WEDNESDAY", name: "วันพุธ", index: "03" },
  { id: "thu", short: "พฤ.", label: "THURSDAY", name: "วันพฤหัสบดี", index: "04" },
  { id: "fri", short: "ศ.", label: "FRIDAY", name: "วันศุกร์", index: "05" },
] as const;

export type DayId = (typeof DAYS)[number]["id"];

export interface ClassSession {
  name: string;
  code: string;
  day: DayId;
  start: string;
  end: string;
  room: string;
  section: string;
  type: "LEC" | "LAB";
}

export const TIMES = [
  "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00",
];

export const CLASSES: ClassSession[] = [
  {"name":"วิทยาการข้อมูล","code":"10301351","day":"mon","start":"10:00","end":"12:00","room":"105","section":"2","type":"LEC"},
  {"name":"ตรรกศาสตร์เชิงดิจิทัลฯ","code":"10301364","day":"mon","start":"13:00","end":"15:00","room":"105","section":"1","type":"LAB"},
  {"name":"ภาษาอังกฤษเพื่อการศึกษาฯ","code":"10700320","day":"mon","start":"15:00","end":"17:00","room":"147","section":"2","type":"LEC"},
  {"name":"ปัญญาประดิษฐ์","code":"10301371","day":"tue","start":"10:00","end":"12:00","room":"141","section":"1","type":"LEC"},
  {"name":"วิทยาการข้อมูล","code":"10301351","day":"tue","start":"13:00","end":"16:00","room":"105","section":"2","type":"LAB"},
  {"name":"วิทยาศาสตร์เพื่อชีวิต","code":"10300411","day":"tue","start":"17:00","end":"19:00","room":"141","section":"5","type":"LEC"},
  {"name":"ตรรกศาสตร์เชิงดิจิทัลฯ","code":"10301364","day":"thu","start":"09:00","end":"12:00","room":"105","section":"1","type":"LAB"},
  {"name":"การประมวลผลภาษาธรรมชาติ","code":"10301374","day":"thu","start":"13:00","end":"15:00","room":"105","section":"1","type":"LEC"},
  {"name":"ภาษาอังกฤษเพื่อการศึกษาฯ","code":"10700320","day":"thu","start":"15:00","end":"17:00","room":"147","section":"2","type":"LEC"},
  {"name":"การประมวลผลภาษาธรรมชาติ","code":"10301374","day":"fri","start":"09:00","end":"12:00","room":"105","section":"1","type":"LAB"},
  {"name":"ปัญญาประดิษฐ์","code":"10301371","day":"fri","start":"13:00","end":"16:00","room":"105","section":"1","type":"LAB"},
  {"name":"วิทยาศาสตร์เพื่อชีวิต","code":"10300411","day":"fri","start":"17:00","end":"19:00","room":"141","section":"5","type":"LEC"},
];

export const COURSE_TONES: Record<string, string> = {
  "10301351": "acid",
  "10301364": "orange",
  "10700320": "sky",
  "10301371": "violet",
  "10300411": "yellow",
  "10301374": "paper",
};

export function getSessionTime(session: ClassSession) {
  return `${session.start}–${session.end}`;
}

export function getSessionGrid(session: ClassSession) {
  return {
    gridRowStart: DAYS.findIndex(day => day.id === session.day) + 2,
    gridColumnStart: Number(session.start.slice(0, 2)) - 7,
    gridColumnEnd: Number(session.end.slice(0, 2)) - 7,
  };
}
