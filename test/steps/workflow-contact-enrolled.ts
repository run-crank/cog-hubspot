import { Struct } from 'google-protobuf/google/protobuf/struct_pb';
import * as chai from 'chai';
import { default as sinon } from 'ts-sinon';
import * as sinonChai from 'sinon-chai';
import 'mocha';

import { Step as ProtoStep, StepDefinition, FieldDefinition, RunStepResponse } from '../../src/proto/cog_pb';
import { Step } from '../../src/steps/workflow-contact-enrolled';

chai.use(sinonChai);

describe('ContactEnrolledToWorkflowStep', () => {
  const expect = chai.expect;
  let protoStep: ProtoStep;
  let stepUnderTest: Step;
  let clientWrapperStub: any;

  beforeEach(() => {
    protoStep = new ProtoStep();
    clientWrapperStub = sinon.stub();
    clientWrapperStub.getContactByEmail = sinon.stub();
    clientWrapperStub.currentContactWorkflows = sinon.stub();
    stepUnderTest = new Step(clientWrapperStub);
  });

  describe('Metadata', () => {
    it('should return expected step metadata', () => {
      const stepDef: StepDefinition = stepUnderTest.getDefinition();
      expect(stepDef.getStepId()).to.equal('ContactEnrolledToWorkflowStep');
      expect(stepDef.getName()).to.equal('Check Workflow Enrollment of a HubSpot Contact');
      expect(stepDef.getExpression()).to.equal('the (?<email>.+) hubspot contact should currently be enrolled in workflow (?<workflow>.+)');
      expect(stepDef.getType()).to.equal(StepDefinition.Type.VALIDATION);
    });

    it('should return expected step fields', () => {
      const stepDef: StepDefinition = stepUnderTest.getDefinition();
      const fields: any[] = stepDef.getExpectedFieldsList().map((field: FieldDefinition) => {
        return field.toObject();
      });

      expect(fields[1].key).to.equal('email');
      expect(fields[1].optionality).to.equal(FieldDefinition.Optionality.REQUIRED);
      expect(fields[1].type).to.equal(FieldDefinition.Type.EMAIL);

      expect(fields[0].key).to.equal('workflow');
      expect(fields[0].optionality).to.equal(FieldDefinition.Optionality.REQUIRED);
      expect(fields[0].type).to.equal(FieldDefinition.Type.ANYSCALAR);
    });
  });

  describe('Execute Step', () => {
    describe('Contact is not enrolled', () => {
      beforeEach(() => {
        clientWrapperStub.getContactByEmail.returns(Promise.resolve({
          properties: { hs_object_id: { value: 1 } },
        }));
        clientWrapperStub.currentContactWorkflows.returns(Promise.resolve([{
          id: 321,
          name: 'Unique Workflow',
        }]));
        protoStep.setData(Struct.fromJavaScript({
          workflow: 'Email Workfloww',
          email: 'test@automatoninc.com',
        }));
      });

      it('should respond with fail', async () => {
        const response = await stepUnderTest.executeStep(protoStep);
        expect(response.getOutcome()).to.equal(RunStepResponse.Outcome.FAILED);
      });
    });

    describe('Contact is enrolled', () => {
      const workflow = 'Email Workflow';
      const email = 'test@automatoninc.com';

      beforeEach(() => {
        clientWrapperStub.currentContactWorkflows.returns(Promise.resolve([{
          id: 12345,
          name: workflow,
        }]));

        clientWrapperStub.getContactByEmail.returns(Promise.resolve({
          properties: { hs_object_id: { value: 1 } },
        }));

        protoStep.setData(Struct.fromJavaScript({
          workflow,
          email,
        }));
      });

      it('should respond with pass', async () => {
        const response = await stepUnderTest.executeStep(protoStep);
        expect(response.getOutcome()).to.equal(RunStepResponse.Outcome.PASSED);
      });
    });

    describe('Error was thrown', () => {
      const workflow = 'Email Workflow';
      const email = 'test@automatoninc.com';

      beforeEach(() => {
        clientWrapperStub.getContactByEmail.throws();
        protoStep.setData(Struct.fromJavaScript({
          workflow,
          email,
        }));
      });

      it('should respond with error', async () => {
        const response = await stepUnderTest.executeStep(protoStep);
        expect(response.getOutcome()).to.equal(RunStepResponse.Outcome.ERROR);
      });
    });
  });
});
