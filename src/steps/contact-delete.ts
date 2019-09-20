/*tslint:disable:no-else-after-return*/

import { BaseStep, Field, StepInterface } from '../core/base-step';
import { Step, FieldDefinition, StepDefinition } from '../proto/cog_pb';

export class DeleteContactStep extends BaseStep implements StepInterface {

  protected stepName: string = 'Delete a hubspot contact';
  protected stepExpression: string = 'delete the (?<email>.+) hubspot contact';
  protected stepType: StepDefinition.Type = StepDefinition.Type.ACTION;

  protected expectedFields: Field[] = [{
    field: 'email',
    type: FieldDefinition.Type.EMAIL,
    description: 'Contact\'s email address',
  }];

  async executeStep(step: Step) {
    const stepData: any = step.getData().toJavaScript();
    const email: string = stepData.email;

    try {
      const data = await this.client.deleteContactByEmail(email);

      if (data.deleted) {
        return this.pass('Successfully deleted contact %s', [
          email,
        ]);
      } else {
        return this.fail('Unable to delete contact. Reason: %s', [
          data.reason,
        ]);
      }
    } catch (e) {
      return this.error('There was an error delete contact in HubSpot: %s', [
        e.toString(),
      ]);
    }
  }

}

export { DeleteContactStep as Step };
