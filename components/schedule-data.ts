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
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
  "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
];

export const CLASSES: ClassSession[] = [
  {"name":"อินเทอร์เน็ตในทุกสิ่ง","code":"10301361","day":"mon","start":"10:00","end":"12:00","room":"Lab คอม2 (105)","section":"1","type":"LEC"},
  {"name":"วิศวกรรมการพัฒนาปฏิบัติการบนคลาวด์","code":"10301347","day":"mon","start":"13:00","end":"15:00","room":"Lab คอม2 (105)","section":"1","type":"LEC"},
  {"name":"การออกกำลังกายเพื่อเสริมสร้างสมรรถภาพ","code":"10700252","day":"mon","start":"15:00","end":"17:00","room":"สังคม 202 (102)","section":"11","type":"LEC"},
  {"name":"การประยุกต์ใช้โปรแกรมสำเร็จรูปทางธุรกิจ","code":"10200503","day":"mon","start":"17:00","end":"21:00","room":"BA 206 (107)","section":"7","type":"LEC"},
  {"name":"วิศวกรรมการพัฒนาปฏิบัติการบนคลาวด์","code":"10301347","day":"tue","start":"09:00","end":"12:00","room":"Lab คอม2 (105)","section":"1","type":"LAB"},
  {"name":"การสร้างสรรค์และนวัตกรรม","code":"10307121","day":"tue","start":"13:00","end":"15:00","room":"วิทย์ 2205 (105)","section":"1","type":"LEC"},
  {"name":"นานาสาระเกี่ยวกับอาหารและยา","code":"10400406","day":"tue","start":"15:00","end":"16:30","room":"ศร301 (125)","section":"1","type":"LEC"},
  {"name":"อินเทอร์เน็ตในทุกสิ่ง","code":"10301361","day":"thu","start":"10:00","end":"13:00","room":"Lab คอม2 (105)","section":"1","type":"LAB"},
  {"name":"การออกกำลังกายเพื่อเสริมสร้างสมรรถภาพ","code":"10700252","day":"thu","start":"15:00","end":"17:00","room":"สังคม 202 (102)","section":"11","type":"LAB"},
  {"name":"การสร้างสรรค์และนวัตกรรม","code":"10307121","day":"fri","start":"13:00","end":"15:00","room":"วิทย์ 2205 (105)","section":"1","type":"LAB"},
  {"name":"นานาสาระเกี่ยวกับอาหารและยา","code":"10400406","day":"fri","start":"15:00","end":"16:30","room":"ศร301 (125)","section":"1","type":"LEC"},
];

export const COURSE_TONES: Record<string, string> = {
  "10301361": "mint",
  "10301347": "orange",
  "10700252": "sky",
  "10200503": "violet",
  "10307121": "yellow",
  "10400406": "paper",
};

export function getSessionTime(session: ClassSession) {
  return `${session.start}–${session.end}`;
}

function timeToHalfHourColumn(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 2 + (minutes >= 30 ? 1 : 0) - 16;
}

export function getSessionGrid(session: ClassSession) {
  return {
    gridRowStart: DAYS.findIndex(day => day.id === session.day) + 2,
    gridColumnStart: timeToHalfHourColumn(session.start),
    gridColumnEnd: timeToHalfHourColumn(session.end),
  };
}
