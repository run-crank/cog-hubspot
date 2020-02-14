import * as hubspot from 'hubspot';

export class ContactAwareMixin {
  clientReady: Promise<boolean>;
  client: hubspot.default;

  public async getContactByEmail(email: string): Promise<Object> {
    await this.clientReady;
    return new Promise((resolve, reject) => {
      this.client.contacts.getByEmail(email).then((result) => {
        resolve(result);
      },                                          (error) => {
        reject(error.message);
      });
    });
  }

  public async createOrUpdateContact(email: string, contact: Object): Promise<Object> {
    await this.clientReady;
    return new Promise((resolve, reject) => {
      this.client.contacts.createOrUpdate(email, contact).then((result) => {
        resolve(result);
      },                                                       (error) => {
        reject(error.message);
      });
    });
  }

  public async deleteContactByEmail(email: string): Promise<Object> {
    await this.clientReady;
    return new Promise(async (resolve, reject) => {
      try {
        const contact = await this.client.contacts.getByEmail(email);
        const result = await this.client.contacts.delete(contact['vid']);
        resolve({ result, contact });
      } catch (e) {
        reject(e.message);
      }
    });
  }
}
