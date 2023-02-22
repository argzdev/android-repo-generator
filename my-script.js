const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

async function run() {
    const repositoryName = "issue_testing_1"
    const REPOSITORY_OWNER = "argzdev"

    try {
        await createAndroidProject(repositoryName, REPOSITORY_OWNER)
    } catch (error) {
        console.error(`Error creating repository ${repositoryName}: ${error}`);
    }
}

run();

async function createAndroidProject(repositoryName, repositoryOwner) {

    const owner = repositoryOwner;
    const repo = repositoryName;
    const content = 'Hello, World!';

    octokit.repos.createForAuthenticatedUser({
        name: repo
      }).then(response => {
        const repoUrl = response.data.html_url;
        console.log('Repository URL:', repoUrl);
      
        // Create a new file in the repository
        return octokit.repos.createOrUpdateFileContents({
          owner: owner,
          repo: repo,
          path: 'hello.txt',
          message: 'Add hello.txt',
          content: Buffer.from(content).toString('base64')
        });
      }).then(response => {
        const commitSha = response.data.commit.sha;
        console.log('Commit SHA:', commitSha);
      
        const tree = [{
          path: 'hello.txt',
          mode: '100644',
          sha: response.data.content.sha
        }];
      
        // Get the SHA for the HEAD commit of the master branch
        return octokit.git.getRef({
          owner: owner,
          repo: repo,
          ref: 'heads/main'
        }).then(response => {
          const baseTreeSha = response.data.object.sha;
          console.log('base Tree SHA:', baseTreeSha);
      
          // Create a new Git tree with the specified content
          return octokit.git.createTree({
            owner: owner,
            repo: repo,
            base_tree: baseTreeSha,
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
        });
      }).then(response => {
        const treeSha = response.data.sha;
        console.log('Tree SHA:', treeSha);
      }).catch(error => {
        console.log('Error:', error);
      });
}