/*tslint:disable:no-else-after-return*/

import { BaseStep, Field, StepInterface } from '../core/base-step';
import { Step, FieldDefinition, StepDefinition } from '../proto/cog_pb';
import * as util from '@run-crank/utilities';
import { baseOperators } from '../client/contants/operators';

export class ContactFieldEquals extends BaseStep implements StepInterface {

  protected stepName: string = 'Check a field on a HubSpot Contact';
  // tslint:disable-next-line:max-line-length
  protected stepExpression: string = 'the (?<field>[a-zA-Z0-9_-]+) field on hubspot contact (?<email>.+) should (?<operator>be less than|be greater than|be|contain|not be|not contain) (?<expectation>.+)';
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
    field: 'operator',
    type: FieldDefinition.Type.STRING,
    optionality: FieldDefinition.Optionality.OPTIONAL,
    description: 'Check Logic (be, not be, contain, not contain, be greater than, or be less than)',
  },
  {
    field: 'expectation',
    type: FieldDefinition.Type.ANYSCALAR,
    description: 'Expected field value',
  }];

  async executeStep(step: Step) {
    const stepData: any = step.getData() ? step.getData().toJavaScript() : {};
    const expectation = stepData.expectation;
    const email = stepData.email;
    const field = stepData.field;
    const operator = stepData.operator || 'be';

    try {
      const contact = await this.client.getContactByEmail(email);

      if (!contact.properties[field]) {
        return this.error("Couldn't check field %s on HubSpot contact: field doesn't exist.", [
          field,
        ]);
      }

      const value = contact.properties[field].value;
      const actual = this.client.isDate(value) ? this.client.toDate(value) : value;

      if (this.compare(operator, actual, expectation)) {
        return this.pass(this.operatorSuccessMessages[operator], [
          field,
          expectation,
        ]);
      } else {
        return this.fail(this.operatorFailMessages[operator], [
          field,
          expectation,
          actual,
        ]);
      }
    } catch (e) {
      if (e instanceof util.UnknownOperatorError) {
        return this.error('%s Please provide one of: %s', [e.message, baseOperators.join(', ')]);
      }
      if (e instanceof util.InvalidOperandError) {
        return this.error('There was an error checking the contact field: %s', [e.message]);
      }
      return this.error('There was an error checking the contact field: %s', [e.message]);
    }
  }

}

export { ContactFieldEquals as Step };
