import expect = require('../../expect');

import { Result, SceneFinished, SceneStarts } from '@serenity-js/core/lib/domain';
import { lastOf } from '../../support/event_picker';
import { spawner } from '../../support/spawner';

describe('When working with Mocha', function() {

    this.timeout(30 * 1000);    // it might take a while to start up the selenium server

    const protractor = spawner(
        process.cwd() + '/node_modules/.bin/protractor',
        { cwd: __dirname, silent: true },
    );

    // todo: tags: https://medium.com/@andrew_levine/tagging-tests-w-protractor-and-mocha-20b20bc10322#.cngxajsbf

    describe('Serenity/JS', () => {

        it ('reports passing scenarios', () => {
            const spawned = protractor('protractor.conf.js',
                '--mochaOpts.grep', 'A sample test that passes',
            );

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.length.greaterThan(2);

                const event = lastOf(SceneFinished, spawned.messages);

                expect(Result[event.value.result]).to.equal(Result[Result.SUCCESS]);
            });
        });

        it ('reports pending scenarios', () => {
            const spawned = protractor('protractor.conf.js',
                '--mochaOpts.grep', 'A sample test that is pending',
            );

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.length.greaterThan(2);

                const event = lastOf(SceneFinished, spawned.messages);

                expect(Result[event.value.result]).to.equal(Result[Result.PENDING]);
            });
        });

        it ('reports skipped scenarios', () => {
            const spawned = protractor('protractor.conf.js',
                '--mochaOpts.grep', 'A sample test that is skipped',
            );

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.length.greaterThan(2);

                const event = lastOf(SceneFinished, spawned.messages);

                expect(Result[event.value.result]).to.equal(Result[Result.PENDING]);
            });
        });

        it('reports sync scenarios failing due to an AssertionError', () => {

            const spawned = protractor('protractor.conf.js',
                '--mochaOpts.grep', 'A sample test that fails due to an AssertionError',
            );

            return expect(spawned.result).to.be.eventually.rejected.then(() => {
                expect(spawned.messages).to.have.length.greaterThan(2);

                const event = lastOf(SceneFinished, spawned.messages);

                expect(Result[event.value.result]).to.equal(Result[Result.FAILURE]);
            });
        });

        it('reports async scenarios failing due to an AssertionError', () => {

            const spawned = protractor('protractor.conf.js',
                '--mochaOpts.grep', 'ails due to an async AssertionError',
            );

            return expect(spawned.result).to.be.eventually.rejected.then(() => {
                expect(spawned.messages).to.have.length.greaterThan(2);

                const event = lastOf(SceneFinished, spawned.messages);

                expect(Result[event.value.result]).to.equal(Result[Result.FAILURE]);
                expect(event.value.error).to.deep.equal({
                    actual: 'async pass',
                    expected: 'async fail',
                    message: 'expected \'async pass\' to equal \'async fail\'',
                    name: 'AssertionError',
                    showDiff: true,
                });
            });
        });

        it('reports scenarios that timed out', () => {

            const spawned = protractor('protractor.conf.js',
                '--mochaOpts.grep', 'A sample test that times out',
            );

            return expect(spawned.result).to.be.eventually.rejected.then(() => {
                expect(spawned.messages).to.have.length.greaterThan(2);

                const event = lastOf(SceneFinished, spawned.messages);

                expect(Result[event.value.result]).to.equal(Result[Result.ERROR]);
                expect(event.value.error.message).to.match(/Timeout of 5ms exceeded./);
            });
        });

        it('reports scenarios that failed with an error', () => {

            const spawned = protractor('protractor.conf.js',
                '--mochaOpts.grep', 'A sample test that fails with an error',
            );

            return expect(spawned.result).to.be.eventually.rejected.then(() => {
                expect(spawned.messages).to.have.length.greaterThan(2);

                const event = lastOf(SceneFinished, spawned.messages);

                expect(Result[event.value.result]).to.equal(Result[Result.ERROR]);
                expect(event.value.error.message).to.match(/Expected problem/);
            });
        });

        it('reports scenarios that failed with an error asynchronously', () => {

            const spawned = protractor('protractor.conf.js',
                '--mochaOpts.grep', 'A sample test that asynchronously fails with an error',
            );

            return expect(spawned.result).to.be.eventually.rejected.then(() => {
                expect(spawned.messages).to.have.length.greaterThan(2);

                const event = lastOf(SceneFinished, spawned.messages);

                expect(Result[event.value.result]).to.equal(Result[Result.ERROR]);
                expect(event.value.error.message).to.match(/Expected async problem/);
            });
        });

        it ('recognises the name of the feature under test (the outer-most `describe`)', () => {
            const spawned = protractor('protractor.conf.js',
                '--mochaOpts.grep', 'A sample test that passes',
            );

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.length.greaterThan(2);

                const sceneStarts = lastOf(SceneStarts, spawned.messages);
                const sceneFinished = lastOf(SceneFinished, spawned.messages);

                expect(sceneStarts.value.category).to.equal('Integration with Mocha');
                expect(sceneFinished.value.subject.category).to.equal('Integration with Mocha');
            });
        });

        it ('recognises the name of the scenario', () => {
            const spawned = protractor('protractor.conf.js',
                '--mochaOpts.grep', 'A sample test that passes',
            );

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.length.greaterThan(2);

                const sceneStarts = lastOf(SceneStarts, spawned.messages);
                const sceneFinished = lastOf(SceneFinished, spawned.messages);

                expect(sceneStarts.value.name).to.equal('A sample test that passes');
                expect(sceneFinished.value.subject.name).to.equal('A sample test that passes');
            });
        });

        it ('treats a scenario with setup and teardown just like any other scenario', () => {
            const spawned = protractor('protractor.conf.js',
                '--mochaOpts.grep', 'A test with both setup and teardown that passes',
            );

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.length.greaterThan(2);

                const sceneStarts = lastOf(SceneStarts, spawned.messages);
                const sceneFinished = lastOf(SceneFinished, spawned.messages);

                expect(sceneStarts.value.name).to.equal('A test with both setup and teardown that passes');
                expect(sceneFinished.value.subject.name).to.equal('A test with both setup and teardown that passes');
            });
        });
    });
});
