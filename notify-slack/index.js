const core = require('@actions/core');
const github = require('@actions/github');

const main = async () => {
    try {
        const owner = core.getInput('owner', { required: true });
        const repo = core.getInput('repo', { required: true });
        const token = core.getInput('token', { required: true });
        const message = core.getInput('message', { required: true });

        const octokit = new github.getOctokit(token);

        const runs = await octokit.rest.actions.listWorkflowRunsForRepo({
            owner: owner,
            repo: repo,
            per_page: 1,
            page: 1,
        });
        console.log(runs);

    } catch (error) {
        core.setFailed(error.message);
    }
}

// Call the main function to run the action
main();