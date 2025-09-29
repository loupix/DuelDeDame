'use client'

export class SessionService {
  private static instance: SessionService
  private apiBase: string

  private constructor() {
    // Si NEXT_PUBLIC_API_URL n'est pas défini, on déduit l'URL à partir de l'hôte courant (public par défaut)
    if (process.env.NEXT_PUBLIC_API_URL) {
      this.apiBase = process.env.NEXT_PUBLIC_API_URL
    } else if (typeof window !== 'undefined' && window.location) {
      const host = window.location.hostname
      this.apiBase = `http://${host}:3001`
    } else {
      this.apiBase = 'http://localhost:3001'
    }
  }

  static getInstance(): SessionService {
    if (!SessionService.instance) SessionService.instance = new SessionService()
    return SessionService.instance
  }

  getOrCreateIdentity(): { identity: string; firstName: string; lastName: string; avatarColor: string; countryCode: string; language: string; timezone: string } {
    const key = 'identityObject'
    let obj: { identity: string; firstName: string; lastName: string; avatarColor: string; countryCode: string; language: string; timezone: string } | null = null
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(key)
        if (raw) obj = JSON.parse(raw)
      } catch {}
    }
    if (!obj) {
      const identity = `u_${Math.random().toString(36).slice(2, 10)}`
      const firstName = this.randomFirstName()
      const lastName = this.randomLastName()
      const avatarColor = this.randomColor()
      const countryCode = this.randomCountry()
      const language = this.detectLanguage()
      const timezone = this.detectTimezone()
      obj = { identity, firstName, lastName, avatarColor, countryCode, language, timezone }
      try { localStorage.setItem(key, JSON.stringify(obj)) } catch {}
    }
    // Fire-and-forget pour créer la session côté API
    this.createSession(obj).catch(() => {})
    return obj
  }

  async createSession(payload: { identity: string; firstName: string; lastName: string; avatarColor: string; countryCode: string; language: string; timezone: string }): Promise<void> {
    await fetch(`${this.apiBase}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  }

  displayName(identityObj: { firstName: string; lastName: string }): string {
    const initial = identityObj.lastName ? identityObj.lastName[0].toUpperCase() : ''
    return `${identityObj.firstName} ${initial ? initial + '.' : ''}`.trim()
  }

  private randomFirstName(): string {
    const list = [
      'Alex','Sam','Léa','Noa','Maya','Nina','Léo','Eli','Milo','Zoe',
      'Lucas','Hugo','Louis','Adam','Arthur','Jules','Maël','Nathan','Gabriel','Théo',
      'Chloé','Emma','Lina','Manon','Inès','Camille','Louna','Jade','Zoé','Ambre',
      'Enzo','Ethan','Tom','Sacha','Raphaël','Noé','Maxime','Axel','Paul','Timéo',
      'Sarah','Eva','Alice','Jeanne','Mila','Léonie','Lucie','Charlie','Lila','Romy',
      'Yanis','Imran','Ilyes','Kylian','Rayan','Mehdi','Adem','Youssef','Ismaël','Yohan',
      'Noémie','Maëlys','Anaïs','Eléna','Adèle','Louise','Ava','Élise','Lison','Agathe'
    ]
    return list[Math.floor(Math.random() * list.length)]
  }

  private randomLastName(): string {
    const list = [
      'Martin','Bernard','Thomas','Petit','Robert','Richard','Durand','Dubois','Moreau','Laurent',
      'Simon','Michel','Lefebvre','Leroy','Roux','David','Bertrand','Morel','Fournier','Girard',
      'Bonnet','Dupont','Lambert','Fontaine','Rousseau','Vincent','Muller','Lefèvre','Faure','Andre',
      'Mercier','Blanc','Guerin','Boyer','Garnier','Chevalier','Francois','Legrand','Gauthier','Garcia',
      'Perrin','Robin','Clement','Morin','Nicolas','Henry','Roussel','Mathieu','Gautier','Masson',
      'Marchand','Duval','Denis','Dumas','Joly','Noel','Meyer','Lucas','Lacroix','Renard'
    ]
    return list[Math.floor(Math.random() * list.length)]
  }

  private randomColor(): string {
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']
    return colors[Math.floor(Math.random() * colors.length)]
  }

  private randomCountry(): string {
    const countries = ['FR', 'BE', 'CH', 'CA', 'ES', 'IT', 'DE']
    return countries[Math.floor(Math.random() * countries.length)]
  }

  private detectLanguage(): string {
    if (typeof navigator !== 'undefined' && navigator.language) return navigator.language
    return 'fr-FR'
  }

  private detectTimezone(): string {
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    }
    return 'UTC'
  }

  async listMatches(identity: string) {
    const res = await fetch(`${this.apiBase}/matches?identity=${encodeURIComponent(identity)}`)
    if (!res.ok) return []
    return await res.json()
  }
}

