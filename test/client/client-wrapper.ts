import * as chai from 'chai';
import { default as sinon } from 'ts-sinon';
import * as sinonChai from 'sinon-chai';
import * as justForIdeTypeHinting from 'chai-as-promised';
import 'mocha';

import { ClientWrapper } from '../../src/client/client-wrapper';
import { Metadata } from 'grpc';

chai.use(sinonChai);
chai.use(require('chai-as-promised'));

describe('ClientWrapper', () => {
  const expect = chai.expect;
  let hubspotClientStub: any;
  let hubspotConstructorStub: any;
  let metadata: Metadata;
  let clientWrapperUnderTest: ClientWrapper;

  beforeEach(() => {
    hubspotClientStub = {
      refreshAccessToken: sinon.stub(),
    };
    hubspotConstructorStub = sinon.stub();
    hubspotConstructorStub.returns(hubspotClientStub)
  });

  it('authenticates with api key', () => {
    // Construct grpc metadata and assert the client was authenticated.
    const expectedCallArgs = {
      apiKey: 'some-api-key',
    };
    metadata = new Metadata();
    metadata.add('apiKey', expectedCallArgs.apiKey);

    // Assert that the underlying API client was authenticated correctly.
    clientWrapperUnderTest = new ClientWrapper(metadata, hubspotConstructorStub);
    expect(hubspotConstructorStub).to.have.been.calledWith(expectedCallArgs);
    expect(clientWrapperUnderTest.clientReady).to.eventually.equal(true);
  });

  it('authenticates with oauth details', () => {
    // Construct grpc metadata and assert the client was authenticated.
    const expectedCallArgs = {
      clientId: 'a-client-id',
      clientSecret: 'a-client-secret',
      refreshToken: 'a-refresh-token',
      redirectUri: 'https://example.com/oauth-callback'
    };
    metadata = new Metadata();
    metadata.add('clientId', expectedCallArgs.clientId);
    metadata.add('clientSecret', expectedCallArgs.clientSecret);
    metadata.add('refreshToken', expectedCallArgs.refreshToken);
    metadata.add('redirectUri', expectedCallArgs.redirectUri);

    // Set the refresh access token method to resolve.
    hubspotClientStub.refreshAccessToken.resolves();

    // Assert that the underlying API client was authenticated correctly.
    clientWrapperUnderTest = new ClientWrapper(metadata, hubspotConstructorStub);
    expect(hubspotConstructorStub).to.have.been.calledWith(expectedCallArgs);
    expect(clientWrapperUnderTest.clientReady).to.eventually.equal(true);
  });

  it('aborts client readiness when auth token refresh fails', () => {
    // Construct grpc metadata and assert the client was authenticated.
    const expectedCallArgs = {
      clientId: 'a-client-id',
      clientSecret: 'a-client-secret',
      refreshToken: 'a-refresh-token',
      redirectUri: 'https://example.com/oauth-callback'
    };
    metadata = new Metadata();
    metadata.add('clientId', expectedCallArgs.clientId);
    metadata.add('clientSecret', expectedCallArgs.clientSecret);
    metadata.add('refreshToken', expectedCallArgs.refreshToken);
    metadata.add('redirectUri', expectedCallArgs.redirectUri);

    // Set the refresh access token method to reject.
    hubspotClientStub.refreshAccessToken.rejects();

    // Assert that the underlying API client was authenticated correctly.
    clientWrapperUnderTest = new ClientWrapper(metadata, hubspotConstructorStub);
    expect(clientWrapperUnderTest.clientReady).to.eventually.be.rejected;
  });

  it('should identify date values', () => {
    const validEpoch = 1589245171;
    metadata = new Metadata();
    clientWrapperUnderTest = new ClientWrapper(metadata, hubspotConstructorStub);
    expect(clientWrapperUnderTest.isDate(validEpoch)).to.equal(true);
  });

  it('should convert epoch dates to YYYY-MM-DD format', () => {
    const validEpoch = 1579245603000;
    metadata = new Metadata();
    clientWrapperUnderTest = new ClientWrapper(metadata, hubspotConstructorStub);
    expect(clientWrapperUnderTest.toDate(validEpoch)).to.equal('2020-01-17T07:20:03.000Z');
  });
});
