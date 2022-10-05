'use strict';

const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios').default;

const main = async () => {
    try {
        const repository = core.getInput('repository', { required: true });
        const token = core.getInput('token', { required: true });
        const message = core.getInput('message', { required: true });
        const conclusion = core.getInput('conclusion', { required: true });
        const slackWebHookUrl = core.getInput('slackWebHookUrl', { required: true });

        const octokit = new github.getOctokit(token);
        const [owner, repo] = repository.split('/');

        const { data } = await octokit.rest.actions.listWorkflowRunsForRepo({
            owner: owner,
            repo: repo,
            per_page: 2,
            page: 1,
        });
        const [curRun, prevRun] = (data || {}).workflow_runs || [];
        console.log(data.workflow_runs);
        console.log("conclusion", conclusion);

        const payload = {
          attachments: [{text: message, color: 'green'}]
        };
        const options = {
          method: 'post',
          baseURL: slackWebHookUrl,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
          },
          data: payload,
        };
        await axios.request(options);
    } catch (error) {
        core.setFailed(error.message);
    }
}

// Call the main function to run the action
main();