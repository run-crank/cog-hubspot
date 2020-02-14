/*tslint:disable:no-else-after-return*/
/*tslint:disable:max-line-length*/

import { BaseStep, Field, StepInterface, ExpectedRecord } from '../../core/base-step';
import { Step, FieldDefinition, StepDefinition, RecordDefinition } from '../../proto/cog_pb';

export class EnrollContactToWorkflowStep extends BaseStep implements StepInterface {

  protected stepName: string = 'Enroll a HubSpot Contact into a Workflow';
  protected stepExpression: string = 'enroll the (?<email>.+) hubspot contact into workflow (?<workflow>.+)';
  protected stepType: StepDefinition.Type = StepDefinition.Type.ACTION;

  protected expectedFields: Field[] = [{
    field: 'workflow',
    type: FieldDefinition.Type.ANYSCALAR,
    description: 'Workflow\'s Name or ID',
  }, {
    field: 'email',
    type: FieldDefinition.Type.EMAIL,
    description: 'Contact\'s email address',
  }];
  
  protected expectedRecords: ExpectedRecord[] = [{
    id: 'workflow',
    type: RecordDefinition.Type.KEYVALUE,
    fields: [{
      field: 'id',
      type: FieldDefinition.Type.NUMERIC,
      description: 'The Workflow\'s ID',
    }, {
      field: 'name',
      type: FieldDefinition.Type.STRING,
      description: 'The Workflow\'s Name',
    }, {
      field: 'type',
      type: FieldDefinition.Type.STRING,
      description: 'The Workflow\'s Type',
    }, {
      field: 'description',
      type: FieldDefinition.Type.STRING,
      description: 'The Workflow\'s Description',
    }],
    dynamicFields: true,
  }];

  async executeStep(step: Step) {
    const stepData: any = step.getData().toJavaScript();
    const email: string = stepData.email;
    let workflow = stepData.workflow;

    try {
      if (isNaN(workflow)) {
        const workflows = await this.client.findWorkflowByName(workflow);
        if (workflows.length > 1) {
          // tslint:disable-next-line:max-line-length
          return this.error('Can\'t enroll %s into %s: found more than one workflow with that name.', [
            email,
            workflow,
          ]);
        }

        if (workflows[0]) {
          workflow = workflows[0].id;
        }
      }

      await this.client.enrollContactToWorkflow(workflow, email);
      return this.pass('The contact %s was successfully enrolled to workflow %s', [email, stepData.workflow]);
    } catch (e) {
      return this.error('There was an error enrolling the HubSpot contact to workflow: %s', [e.toString()]);
    }
  }

}

export { EnrollContactToWorkflowStep as Step };
