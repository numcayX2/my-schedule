# ZZZ Design Spec for my-schedule (draft v1, รอตรวจ)

ที่มา: วิเคราะห์ภาพ in-game UI 79 ภาพ (C:\Users\Acer\Pictures\ZZZ_finetune)
ข้อจำกัด: ค่า hex เป็นค่าประมาณจากภาพย่อ ควรเก็บสีจริงด้วย eyedropper จากภาพต้นฉบับก่อน lock ค่าสุดท้าย
การตัดสินใจจากผู้ใช้: ตามเกมจริง อนุญาต pill และ capsule (ไม่ใช้กฎมุมคมเดิม)

---

## 1. หลักการ

1. ความอ่านง่ายของตารางเรียนมาก่อนความรก ลายเซ็นของ ZZZ ใส่ที่กรอบ พื้นหลัง และจุดเน้น ไม่ใส่ในเนื้อหาตาราง
2. ฐานมืดด้านเสมอ สีเน้นมีเพียงสีเดียวหลัก (เหลือง-lime) ใช้น้อยแต่ตัดแรง
3. ทุกหน้าจอเป็น "วัตถุ" (diegetic): การ์ดเหมือนเทป VHS, binder, ป้ายสติกเกอร์ ไม่ใช่แผง flat เฉย ๆ
4. รูปทรงขัดกันโดยตั้งใจ: การ์ดและแท็บเฉียง 45° เทียบกับปุ่มและ chip แบบ pill
5. ตัวเลขเป็นพระเอก (เวลา วัน ห้อง ระดับ) ขนาดใหญ่ หนา tabular

## 2. Color tokens

| Token | ค่า (ประมาณ) | ใช้กับ |
|---|---|---|
| `--bg-base` | `#101114` | พื้นหลังหลัก |
| `--bg-panel` | `#1A1B1F` | แผงและการ์ด |
| `--bg-raised` | `#23252A` | hover, แถวสลับ, ช่องว่าง |
| `--line` | `#353940` | เส้นแบ่ง, กริด |
| `--text` | `#FFFFFF` | ข้อความหลัก |
| `--text-muted` | `#A3A6AB` | ข้อความรอง, รายการ inactive |
| `--accent` | `#E5FE10` | active, focus, CTA, วันนี้ (สีเดียวที่เป็นพระเอก) |
| `--accent-ink` | `#101114` | ตัวอักษรบนพื้น accent |
| `--warn` | `#FF6600` | แจ้งเตือน, hazard stripe, งานใกล้กำหนด |
| `--danger` | `#FF3B30` | ปุ่มปิด, ยกเลิก, ลบ |
| `--info` | `#00E5FF` | ข้อมูลเสริม, สถานะ (ใช้เฉพาะจุด) |

กฎสี
- accent ไม่เกิน ~10% ของพื้นที่หน้า
- warn/danger/info ใช้ตามความหมายเท่านั้น ห้ามประดับ
- สีประจำวิชาหรือหมวด (ถ้ามี) ใช้เป็นแถบหรือขอบด้านซ้ายของการ์ด ห้ามระบายทั้งการ์ด
- ห้าม gradient ม่วง-ชมพู, ห้ามใช้สีขาวเป็นพื้นหลังใหญ่ (ยกเว้นการ์ดแบบ binder/กระดาษ `#EAE6DF` เป็นจุดเน้น)

## 3. Typography

| บทบาท | สไตล์ | ตัวอย่าง |
|---|---|---|
| Display | Anton (หนามาก condensed ตัวพิมพ์ใหญ่ เอียงได้ skewX -8°) | หัวหน้า, ชื่อวัน, "SCHEDULE" |
| Numeral | หนา tabular (`font-variant-numeric: tabular-nums`) | เวลา, วันที่ `23/11 MON` |
| Body | Prompt (sans-serif, รองรับภาษาไทย) น้ำหนัก 400/600/800 | ชื่อวิชา, ห้อง, อาจารย์ |
| Label | uppercase ตัวเล็ก letter-spacing กว้าง หรือ monospace | `ROOM`, `SEC`, serial stamp |
| Watermark | display ขนาดยักษ์ opacity 4-8% วางหลังแผง | "MON", "TERM 2", ตัวเลขชั้น |

กฎ: หัวข้อภาษาอังกฤษตัวพิมพ์ใหญ่เป็นกราฟิกคู่กับข้อความไทย ข้อความไทยที่อ่านจริงใช้ body ไม่ใช้ display เอียง (ฟอนต์ไทยเอียงเทียมอ่านยาก)

## 4. รูปทรง (shape language)

- **การ์ด / แท็บ / หัวข้อ:** เฉียงด้วย `clip-path` 45° (chamfer มุมเดียวหรือสองมุม) หรือ parallelogram (`skewX(-8deg)` พร้อม counter-skew ให้ข้อความตรง)
- **ปุ่ม / chip / toggle / filter:** pill (`border-radius: 9999px`)
- **ปุ่มปิด:** วงกลมสีแดงพร้อมกากบาท ลอยมุมขวาบน
- **ช่องว่าง (empty slot):** กรอบเส้นประหรือกากบาทเส้นบาง ไม่ปล่อยว่างเฉย
- **Focus bracket:** กรอบ accent หนา 3-4px พร้อม pip มุมทั้งสี่
- กรอบ container หลัก: เส้น `--line` 1-2px, ไม่ใช้ shadow นุ่ม ใช้ hard offset shadow (`4px 4px 0 #000`) แทน

## 5. Signature elements (ใส่ให้ครบแต่ใช้อย่างประหยัด)

1. **Hazard stripe:** ทแยง 45° เหลือง/ดำ ใช้กับขอบแท็บ แถบแจ้งเตือน มาตรวัด (ไม่เกิน 1-2 จุดต่อหน้า)
2. **Halftone dots:** overlay บนภาพหรือมุมแผง opacity ต่ำ
3. **ป้ายสติกเกอร์:** `NEW!`/`TODAY` เป็นเทปเอียงสี่เหลี่ยมหรือ pill สี accent หมุน -3° ถึง -6°
4. **ข้อความหมุน 90°:** สันข้างแผง เช่น `WEEKLY`, `DATA FILE`
5. **Serial/barcode stamp:** รหัสเล็ก ๆ มุมการ์ด เช่น `CS121-SEC2` แบบ monospace
6. **Chevron:** `>` และ `>>` สำหรับ next/ลำดับ
7. **Grain/photocopy noise:** บน `--bg-base` (opacity 3-5%)
8. **ตัวอักษรยักษ์จาง** ด้านหลังแผง (ดู Watermark)

## 6. State และ motion

| State | พฤติกรรม |
|---|---|
| Inactive | สี `--text-muted`, พื้น `--bg-panel` |
| Hover | พื้น `--bg-raised`, ขยับ translate(-2px,-2px) พร้อม shadow offset เพิ่ม |
| Active/Focus | เติม `--accent` ทั้ง pill หรือกรอบ bracket |
| Today | แถบ accent + ป้าย `TODAY` |
| Transition | เร็วและคม 120-180ms, easing แบบ snap (`cubic-bezier(.2,.9,.2,1)`), ไม่ bounce นุ่ม |
| Enter | slide เฉียงเข้า (translate + skew) แบบ stagger ทีละการ์ด |

ต้องรองรับ `prefers-reduced-motion`

## 7. การแมปกับ my-schedule (ยังไม่ได้อ่านโค้ด ต้องตรวจก่อนลงมือ)

| ส่วนของเว็บ | แนวทาง |
|---|---|
| หัวหน้า | display เอียง + watermark ยักษ์ + serial stamp (เทอม/ปีการศึกษา) |
| แถบวัน | แท็บ parallelogram, วันนี้ = เติม accent |
| ตารางเวลา | เส้นกริด `--line` บาง, หัวเวลา tabular, พื้น panel |
| การ์ดวิชา | chamfer 1 มุม, แถบสีวิชาด้านซ้าย, เวลาเป็นตัวเลขใหญ่, ห้อง/section เป็น label |
| ป้ายสถานะ | เทปเอียง (`NOW`, `NEXT`) |
| ปุ่ม/ตัวกรอง | pill |
| พื้นหลัง | ตัวอักษรยักษ์จาง + grain, hazard stripe 1 จุด |

## 8. Do / Don't

Do
- ใช้ accent เฉพาะ active, focus, วันนี้
- ผสมมุมเฉียงกับ pill ในหน้าเดียวกัน
- ตัวเลขใหญ่ หนา tabular
- ให้ความตัดกันของข้อความผ่าน AA (ข้อความ 4.5:1)

Don't
- ห้ามระบายสีเน้นหลายสีพร้อมกันในหน้าเดียว
- ห้ามใช้ shadow นุ่มหรือ glassmorphism
- ห้ามใส่ลายเซ็นครบทุกอย่างในจุดเดียวจนรก
- ห้ามใช้ emoji, ห้ามข้อความโฆษณา
- ห้ามใช้ hazard stripe หรือ halftone ทับข้อความที่ต้องอ่าน
- ห้ามเอียงฟอนต์ไทยในข้อความยาว

## 9. การตัดสินใจและคำถามค้าง

ตัดสินใจแล้ว
- Display: **Anton** (Google Fonts), ใช้กับอังกฤษและตัวเลขเป็นหลัก
- Body และภาษาไทย: **Prompt** (sans-serif)
- Font stack: `"Anton", "Prompt", sans-serif` สำหรับ display, `"Prompt", system-ui, sans-serif` สำหรับ body

ยังค้าง
1. ต้องรักษา Radix UI Themes ต่อไป หรือเขียน CSS เองทั้งหมด
2. แก้ไขที่ยังไม่ commit 3 ไฟล์ (Schedule.css, Schedule.tsx, motion-presets.ts) ให้ commit ไว้ก่อนหรือต่อยอดทับ
3. โปรเจกต์ปัจจุบันใช้ Archivo + Kanit ใน app/layout.tsx ต้องเปลี่ยนเป็น Anton + Prompt ผ่าน next/font/google
