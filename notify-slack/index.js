'use strict';

const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');

const CONCLUSION_SUCCESS = 'success';
const CONCLUSION_FAILURE = 'failure';

/**
 * Return diff of two dates in human readable format.
 * Example:
 *  timeDiff('2022-10-01T12:18:00.706Z', '2022-10-07T07:35:35.706Z')
 *  returns "5 days 19 hours 17 minutes 35 seconds"
 *
 * @param startDate Date in ISO format
 * @param endDate Date in ISO format
 * @returns Time diff in human readable format
 */
function timeDiff(startDate, endDate) {
    const seconds = Math.trunc(new Date(endDate).getTime() / 1000) - Math.trunc(new Date(startDate).getTime() / 1000);
    const levels = [
        [Math.floor(seconds / 31536000), 'year'],
        [Math.floor((seconds % 31536000) / 86400), 'day'],
        [Math.floor(((seconds % 31536000) % 86400) / 3600), 'hour'],
        [Math.floor((((seconds % 31536000) % 86400) % 3600) / 60), 'minute'],
        [(((seconds % 31536000) % 86400) % 3600) % 60, 'second'],
    ];
    const parts = [];
    for (const [num, val] of levels) {
        if (num === 0) continue;
        const value = num > 1 ? val + 's': val;
        parts.push(`${num} ${value}`);
    }
    return parts.join(' ');
}

/**
 * Get slack message API payload for given github run.
 *
 * @param {Object} run Github run object.
 * @returns Slack message API payload object
 */
function getPayload(run, conclusion) {
    const text = conclusion === CONCLUSION_FAILURE
        ? `Build <${run.html_url}|'${run.display_title}'> failed`
        : `Build <${run.html_url}|'${run.display_title}'> succeeded`;
    const color = conclusion === CONCLUSION_FAILURE
        ? "#FF0000"
        : "#008000";
    return {
        text: text,
        icon_emoji: ':rocket:',
        attachments: [{
            color: color,
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
                    value: timeDiff(run.created_at, run.updated_at),
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
        await axios.post(slackWebHookUrl, JSON.stringify(getPayload(curRun, conclusion)));
    } catch (error) {
        core.setFailed(error.stack);
    }
}
main();
