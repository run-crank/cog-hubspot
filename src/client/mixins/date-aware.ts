export class DateAwareMixin {

  public isDate(object: string, field: string): boolean {
    const fields = this.getDateFields()[object];
    return fields.includes(field);
  }

  public toDate(epoch: number): string {
    const result = new Date(+epoch);
    return result.toISOString();
  }

  public getDateFields() {
    return {
      contact: [
        'first_conversion_date',
        'first_deal_created_date',
        'hs_content_membership_registered_at',
        'hs_content_membership_registration_email_sent_at',
        'hs_createdate',
        'hs_document_last_revisited',
        'hs_email_recipient_fatigue_recovery_time',
        'hs_feedback_last_survey_date',
        'hs_last_sales_activity_date',
        'hs_lastmodifieddate',
        'hs_sales_email_last_clicked',
        'hs_sales_email_last_opened',
        'hubspot_owner_assigneddate',
        'lastmodifieddate',
        'recent_conversion_date',
        'recent_deal_close_date',
        'salesforcelastsynctime',
        'hs_analytics_first_timestamp',
        'hs_email_last_send_date',
        'engagements_last_meeting_booked',
        'hs_analytics_first_visit_timestamp',
        'hs_email_last_open_date',
        'hs_sales_email_last_replied',
        'notes_last_contacted',
        'notes_last_updated',
        'notes_next_activity_date',
        'hs_analytics_last_timestamp',
        'hs_email_last_click_date',
        'hs_analytics_last_visit_timestamp',
        'hs_email_first_send_date',
        'hs_email_first_open_date',
        'hs_email_first_click_date',
        'closedate',
        'hs_lifecyclestage_lead_date',
        'hs_lifecyclestage_marketingqualifiedlead_date',
        'hs_lifecyclestage_opportunity_date',
        'hs_lifecyclestage_salesqualifiedlead_date',
        'createdate',
        'hs_lifecyclestage_evangelist_date',
        'hs_lifecyclestage_customer_date',
        'hs_lifecyclestage_subscriber_date',
        'hs_lifecyclestage_other_date'],
    };
  }
}
