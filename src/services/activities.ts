import AsyncStorage from '@react-native-async-storage/async-storage';
import { Activity, ActivityStatus, CustomType, DayType, ActivityCategory } from '../types/data';
import { makeApiRequest } from './apiService';

// Key for storing activities in AsyncStorage
const ACTIVITIES_STORAGE_KEY = 'halacha_today_activities';

export const ACTIVITIES: Activity[] = [
  // Shabbat & Holidays
  {
    id: 'shabbat_lighting',
    title: 'Light Shabbat Candles',
    description: 'Light candles to welcome Shabbat',
    category: 'Shabbat & Holidays',
    isPermitted: false,
    notes: 'Must be done before sunset',
    defaultStatus: 'forbidden',
    statusByDay: {
      regular: 'forbidden',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Candle lighting is only done for Shabbat and holidays.',
      shabbat: 'Candle lighting must be done before sunset on Friday.',
      yomTov: 'Candle lighting must be done before sunset on holidays.',
      fastDay: 'Candle lighting is not done on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 263',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'shabbat_meal',
    title: 'Shabbat Meal',
    description: 'Enjoy festive meals with family and friends',
    category: 'Shabbat & Holidays',
    isPermitted: true,
    notes: 'Three meals required',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Regular meals are permitted on weekdays.',
      shabbat: 'Three festive meals are required on Shabbat.',
      yomTov: 'Festive meals are required on holidays.',
      fastDay: 'Eating is forbidden on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 242',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'muktzeh_handling',
    title: 'Handle Muktzeh Items',
    description: 'Handling items set aside and not for Shabbat use',
    category: 'Shabbat & Holidays',
    isPermitted: false,
    notes: 'Several categories with different restrictions',
    defaultStatus: 'conditional',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'conditional',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'No restrictions on handling objects during weekdays.',
      shabbat: 'Muktzeh items generally cannot be moved on Shabbat with some exceptions.',
      yomTov: 'Many muktzeh restrictions are relaxed on holidays for food preparation purposes.',
      fastDay: 'No restrictions on handling objects during fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 308',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'electronic_devices',
    title: 'Use Electronic Devices',
    description: 'Operating electrical or electronic devices',
    category: 'Shabbat & Holidays',
    isPermitted: false,
    notes: 'Prohibited on Shabbat and most holidays',
    defaultStatus: 'conditional',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'No restrictions on electronics during weekdays.',
      shabbat: 'Using or adjusting electronic devices is prohibited on Shabbat.',
      yomTov: 'Using electronic devices is generally prohibited on holidays.',
      fastDay: 'No restrictions on electronics during fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Contemporary Halachic Authorities',
        reference: 'Based on melachot of kindling fire and completing circuits',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'carrying_objects',
    title: 'Carry Objects Outside',
    description: 'Moving items between private and public domains',
    category: 'Shabbat & Holidays',
    isPermitted: false,
    notes: 'Depends on eruv availability',
    defaultStatus: 'conditional',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'conditional',
      yomTov: 'conditional',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'No restrictions on carrying during weekdays.',
      shabbat: 'Carrying between domains is prohibited unless there is a valid eruv.',
      yomTov: 'Carrying for food preparation is permitted on holidays, otherwise similar to Shabbat.',
      fastDay: 'No restrictions on carrying during fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 346',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'food_preparation',
    title: 'Prepare Food',
    description: 'Cooking, baking, and food preparation',
    category: 'Shabbat & Holidays',
    isPermitted: false,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'conditional',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'conditional',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'No restrictions on food preparation during weekdays.',
      shabbat: 'Cooking and most food preparation is prohibited on Shabbat.',
      yomTov: 'Cooking for same-day use is permitted on holidays with certain limitations.',
      fastDay: 'Food preparation is allowed though not for personal consumption during the fast.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 495, 511',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'writing',
    title: 'Write or Draw',
    description: 'Creating permanent marks on surfaces',
    category: 'Shabbat & Holidays',
    isPermitted: false,
    notes: 'Includes typing and digital input',
    defaultStatus: 'conditional',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'No restrictions on writing during weekdays.',
      shabbat: 'Writing, drawing, and typing are prohibited on Shabbat.',
      yomTov: 'Writing is generally prohibited on holidays except for food preparation needs.',
      fastDay: 'No restrictions on writing during fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'hair_cutting',
    title: 'Cut Hair or Shave',
    description: 'Hair cutting, shaving, or trimming nails',
    category: 'Shabbat & Holidays',
    isPermitted: false,
    notes: 'Also applies to cutting nails',
    defaultStatus: 'conditional',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'No restrictions on hair cutting during weekdays (except Sefirat HaOmer and Three Weeks).',
      shabbat: 'Hair cutting and shaving are prohibited on Shabbat.',
      yomTov: 'Hair cutting and shaving are prohibited on holidays.',
      fastDay: 'No restrictions on hair cutting during most fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'business_transactions',
    title: 'Conduct Business',
    description: 'Buying, selling, and financial transactions',
    category: 'Shabbat & Holidays',
    isPermitted: false,
    notes: 'Includes online purchases and sales',
    defaultStatus: 'conditional',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'No restrictions on business during weekdays.',
      shabbat: 'Business transactions are prohibited on Shabbat.',
      yomTov: 'Business transactions are prohibited on holidays.',
      fastDay: 'No restrictions on business during fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 306',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'learn_torah',
    title: 'Study Torah',
    description: 'Learning religious texts and Jewish studies',
    category: 'Shabbat & Holidays',
    isPermitted: true,
    notes: 'Specially encouraged on Shabbat',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Torah study is encouraged daily.',
      shabbat: 'Shabbat is an especially appropriate time for Torah study.',
      yomTov: 'Holiday observance includes Torah study related to the festival.',
      fastDay: 'Torah study is encouraged during fast days, particularly topics related to repentance.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Talmud',
        reference: 'Shabbat 127a',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'pray',
    title: 'Pray with a Minyan',
    description: 'Participating in communal prayer services',
    category: 'Shabbat & Holidays',
    isPermitted: true,
    notes: 'Special prayers added on Shabbat and holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Communal prayer is encouraged daily.',
      shabbat: 'Shabbat prayers include additional elements like Musaf.',
      yomTov: 'Holiday prayers include special additions and Torah readings.',
      fastDay: 'Fast day prayers include special additions like Selichot and Anenu.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 90',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'medical_treatment',
    title: 'Seek Medical Treatment',
    description: 'Medical care and medication',
    category: 'Shabbat & Holidays',
    isPermitted: true,
    notes: 'Permitted for serious conditions',
    defaultStatus: 'conditional',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'conditional',
      yomTov: 'conditional',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'No restrictions on medical treatment during weekdays.',
      shabbat: 'Life-threatening situations override Shabbat. Minor ailments have restrictions.',
      yomTov: 'Similar to Shabbat, with some leniencies for medication.',
      fastDay: 'Medical treatment is allowed and those who are ill may be exempt from fasting.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 328',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'travel',
    title: 'Travel by Vehicle',
    description: 'Using cars, buses, or other vehicles',
    category: 'Shabbat & Holidays',
    isPermitted: false,
    notes: 'Restricted on Shabbat and major holidays',
    defaultStatus: 'conditional',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'No restrictions on travel during weekdays.',
      shabbat: 'Vehicle travel is prohibited on Shabbat except for life-threatening situations.',
      yomTov: 'Vehicle travel is prohibited on major holidays except for life-threatening situations.',
      fastDay: 'No restrictions on travel during fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Contemporary Halachic Authorities',
        reference: 'Based on multiple melachot',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'swimming',
    title: 'Go Swimming',
    description: 'Swimming in pools, lakes, or the ocean',
    category: 'Shabbat & Holidays',
    isPermitted: false,
    notes: 'Concerns include squeezing water and carrying',
    defaultStatus: 'conditional',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'conditional',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'No restrictions on swimming during weekdays.',
      shabbat: 'Swimming is generally prohibited due to various concerns.',
      yomTov: 'Swimming may be permitted on holidays with certain conditions.',
      fastDay: 'No restrictions on swimming during fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 339',
      },
    ],
    relatedActivities: [],
  },
  
  // Daily Practices
  {
    id: 'tefillin',
    title: 'Wear Tefillin',
    description: 'Putting on phylacteries for weekday prayer',
    category: 'Daily Practices',
    isPermitted: true,
    notes: 'Not worn on Shabbat or major holidays',
    defaultStatus: 'conditional',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Tefillin are worn during weekday morning prayers.',
      shabbat: 'Tefillin are not worn on Shabbat as it is considered an "ot" (sign) itself.',
      yomTov: 'Tefillin are not worn on major holidays.',
      fastDay: 'Tefillin are worn on fast days during morning prayers.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 31',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'tzitzit',
    title: 'Wear Tzitzit',
    description: 'Wearing a four-cornered garment with ritual fringes',
    category: 'Daily Practices',
    isPermitted: true,
    notes: 'Worn daily including Shabbat',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Tzitzit are worn daily by men.',
      shabbat: 'Tzitzit continue to be worn on Shabbat.',
      yomTov: 'Tzitzit continue to be worn on holidays.',
      fastDay: 'Tzitzit continue to be worn on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 8',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'blessings',
    title: 'Recite Blessings',
    description: 'Saying appropriate blessings before and after activities',
    category: 'Daily Practices',
    isPermitted: true,
    notes: 'Required before eating, after using the bathroom, etc.',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Blessings are recited daily for various activities and experiences.',
      shabbat: 'Blessings continue to be recited on Shabbat, with special additions.',
      yomTov: 'Blessings continue to be recited on holidays, with special additions.',
      fastDay: 'Blessings continue to be recited on fast days, though food-related blessings are limited.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 46-59, 167-201',
      },
    ],
    relatedActivities: [],
  },
  
  // Food & Kashrut
  {
    id: 'separate_meat_dairy',
    title: 'Separate Meat and Dairy',
    description: 'Maintaining separation between meat and dairy foods',
    category: 'Food & Kashrut',
    isPermitted: true,
    notes: 'Fundamental kosher principle',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Meat and dairy must be separated at all times.',
      shabbat: 'Meat and dairy separation continues on Shabbat.',
      yomTov: 'Meat and dairy separation continues on holidays.',
      fastDay: 'While fasting, the principle remains though not actively practiced.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Yoreh Deah 87-97',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'check_kosher_symbols',
    title: 'Check Kosher Symbols',
    description: 'Verifying kosher certification on food products',
    category: 'Food & Kashrut',
    isPermitted: true,
    notes: 'Different certification standards exist',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Always check for reliable kosher certification when purchasing food.',
      shabbat: 'Food should be checked before Shabbat. Reading is permitted on Shabbat if necessary.',
      yomTov: 'Similar to Shabbat, preferred to check in advance.',
      fastDay: 'Checking kosher symbols is permitted on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Contemporary Halachic Authorities',
        reference: 'Based on multiple dietary laws',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'check_produce',
    title: 'Check Produce for Insects',
    description: 'Inspecting fruits and vegetables for bugs',
    category: 'Food & Kashrut',
    isPermitted: true,
    notes: 'Required for many types of produce',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'conditional',
      yomTov: 'conditional',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Checking produce for insects is required before consumption.',
      shabbat: 'Preferably done before Shabbat. On Shabbat, has limitations regarding removing insects.',
      yomTov: 'Can be done on holidays, with certain limitations.',
      fastDay: 'Permitted on fast days though not practically needed.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Yoreh Deah 84',
      },
    ],
    relatedActivities: [],
  },
  
  // Lifecycle Events
  {
    id: 'wedding',
    title: 'Attend a Wedding',
    description: 'Participating in Jewish wedding celebrations',
    category: 'Lifecycle Events',
    isPermitted: true,
    notes: 'Not held on Shabbat or certain dates',
    defaultStatus: 'conditional',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Weddings can be held on most weekdays.',
      shabbat: 'Weddings are not performed on Shabbat.',
      yomTov: 'Weddings are not performed on major holidays.',
      fastDay: 'Weddings are generally not held on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Even HaEzer 64',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'burial',
    title: 'Attend a Burial',
    description: 'Participating in Jewish funeral and burial',
    category: 'Lifecycle Events',
    isPermitted: true,
    notes: 'Prompt burial is important, with exceptions',
    defaultStatus: 'conditional',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'conditional',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Prompt burial is encouraged on weekdays.',
      shabbat: 'Funerals and burials are not conducted on Shabbat.',
      yomTov: 'Complex rules apply to holidays - generally postponed on first/last days.',
      fastDay: 'Funerals may be conducted on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Yoreh Deah 357',
      },
    ],
    relatedActivities: [],
  },
  // Religious Activities
  {
    id: 'tefillin',
    title: 'Put on Tefillin',
    description: 'Wear tefillin for morning prayers',
    category: 'Religious',
    isPermitted: true,
    notes: 'Must be done during daylight hours',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Tefillin are worn on weekdays during morning prayers.',
      shabbat: 'Tefillin are not worn on Shabbat as it is a sign.',
      yomTov: 'Tefillin are not worn on holidays as they are a sign.',
      fastDay: 'Tefillin are worn on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 31',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'shacharit',
    title: 'Pray Shacharit',
    description: 'Morning prayer service',
    category: 'Religious',
    isPermitted: true,
    notes: 'Best done early in the morning',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Shacharit is prayed every morning.',
      shabbat: 'Shacharit is prayed on Shabbat with special additions.',
      yomTov: 'Shacharit is prayed on holidays with special additions.',
      fastDay: 'Shacharit is prayed on fast days with special additions.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 89',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'mincha',
    title: 'Pray Mincha',
    description: 'Afternoon prayer service',
    category: 'Religious',
    isPermitted: true,
    notes: 'Best done in the afternoon',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Mincha is prayed every afternoon.',
      shabbat: 'Mincha is prayed on Shabbat with special additions.',
      yomTov: 'Mincha is prayed on holidays with special additions.',
      fastDay: 'Mincha is prayed on fast days with special additions.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 232',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'arvit',
    title: 'Pray Arvit',
    description: 'Evening prayer service',
    category: 'Religious',
    isPermitted: true,
    notes: 'Best done after sunset',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Arvit is prayed every evening.',
      shabbat: 'Arvit is prayed on Shabbat with special additions.',
      yomTov: 'Arvit is prayed on holidays with special additions.',
      fastDay: 'Arvit is prayed on fast days with special additions.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 235',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'shema',
    title: 'Say Shema',
    description: 'Recite the Shema prayer',
    category: 'Religious',
    isPermitted: true,
    notes: 'Must be said twice daily',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Shema is said twice daily, morning and evening.',
      shabbat: 'Shema is said twice daily, morning and evening.',
      yomTov: 'Shema is said twice daily, morning and evening.',
      fastDay: 'Shema is said twice daily, morning and evening.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 58',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'shabbat_candles',
    title: 'Light Shabbat Candles',
    description: 'Light candles to welcome Shabbat',
    category: 'Religious',
    isPermitted: false,
    notes: 'Must be done before sunset',
    defaultStatus: 'forbidden',
    statusByDay: {
      regular: 'forbidden',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Candle lighting is only done for Shabbat and holidays.',
      shabbat: 'Candle lighting must be done before sunset on Friday.',
      yomTov: 'Candle lighting must be done before sunset on holidays.',
      fastDay: 'Candle lighting is not done on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 263',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'yomtov_candles',
    title: 'Light Yom Tov Candles',
    description: 'Light candles for holidays',
    category: 'Religious',
    isPermitted: false,
    notes: 'Must be done before sunset',
    defaultStatus: 'forbidden',
    statusByDay: {
      regular: 'forbidden',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Candle lighting is only done for Shabbat and holidays.',
      shabbat: 'Candle lighting must be done before sunset on Friday.',
      yomTov: 'Candle lighting must be done before sunset on holidays.',
      fastDay: 'Candle lighting is not done on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 263',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'havdalah',
    title: 'Say Havdalah',
    description: 'Recite the Havdalah prayer',
    category: 'Religious',
    isPermitted: false,
    notes: 'Must be done after sunset',
    defaultStatus: 'forbidden',
    statusByDay: {
      regular: 'forbidden',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Havdalah is only said at the end of Shabbat and holidays.',
      shabbat: 'Havdalah must be said after sunset on Saturday night.',
      yomTov: 'Havdalah must be said after sunset on holiday nights.',
      fastDay: 'Havdalah is not said on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 296',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'torah_reading',
    title: 'Read Torah',
    description: 'Read from the Torah scroll',
    category: 'Religious',
    isPermitted: false,
    notes: 'Only done on specific days',
    defaultStatus: 'forbidden',
    statusByDay: {
      regular: 'forbidden',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Torah reading is only done on Shabbat, holidays, and fast days.',
      shabbat: 'Torah is read on Shabbat morning and afternoon.',
      yomTov: 'Torah is read on holidays.',
      fastDay: 'Torah is read on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 282',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'shul_attendance',
    title: 'Go to Synagogue',
    description: 'Attend synagogue services',
    category: 'Religious',
    isPermitted: true,
    notes: 'Recommended for all services',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Synagogue attendance is encouraged for all services.',
      shabbat: 'Synagogue attendance is required for Shabbat services.',
      yomTov: 'Synagogue attendance is required for holiday services.',
      fastDay: 'Synagogue attendance is required for fast day services.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 90',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'shofar',
    title: 'Blow Shofar',
    description: 'Blow the shofar',
    category: 'Religious',
    isPermitted: false,
    notes: 'Only done on Rosh Hashanah',
    defaultStatus: 'forbidden',
    statusByDay: {
      regular: 'forbidden',
      shabbat: 'forbidden',
      yomTov: 'conditional',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Shofar is only blown on Rosh Hashanah.',
      shabbat: 'Shofar is not blown on Shabbat.',
      yomTov: 'Shofar is blown on Rosh Hashanah.',
      fastDay: 'Shofar is not blown on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 585',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'sukkah',
    title: 'Sit in Sukkah',
    description: 'Eat and spend time in the sukkah',
    category: 'Religious',
    isPermitted: false,
    notes: 'Only during Sukkot',
    defaultStatus: 'forbidden',
    statusByDay: {
      regular: 'forbidden',
      shabbat: 'conditional',
      yomTov: 'conditional',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Sukkah is only used during Sukkot.',
      shabbat: 'Sukkah is used on Shabbat during Sukkot.',
      yomTov: 'Sukkah is used on holidays during Sukkot.',
      fastDay: 'Sukkah is not used on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 625',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'omer',
    title: 'Count Omer',
    description: 'Count the days of the Omer',
    category: 'Religious',
    isPermitted: false,
    notes: 'Only during Sefirat HaOmer',
    defaultStatus: 'forbidden',
    statusByDay: {
      regular: 'conditional',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Omer is counted during the 49 days between Pesach and Shavuot.',
      shabbat: 'Omer is counted on Shabbat during Sefirat HaOmer.',
      yomTov: 'Omer is counted on holidays during Sefirat HaOmer.',
      fastDay: 'Omer is counted on fast days during Sefirat HaOmer.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 489',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'fasting',
    title: 'Fast',
    description: 'Abstain from food and drink',
    category: 'Religious',
    isPermitted: false,
    notes: 'Only on designated fast days',
    defaultStatus: 'forbidden',
    statusByDay: {
      regular: 'forbidden',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Fasting is only done on designated fast days.',
      shabbat: 'Fasting is not done on Shabbat.',
      yomTov: 'Fasting is not done on holidays.',
      fastDay: 'Fasting is required on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 550',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'megillah',
    title: 'Read Megillah',
    description: 'Read the Book of Esther',
    category: 'Religious',
    isPermitted: false,
    notes: 'Only on Purim',
    defaultStatus: 'forbidden',
    statusByDay: {
      regular: 'forbidden',
      shabbat: 'conditional',
      yomTov: 'conditional',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Megillah is only read on Purim.',
      shabbat: 'Megillah is read on Shabbat if Purim falls on Shabbat.',
      yomTov: 'Megillah is read on holidays if Purim falls on a holiday.',
      fastDay: 'Megillah is not read on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 690',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'netilat_yadayim',
    title: 'Netilat Yadayim',
    description: 'Ritual hand washing',
    category: 'Religious',
    isPermitted: true,
    notes: 'Required before eating bread',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Netilat Yadayim is required before eating bread.',
      shabbat: 'Netilat Yadayim is required before eating bread on Shabbat.',
      yomTov: 'Netilat Yadayim is required before eating bread on holidays.',
      fastDay: 'Netilat Yadayim is required before eating bread on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 158',
      },
    ],
    relatedActivities: ['birkat_hamazon'],
  },
  {
    id: 'birkat_hamazon',
    title: 'Birkat Hamazon',
    description: 'Grace after meals',
    category: 'Religious',
    isPermitted: true,
    notes: 'Required after eating bread',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Birkat Hamazon is required after eating bread.',
      shabbat: 'Birkat Hamazon is required after eating bread on Shabbat.',
      yomTov: 'Birkat Hamazon is required after eating bread on holidays.',
      fastDay: 'Birkat Hamazon is required after eating bread on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 184',
      },
    ],
    relatedActivities: ['netilat_yadayim'],
  },
  {
    id: 'mezuzah',
    title: 'Put up Mezuzah',
    description: 'Affix mezuzah to doorpost',
    category: 'Religious',
    isPermitted: true,
    notes: 'Required for Jewish homes',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Mezuzah can be affixed on weekdays.',
      shabbat: 'Mezuzah cannot be affixed on Shabbat.',
      yomTov: 'Mezuzah cannot be affixed on holidays.',
      fastDay: 'Mezuzah can be affixed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Yoreh Deah 291',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'food_blessings',
    title: 'Say Food Blessings',
    description: 'Recite blessings before eating',
    category: 'Religious',
    isPermitted: true,
    notes: 'Required before eating any food',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Food blessings are required before eating any food.',
      shabbat: 'Food blessings are required before eating any food on Shabbat.',
      yomTov: 'Food blessings are required before eating any food on holidays.',
      fastDay: 'Food blessings are required before eating any food on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 167',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'eat_bread',
    title: 'Eat Bread',
    description: 'Consume bread products',
    category: 'Food & Drink',
    isPermitted: true,
    notes: 'Requires netilat yadayim and birkat hamazon',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Bread can be eaten on weekdays.',
      shabbat: 'Bread is eaten on Shabbat.',
      yomTov: 'Bread is eaten on holidays.',
      fastDay: 'Bread cannot be eaten on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 158',
      },
    ],
    relatedActivities: ['netilat_yadayim', 'birkat_hamazon'],
  },
  {
    id: 'eat_meat',
    title: 'Eat Meat',
    description: 'Consume meat products',
    category: 'Food & Drink',
    isPermitted: true,
    notes: 'Must be kosher and not mixed with dairy',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Meat can be eaten on weekdays.',
      shabbat: 'Meat is eaten on Shabbat.',
      yomTov: 'Meat is eaten on holidays.',
      fastDay: 'Meat cannot be eaten on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Yoreh Deah 89',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'eat_fish',
    title: 'Eat Fish',
    description: 'Consume fish products',
    category: 'Food & Drink',
    isPermitted: true,
    notes: 'Must be kosher fish',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Fish can be eaten on weekdays.',
      shabbat: 'Fish is eaten on Shabbat.',
      yomTov: 'Fish is eaten on holidays.',
      fastDay: 'Fish cannot be eaten on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Yoreh Deah 83',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'eat_dairy',
    title: 'Eat Dairy',
    description: 'Consume dairy products',
    category: 'Food & Drink',
    isPermitted: true,
    notes: 'Must be kosher and not mixed with meat',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Dairy can be eaten on weekdays.',
      shabbat: 'Dairy is eaten on Shabbat.',
      yomTov: 'Dairy is eaten on holidays.',
      fastDay: 'Dairy cannot be eaten on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Yoreh Deah 89',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'mix_meat_dairy',
    title: 'Mix Meat and Dairy',
    description: 'Combine meat and dairy products',
    category: 'Food & Drink',
    isPermitted: false,
    notes: 'Strictly forbidden',
    defaultStatus: 'forbidden',
    statusByDay: {
      regular: 'forbidden',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Mixing meat and dairy is forbidden.',
      shabbat: 'Mixing meat and dairy is forbidden on Shabbat.',
      yomTov: 'Mixing meat and dairy is forbidden on holidays.',
      fastDay: 'Mixing meat and dairy is forbidden on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Yoreh Deah 87',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'eat_non_kosher',
    title: 'Eat Non-Kosher Food',
    description: 'Consume non-kosher food',
    category: 'Food & Drink',
    isPermitted: false,
    notes: 'Strictly forbidden',
    defaultStatus: 'forbidden',
    statusByDay: {
      regular: 'forbidden',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Non-kosher food is forbidden.',
      shabbat: 'Non-kosher food is forbidden on Shabbat.',
      yomTov: 'Non-kosher food is forbidden on holidays.',
      fastDay: 'Non-kosher food is forbidden on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Yoreh Deah 1',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'drink_wine',
    title: 'Drink Wine',
    description: 'Consume wine',
    category: 'Food & Drink',
    isPermitted: true,
    notes: 'Must be kosher wine',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Wine can be drunk on weekdays.',
      shabbat: 'Wine is drunk on Shabbat.',
      yomTov: 'Wine is drunk on holidays.',
      fastDay: 'Wine cannot be drunk on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 272',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'eat_matza',
    title: 'Eat Matza',
    description: 'Consume matza',
    category: 'Food & Drink',
    isPermitted: false,
    notes: 'Only during Pesach',
    defaultStatus: 'forbidden',
    statusByDay: {
      regular: 'forbidden',
      shabbat: 'conditional',
      yomTov: 'conditional',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Matza is only eaten during Pesach.',
      shabbat: 'Matza is eaten on Shabbat during Pesach.',
      yomTov: 'Matza is eaten on holidays during Pesach.',
      fastDay: 'Matza is not eaten on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 453',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'eat_chametz',
    title: 'Eat Chametz',
    description: 'Consume chametz during Pesach',
    category: 'Food & Drink',
    isPermitted: false,
    notes: 'Strictly forbidden during Pesach',
    defaultStatus: 'forbidden',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Chametz can be eaten on weekdays.',
      shabbat: 'Chametz cannot be eaten on Shabbat during Pesach.',
      yomTov: 'Chametz cannot be eaten on holidays during Pesach.',
      fastDay: 'Chametz can be eaten on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 453',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'break_fast',
    title: 'Break Fast',
    description: 'End a fast day',
    category: 'Food & Drink',
    isPermitted: false,
    notes: 'Only after fast ends',
    defaultStatus: 'forbidden',
    statusByDay: {
      regular: 'forbidden',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Breaking fast is only done after fast ends.',
      shabbat: 'Breaking fast is only done after fast ends.',
      yomTov: 'Breaking fast is only done after fast ends.',
      fastDay: 'Breaking fast is only done after fast ends.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 550',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'eat_outside',
    title: 'Eat Outside',
    description: 'Eat in non-kosher establishments',
    category: 'Food & Drink',
    isPermitted: false,
    notes: 'Only in kosher establishments',
    defaultStatus: 'forbidden',
    statusByDay: {
      regular: 'forbidden',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Eating in non-kosher establishments is forbidden.',
      shabbat: 'Eating in non-kosher establishments is forbidden on Shabbat.',
      yomTov: 'Eating in non-kosher establishments is forbidden on holidays.',
      fastDay: 'Eating in non-kosher establishments is forbidden on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Yoreh Deah 1',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'eat_before_prayer',
    title: 'Eat Before Prayer',
    description: 'Eat before morning prayers',
    category: 'Food & Drink',
    isPermitted: false,
    notes: 'Not recommended',
    defaultStatus: 'forbidden',
    statusByDay: {
      regular: 'forbidden',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Eating before morning prayers is not recommended.',
      shabbat: 'Eating before morning prayers is not recommended on Shabbat.',
      yomTov: 'Eating before morning prayers is not recommended on holidays.',
      fastDay: 'Eating before morning prayers is not recommended on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 89',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'eat_without_blessing',
    title: 'Eat Without Blessing',
    description: 'Eat without saying blessings',
    category: 'Food & Drink',
    isPermitted: false,
    notes: 'Blessings required before eating',
    defaultStatus: 'forbidden',
    statusByDay: {
      regular: 'forbidden',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Blessings are required before eating.',
      shabbat: 'Blessings are required before eating on Shabbat.',
      yomTov: 'Blessings are required before eating on holidays.',
      fastDay: 'Blessings are required before eating on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 167',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'wash_hands_morning',
    title: 'Wash Hands in Morning',
    description: 'Ritual hand washing upon waking',
    category: 'Personal Hygiene',
    isPermitted: true,
    notes: 'Required upon waking',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Morning hand washing is required upon waking.',
      shabbat: 'Morning hand washing is required upon waking on Shabbat.',
      yomTov: 'Morning hand washing is required upon waking on holidays.',
      fastDay: 'Morning hand washing is required upon waking on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 4',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'shower',
    title: 'Shower or Bathe',
    description: 'Take a shower or bath',
    category: 'Personal Hygiene',
    isPermitted: true,
    notes: 'Required for cleanliness',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Showering is allowed on weekdays.',
      shabbat: 'Showering is allowed on Shabbat.',
      yomTov: 'Showering is allowed on holidays.',
      fastDay: 'Showering is forbidden on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 326',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'wash_hair',
    title: 'Wash Hair',
    description: 'Wash or shampoo hair',
    category: 'Personal Hygiene',
    isPermitted: true,
    notes: 'Required for cleanliness',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Washing hair is allowed on weekdays.',
      shabbat: 'Washing hair is allowed on Shabbat.',
      yomTov: 'Washing hair is allowed on holidays.',
      fastDay: 'Washing hair is forbidden on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 326',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'cut_nails',
    title: 'Cut Nails',
    description: 'Trim fingernails or toenails',
    category: 'Personal Hygiene',
    isPermitted: true,
    notes: 'Required for cleanliness',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Cutting nails is allowed on weekdays.',
      shabbat: 'Cutting nails is forbidden on Shabbat.',
      yomTov: 'Cutting nails is forbidden on holidays.',
      fastDay: 'Cutting nails is forbidden on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'shave',
    title: 'Shave',
    description: 'Remove facial or body hair',
    category: 'Personal Hygiene',
    isPermitted: true,
    notes: 'Required for cleanliness',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Shaving is allowed on weekdays.',
      shabbat: 'Shaving is forbidden on Shabbat.',
      yomTov: 'Shaving is forbidden on holidays.',
      fastDay: 'Shaving is forbidden on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'cut_hair',
    title: 'Cut Hair',
    description: 'Get a haircut',
    category: 'Personal Hygiene',
    isPermitted: true,
    notes: 'Required for cleanliness',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Getting a haircut is allowed on weekdays.',
      shabbat: 'Getting a haircut is forbidden on Shabbat.',
      yomTov: 'Getting a haircut is forbidden on holidays.',
      fastDay: 'Getting a haircut is forbidden on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'use_perfume',
    title: 'Use Perfume',
    description: 'Apply perfume or cologne',
    category: 'Personal Hygiene',
    isPermitted: true,
    notes: 'For personal grooming',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Using perfume is allowed on weekdays.',
      shabbat: 'Using perfume is allowed on Shabbat.',
      yomTov: 'Using perfume is allowed on holidays.',
      fastDay: 'Using perfume is forbidden on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 326',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'brush_teeth',
    title: 'Brush Teeth',
    description: 'Clean teeth with toothbrush',
    category: 'Personal Hygiene',
    isPermitted: true,
    notes: 'Required for dental hygiene',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Brushing teeth is allowed on weekdays.',
      shabbat: 'Brushing teeth is allowed on Shabbat.',
      yomTov: 'Brushing teeth is allowed on holidays.',
      fastDay: 'Brushing teeth is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 326',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'apply_lotion',
    title: 'Apply Lotion',
    description: 'Apply skin lotion or cream',
    category: 'Personal Hygiene',
    isPermitted: true,
    notes: 'For skin care',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Applying lotion is allowed on weekdays.',
      shabbat: 'Applying lotion is allowed on Shabbat.',
      yomTov: 'Applying lotion is allowed on holidays.',
      fastDay: 'Applying lotion is forbidden on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 326',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'use_deodorant',
    title: 'Use Deodorant',
    description: 'Apply deodorant',
    category: 'Personal Hygiene',
    isPermitted: true,
    notes: 'For personal hygiene',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Using deodorant is allowed on weekdays.',
      shabbat: 'Using deodorant is allowed on Shabbat.',
      yomTov: 'Using deodorant is allowed on holidays.',
      fastDay: 'Using deodorant is forbidden on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 326',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'wear_makeup',
    title: 'Wear Makeup',
    description: 'Apply cosmetics',
    category: 'Personal Hygiene',
    isPermitted: true,
    notes: 'For personal grooming',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Wearing makeup is allowed on weekdays.',
      shabbat: 'Wearing makeup is allowed on Shabbat.',
      yomTov: 'Wearing makeup is allowed on holidays.',
      fastDay: 'Wearing makeup is forbidden on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 326',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'wash_clothes',
    title: 'Wash Clothes',
    description: 'Launder clothing',
    category: 'Personal Hygiene',
    isPermitted: true,
    notes: 'Required for cleanliness',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Washing clothes is allowed on weekdays.',
      shabbat: 'Washing clothes is forbidden on Shabbat.',
      yomTov: 'Washing clothes is forbidden on holidays.',
      fastDay: 'Washing clothes is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'change_clothes',
    title: 'Change Clothes',
    description: 'Change into different clothing',
    category: 'Personal Hygiene',
    isPermitted: true,
    notes: 'Required for cleanliness',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Changing clothes is allowed on weekdays.',
      shabbat: 'Changing clothes is allowed on Shabbat.',
      yomTov: 'Changing clothes is allowed on holidays.',
      fastDay: 'Changing clothes is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 326',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'iron_clothes',
    title: 'Iron Clothes',
    description: 'Press or iron clothing',
    category: 'Personal Hygiene',
    isPermitted: true,
    notes: 'For clothing maintenance',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Ironing clothes is allowed on weekdays.',
      shabbat: 'Ironing clothes is forbidden on Shabbat.',
      yomTov: 'Ironing clothes is forbidden on holidays.',
      fastDay: 'Ironing clothes is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'cook',
    title: 'Cook',
    description: 'Prepare food by cooking',
    category: 'Social & Home',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'conditional',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Cooking is allowed on weekdays.',
      shabbat: 'Cooking is forbidden on Shabbat.',
      yomTov: 'Cooking is allowed on holidays for same-day use.',
      fastDay: 'Cooking is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 495',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'use_light',
    title: 'Use Light',
    description: 'Turn lights on or off',
    category: 'Social & Home',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Using lights is allowed on weekdays.',
      shabbat: 'Using lights is forbidden on Shabbat.',
      yomTov: 'Using lights is forbidden on holidays.',
      fastDay: 'Using lights is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'use_appliance',
    title: 'Use Appliances',
    description: 'Use electrical appliances',
    category: 'Social & Home',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Using appliances is allowed on weekdays.',
      shabbat: 'Using appliances is forbidden on Shabbat.',
      yomTov: 'Using appliances is forbidden on holidays.',
      fastDay: 'Using appliances is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'use_fire',
    title: 'Use Fire',
    description: 'Light or extinguish fire',
    category: 'Social & Home',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Using fire is allowed on weekdays.',
      shabbat: 'Using fire is forbidden on Shabbat.',
      yomTov: 'Using fire is forbidden on holidays.',
      fastDay: 'Using fire is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'use_elevator',
    title: 'Use Elevator',
    description: 'Ride in an elevator',
    category: 'Social & Home',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Using elevators is allowed on weekdays.',
      shabbat: 'Using elevators is forbidden on Shabbat.',
      yomTov: 'Using elevators is forbidden on holidays.',
      fastDay: 'Using elevators is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'carry_public',
    title: 'Carry in Public',
    description: 'Carry objects in public domain',
    category: 'Social & Home',
    isPermitted: true,
    notes: 'Depends on eruv availability',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'conditional',
      yomTov: 'conditional',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Carrying in public is allowed on weekdays.',
      shabbat: 'Carrying in public is forbidden on Shabbat unless there is an eruv.',
      yomTov: 'Carrying in public is forbidden on holidays unless there is an eruv.',
      fastDay: 'Carrying in public is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 346',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'drive_car',
    title: 'Drive Car',
    description: 'Operate a motor vehicle',
    category: 'Social & Home',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Driving is allowed on weekdays.',
      shabbat: 'Driving is forbidden on Shabbat.',
      yomTov: 'Driving is forbidden on holidays.',
      fastDay: 'Driving is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'use_transport',
    title: 'Use Public Transport',
    description: 'Use buses, trains, etc.',
    category: 'Social & Home',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Using public transport is allowed on weekdays.',
      shabbat: 'Using public transport is forbidden on Shabbat.',
      yomTov: 'Using public transport is forbidden on holidays.',
      fastDay: 'Using public transport is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'use_phone',
    title: 'Use Phone',
    description: 'Make phone calls',
    category: 'Social & Home',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Using phone is allowed on weekdays.',
      shabbat: 'Using phone is forbidden on Shabbat.',
      yomTov: 'Using phone is forbidden on holidays.',
      fastDay: 'Using phone is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'send_messages',
    title: 'Send Messages',
    description: 'Send text messages or emails',
    category: 'Social & Home',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Sending messages is allowed on weekdays.',
      shabbat: 'Sending messages is forbidden on Shabbat.',
      yomTov: 'Sending messages is forbidden on holidays.',
      fastDay: 'Sending messages is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'use_social_media',
    title: 'Use Social Media',
    description: 'Use social media platforms',
    category: 'Social & Home',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Using social media is allowed on weekdays.',
      shabbat: 'Using social media is forbidden on Shabbat.',
      yomTov: 'Using social media is forbidden on holidays.',
      fastDay: 'Using social media is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'use_apps',
    title: 'Use Apps',
    description: 'Use mobile applications',
    category: 'Social & Home',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Using apps is allowed on weekdays.',
      shabbat: 'Using apps is forbidden on Shabbat.',
      yomTov: 'Using apps is forbidden on holidays.',
      fastDay: 'Using apps is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'listen_music',
    title: 'Listen to Music',
    description: 'Play or listen to music',
    category: 'Social & Home',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Listening to music is allowed on weekdays.',
      shabbat: 'Listening to music is forbidden on Shabbat.',
      yomTov: 'Listening to music is forbidden on holidays.',
      fastDay: 'Listening to music is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'watch_tv',
    title: 'Watch TV',
    description: 'Watch television',
    category: 'Social & Home',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Watching TV is allowed on weekdays.',
      shabbat: 'Watching TV is forbidden on Shabbat.',
      yomTov: 'Watching TV is forbidden on holidays.',
      fastDay: 'Watching TV is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'watch_videos',
    title: 'Watch Videos',
    description: 'Watch videos or series',
    category: 'Social & Home',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Watching videos is allowed on weekdays.',
      shabbat: 'Watching videos is forbidden on Shabbat.',
      yomTov: 'Watching videos is forbidden on holidays.',
      fastDay: 'Watching videos is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'read_secular',
    title: 'Read Secular Books',
    description: 'Read non-religious books',
    category: 'Social & Home',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Reading secular books is allowed on weekdays.',
      shabbat: 'Reading secular books is allowed on Shabbat.',
      yomTov: 'Reading secular books is allowed on holidays.',
      fastDay: 'Reading secular books is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'write_hand',
    title: 'Write by Hand',
    description: 'Write with pen or pencil',
    category: 'Social & Home',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Writing by hand is allowed on weekdays.',
      shabbat: 'Writing by hand is forbidden on Shabbat.',
      yomTov: 'Writing by hand is forbidden on holidays.',
      fastDay: 'Writing by hand is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'write_digital',
    title: 'Write Digitally',
    description: 'Type on computer or phone',
    category: 'Social & Home',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Writing digitally is allowed on weekdays.',
      shabbat: 'Writing digitally is forbidden on Shabbat.',
      yomTov: 'Writing digitally is forbidden on holidays.',
      fastDay: 'Writing digitally is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'draw',
    title: 'Draw or Paint',
    description: 'Create art or drawings',
    category: 'Social & Home',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Drawing is allowed on weekdays.',
      shabbat: 'Drawing is forbidden on Shabbat.',
      yomTov: 'Drawing is forbidden on holidays.',
      fastDay: 'Drawing is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'study_torah',
    title: 'Study Torah',
    description: 'Learn Jewish texts',
    category: 'Social & Home',
    isPermitted: true,
    notes: 'Encouraged on all days',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Studying Torah is allowed on weekdays.',
      shabbat: 'Studying Torah is allowed on Shabbat.',
      yomTov: 'Studying Torah is allowed on holidays.',
      fastDay: 'Studying Torah is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 155',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'study_secular',
    title: 'Study Secular Topics',
    description: 'Learn non-religious subjects',
    category: 'Social & Home',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Studying secular topics is allowed on weekdays.',
      shabbat: 'Studying secular topics is forbidden on Shabbat.',
      yomTov: 'Studying secular topics is forbidden on holidays.',
      fastDay: 'Studying secular topics is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'work_study',
    title: 'Work or Study',
    description: 'Perform work or study',
    category: 'Social & Home',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Working or studying is allowed on weekdays.',
      shabbat: 'Working or studying is forbidden on Shabbat.',
      yomTov: 'Working or studying is forbidden on holidays.',
      fastDay: 'Working or studying is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'work_job',
    title: 'Work at Job',
    description: 'Perform work at place of employment',
    category: 'Professional',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Working at a job is allowed on weekdays.',
      shabbat: 'Working at a job is forbidden on Shabbat.',
      yomTov: 'Working at a job is forbidden on holidays.',
      fastDay: 'Working at a job is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'attend_meeting',
    title: 'Attend Meeting',
    description: 'Participate in work meetings',
    category: 'Professional',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Attending meetings is allowed on weekdays.',
      shabbat: 'Attending meetings is forbidden on Shabbat.',
      yomTov: 'Attending meetings is forbidden on holidays.',
      fastDay: 'Attending meetings is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'make_business_call',
    title: 'Make Business Call',
    description: 'Make work-related phone calls',
    category: 'Professional',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Making business calls is allowed on weekdays.',
      shabbat: 'Making business calls is forbidden on Shabbat.',
      yomTov: 'Making business calls is forbidden on holidays.',
      fastDay: 'Making business calls is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'send_work_email',
    title: 'Send Work Email',
    description: 'Send work-related emails',
    category: 'Professional',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Sending work emails is allowed on weekdays.',
      shabbat: 'Sending work emails is forbidden on Shabbat.',
      yomTov: 'Sending work emails is forbidden on holidays.',
      fastDay: 'Sending work emails is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'shop_grocery',
    title: 'Shop for Groceries',
    description: 'Buy food and household items',
    category: 'Shopping & Money',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Shopping for groceries is allowed on weekdays.',
      shabbat: 'Shopping for groceries is forbidden on Shabbat.',
      yomTov: 'Shopping for groceries is forbidden on holidays.',
      fastDay: 'Shopping for groceries is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'shop_clothing',
    title: 'Shop for Clothing',
    description: 'Buy clothes and accessories',
    category: 'Shopping & Money',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Shopping for clothing is allowed on weekdays.',
      shabbat: 'Shopping for clothing is forbidden on Shabbat.',
      yomTov: 'Shopping for clothing is forbidden on holidays.',
      fastDay: 'Shopping for clothing is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'shop_other',
    title: 'Shop for Other Items',
    description: 'Buy non-food, non-clothing items',
    category: 'Shopping & Money',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Shopping for other items is allowed on weekdays.',
      shabbat: 'Shopping for other items is forbidden on Shabbat.',
      yomTov: 'Shopping for other items is forbidden on holidays.',
      fastDay: 'Shopping for other items is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'use_money',
    title: 'Use Money',
    description: 'Handle money or make purchases',
    category: 'Shopping & Money',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Using money is allowed on weekdays.',
      shabbat: 'Using money is forbidden on Shabbat.',
      yomTov: 'Using money is forbidden on holidays.',
      fastDay: 'Using money is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'use_credit_card',
    title: 'Use Credit Card',
    description: 'Make purchases with credit card',
    category: 'Shopping & Money',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Using credit cards is allowed on weekdays.',
      shabbat: 'Using credit cards is forbidden on Shabbat.',
      yomTov: 'Using credit cards is forbidden on holidays.',
      fastDay: 'Using credit cards is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'use_atm',
    title: 'Use ATM',
    description: 'Withdraw money from ATM',
    category: 'Shopping & Money',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Using ATMs is allowed on weekdays.',
      shabbat: 'Using ATMs is forbidden on Shabbat.',
      yomTov: 'Using ATMs is forbidden on holidays.',
      fastDay: 'Using ATMs is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'pay_bills',
    title: 'Pay Bills',
    description: 'Pay bills or make payments',
    category: 'Shopping & Money',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Paying bills is allowed on weekdays.',
      shabbat: 'Paying bills is forbidden on Shabbat.',
      yomTov: 'Paying bills is forbidden on holidays.',
      fastDay: 'Paying bills is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'make_investment',
    title: 'Make Investment',
    description: 'Make financial investments',
    category: 'Shopping & Money',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Making investments is allowed on weekdays.',
      shabbat: 'Making investments is forbidden on Shabbat.',
      yomTov: 'Making investments is forbidden on holidays.',
      fastDay: 'Making investments is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'check_stocks',
    title: 'Check Stocks',
    description: 'Check stock market or investments',
    category: 'Shopping & Money',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Checking stocks is allowed on weekdays.',
      shabbat: 'Checking stocks is forbidden on Shabbat.',
      yomTov: 'Checking stocks is forbidden on holidays.',
      fastDay: 'Checking stocks is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'make_donation',
    title: 'Make Donation',
    description: 'Give tzedakah or make charitable donations',
    category: 'Shopping & Money',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Making donations is allowed on weekdays.',
      shabbat: 'Making donations is forbidden on Shabbat.',
      yomTov: 'Making donations is forbidden on holidays.',
      fastDay: 'Making donations is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'walk_distance',
    title: 'Walk Long Distance',
    description: 'Walk more than 2000 cubits (about 1 km)',
    category: 'Travel & Mobility',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Walking long distances is allowed on weekdays.',
      shabbat: 'Walking more than 2000 cubits is forbidden on Shabbat.',
      yomTov: 'Walking more than 2000 cubits is forbidden on holidays.',
      fastDay: 'Walking long distances is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 396',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'walk_eruv',
    title: 'Walk in Eruv',
    description: 'Walk within eruv boundaries',
    category: 'Travel & Mobility',
    isPermitted: true,
    notes: 'Depends on eruv availability',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'conditional',
      yomTov: 'conditional',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Walking in eruv is allowed on weekdays.',
      shabbat: 'Walking in eruv is allowed on Shabbat if eruv exists.',
      yomTov: 'Walking in eruv is allowed on holidays if eruv exists.',
      fastDay: 'Walking in eruv is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 396',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'ride_bike',
    title: 'Ride Bicycle',
    description: 'Ride a bicycle',
    category: 'Travel & Mobility',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Riding a bicycle is allowed on weekdays.',
      shabbat: 'Riding a bicycle is forbidden on Shabbat.',
      yomTov: 'Riding a bicycle is forbidden on holidays.',
      fastDay: 'Riding a bicycle is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'ride_scooter',
    title: 'Ride Scooter',
    description: 'Ride an electric scooter',
    category: 'Travel & Mobility',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Riding a scooter is allowed on weekdays.',
      shabbat: 'Riding a scooter is forbidden on Shabbat.',
      yomTov: 'Riding a scooter is forbidden on holidays.',
      fastDay: 'Riding a scooter is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'use_taxi',
    title: 'Use Taxi',
    description: 'Take a taxi ride',
    category: 'Travel & Mobility',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Using a taxi is allowed on weekdays.',
      shabbat: 'Using a taxi is forbidden on Shabbat.',
      yomTov: 'Using a taxi is forbidden on holidays.',
      fastDay: 'Using a taxi is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'use_ride_share',
    title: 'Use Ride Share',
    description: 'Use ride-sharing services',
    category: 'Travel & Mobility',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Using ride share is allowed on weekdays.',
      shabbat: 'Using ride share is forbidden on Shabbat.',
      yomTov: 'Using ride share is forbidden on holidays.',
      fastDay: 'Using ride share is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'fly_plane',
    title: 'Fly in Plane',
    description: 'Travel by airplane',
    category: 'Travel & Mobility',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Flying in a plane is allowed on weekdays.',
      shabbat: 'Flying in a plane is forbidden on Shabbat.',
      yomTov: 'Flying in a plane is forbidden on holidays.',
      fastDay: 'Flying in a plane is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'take_train',
    title: 'Take Train',
    description: 'Travel by train',
    category: 'Travel & Mobility',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Taking a train is allowed on weekdays.',
      shabbat: 'Taking a train is forbidden on Shabbat.',
      yomTov: 'Taking a train is forbidden on holidays.',
      fastDay: 'Taking a train is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'exercise',
    title: 'Exercise',
    description: 'Perform physical exercise',
    category: 'Personal Life',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Exercise is allowed on weekdays.',
      shabbat: 'Exercise is forbidden on Shabbat.',
      yomTov: 'Exercise is forbidden on holidays.',
      fastDay: 'Exercise is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'play_sports',
    title: 'Play Sports',
    description: 'Participate in sports activities',
    category: 'Personal Life',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Playing sports is allowed on weekdays.',
      shabbat: 'Playing sports is forbidden on Shabbat.',
      yomTov: 'Playing sports is forbidden on holidays.',
      fastDay: 'Playing sports is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'swim',
    title: 'Swim',
    description: 'Go swimming',
    category: 'Personal Life',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Swimming is allowed on weekdays.',
      shabbat: 'Swimming is forbidden on Shabbat.',
      yomTov: 'Swimming is forbidden on holidays.',
      fastDay: 'Swimming is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'play_games',
    title: 'Play Games',
    description: 'Play board games or video games',
    category: 'Personal Life',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Playing games is allowed on weekdays.',
      shabbat: 'Playing games is forbidden on Shabbat.',
      yomTov: 'Playing games is forbidden on holidays.',
      fastDay: 'Playing games is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'watch_movie',
    title: 'Watch Movie',
    description: 'Watch movies or shows',
    category: 'Personal Life',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Watching movies is allowed on weekdays.',
      shabbat: 'Watching movies is forbidden on Shabbat.',
      yomTov: 'Watching movies is forbidden on holidays.',
      fastDay: 'Watching movies is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'listen_podcast',
    title: 'Listen to Podcast',
    description: 'Listen to podcasts or audio content',
    category: 'Personal Life',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Listening to podcasts is allowed on weekdays.',
      shabbat: 'Listening to podcasts is forbidden on Shabbat.',
      yomTov: 'Listening to podcasts is forbidden on holidays.',
      fastDay: 'Listening to podcasts is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'read_book',
    title: 'Read Book',
    description: 'Read books or articles',
    category: 'Personal Life',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Reading books is allowed on weekdays.',
      shabbat: 'Reading books is allowed on Shabbat.',
      yomTov: 'Reading books is allowed on holidays.',
      fastDay: 'Reading books is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'play_instrument',
    title: 'Play Instrument',
    description: 'Play musical instruments',
    category: 'Personal Life',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Playing instruments is allowed on weekdays.',
      shabbat: 'Playing instruments is forbidden on Shabbat.',
      yomTov: 'Playing instruments is forbidden on holidays.',
      fastDay: 'Playing instruments is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'sing',
    title: 'Sing',
    description: 'Sing songs or melodies',
    category: 'Personal Life',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Singing is allowed on weekdays.',
      shabbat: 'Singing is allowed on Shabbat.',
      yomTov: 'Singing is allowed on holidays.',
      fastDay: 'Singing is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'visit_friends',
    title: 'Visit Friends',
    description: 'Visit friends or family',
    category: 'Personal Life',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Visiting friends is allowed on weekdays.',
      shabbat: 'Visiting friends is allowed on Shabbat.',
      yomTov: 'Visiting friends is allowed on holidays.',
      fastDay: 'Visiting friends is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'host_guests',
    title: 'Host Guests',
    description: 'Host friends or family',
    category: 'Personal Life',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Hosting guests is allowed on weekdays.',
      shabbat: 'Hosting guests is allowed on Shabbat.',
      yomTov: 'Hosting guests is allowed on holidays.',
      fastDay: 'Hosting guests is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'attend_party',
    title: 'Attend Party',
    description: 'Attend social gatherings',
    category: 'Personal Life',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Attending parties is allowed on weekdays.',
      shabbat: 'Attending parties is allowed on Shabbat.',
      yomTov: 'Attending parties is allowed on holidays.',
      fastDay: 'Attending parties is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'go_restaurant',
    title: 'Go to Restaurant',
    description: 'Eat at a restaurant',
    category: 'Personal Life',
    isPermitted: true,
    notes: 'Must be kosher restaurant',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Going to restaurants is allowed on weekdays.',
      shabbat: 'Going to restaurants is forbidden on Shabbat.',
      yomTov: 'Going to restaurants is forbidden on holidays.',
      fastDay: 'Going to restaurants is forbidden on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'go_cafe',
    title: 'Go to Cafe',
    description: 'Visit a cafe or coffee shop',
    category: 'Personal Life',
    isPermitted: true,
    notes: 'Must be kosher establishment',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Going to cafes is allowed on weekdays.',
      shabbat: 'Going to cafes is forbidden on Shabbat.',
      yomTov: 'Going to cafes is forbidden on holidays.',
      fastDay: 'Going to cafes is forbidden on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'go_museum',
    title: 'Go to Museum',
    description: 'Visit museums or exhibitions',
    category: 'Personal Life',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Going to museums is allowed on weekdays.',
      shabbat: 'Going to museums is forbidden on Shabbat.',
      yomTov: 'Going to museums is forbidden on holidays.',
      fastDay: 'Going to museums is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'go_theater',
    title: 'Go to Theater',
    description: 'Attend theater or shows',
    category: 'Personal Life',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Going to theater is allowed on weekdays.',
      shabbat: 'Going to theater is forbidden on Shabbat.',
      yomTov: 'Going to theater is forbidden on holidays.',
      fastDay: 'Going to theater is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'go_concert',
    title: 'Go to Concert',
    description: 'Attend concerts or performances',
    category: 'Personal Life',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Going to concerts is allowed on weekdays.',
      shabbat: 'Going to concerts is forbidden on Shabbat.',
      yomTov: 'Going to concerts is forbidden on holidays.',
      fastDay: 'Going to concerts is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'go_park',
    title: 'Go to Park',
    description: 'Visit parks or outdoor spaces',
    category: 'Personal Life',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Going to parks is allowed on weekdays.',
      shabbat: 'Going to parks is allowed on Shabbat.',
      yomTov: 'Going to parks is allowed on holidays.',
      fastDay: 'Going to parks is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'go_beach',
    title: 'Go to Beach',
    description: 'Visit beach or swimming areas',
    category: 'Personal Life',
    isPermitted: true,
    notes: 'Different rules for Shabbat vs. Holidays',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Going to beach is allowed on weekdays.',
      shabbat: 'Going to beach is forbidden on Shabbat.',
      yomTov: 'Going to beach is forbidden on holidays.',
      fastDay: 'Going to beach is allowed on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 340',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'light_chanukah',
    title: 'Light Chanukah Candles',
    description: 'Light Chanukah menorah',
    category: 'Special Days',
    isPermitted: true,
    notes: 'Only during Chanukah',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'forbidden',
      shabbat: 'conditional',
      yomTov: 'conditional',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Lighting Chanukah candles is only allowed during Chanukah.',
      shabbat: 'Lighting Chanukah candles is allowed on Shabbat during Chanukah.',
      yomTov: 'Lighting Chanukah candles is allowed on holidays during Chanukah.',
      fastDay: 'Lighting Chanukah candles is allowed on fast days during Chanukah.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 671',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'eat_latkes',
    title: 'Eat Latkes',
    description: 'Eat Chanukah latkes',
    category: 'Special Days',
    isPermitted: true,
    notes: 'Only during Chanukah',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Eating latkes is allowed during Chanukah.',
      shabbat: 'Eating latkes is allowed on Shabbat during Chanukah.',
      yomTov: 'Eating latkes is allowed on holidays during Chanukah.',
      fastDay: 'Eating latkes is forbidden on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 670',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'eat_sufganiyot',
    title: 'Eat Sufganiyot',
    description: 'Eat Chanukah donuts',
    category: 'Special Days',
    isPermitted: true,
    notes: 'Only during Chanukah',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Eating sufganiyot is allowed during Chanukah.',
      shabbat: 'Eating sufganiyot is allowed on Shabbat during Chanukah.',
      yomTov: 'Eating sufganiyot is allowed on holidays during Chanukah.',
      fastDay: 'Eating sufganiyot is forbidden on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 670',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'play_dreidel',
    title: 'Play Dreidel',
    description: 'Play with dreidel',
    category: 'Special Days',
    isPermitted: true,
    notes: 'Only during Chanukah',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Playing dreidel is allowed during Chanukah.',
      shabbat: 'Playing dreidel is forbidden on Shabbat.',
      yomTov: 'Playing dreidel is forbidden on holidays.',
      fastDay: 'Playing dreidel is allowed on fast days during Chanukah.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 670',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'eat_hamantaschen',
    title: 'Eat Hamantaschen',
    description: 'Eat Purim cookies',
    category: 'Special Days',
    isPermitted: true,
    notes: 'Only during Purim',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Eating hamantaschen is allowed during Purim.',
      shabbat: 'Eating hamantaschen is allowed on Shabbat during Purim.',
      yomTov: 'Eating hamantaschen is allowed on holidays during Purim.',
      fastDay: 'Eating hamantaschen is forbidden on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 695',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'give_mishloach_manot',
    title: 'Give Mishloach Manot',
    description: 'Give Purim food gifts',
    category: 'Special Days',
    isPermitted: true,
    notes: 'Only during Purim',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Giving mishloach manot is allowed during Purim.',
      shabbat: 'Giving mishloach manot is forbidden on Shabbat.',
      yomTov: 'Giving mishloach manot is forbidden on holidays.',
      fastDay: 'Giving mishloach manot is allowed on fast days during Purim.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 695',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'give_matnot_la_evyonim',
    title: 'Give Matnot LaEvyonim',
    description: 'Give Purim charity',
    category: 'Special Days',
    isPermitted: true,
    notes: 'Only during Purim',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'forbidden',
      yomTov: 'forbidden',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Giving matnot laevyonim is allowed during Purim.',
      shabbat: 'Giving matnot laevyonim is forbidden on Shabbat.',
      yomTov: 'Giving matnot laevyonim is forbidden on holidays.',
      fastDay: 'Giving matnot laevyonim is allowed on fast days during Purim.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 694',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'eat_seudat_purim',
    title: 'Eat Seudat Purim',
    description: 'Eat Purim festive meal',
    category: 'Special Days',
    isPermitted: true,
    notes: 'Only during Purim',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Eating seudat Purim is allowed during Purim.',
      shabbat: 'Eating seudat Purim is allowed on Shabbat during Purim.',
      yomTov: 'Eating seudat Purim is allowed on holidays during Purim.',
      fastDay: 'Eating seudat Purim is forbidden on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 695',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'eat_matza',
    title: 'Eat Matza',
    description: 'Eat matza during Pesach',
    category: 'Special Days',
    isPermitted: true,
    notes: 'Only during Pesach',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Eating matza is allowed during Pesach.',
      shabbat: 'Eating matza is allowed on Shabbat during Pesach.',
      yomTov: 'Eating matza is allowed on holidays during Pesach.',
      fastDay: 'Eating matza is allowed on fast days during Pesach.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 453',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'eat_maror',
    title: 'Eat Maror',
    description: 'Eat bitter herbs during Pesach',
    category: 'Special Days',
    isPermitted: true,
    notes: 'Only during Pesach Seder',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Eating maror is allowed during Pesach Seder.',
      shabbat: 'Eating maror is allowed on Shabbat during Pesach Seder.',
      yomTov: 'Eating maror is allowed on holidays during Pesach Seder.',
      fastDay: 'Eating maror is allowed on fast days during Pesach Seder.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 475',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'eat_afikoman',
    title: 'Eat Afikoman',
    description: 'Eat afikoman during Pesach Seder',
    category: 'Special Days',
    isPermitted: true,
    notes: 'Only during Pesach Seder',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Eating afikoman is allowed during Pesach Seder.',
      shabbat: 'Eating afikoman is allowed on Shabbat during Pesach Seder.',
      yomTov: 'Eating afikoman is allowed on holidays during Pesach Seder.',
      fastDay: 'Eating afikoman is allowed on fast days during Pesach Seder.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 477',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'drink_wine_seder',
    title: 'Drink Wine at Seder',
    description: 'Drink wine during Pesach Seder',
    category: 'Special Days',
    isPermitted: true,
    notes: 'Only during Pesach Seder',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'allowed',
    },
    explanation: {
      regular: 'Drinking wine is allowed during Pesach Seder.',
      shabbat: 'Drinking wine is allowed on Shabbat during Pesach Seder.',
      yomTov: 'Drinking wine is allowed on holidays during Pesach Seder.',
      fastDay: 'Drinking wine is allowed on fast days during Pesach Seder.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 472',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'eat_seudat_shlishit',
    title: 'Eat Seudat Shlishit',
    description: 'Eat third Shabbat meal',
    category: 'Special Days',
    isPermitted: true,
    notes: 'Only on Shabbat',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'forbidden',
      shabbat: 'allowed',
      yomTov: 'forbidden',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Eating seudat shlishit is forbidden on weekdays.',
      shabbat: 'Eating seudat shlishit is allowed on Shabbat.',
      yomTov: 'Eating seudat shlishit is forbidden on holidays.',
      fastDay: 'Eating seudat shlishit is forbidden on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 291',
      },
    ],
    relatedActivities: [],
  },
  {
    id: 'eat_seudat_rosh_chodesh',
    title: 'Eat Seudat Rosh Chodesh',
    description: 'Eat Rosh Chodesh meal',
    category: 'Special Days',
    isPermitted: true,
    notes: 'Only on Rosh Chodesh',
    defaultStatus: 'allowed',
    statusByDay: {
      regular: 'allowed',
      shabbat: 'allowed',
      yomTov: 'allowed',
      fastDay: 'forbidden',
    },
    explanation: {
      regular: 'Eating seudat Rosh Chodesh is allowed on Rosh Chodesh.',
      shabbat: 'Eating seudat Rosh Chodesh is allowed on Shabbat during Rosh Chodesh.',
      yomTov: 'Eating seudat Rosh Chodesh is allowed on holidays during Rosh Chodesh.',
      fastDay: 'Eating seudat Rosh Chodesh is forbidden on fast days.',
    },
    customVariation: {},
    sources: [
      {
        text: 'Shulchan Aruch',
        reference: 'Orach Chaim 419',
      },
    ],
    relatedActivities: [],
  },
];

/**
 * Initialize activities data if not already in storage
 */
export const initializeActivities = async (): Promise<void> => {
  try {
    const existingActivities = await AsyncStorage.getItem(ACTIVITIES_STORAGE_KEY);
    
    if (!existingActivities) {
      await AsyncStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(ACTIVITIES));
    }
  } catch (error) {
    console.error('Error initializing activities:', error);
  }
};

/**
 * Get all activities
 */
export const getActivities = async (): Promise<Activity[]> => {
  try {
    // Check if activities exist in storage, if not initialize them
    await initializeActivities();
    
    const activitiesJson = await AsyncStorage.getItem(ACTIVITIES_STORAGE_KEY);
    
    if (activitiesJson) {
      return JSON.parse(activitiesJson) as Activity[];
    }
    
    return ACTIVITIES;
  } catch (error) {
    console.error('Error getting activities:', error);
    return ACTIVITIES;
  }
};

/**
 * Get a single activity by ID (async, fetches from API if configured)
 */
export const getActivityById = async (id: string): Promise<Activity | null> => {
  try {
    // Try to fetch from API if configured
    const apiResult = await makeApiRequest<Activity>(`/activities/${id}`);
    if (apiResult && apiResult.success && apiResult.data) {
      return apiResult.data;
    }
  } catch (error) {
    console.error('Error fetching activity from API:', error);
  }
  // Fallback to local data
  try {
    return ACTIVITIES.find(activity => activity.id === id) || null;
  } catch (error) {
    console.error('Error getting activity by ID:', error);
    return null;
  }
};

/**
 * Synchronous version for direct/local use only
 */
export const getActivityByIdSync = (id: string): Activity | null => {
  try {
    return ACTIVITIES.find(activity => activity.id === id) || null;
  } catch (error) {
    console.error('Error getting activity by ID:', error);
    return null;
  }
};

/**
 * Get activities by day type
 */
export const getActivitiesByDayType = async (dayType: DayType): Promise<Activity[]> => {
  try {
    const activities = await getActivities();
    return activities;
  } catch (error) {
    console.error('Error getting activities by day type:', error);
    return [];
  }
};

/**
 * Get activities by category (async version)
 */
export const getActivitiesByCategory = async (category: string): Promise<Activity[]> => {
  try {
    const activities = await getActivities();
    if (!category) {
      return activities;
    }
    return activities.filter(activity => activity.category === category);
  } catch (error) {
    console.error('Error getting activities by category:', error);
    return [];
  }
};

/**
 * Get activities by category (synchronous version for use in components)
 */
export const getActivitiesByCategorySync = (category: string): Activity[] => {
  // Use the predefined ACTIVITIES array directly for synchronous access
  if (!category) {
    return ACTIVITIES;
  }
  return ACTIVITIES.filter(activity => activity.category === category);
};

/**
 * Get all unique categories
 */
export const getCategories = async (): Promise<string[]> => {
  try {
    const activities = await getActivities();
    const categoriesSet = new Set(activities.map(activity => activity.category));
    return Array.from(categoriesSet);
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

/**
 * Get the status of an activity for a specific day type and tradition
 */
export const getActivityStatus = (
  activity: Activity, 
  dayType: DayType,
  tradition: CustomType = 'Ashkenazi'
): ActivityStatus => {
  try {
    // Check if we have a tradition-specific status
    const traditionKey = tradition.toLowerCase() as 'ashkenazi' | 'sephardi';
    const customVariation = activity.customVariation?.[traditionKey];
    const hasCustom = customVariation && customVariation.statusByDay && customVariation.statusByDay[dayType];
    
    if (hasCustom && customVariation.statusByDay) {
      return customVariation.statusByDay[dayType] as ActivityStatus;
    }
    
    // Fall back to default status
    return activity.statusByDay?.[dayType] || activity.defaultStatus || 'conditional';
  } catch (error) {
    console.error(`Error getting activity status for ${activity.id}:`, error);
    return 'conditional'; // Default to conditional as a safe fallback
  }
};
