import { Resend } from "resend"

export interface SendEmailOptions {
    apiKey: string
    from: string
    to: string
    subject: string
    html: string
    replyTo?: string
    tags?: { name: string; value: string }[]
}

export interface BatchEmailOptions {
    apiKey: string
    emails: {
        from: string
        to: string
        subject: string
        html: string
        replyTo?: string
        tags?: { name: string; value: string }[]
    }[]
}

export class ResendService {
    static async sendEmail(opts: SendEmailOptions): Promise<{ id: string }> {
        const resend = new Resend(opts.apiKey)
        const { data, error } = await resend.emails.send({
            from: opts.from,
            to: opts.to,
            subject: opts.subject,
            html: opts.html,
            replyTo: opts.replyTo,
            tags: opts.tags,
        })
        if (error) throw new Error(`Resend error: ${error.message}`)
        return { id: data!.id }
    }

    static async sendBatch(opts: BatchEmailOptions): Promise<{ ids: string[] }> {
        const resend = new Resend(opts.apiKey)
        const { data, error } = await resend.batch.send(
            opts.emails.map((e) => ({
                from: e.from,
                to: e.to,
                subject: e.subject,
                html: e.html,
                replyTo: e.replyTo,
                tags: e.tags,
            }))
        )
        if (error) throw new Error(`Resend batch error: ${error.message}`)
        return { ids: data!.data.map((d: any) => d.id) }
    }

    static buildCampaignEmail(opts: {
        senderName: string
        senderDomain: string
        recipientEmail: string
        subject: string
        body: string
        prospectName: string
        companyName: string
        unsubscribeUrl: string
        physicalAddress: string
    }): SendEmailOptions {
        const personalizedBody = opts.body
            .replace(/\{\{prospect_name\}\}/g, opts.prospectName)
            .replace(/\{\{company_name\}\}/g, opts.companyName)

        const html = `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        ${personalizedBody}
        <hr style="margin-top: 2rem; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="font-size: 12px; color: #6b7280;">
          ${opts.physicalAddress}<br/>
          <a href="${opts.unsubscribeUrl}" style="color: #6366f1;">Unsubscribe</a>
        </p>
      </div>
    `

        return {
            apiKey: "", // Set by caller
            from: `${opts.senderName} <noreply@${opts.senderDomain}>`,
            to: opts.recipientEmail,
            subject: opts.subject.replace(/\{\{prospect_name\}\}/g, opts.prospectName),
            html,
            tags: [
                { name: "campaign", value: "outreach" },
                { name: "prospect", value: opts.prospectName },
            ],
        }
    }
}
