import * as grpc from 'grpc';
import { Field } from '../core/base-step';
import { FieldDefinition } from '../proto/cog_pb';
import * as Hubspot from 'hubspot';
import { rejects } from 'assert';

export class ClientWrapper {
  public static expectedAuthFields: Field[] = [{
    field: 'apiKey',
    type: FieldDefinition.Type.STRING,
    description: 'API Key',
  }];

  private client: Hubspot.default;

  constructor(auth: grpc.Metadata, clientConstructor = Hubspot.default) {
    this.client = new clientConstructor({
      apiKey: auth.get('apiKey').toString(),
    });
  }

  public async getContactByEmail(email: string): Promise<Object> {
    return new Promise((resolve, reject) => {
      this.client.contacts.getByEmail(email).then((result) => {
        resolve(result);
      },                                          (error) => {
        reject(error.message);
      });
    });
  }
}
