import * as grpc from 'grpc';
import * as Hubspot from 'hubspot';
import { Field } from '../core/base-step';
import { FieldDefinition } from '../proto/cog_pb';
import { ContactAwareMixin } from './mixins/contact-aware';

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

interface ClientWrapper extends ContactAwareMixin {}

applyMixins(ClientWrapper, [ContactAwareMixin]);

function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
          // tslint:disable-next-line:max-line-length
      Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
    });
  });
}

export { ClientWrapper as ClientWrapper };
