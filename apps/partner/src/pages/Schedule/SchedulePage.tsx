import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import scheduleService, { type ScheduleResponse } from '../../services/scheduleService';
import restaurantService, { type RestaurantResponse } from '../../services/restaurantService';
import './SchedulePage.css';

const DAY_NAMES_VI = ['', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
const DAY_NAMES_EN = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT_VI = ['', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

interface DaySchedule {
    dayOfWeek: number;
    enabled: boolean;
    openTime: string;
    closeTime: string;
    scheduleId: number | null;
    dirty: boolean;
}

const SchedulePage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isVi = i18n.language === 'vi';
    const dayNames = isVi ? DAY_NAMES_VI : DAY_NAMES_EN;

    const [restaurant, setRestaurant] = useState<RestaurantResponse | null>(null);
    const [days, setDays] = useState<DaySchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => { loadData(); }, []);
    useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); } }, [toast]);

    const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

    const loadData = async () => {
        try {
            setLoading(true);
            const restaurantId = localStorage.getItem('currentRestaurantId');
            if (!restaurantId) return;
            const restData = await restaurantService.getRestaurantById(Number(restaurantId));
            if (!restData?.result) return;
            setRestaurant(restData.result);

            let existing: ScheduleResponse[] = [];
            try {
                const s = await scheduleService.getByRestaurant(restData.result.slug);
                if (s?.result) existing = s.result;
            } catch { /* none */ }

            const weekDays: DaySchedule[] = [];
            for (let d = 1; d <= 7; d++) {
                const ex = existing.find(s => s.dayOfWeek === d);
                weekDays.push(ex ? {
                    dayOfWeek: d, enabled: true,
                    openTime: ex.openTime.substring(0, 5),
                    closeTime: ex.closeTime.substring(0, 5),
                    scheduleId: ex.id, dirty: false,
                } : {
                    dayOfWeek: d, enabled: false,
                    openTime: '08:00', closeTime: '22:00',
                    scheduleId: null, dirty: false,
                });
            }
            setDays(weekDays);
        } catch (error) {
            console.error('Failed to load schedule:', error);
            showToast(t('common.error'), 'error');
        } finally { setLoading(false); }
    };

    const toggleDay = (dow: number) =>
        setDays(prev => prev.map(d => d.dayOfWeek === dow ? { ...d, enabled: !d.enabled, dirty: true } : d));

    const updateTime = (dow: number, field: 'openTime' | 'closeTime', value: string) =>
        setDays(prev => prev.map(d => d.dayOfWeek === dow ? { ...d, [field]: value, dirty: true } : d));

    const applyToAll = (srcDow: number) => {
        const src = days.find(d => d.dayOfWeek === srcDow);
        if (!src) return;
        setDays(prev => prev.map(d => ({ ...d, enabled: true, openTime: src.openTime, closeTime: src.closeTime, dirty: true })));
    };

    const saveAll = async () => {
        if (!restaurant) return;
        const dirtyDays = days.filter(d => d.dirty);
        if (!dirtyDays.length) { showToast(isVi ? 'Không có thay đổi' : 'No changes', 'success'); return; }
        setSaving(true);
        try {
            for (const day of dirtyDays) {
                if (day.enabled) {
                    const payload = { dayOfWeek: day.dayOfWeek, openTime: day.openTime + ':00', closeTime: day.closeTime + ':00', restaurantId: restaurant.id };
                    day.scheduleId ? await scheduleService.update(day.scheduleId, payload) : await scheduleService.create(payload);
                } else if (day.scheduleId) {
                    await scheduleService.delete(day.scheduleId);
                }
            }
            showToast(isVi ? 'Đã lưu lịch hoạt động!' : 'Schedule saved!', 'success');
            await loadData();
        } catch (error: any) {
            showToast(error?.response?.data?.message || t('common.error'), 'error');
        } finally { setSaving(false); }
    };

    const hasDirty = days.some(d => d.dirty);
    const enabledCount = days.filter(d => d.enabled).length;
    const now = new Date();
    const todayDow = now.getDay() === 0 ? 7 : now.getDay();

    if (loading) {
        return (
            <DashboardLayout pageTitle={t('schedule.title')}>
                <div className="sched-loading"><div className="sched-loader"></div><p>{t('common.loading')}</p></div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout pageTitle={t('schedule.title')}>
            <div className="sched-page">
                {/* Header */}
                <div className="sched-header">
                    <div className="sched-header-left">
                        <h2>{t('schedule.title')}</h2>
                        <p>{t('schedule.desc')}</p>
                    </div>
                    <div className="sched-header-right">
                        <div className="sched-counter">{enabledCount}<span>/7</span></div>
                        <button className="sched-save-btn" onClick={saveAll} disabled={saving || !hasDirty}>
                            {saving ? <><span className="sched-btn-spin"></span>{isVi ? 'Đang lưu...' : 'Saving...'}</> : <>{t('schedule.saveAll')}</>}
                        </button>
                    </div>
                </div>

                {/* Week Mini Bar */}
                <div className="sched-week-bar">
                    {days.map(day => (
                        <div key={day.dayOfWeek}
                            className={`sched-week-chip ${day.enabled ? 'on' : ''} ${day.dayOfWeek === todayDow ? 'now' : ''}`}
                            onClick={() => toggleDay(day.dayOfWeek)}>
                            {DAY_SHORT_VI[day.dayOfWeek]}
                        </div>
                    ))}
                </div>

                {/* Day Cards */}
                <div className="sched-grid">
                    {days.map(day => (
                        <div key={day.dayOfWeek}
                            className={`sched-card ${day.enabled ? 'on' : 'off'} ${day.dayOfWeek === todayDow ? 'today' : ''} ${day.dirty ? 'changed' : ''}`}>
                            <div className="sched-card-top">
                                <div className="sched-card-name">
                                    <h3>{dayNames[day.dayOfWeek]}</h3>
                                    {day.dayOfWeek === todayDow && <span className="sched-today-dot"></span>}
                                </div>
                                <label className="sched-switch">
                                    <input type="checkbox" checked={day.enabled} onChange={() => toggleDay(day.dayOfWeek)} />
                                    <span className="sched-switch-track"></span>
                                </label>
                            </div>

                            {day.enabled ? (
                                <div className="sched-card-body">
                                    <div className="sched-times">
                                        <div className="sched-time-box">
                                            <span className="sched-time-label">{t('schedule.openTime')}</span>
                                            <input type="time" value={day.openTime} onChange={e => updateTime(day.dayOfWeek, 'openTime', e.target.value)} />
                                        </div>
                                        <span className="sched-time-sep">—</span>
                                        <div className="sched-time-box">
                                            <span className="sched-time-label">{t('schedule.closeTime')}</span>
                                            <input type="time" value={day.closeTime} onChange={e => updateTime(day.dayOfWeek, 'closeTime', e.target.value)} />
                                        </div>
                                    </div>
                                    <button className="sched-apply-btn" onClick={() => applyToAll(day.dayOfWeek)}>
                                        {isVi ? 'Áp dụng cho tất cả ngày' : 'Apply to all days'}
                                    </button>
                                </div>
                            ) : (
                                <div className="sched-card-off">
                                    <span>{isVi ? 'Đóng cửa' : 'Closed'}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Tip */}
                <div className="sched-tip">
                    {isVi
                        ? 'Bật/tắt từng ngày, chỉnh giờ rồi nhấn "Lưu tất cả" để lưu. Dùng "Áp dụng cho tất cả ngày" để copy nhanh.'
                        : 'Toggle days, adjust times, then click "Save All". Use "Apply to all days" to copy quickly.'}
                </div>

                {toast && (
                    <div className={`sched-toast ${toast.type}`}>
                        {toast.type === 'success' ? '✓' : '✕'} {toast.message}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default SchedulePage;
