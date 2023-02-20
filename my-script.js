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
  const query = `is:issue is:open created:${today} repo:firebase/firebase-android-sdk`;
  var issues = [];
  // Search for issues using the API
  octokit.search.issuesAndPullRequests({ q: query })
    .then((response) => {
      issues = response.data.items.filter(issue => !issue.pull_request);
      console.log(`Found ${issues.length} issues opened today in firebase-android-sdk:`);

      issues.forEach(issue => {
        console.log("issue"+issue.number)
      })
    })
    .catch((error) => {
      console.error(`Error retrieving issues: ${error}`);
    });

    // issues.forEach(async (issue) => {
    //   const name = issue.name
    //   try {
    //     const response = await octokit.repos.createForAuthenticatedUser({
    //       name,
    //       private: true,
    //     });
    //     console.log(`Created repository ${response.data.name} with URL ${response.data.html_url}`);
    //   } catch (error) {
    //     console.error(`Error creating repository ${name}: ${error}`);
    //   }
    // });

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
