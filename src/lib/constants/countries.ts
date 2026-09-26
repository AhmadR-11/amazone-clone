export interface CountryOption {
  name: string;
  code: string;
  phoneCode: string;
  flag: string;
}

export const COUNTRIES: CountryOption[] = [
  { name: 'United States', code: 'US', phoneCode: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'GB', phoneCode: '+44', flag: '🇬🇧' },
  { name: 'Canada', code: 'CA', phoneCode: '+1', flag: '🇨🇦' },
  { name: 'Pakistan', code: 'PK', phoneCode: '+92', flag: '🇵🇰' },
  { name: 'India', code: 'IN', phoneCode: '+91', flag: '🇮🇳' },
  { name: 'Australia', code: 'AU', phoneCode: '+61', flag: '🇦🇺' },
  { name: 'Germany', code: 'DE', phoneCode: '+49', flag: '🇩🇪' },
  { name: 'France', code: 'FR', phoneCode: '+33', flag: '🇫🇷' },
  { name: 'United Arab Emirates', code: 'AE', phoneCode: '+971', flag: '🇦🇪' },
  { name: 'Saudi Arabia', code: 'SA', phoneCode: '+966', flag: '🇸🇦' },
  { name: 'Japan', code: 'JP', phoneCode: '+81', flag: '🇯🇵' },
  { name: 'China', code: 'CN', phoneCode: '+86', flag: '🇨🇳' },
  { name: 'Brazil', code: 'BR', phoneCode: '+55', flag: '🇧🇷' },
  { name: 'Mexico', code: 'MX', phoneCode: '+52', flag: '🇲🇽' },
  { name: 'Italy', code: 'IT', phoneCode: '+39', flag: '🇮🇹' },
  { name: 'Spain', code: 'ES', phoneCode: '+34', flag: '🇪🇸' },
  { name: 'Netherlands', code: 'NL', phoneCode: '+31', flag: '🇳🇱' },
  { name: 'Switzerland', code: 'CH', phoneCode: '+41', flag: '🇨🇭' },
  { name: 'Singapore', code: 'SG', phoneCode: '+65', flag: '🇸🇬' },
  { name: 'Turkey', code: 'TR', phoneCode: '+90', flag: '🇹🇷' },
];
