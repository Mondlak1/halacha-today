import { HebrewCalendar, HDate, Location } from '@hebcal/core';
import { DayType } from '../types/data';

export interface HebcalEvent {
  name: string;
  date: string;
  type: DayType;
}

export interface Zmanim {
  candleLighting?: string;
  havdalah?: string;
  shema?: string;
  shacharit?: string;
  minchaGedola?: string;
  minchaKetana?: string;
  location: string;
}

export interface HebcalDayData {
  date: string;
  events: HebcalEvent[];
  dayType: DayType;
  zmanim: Zmanim;
}

export async function getHebcalDayData(city = 'Jerusalem'): Promise<HebcalDayData> {
  const today = new HDate();
  const location = Location.lookup(city);

  const options = {
    start: today,
    end: today,
    location,
    candlelighting: true,
    sedrot: true,
    omer: true,
  };

  const events = HebrewCalendar.calendar(options);
  const eventNames = events.map(ev => ev.render('en'));

  // Determine day type based on events
  let dayType: DayType = 'regular';
  
  if (eventNames.some(name => name.includes('Shabbat'))) {
    dayType = 'shabbat';
  } else if (eventNames.some(name => 
    name.includes('Rosh Hashanah') || 
    name.includes('Yom Kippur') || 
    name.includes('Sukkot') || 
    name.includes('Pesach') || 
    name.includes('Shavuot')
  )) {
    dayType = 'yomTov';
  } else if (eventNames.some(name => 
    name.includes('Tisha B\'Av') || 
    name.includes('Yom Kippur') || 
    name.includes('Fast of')
  )) {
    dayType = 'fastDay';
  }

  const hebcalEvents: HebcalEvent[] = events.map(ev => ({
    name: ev.render('en'),
    date: ev.getDate().toString(),
    type: dayType
  }));

  return {
    date: today.toString(),
    events: hebcalEvents,
    dayType,
    zmanim: {
      location: city
    }
  };
}

export function getDayTypeFromEvents(eventNames: string[]): DayType {
  if (eventNames.some(name => name.includes('Shabbat'))) {
    return 'shabbat';
  }
  
  if (eventNames.some(name => 
    name.includes('Rosh Hashanah') || 
    name.includes('Yom Kippur') || 
    name.includes('Sukkot') || 
    name.includes('Pesach') || 
    name.includes('Shavuot')
  )) {
    return 'yomTov';
  }
  
  if (eventNames.some(name => 
    name.includes('Tisha B\'Av') || 
    name.includes('Yom Kippur') || 
    name.includes('Fast of')
  )) {
    return 'fastDay';
  }
  
  return 'regular';
} 