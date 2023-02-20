const { Octokit } = require("@octokit/rest");

const owner = "firebase"
const repo = "firebase-android-sdk"

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

async function run() {
  // const { data } = await octokit.request('GET /repos/{owner}/{repo}/issues', {
  //   owner: owner,
  //   repo: repo,
  //   state: "open"
  // })
  // console.log(data.length);

  const today = new Date().toISOString().split('T')[0];
  const query = `is:issue is:open created:${today}`;

  octokit.search.issuesAndPullRequests({ q: query })
    .then((response) => {
      console.log(`Found ${response.data.total_count} issues opened today:`);
      response.data.items.forEach((issue) => {
        console.log(`- ${issue.html_url}`);
      });
    })
    .catch((error) => {
      console.error(`Error retrieving issues: ${error}`);
    });
    



  // octokit.repos.createForAuthenticatedUser({
  //   name: "test_repo",
  //   description: "this is a test",
  // })
  // .then((response) => {
  //   console.log(`Successfully created new repository: ${response.data.html_url}`);
  // })
  // .catch((error) => {
  //   console.error(`Error creating new repository: ${error}`);
  // });
}

run();
