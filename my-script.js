const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: process.env.MY_TOKEN,
});

async function run() {
  const { data } = await octokit.repos.listForAuthenticatedUser();
  console.log(data);
}

run();
