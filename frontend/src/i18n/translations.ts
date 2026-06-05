export type Language = 'English' | 'Hindi (हिंदी)' | 'Bengali (বাংলা)' | 'Punjabi (ਪੰਜਾਬੀ)';

export const translations: Record<Language, Record<string, string>> = {
  'English': {
    'Dashboard': 'Dashboard',
    'Visit Planner': 'Visit Planner',
    'AI Recommendations': 'AI Recommendations',
    'Risk Analyzer': 'Risk Analyzer',
    'Retailer Insights': 'Retailer Insights',
    'Grower Insights': 'Grower Insights',
    'Analytics': 'Analytics',
    'Notifications': 'Notifications',
    'Settings': 'Settings',
    'Rep-wise Visit Tracking': 'Rep-wise Visit Tracking',
    'Team Performance': 'Team Performance',
    'Product Demand Trends': 'Product Demand Trends',
    'Recommendation Impact': 'Recommendation Impact',
    'High Priority Areas': 'High Priority Areas',
    'Reports & Downloads': 'Reports & Downloads',
    'Good Morning': 'Good Morning',
    'Good Afternoon': 'Good Afternoon',
    'Good Evening': 'Good Evening',
    'Online - Synced': 'Online - Synced',
    'Offline - Queued': 'Offline - Queued'
  },
  'Hindi (हिंदी)': {
    'Dashboard': 'डैशबोर्ड',
    'Visit Planner': 'यात्रा योजनाकार',
    'AI Recommendations': 'एआई सिफारिशें',
    'Risk Analyzer': 'जोखिम विश्लेषक',
    'Retailer Insights': 'विक्रेता अंतर्दृष्टि',
    'Grower Insights': 'उत्पादक अंतर्दृष्टि',
    'Analytics': 'विश्लेषण',
    'Notifications': 'सूचनाएं',
    'Settings': 'सेटिंग्स',
    'Rep-wise Visit Tracking': 'प्रतिनिधि यात्रा ट्रैकिंग',
    'Team Performance': 'टीम का प्रदर्शन',
    'Product Demand Trends': 'उत्पाद मांग रुझान',
    'Recommendation Impact': 'सिफारिश प्रभाव',
    'High Priority Areas': 'उच्च प्राथमिकता क्षेत्र',
    'Reports & Downloads': 'रिपोर्ट और डाउनलोड',
    'Good Morning': 'शुभ प्रभात',
    'Good Afternoon': 'शुभ दोपहर',
    'Good Evening': 'शुभ संध्या',
    'Online - Synced': 'ऑनलाइन - सिंक किया गया',
    'Offline - Queued': 'ऑफ़लाइन - कतारबद्ध'
  },
  'Bengali (বাংলা)': {
    'Dashboard': 'ড্যাশবোর্ড',
    'Visit Planner': 'ভ্রমণ পরিকল্পনাকারী',
    'AI Recommendations': 'এআই সুপারিশ',
    'Risk Analyzer': 'ঝুঁকি বিশ্লেষক',
    'Retailer Insights': 'খুচরা বিক্রেতা তথ্য',
    'Grower Insights': 'চাষী তথ্য',
    'Analytics': 'বিশ্লেষণ',
    'Notifications': 'বিজ্ঞপ্তি',
    'Settings': 'সেটিংস',
    'Rep-wise Visit Tracking': 'প্রতিনিধি ভ্রমণ ট্র্যাকিং',
    'Team Performance': 'টিমের পারফরম্যান্স',
    'Product Demand Trends': 'পণ্যের চাহিদার গতিধারা',
    'Recommendation Impact': 'সুপারিশের প্রভাব',
    'High Priority Areas': 'উচ্চ অগ্রাধিকার এলাকা',
    'Reports & Downloads': 'রিপোর্ট এবং ডাউনলোড',
    'Good Morning': 'সুপ্রভাত',
    'Good Afternoon': 'শুভ দুপুর',
    'Good Evening': 'শুভ সন্ধ্যা',
    'Online - Synced': 'অনলাইন - সিঙ্ক করা হয়েছে',
    'Offline - Queued': 'অফলাইন - সারিবদ্ধ'
  },
  'Punjabi (ਪੰਜਾਬੀ)': {
    'Dashboard': 'ਡੈਸ਼ਬੋਰਡ',
    'Visit Planner': 'ਯਾਤਰਾ ਯੋਜਨਾਕਾਰ',
    'AI Recommendations': 'ਏਆਈ ਸਿਫ਼ਾਰਸ਼ਾਂ',
    'Risk Analyzer': 'ਜੋਖਮ ਵਿਸ਼ਲੇਸ਼ਕ',
    'Retailer Insights': 'ਵਿਕਰੇਤਾ ਅੰਤਰਦ੍ਰਿਸ਼ਟੀ',
    'Grower Insights': 'ਉਤਪਾਦਕ ਅੰਤਰਦ੍ਰਿਸ਼ਟੀ',
    'Analytics': 'ਵਿਸ਼ਲੇਸ਼ਣ',
    'Notifications': 'ਨੋਟੀਫਿਕੇਸ਼ਨ',
    'Settings': 'ਸੈਟਿੰਗਾਂ',
    'Rep-wise Visit Tracking': 'ਪ੍ਰਤੀਨਿਧੀ ਯਾਤਰਾ ਟ੍ਰੈਕਿੰਗ',
    'Team Performance': 'ਟੀਮ ਦਾ ਪ੍ਰਦਰਸ਼ਨ',
    'Product Demand Trends': 'ਉਤਪਾਦ ਦੀ ਮੰਗ ਦੇ ਰੁਝਾਨ',
    'Recommendation Impact': 'ਸਿਫ਼ਾਰਸ਼ ਦਾ ਪ੍ਰਭਾਵ',
    'High Priority Areas': 'ਉੱਚ ਤਰਜੀਹ ਵਾਲੇ ਖੇਤਰ',
    'Reports & Downloads': 'ਰਿਪੋਰਟਾਂ ਅਤੇ ਡਾਊਨਲੋਡ',
    'Good Morning': 'ਸ਼ੁਭ ਸਵੇਰ',
    'Good Afternoon': 'ਸ਼ੁਭ ਦੁਪਹਿਰ',
    'Good Evening': 'ਸ਼ੁਭ ਸ਼ਾਮ',
    'Online - Synced': 'ਔਨਲਾਈਨ - ਸਿੰਕ ਕੀਤਾ',
    'Offline - Queued': 'ਔਫਲਾਈਨ - ਕਤਾਰਬੱਧ'
  }
};

export function getTranslation(language: string | undefined, key: string): string {
  const lang = (language || 'English') as Language;
  const dict = translations[lang] || translations['English'];
  return dict[key] || translations['English'][key] || key;
}
