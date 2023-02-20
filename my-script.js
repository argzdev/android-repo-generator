const { Octokit } = require("@octokit/rest");

const owner = "firebase"
const repo = "firebase-android-sdk"

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

async function run() {
  const today = new Date().toISOString().split('T')[0];
  const query = `is:issue is:open created:${today} repo:${owner}/${repo}`;
  var issues = [];

  // get all repositories that were opened for the day
  await octokit.search.issuesAndPullRequests({ q: query })
    .then((response) => {
      issues = response.data.items.filter(issue => !issue.pull_request);
      console.log(`Found ${issues.length} issues opened today in firebase-android-sdk:`);
    })
    .catch((error) => {
      console.error(`Error retrieving issues: ${error}`);
    });

  // for each issue that were opened for the day, create a repository
  await issues.forEach(async (issue) => {
    const name = `issue${issue.number}`
    
    try {
      const existingRepo = await octokit.repos.get({ owner: process.env.MY_USERNAME, repo: name }).catch(() => null);

      if (!existingRepo) {
        const response = await octokit.repos.createForAuthenticatedUser({
          name,
          private: true,
          auto_init: true,
          template_owner: 'android',
          template_repo: 'android-starter',
        });
        console.log(`Created repository ${response.data.name} with URL ${response.data.html_url}`);
      } else {
        console.log(`Repository ${existingRepo.data.name} already exists`);
      }
    } catch (error) {
      console.error(`Error creating repository ${name}: ${error}`);
    }
  });
}

run();
