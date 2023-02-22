const { Octokit } = require("@octokit/rest");

const today = new Date().toISOString().split('T')[0];
var yesterday = new Date()
yesterday = new Date(yesterday.setDate(yesterday.getDate()-1)).toISOString().split('T')[0];

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

async function run() {
    const FIREBASE_OWNER = "firebase"
    const FIREBASE_REPOSITORY = "firebase-android-sdk"
    const QUERY_DATE = yesterday

    // Retrieve all issues that were opened for the day for the said repository
    const query = `is:issue is:open created:${QUERY_DATE} repo:${FIREBASE_OWNER}/${FIREBASE_REPOSITORY}`;
    var issues = await getIssuesFromRepo(query)

    // Create a repository for each issue that were opened
    await issues.forEach(async (issue) => {
        const repositoryName = `issue${issue.number}`
        
        console.log("issue9999: " + repoExists("issue9999"))
        console.log("issue8888: " + repoExists("issue8888"))
        console.log("issue4707: " + repoExists("issue4707"))
        
        if(repoExists(repositoryName)) {
            console.log(`Repository ${repositoryName} already exists`);
            return
        }

        try {
            const response = await createAndroidProject(repositoryName)
            console.log(`Created repository ${response.data.name} with URL ${response.data.html_url}`);
        } catch (error) {
            console.error(`Error creating repository ${repositoryName}: ${error}`);
        }
    });
}

run();


async function getIssuesFromRepo(query) {
    return await octokit.search.issuesAndPullRequests({ q: query })
        .then((response) => { return response.data.items.filter(issue => !issue.pull_request) })
        .catch((error) => console.error(`Error retrieving issues: ${error}`));
}

async function repoExists(repositoryName){
    const existingRepo = await octokit.repos.get({ owner: process.env.MY_USERNAME, repo: repositoryName }).catch(() => null);
    if(existingRepo) { return true } else { return false }
}

async function createAndroidProject(repositoryName) {

  const response = await octokit.repos.createForAuthenticatedUser({
    name: repositoryName,
    private: true,
  });

  const tree = await octokit.git.createTree({
    owner: owner,
    repo: repositoryName,
    base_tree: null,
    tree: [
      {
        path: 'app',
        mode: '040000',
        type: 'tree'
      },
      {
        path: 'gradle',
        mode: '040000',
        type: 'tree'
      },
      {
        path: `src/main/java/com/${repositoryOwner}/${repositoryName}`,
        mode: '040000',
        type: 'tree'
      },
      {
        path: 'src/main/res',
        mode: '040000',
        type: 'tree'
      },
      {
        path: 'build.gradle',
        mode: '100644',
        type: 'blob',
        content: 'BUILD_GRADLE_CONTENTS'
      },
      {
        path: 'settings.gradle',
        mode: '100644',
        type: 'blob',
        content: 'SETTINGS_GRADLE_CONTENTS'
      }
    ]
  });
  
  const commit = await octokit.git.createCommit({
    owner: owner,
    repo: repositoryName,
    message: 'Initial commit',
    tree: tree.data.sha,
    parents: [],
  });

  await octokit.git.updateRef({
    owner: owner,
    repo: repositoryName,
    ref: 'heads/master',
    sha: commit.data.sha,
  });

  return response
}