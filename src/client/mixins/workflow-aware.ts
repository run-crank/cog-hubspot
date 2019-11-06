export class WorkflowAwareMixin {
  clientReady: Promise<boolean>;
  client: any; //// cant use the @types here. The workflows property was not exposed.

  async enrollContactToWorkflow(workflow, email) {
    await this.clientReady;
    return new Promise((resolve, reject) => {
      this.client.workflows.enroll(workflow, email).then(resolve)
        .catch((err) => {
          const error = new Error();
          if (err.statusCode === 404) {
            error.message = `The Contact ${email} or the Workflow ${workflow} does not exist`;
            reject(error);
          } else if (err.statusCode === 412) {
            reject(err.message);
          }
          reject(err);
        });
    });
  }

  async findWorkflowByName(name) {
    await this.clientReady;
    return new Promise((resolve, reject) => {
      this.client.workflows.getAll().then((response) => {
        resolve(response.workflows.filter(f => f.name === name));
      }).catch(reject);
    });
  }
}
