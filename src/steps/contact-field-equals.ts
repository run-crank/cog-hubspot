/*tslint:disable:no-else-after-return*/

import { BaseStep, Field, StepInterface } from '../core/base-step';
import { Step, FieldDefinition, StepDefinition } from '../proto/cog_pb';

export class ContactFieldEquals extends BaseStep implements StepInterface {

  protected stepName: string = 'Check a field on a HubSpot Contact';
  // tslint:disable-next-line:max-line-length
  protected stepExpression: string = 'the (?<field>[a-zA-Z0-9_-]+) field on hubspot contact (?<email>.+) should be (?<expectation>.+)';
  protected stepType: StepDefinition.Type = StepDefinition.Type.VALIDATION;
  protected expectedFields: Field[] = [{
    field: 'email',
    type: FieldDefinition.Type.EMAIL,
    description: "Contact's email address",
  }, {
    field: 'field',
    type: FieldDefinition.Type.STRING,
    description: 'Field name to check',
  }, {
    field: 'expectation',
    type: FieldDefinition.Type.ANYSCALAR,
    description: 'Expected field value',
  }];

  async executeStep(step: Step) {
    const stepData: any = step.getData() ? step.getData().toJavaScript() : {};
    const expectation = stepData.expectation;
    const email = stepData.email;
    const field = stepData.field;

    try {
      const contact = await this.client.getContactByEmail(email);

      if (!contact.properties[field]) {
        return this.error('Expected field %s was invalid.', [
          field,
        ]);
      }

      // tslint:disable-next-line:triple-equals
      if (contact.properties[field].value == expectation) {
        return this.pass('The %s field was %s, as expected.', [
          field,
          expectation,
        ]);
      } else {
        return this.fail('Expected %s to be %s, but it was actually %s.', [
          field,
          expectation,
          contact.properties[field],
        ]);
      }
    } catch (e) {
      return this.error('There was an error loading contacts from Hubspot: %s', [e.toString()]);
    }
  }

}

export { ContactFieldEquals as Step };
