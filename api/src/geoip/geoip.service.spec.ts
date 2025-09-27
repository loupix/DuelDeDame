import { Test, TestingModule } from '@nestjs/testing';
import { GeoipService } from './geoip.service';

// Mock fetch global
global.fetch = jest.fn();

describe('GeoipService', () => {
  let service: GeoipService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeoipService],
    }).compile();

    service = module.get<GeoipService>(GeoipService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getGeoData', () => {
    it('devrait retourner les données géographiques pour une IP valide', async () => {
      const mockResponse = {
        country_code: 'FR',
        timezone: 'Europe/Paris',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await service.getGeoData('192.168.1.1');

      expect(global.fetch).toHaveBeenCalledWith('https://ipapi.co/192.168.1.1/json/');
      expect(result).toEqual({
        countryCode: 'FR',
        timezone: 'Europe/Paris',
        language: 'fr-FR',
      });
    });

    it('devrait retourner un objet vide si la requête échoue', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });

      const result = await service.getGeoData('192.168.1.1');

      expect(global.fetch).toHaveBeenCalledWith('https://ipapi.co/192.168.1.1/json/');
      expect(result).toEqual({});
    });

    it('devrait retourner un objet vide en cas d\'erreur réseau', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      // Supprimer le warning console pour ce test
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await service.getGeoData('192.168.1.1');

      expect(global.fetch).toHaveBeenCalledWith('https://ipapi.co/192.168.1.1/json/');
      expect(result).toEqual({});
      
      consoleSpy.mockRestore();
    });

    it('devrait mapper correctement les codes pays vers les langues', async () => {
      const testCases = [
        { country_code: 'FR', expectedLanguage: 'fr-FR' },
        { country_code: 'BE', expectedLanguage: 'fr-FR' },
        { country_code: 'ES', expectedLanguage: 'es-ES' },
        { country_code: 'DE', expectedLanguage: 'de-DE' },
        { country_code: 'US', expectedLanguage: 'en-US' },
        { country_code: 'XX', expectedLanguage: 'en-US' }, // Code inconnu
      ];

      for (const testCase of testCases) {
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ country_code: testCase.country_code }),
        });

        const result = await service.getGeoData('192.168.1.1');

        expect(result.language).toBe(testCase.expectedLanguage);
      }
    });
  });
});