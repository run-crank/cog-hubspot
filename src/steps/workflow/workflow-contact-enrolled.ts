/*tslint:disable:no-else-after-return*/

import { BaseStep, Field, StepInterface } from '../../core/base-step';
import { Step, FieldDefinition, StepDefinition } from '../../proto/cog_pb';

export class ContactEnrolledToWorkflowStep extends BaseStep implements StepInterface {

  protected stepName: string = 'Check Current Workflow Enrollment of a HubSpot Contact';
  protected stepExpression: string = 'the (?<email>.+) hubspot contact should currently be enrolled in workflow (?<workflow>.+)';
  protected stepType: StepDefinition.Type = StepDefinition.Type.VALIDATION;

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
    const workflow = stepData.workflow;

    try {

      const contact = await this.client.getContactByEmail(email);

      // tslint:disable-next-line:max-line-length
      const workflows = (await this.client.currentContactWorkflows(contact.properties['hs_object_id'].value)) || [];

      if (workflows.length === 0) {
        return this.fail('Contact %s is currently not enrolled to any Workflow', [
          email,
        ]);
      }

      const property = isNaN(workflow) ? 'name' : 'id';

      // tslint:disable-next-line:triple-equals
      const enrolled = workflows.find(f => f[property] == workflow);

      if (!enrolled) {
        return this.fail('The Contact %s is not enrolled in the given workflow %s. Contact is enrolled in: %s', [
          email,
          workflow,
          workflows.map(f => f[property]).join(', '),
        ]);
      }

      return this.pass('The contact %s was verified to be enrolled in workflow %s', [
        email,
        workflow,
      ]);
    } catch (e) {
      return this.error('There was an error checking workflow enrollments for contact: %s', [
        e.toString(),
      ]);
    }
  }

}

export { ContactEnrolledToWorkflowStep as Step };
