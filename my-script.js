const { Octokit } = require("@octokit/rest");

const firebase_owner = "firebase"
const firebase_repository = "firebase-android-sdk"
const today = new Date().toISOString().split('T')[0];
var yesterday = new Date()
yesterday = new Date(yesterday.setDate(yesterday.getDate()-1)).toISOString().split('T')[0];

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

async function run() {
    const query = `is:issue is:open created:${yesterday} repo:${firebase_owner}/${firebase_repository}`;

    var issues = await getIssuesFromRepo(query)
    console.log(`issues: ${issues}`)

  // for each issue that were opened for the day, create a repository
//   await issues.forEach(async (issue) => {
//     const repositoryName = `issue${issue.number}`
    
//     try {
//       const existingRepo = await octokit.repos.get({ owner: process.env.MY_USERNAME, repo: repositoryName }).catch(() => null);

//       if (!existingRepo) {
//         const response = await createAndroidProject(repositoryName)
//         console.log(`Created repository ${response.data.name} with URL ${response.data.html_url}`);
//       } else {
//         console.log(`Repository ${existingRepo.data.name} already exists`);
//       }
//     } catch (error) {
//       console.error(`Error creating repository ${repositoryName}: ${error}`);
//     }
//   });
}

run();


async function getIssuesFromRepo(query) {
    return await octokit.search.issuesAndPullRequests({ q: query })
        .then((response) => { return response.data.items.filter(issue => !issue.pull_request) })
        .catch((error) => console.error(`Error retrieving issues: ${error}`));
}