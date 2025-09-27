import { Injectable } from '@nestjs/common';

export interface GeoData {
  countryCode?: string;
  timezone?: string;
  language?: string;
}

@Injectable()
export class GeoipService {
  async getGeoData(ip: string): Promise<GeoData> {
    try {
      // Utiliser ipapi.co (gratuit, 1000 req/jour)
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      if (!response.ok) return {};
      
      const data = await response.json();
      return {
        countryCode: data.country_code || undefined,
        timezone: data.timezone || undefined,
        language: this.mapCountryToLanguage(data.country_code),
      };
    } catch (error) {
      console.warn('Géolocalisation IP échouée:', error);
      return {};
    }
  }

  private mapCountryToLanguage(countryCode?: string): string {
    const mapping: Record<string, string> = {
      'FR': 'fr-FR',
      'BE': 'fr-FR',
      'CH': 'fr-FR',
      'CA': 'fr-FR',
      'ES': 'es-ES',
      'IT': 'it-IT',
      'DE': 'de-DE',
      'GB': 'en-GB',
      'US': 'en-US',
      'AU': 'en-AU',
    };
    return mapping[countryCode || ''] || 'en-US';
  }
}