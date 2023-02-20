const { Octokit } = require("@octokit/rest");

const owner = "firebase"
const repo = "firebase-android-sdk"

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

async function run() {
  const today = new Date().toISOString().split('T')[0];
  const query = `is:issue is:open created:${today} repo:firebase/firebase-android-sdk`;
  var issues = [];

  // get all repositories that were opened for the day
  octokit.search.issuesAndPullRequests({ q: query })
    .then((response) => {
      issues = response.data.items.filter(issue => !issue.pull_request);
      console.log(`Found ${issues.length} issues opened today in firebase-android-sdk:`);
    })
    .catch((error) => {
      console.error(`Error retrieving issues: ${error}`);
    });

  // for each issue that were opened for the day, create a repository
  issues.forEach(async (issue) => {
    const name = "issue" + issue.number

    try {
      const existingRepo = await octokit.repos.get({ owner: process.env.MY_USERNAME, repo: name }).catch(() => null);

      if (!existingRepo) {
        const response = await octokit.repos.createForAuthenticatedUser({
          name,
          private: true,
        });
        console.log(`Created repository ${response.data.name} with URL ${response.data.html_url}`);
      }
    } catch (error) {
      console.error(`Error creating repository ${name}: ${error}`);
    }
  });
}

run();
