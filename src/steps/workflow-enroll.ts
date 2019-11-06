/*tslint:disable:no-else-after-return*/

import { BaseStep, Field, StepInterface } from '../core/base-step';
import { Step, FieldDefinition, StepDefinition } from '../proto/cog_pb';

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

        workflow = workflows[0].id;
      }

      await this.client.enrollContactToWorkflow(workflow, email);

      return this.pass('The contact %s was successfully enrolled to workflow %s', [
        email,
        workflow,
      ]);
    } catch (e) {
      return this.error('There was an error enrolling the HubSpot contact to workflow: %s', [
        e.toString(),
      ]);
    }
  }

}

export { EnrollContactToWorkflowStep as Step };
