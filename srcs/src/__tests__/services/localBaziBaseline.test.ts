import { describe, expect, it } from 'vitest';
import {
  buildLocalBaziBaselineFromText,
  formatLocalBaziBaseline,
} from '../../services/ai/localBaziBaseline';

describe('localBaziBaseline', () => {
  it('parses solar input and builds baseline', () => {
    const baseline = buildLocalBaziBaselineFromText(
      '阳历1995-08-14 09:30，杭州，女'
    );

    expect(baseline).not.toBeNull();
    expect(baseline?.inputCalendar).toBe('solar');
    expect(baseline?.solarDateText.startsWith('1995-08-14')).toBe(true);
    expect(baseline?.fourPillars.year).toHaveLength(2);
    expect(baseline?.fourPillars.month).toHaveLength(2);
    expect(baseline?.fourPillars.day).toHaveLength(2);
    expect(baseline?.fourPillars.hour).toHaveLength(2);
  });

  it('converts lunar numeric date to same baseline as solar date', () => {
    const fromSolar = buildLocalBaziBaselineFromText(
      '阳历1995-08-14 09:30，杭州，女'
    );
    const fromLunar = buildLocalBaziBaselineFromText(
      '农历1995-07-19 09:30，杭州，女'
    );

    expect(fromSolar).not.toBeNull();
    expect(fromLunar).not.toBeNull();
    expect(fromLunar?.inputCalendar).toBe('lunar');
    expect(fromLunar?.solarDateText.startsWith('1995-08-14')).toBe(true);

    expect(fromLunar?.fourPillars).toEqual(fromSolar?.fourPillars);
    expect(fromLunar?.tenGodStems).toEqual(fromSolar?.tenGodStems);
  });

  it('supports chinese lunar expression with shichen', () => {
    const baseline = buildLocalBaziBaselineFromText(
      '农历1995年七月十九巳时，杭州，女'
    );

    expect(baseline).not.toBeNull();
    expect(baseline?.inputCalendar).toBe('lunar');
    expect(baseline?.solarDateText.startsWith('1995-08-14 09:00')).toBe(true);
  });

  it('returns null when text has no parseable birth info', () => {
    const baseline = buildLocalBaziBaselineFromText('帮我看看事业');
    expect(baseline).toBeNull();
  });

  it('formats baseline into strict local context text', () => {
    const baseline = buildLocalBaziBaselineFromText(
      '阳历1995-08-14 09:30，杭州，女'
    );
    expect(baseline).not.toBeNull();

    const context = formatLocalBaziBaseline(baseline!);
    expect(context).toContain('本地权威排盘基线');
    expect(context).toContain('阳历标准时间');
    expect(context).toContain('四柱');
    expect(context).toContain('十神(天干)');
  });
});
