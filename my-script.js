const { Octokit } = require("@octokit/rest");

const today = new Date().toISOString().split('T')[0];
var yesterday = new Date()
yesterday = new Date(yesterday.setDate(yesterday.getDate()-1)).toISOString().split('T')[0];

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

async function run() {
  try {
    const repositoryName = "issue_testing_1"
    const response = await createAndroidProject(repositoryName, REPOSITORY_OWNER)
    console.log(`Created repository ${response.data.name} with URL ${response.data.html_url}`);
  } catch (error) {
    console.error(`Error creating repository ${repositoryName}: ${error}`);
  }
}

run();

async function createAndroidProject(repositoryName, repositoryOwner) {

  // const response = await octokit.repos.createForAuthenticatedUser({
  //   name: repositoryName,
  //   private: true,
  // });

  const tree = await octokit.git.createTree({
    owner: repositoryOwner,
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