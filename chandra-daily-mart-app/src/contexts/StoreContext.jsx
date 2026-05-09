import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [settings, setSettings] = useState({
    isOpen: true,
    deliveryRadius: 5.0,
    morningDeliveryEnabled: true,
    morningCutoff: '23:00',
    minOrderValue: 99,
    deliveryCharge: 25,
    handlingCharge: 5,
    openingTime: '07:00',
    closingTime: '23:00',
    isAutoScheduleEnabled: true,
    isDeliveryChargeEnabled: true,
    isHandlingChargeEnabled: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial Fetch
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('*')
          .eq('id', 1)
          .single();
        
        if (data) {
          const mappedSettings = {
            isOpen: data.is_open,
            deliveryRadius: data.delivery_radius,
            morningDeliveryEnabled: data.morning_delivery_enabled,
            morningCutoff: data.morning_cutoff,
            minOrderValue: data.min_order_value || 0,
            deliveryCharge: data.delivery_charge || 0,
            handlingCharge: data.handling_charge || 0,
            openingTime: data.opening_time || '07:00',
            closingTime: data.closing_time || '23:00',
            isAutoScheduleEnabled: data.is_auto_schedule_enabled ?? true,
            isDeliveryChargeEnabled: data.is_delivery_charge_enabled ?? true,
            isHandlingChargeEnabled: data.is_handling_charge_enabled ?? true
          };
          setSettings(mappedSettings);
        }
      } catch (err) {
        console.error('Error fetching store settings:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();

    // 2. Realtime Subscription
    const channel = supabase
      .channel('store_settings_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'store_settings', filter: 'id=eq.1' },
        (payload) => {
          const mappedSettings = {
            isOpen: payload.new.is_open,
            deliveryRadius: payload.new.delivery_radius,
            morningDeliveryEnabled: payload.new.morning_delivery_enabled,
            morningCutoff: payload.new.morning_cutoff,
            minOrderValue: payload.new.min_order_value,
            deliveryCharge: payload.new.delivery_charge,
            handlingCharge: payload.new.handling_charge,
            openingTime: payload.new.opening_time,
            closingTime: payload.new.closing_time,
            isAutoScheduleEnabled: payload.new.is_auto_schedule_enabled,
            isDeliveryChargeEnabled: payload.new.is_delivery_charge_enabled,
            isHandlingChargeEnabled: payload.new.is_handling_charge_enabled
          };
          setSettings(mappedSettings);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateSettings = async (newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    
    // Convert back to DB columns
    const dbUpdate = {};
    if (newSettings.isOpen !== undefined) dbUpdate.is_open = newSettings.isOpen;
    if (newSettings.deliveryRadius !== undefined) dbUpdate.delivery_radius = newSettings.deliveryRadius;
    if (newSettings.morningDeliveryEnabled !== undefined) dbUpdate.morning_delivery_enabled = newSettings.morningDeliveryEnabled;
    if (newSettings.morningCutoff !== undefined) dbUpdate.morning_cutoff = newSettings.morningCutoff;
    if (newSettings.minOrderValue !== undefined) dbUpdate.min_order_value = newSettings.minOrderValue;
    if (newSettings.deliveryCharge !== undefined) dbUpdate.delivery_charge = newSettings.deliveryCharge;
    if (newSettings.handlingCharge !== undefined) dbUpdate.handling_charge = newSettings.handlingCharge;
    if (newSettings.openingTime !== undefined) dbUpdate.opening_time = newSettings.openingTime;
    if (newSettings.closingTime !== undefined) dbUpdate.closing_time = newSettings.closingTime;
    if (newSettings.isAutoScheduleEnabled !== undefined) dbUpdate.is_auto_schedule_enabled = newSettings.isAutoScheduleEnabled;
    if (newSettings.isDeliveryChargeEnabled !== undefined) dbUpdate.is_delivery_charge_enabled = newSettings.isDeliveryChargeEnabled;
    if (newSettings.isHandlingChargeEnabled !== undefined) dbUpdate.is_handling_charge_enabled = newSettings.isHandlingChargeEnabled;

    dbUpdate.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('store_settings')
      .update(dbUpdate)
      .eq('id', 1);
    
    if (error) {
      console.warn('Failed to update DB settings', error);
    }
  };

  const isCurrentlyOpen = (() => {
    if (!settings.isOpen) return false;
    if (!settings.isAutoScheduleEnabled) return true;
    
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    return currentTime >= settings.openingTime && currentTime < settings.closingTime;
  })();

  return (
    <StoreContext.Provider value={{ ...settings, updateSettings, loading, isCurrentlyOpen }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
