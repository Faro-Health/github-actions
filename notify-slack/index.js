'use strict';

const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');

const CONCLUSION_SUCCESS = 'success';
const CONCLUSION_FAILURE = 'failure';

function getFailedPayload(run) {
    return {
        text: `Build <${run.html_url}|'${run.display_title}'> failed`,
        icon_emoji: ':rocket:',
        attachments: [{
            color: "#FF0000",
            fields: [
                {
                    title: "Repository",
                    value: `<${run.repository.html_url}|${run.repository.name}>`,
                    short: true,
                },
                {
                    title: "Branch",
                    value: run.head_branch,
                    short: true,
                },
                {
                    title: "Requested for",
                    value: `<${run.triggering_actor.html_url}|${run.triggering_actor.login}>`,
                    short: true,
                },
                {
                    title: "Duration",
                    value: "20 seconds", // calc updated_at - created_at
                    short: true,
                },
            ],
        }],
    };
}

function getSuccessPayload(run) {
    return {
        text: `Build <${run.html_url}|'${run.display_title}'> succeeded`,
        icon_emoji: ':rocket:',
        attachments: [{
            color: "#00FF00",
            fields: [
                {
                    title: "Repository",
                    value: `<${run.repository.html_url}|${run.repository.name}>`,
                    short: true,
                },
                {
                    title: "Branch",
                    value: run.head_branch,
                    short: true,
                },
                {
                    title: "Requested for",
                    value: `<${run.triggering_actor.html_url}|${run.triggering_actor.login}>`,
                    short: true,
                },
                {
                    title: "Duration",
                    value: "20 seconds", // calc updated_at - created_at
                    short: true,
                },
            ],
        }],
    };
}

const main = async () => {
    try {
        const repository = core.getInput('repository', { required: true });
        const token = core.getInput('token', { required: true });
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
        if (conclusion === CONCLUSION_SUCCESS) {
            if ((prevRun || {}).conclusion === CONCLUSION_SUCCESS) {
                return;
            }
        }
        const payload = conclusion === CONCLUSION_FAILURE ? getFailedPayload(curRun) : getSuccessPayload(curRun);
console.log('payload:', payload);
        await axios.post(slackWebHookUrl, JSON.stringify(payload));
    } catch (error) {
        core.setFailed(error.stack);
    }
}
main();
