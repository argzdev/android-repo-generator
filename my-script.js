const core = require('@actions/core')
const github = require('@actions/github')

async function run() {
  const GITHUB_TOKEN = process.env.MY_TOKEN
  const octokit = github.getOctokit(GITHUB_TOKEN)

  const { data } = await octokit.repos.listForAuthenticatedUser();
  console.log(data);
}

run();
