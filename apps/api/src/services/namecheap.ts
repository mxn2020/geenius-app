interface DomainAvailability {
  domain: string
  available: boolean
  priceCents: number
}

interface NamecheapDomainCheck {
  DomainName: string
  Available: "true" | "false"
  IsPremiumName: boolean
  PremiumRegistrationPrice: string
  RegularRegistrationPrice: string
}

export class NamecheapService {
  private apiUser: string
  private apiKey: string
  private clientIp: string
  private baseUrl = "https://api.namecheap.com/xml.response"

  constructor(apiUser: string, apiKey: string, clientIp: string) {
    this.apiUser = apiUser
    this.apiKey = apiKey
    this.clientIp = clientIp
  }

  private buildUrl(command: string, params: Record<string, string> = {}): string {
    const qs = new URLSearchParams({
      ApiUser: this.apiUser,
      ApiKey: this.apiKey,
      UserName: this.apiUser,
      ClientIp: this.clientIp,
      Command: command,
      ...params,
    })
    return `${this.baseUrl}?${qs}`
  }

  private parseXml(xml: string): string {
    // Simple extraction — production would use an XML parser
    return xml
  }

  async checkAvailability(domains: string[]): Promise<DomainAvailability[]> {
    const url = this.buildUrl("namecheap.domains.check", {
      DomainList: domains.join(","),
    })
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Namecheap: failed to check availability (${res.status})`)
    const xml = await res.text()
    this.parseXml(xml)

    // Parse basic availability from XML response
    return domains.map((domain) => {
      const available = xml.includes(`Domain="${domain}" Available="true"`)
      const priceMatch = xml.match(/RegularRegistrationPrice="([\d.]+)"/)
      const registrarCents = priceMatch ? Math.round(parseFloat(priceMatch[1]) * 100) : 1000
      return {
        domain,
        available,
        priceCents: this.applyMarkup(registrarCents),
      }
    })
  }

  async getPrice(domain: string): Promise<number> {
    const results = await this.checkAvailability([domain])
    return results[0]?.priceCents ?? this.applyMarkup(1000)
  }

  private applyMarkup(registrarCents: number): number {
    return Math.max(1000, Math.ceil(registrarCents * 1.3))
  }

  async purchaseDomain(domain: string, years: number): Promise<void> {
    const url = this.buildUrl("namecheap.domains.create", {
      DomainName: domain,
      Years: String(years),
      AuxBillingFirstName: "Geenius",
      AuxBillingLastName: "Platform",
      AuxBillingAddress1: "123 Main St",
      AuxBillingCity: "San Francisco",
      AuxBillingStateProvince: "CA",
      AuxBillingPostalCode: "94105",
      AuxBillingCountry: "US",
      AuxBillingPhone: "+1.4155551234",
      AuxBillingEmailAddress: "billing@geenius.dev",
      RegistrantFirstName: "Geenius",
      RegistrantLastName: "Platform",
      RegistrantAddress1: "123 Main St",
      RegistrantCity: "San Francisco",
      RegistrantStateProvince: "CA",
      RegistrantPostalCode: "94105",
      RegistrantCountry: "US",
      RegistrantPhone: "+1.4155551234",
      RegistrantEmailAddress: "billing@geenius.dev",
      TechFirstName: "Geenius",
      TechLastName: "Platform",
      TechAddress1: "123 Main St",
      TechCity: "San Francisco",
      TechStateProvince: "CA",
      TechPostalCode: "94105",
      TechCountry: "US",
      TechPhone: "+1.4155551234",
      TechEmailAddress: "billing@geenius.dev",
    })
    const res = await fetch(url, { method: "POST" })
    if (!res.ok) throw new Error(`Namecheap: failed to purchase domain (${res.status})`)
  }

  async setDNStoVercel(domain: string): Promise<void> {
    const [sld, ...tldParts] = domain.split(".")
    const tld = tldParts.join(".")
    const url = this.buildUrl("namecheap.domains.dns.setCustom", {
      SLD: sld,
      TLD: tld,
      Nameservers: "ns1.vercel-dns.com,ns2.vercel-dns.com",
    })
    const res = await fetch(url, { method: "POST" })
    if (!res.ok) throw new Error(`Namecheap: failed to set DNS (${res.status})`)
  }

  async getDomainStatus(domain: string): Promise<string> {
    const [sld, ...tldParts] = domain.split(".")
    const tld = tldParts.join(".")
    const url = this.buildUrl("namecheap.domains.getInfo", { DomainName: domain, SLD: sld, TLD: tld })
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Namecheap: failed to get domain status (${res.status})`)
    const xml = await res.text()
    const match = xml.match(/Status="([^"]+)"/)
    return match?.[1] ?? "unknown"
  }

  async renewDomain(domain: string): Promise<void> {
    const [sld, ...tldParts] = domain.split(".")
    const tld = tldParts.join(".")
    const url = this.buildUrl("namecheap.domains.renew", {
      DomainName: domain,
      Years: "1",
      SLD: sld,
      TLD: tld,
    })
    const res = await fetch(url, { method: "POST" })
    if (!res.ok) throw new Error(`Namecheap: failed to renew domain (${res.status})`)
  }
}
