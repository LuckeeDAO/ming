import { convertBirthToFourPillars } from '../energy/fourPillarsConverter';
import tenGodService from '../energy/tenGodService';
import lunar from '@tony801015/chinese-lunar';

export interface LocalBaziBaseline {
  inputCalendar: 'solar' | 'lunar';
  dateText: string;
  solarDateText: string;
  lunarDateText: string;
  fourPillars: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  tenGodStems: {
    year: string | null;
    month: string | null;
    day: string | null;
    hour: string | null;
  };
}

const CHINESE_DIGIT_MAP: Record<string, number> = {
  '零': 0,
  '〇': 0,
  '一': 1,
  '二': 2,
  '三': 3,
  '四': 4,
  '五': 5,
  '六': 6,
  '七': 7,
  '八': 8,
  '九': 9,
};

const SHICHEN_HOUR_MAP: Record<string, number> = {
  '子': 23,
  '丑': 1,
  '寅': 3,
  '卯': 5,
  '辰': 7,
  '巳': 9,
  '午': 11,
  '未': 13,
  '申': 15,
  '酉': 17,
  '戌': 19,
  '亥': 21,
};

function parseChineseMonth(text: string): number | null {
  const clean = text.replace(/[月]/g, '').trim();
  if (!clean) return null;
  if (clean === '正') return 1;
  if (clean === '冬') return 11;
  if (clean === '腊' || clean === '臘') return 12;
  if (clean === '十一') return 11;
  if (clean === '十二') return 12;
  if (clean === '十') return 10;
  const single = CHINESE_DIGIT_MAP[clean];
  if (single) return single;
  if (clean.startsWith('十')) {
    const d = CHINESE_DIGIT_MAP[clean.slice(1)];
    return d ? 10 + d : null;
  }
  return null;
}

function parseChineseDay(text: string): number | null {
  const clean = text.replace(/[日号號]/g, '').trim();
  if (!clean) return null;
  if (clean === '三十') return 30;
  if (clean === '二十') return 20;
  if (clean === '初十') return 10;

  if (clean.startsWith('初')) {
    const d = CHINESE_DIGIT_MAP[clean.slice(1)];
    return d ?? null;
  }
  if (clean.startsWith('十')) {
    const tail = clean.slice(1);
    if (!tail) return 10;
    const d = CHINESE_DIGIT_MAP[tail];
    return d ? 10 + d : null;
  }
  if (clean.startsWith('廿')) {
    const tail = clean.slice(1);
    if (!tail) return 20;
    const d = CHINESE_DIGIT_MAP[tail];
    return d ? 20 + d : null;
  }
  if (clean.startsWith('卅')) {
    const tail = clean.slice(1);
    if (!tail) return 30;
    const d = CHINESE_DIGIT_MAP[tail];
    return d ? 30 + d : null;
  }
  return null;
}

function parseHourFromText(text: string): number {
  let hour = 12;
  const hhmm = text.match(/(\d{1,2})\s*:\s*(\d{1,2})/);
  const hhPoint = text.match(/(\d{1,2})\s*点/);
  const shichen = text.match(/([子丑寅卯辰巳午未申酉戌亥])时/);

  if (hhmm) hour = Number(hhmm[1]);
  else if (hhPoint) hour = Number(hhPoint[1]);
  else if (shichen) hour = SHICHEN_HOUR_MAP[shichen[1]];

  if (!Number.isFinite(hour) || hour < 0 || hour > 23) return 12;
  return hour;
}

function parseBirthFromText(text: string): {
  year: number;
  month: number;
  day: number;
  hour: number;
  calendar: 'solar' | 'lunar';
  lunarLeap: boolean;
} | null {
  const dateMatch = text.match(/(\d{4})\s*[-/.年]\s*(\d{1,2})\s*[-/.月]\s*(\d{1,2})\s*日?/);
  const lunarTextMatch = text.match(
    /(农历|陰历|阴历|農曆)\s*(\d{4})\s*年\s*(闰|閏)?\s*([正冬腊臘一二三四五六七八九十]{1,3})\s*月\s*([初十廿卅一二三四五六七八九]{1,3})/
  );

  let y: number;
  let m: number;
  let d: number;

  if (dateMatch) {
    y = Number(dateMatch[1]);
    m = Number(dateMatch[2]);
    d = Number(dateMatch[3]);
  } else if (lunarTextMatch) {
    y = Number(lunarTextMatch[2]);
    const cm = parseChineseMonth(lunarTextMatch[4]);
    const cd = parseChineseDay(lunarTextMatch[5]);
    if (!cm || !cd) return null;
    m = cm;
    d = cd;
  } else {
    return null;
  }

  const isLunar = /(农历|陰历|阴历|農曆)/i.test(text);
  const lunarLeap = /闰|閏/.test(text);
  const hour = parseHourFromText(text);

  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d) || !Number.isFinite(hour)) {
    return null;
  }
  if (m < 1 || m > 12 || d < 1 || d > 31 || hour < 0 || hour > 23) {
    return null;
  }
  return {
    year: y,
    month: m,
    day: d,
    hour,
    calendar: isLunar ? 'lunar' : 'solar',
    lunarLeap,
  };
}

export function buildLocalBaziBaselineFromText(text: string): LocalBaziBaseline | null {
  const parsed = parseBirthFromText(text);
  if (!parsed) return null;

  let solarYear = parsed.year;
  let solarMonth = parsed.month;
  let solarDay = parsed.day;

  if (parsed.calendar === 'lunar') {
    const lunarApp = lunar(String(parsed.year), String(parsed.month).padStart(2, '0'), String(parsed.day).padStart(2, '0'));
    const solarApp = lunarApp.lunarToSolar(parsed.lunarLeap);
    solarYear = Number(solarApp.year);
    solarMonth = Number(solarApp.month);
    solarDay = Number(solarApp.day);
  }

  const solarApp = lunar(String(solarYear), String(solarMonth).padStart(2, '0'), String(solarDay).padStart(2, '0'));
  solarApp.setTime(String(parsed.hour).padStart(2, '0'));
  const solarJson = solarApp.getJson();

  const fourPillars = convertBirthToFourPillars(solarYear, solarMonth, solarDay, parsed.hour);
  const tenGods = tenGodService.calculateTenGods(fourPillars);

  return {
    inputCalendar: parsed.calendar,
    dateText: `${parsed.year}-${String(parsed.month).padStart(2, '0')}-${String(parsed.day).padStart(2, '0')} ${String(parsed.hour).padStart(2, '0')}:00`,
    solarDateText: `${String(solarYear).padStart(4, '0')}-${String(solarMonth).padStart(2, '0')}-${String(solarDay).padStart(2, '0')} ${String(parsed.hour).padStart(2, '0')}:00`,
    lunarDateText: `${solarJson.lunarMonth}${solarJson.lunarDay}${parsed.lunarLeap ? '（闰月输入）' : ''}`,
    fourPillars,
    tenGodStems: {
      year: tenGods.year,
      month: tenGods.month,
      day: tenGods.day,
      hour: tenGods.hour,
    },
  };
}

export function formatLocalBaziBaseline(b: LocalBaziBaseline): string {
  return [
    '【本地权威排盘基线（必须优先采用，不可改写）】',
    `- 输入历法: ${b.inputCalendar === 'lunar' ? '农历/阴历' : '公历/阳历'}`,
    `- 出生时间(原始解析): ${b.dateText}`,
    `- 阳历标准时间: ${b.solarDateText}`,
    `- 农历对应时间: ${b.lunarDateText}`,
    `- 四柱: 年柱=${b.fourPillars.year} 月柱=${b.fourPillars.month} 日柱=${b.fourPillars.day} 时柱=${b.fourPillars.hour}`,
    `- 十神(天干): 年=${b.tenGodStems.year || '未知'} 月=${b.tenGodStems.month || '未知'} 日=${b.tenGodStems.day || '未知'} 时=${b.tenGodStems.hour || '未知'}`,
    '- 若你内部推算结果与上述不同，一律以上述本地排盘为准，仅做解释，不重新排盘。',
  ].join('\n');
}
