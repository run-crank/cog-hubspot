import * as grpc from 'grpc';
import * as Hubspot from 'hubspot';
import { Field } from '../core/base-step';
import { FieldDefinition } from '../proto/cog_pb';
import { ContactAware } from './mixins/contact-aware';

class ClientWrapper {
  public static expectedAuthFields: Field[] = [{
    field: 'apiKey',
    type: FieldDefinition.Type.STRING,
    description: 'API Key',
  }];

  client: Hubspot.default;

  constructor(auth: grpc.Metadata, clientConstructor = Hubspot.default) {
    this.client = new clientConstructor({
      apiKey: auth.get('apiKey').toString(),
    });
  }
}

interface ClientWrapper extends ContactAware { }

export { ClientWrapper as ClientWrapper };
