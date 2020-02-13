/*tslint:disable:no-else-after-return*/

import { BaseStep, Field, StepInterface, ExpectedRecord } from '../../core/base-step';
import { Step, FieldDefinition, StepDefinition, RecordDefinition } from '../../proto/cog_pb';

export class CreateOrUpdateContactStep extends BaseStep implements StepInterface {

  protected stepName: string = 'Create or update a HubSpot contact';
  protected stepExpression: string = 'create or update a hubspot contact';
  protected stepType: StepDefinition.Type = StepDefinition.Type.ACTION;

  protected expectedFields: Field[] = [{
    field: 'contact',
    type: FieldDefinition.Type.MAP,
    description: 'A map of field names to field values',
  }];

  protected expectedRecords: ExpectedRecord[] = [{
    id: 'contact',
    type: RecordDefinition.Type.KEYVALUE,
    fields: [{
      field: 'id',
      type: FieldDefinition.Type.STRING,
      description: 'The contact\'s ID',
    }],
    dynamicFields: true,
  }];

  async executeStep(step: Step) {
    const stepData: any = step.getData().toJavaScript();
    const email: string = stepData.contact.email;
    const contact: Object = {
      properties: [],
    };

    try {
      Object.keys(stepData.contact).forEach((key) => {
        contact['properties'].push({
          property: key,
          value: stepData.contact[key],
        });
      });

      const data = await this.client.createOrUpdateContact(email, contact);
      const record = this.keyValue('contact', 'Created Contact', stepData.contact);

      if (data) {
        return this.pass('Successfully created or updated HubSpot contact %s', [email], [record]);
      } else {
        return this.fail('Unable to create or update HubSpot contact');
      }
    } catch (e) {
      return this.error('There was an error creating or updating the contact in HubSpot: %s', [
        e.toString(),
      ]);
    }
  }

}

export { CreateOrUpdateContactStep as Step };
