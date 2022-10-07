# Farohealth GitHub Actions

## azure-devops-npm

### Generate .npmrc file for Azure DevOps

This github action generates a `.npmrc` file for Azure DevOps

```yaml
- uses: Faro-Health/github-actions/azure-devops-npm@master
  with:
    organization: "farohealth"
    registry: "my_registry"
    user: "some_user"
    password: ${{ secrets.AZURE_NPM_TOKEN }}
    email: "some_user@farohealth.com"
```
### How to setup (You must follow steps 1 and 2 to make the action work)
#### **Step 1**: Create a yaml workflow file in your project
Go to the root of your project, and create the path to your workflow file. For example

```
mkdir -p .github/workflows
```

Here is an example of what to put in your `.github/workflows/publish-npm.yml` file to trigger the action.

```yaml
name: Publish on Azure NPM registry
on:
    push:
        branches: [master]
jobs:
    build:
        runs-on: ubuntu-latest
        steps:
        - uses: actions/checkout@v2
        - uses: Faro-Health/github-actions/azure-devops-npm@master
          with:
              organization: farohealth
              registry: my_npm_registry
              user: some_user
              password: ${{ secrets.AZURE_NPM_TOKEN }}
              email: some_user@farohealth.com
        - name: Install dependencies
          run: npm install
        - name: Build
          run: npm run build
        - name: Publish to Azure
          run: npm publish
```
**This yaml file build and publish your project everytime you push on master**

#### **Step 2:** Add your Azure DevOps token to github secrets
Go to [Azure DevOps](https://dev.azure.com) to generate a new token. More imformation on the [offical documentation](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=preview-page). Once your token is correctly base64 encoded, you can had it to your github secrets by following these steps:

-   Open your project on Github
-   Click on **Settings**
-   Click on **Secrets**
-   Click on **New Secret**
-   Name: **AZURE_NPM_TOKEN**, Value: (Paste your token from Azure)

That's it! Once this is done, the action will be triggered on every push to master.

### Action inputs

| Name              | Description                                          | Required | Default  |
| ----------------- | ---------------------------------------------------- | -------- |----------|
| `organization`    | Your Azure organization                              | true     |    -     |
| `registry`        | Your Azure registry                                  | true     |    -     |
| `user`            | Your Azure user                                      | true     |    -     |
| `password `       | Your Azure password                                  | true     |    -     |
| `email`           | Your Azure email                                     | true     |    -     |
| `npmrc-path`      | Path to .npmrc file                                  | false    | ~/.npmrc |

## notify-slack

This github action notifies slack users about successful or failed builds. Add as a job into your build workflow script:

```yaml
  notify-slack:
    runs-on: ubuntu-latest
    if: success() || failure()
    needs: [build]
    steps:
      - name: Notify slack
        uses: Faro-Health/github-actions/notify-slack@master
        with:
          repository: ${{ github.repository }}
          token: ${{ github.token }}
          conclusion: ${{ needs.build.result }}
          slackWebHookUrl: ${{ secrets.SLACK_WEBHOOK }}
```

### How to setup
1. Create a new Slack app in the workspace where you want to post messages.
2. From the Features page, toggle Activate Incoming Webhooks on.
3. Click Add New Webhook to Workspace.
4. Pick a channel that the app will post to, then click Authorize.
5. Store Incoming Webhook URL in the Github repository or project secrets.

For more info go to [Slack API::Create an Incoming Webhook](https://api.slack.com/messaging/webhooks#create_a_webhook).

### Action inputs
| Name              | Description                                          | Required |
| ----------------- | ---------------------------------------------------- | -------- |
| `repository`      | Github repository full name, "account/repo"          | true     |
| `token`           | Github token                                         | true     |
| `conclusion`      | Build job conclusion, "success" or "failure"         | true     |
| `slackWebHookUrl `| Slack Incoming Webhook URL                           | true     |
