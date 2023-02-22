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
    const repository = await createRepository(repositoryName)
    // const repoUrl = repository.data.html_url;
    console.log('Repository URL:', repository);

    // return octokit.repos.createOrUpdateFileContents({
    //       owner: owner,
    //       repo: repo,
    //       path: 'tests.txt',
    //       message: 'Add tests.txt',
    //       content: Buffer.from(content).toString('base64')
    //     });
    //   }).then(response => {
    //     const commitSha = response.data.commit.sha;
    //     console.log('Commit SHA:', commitSha);
      
    //     const tree = [
    //         {
    //             path: 'hello.txt',
    //             mode: '100644',
    //             sha: response.data.content.sha
    //         },
    //         {
    //             path: 'app',
    //             mode: '040000',
    //             type: 'tree',
    //             sha: response.data.content.sha
    //           },
    //           {
    //             path: 'gradle',
    //             mode: '040000',
    //             type: 'tree',
    //             sha: response.data.content.sha
    //           },
    //     ];
      
    //     // Get the SHA for the HEAD commit of the master branch
    //     return octokit.git.getRef({
    //       owner: owner,
    //       repo: repo,
    //       ref: 'heads/main'
    //     }).then(response => {
    //       const baseTreeSha = response.data.object.sha;
    //       console.log('base Tree SHA:', baseTreeSha);
      
    //       // Create a new Git tree with the specified content
    //       return octokit.git.createTree({
    //         owner: owner,
    //         repo: repo,
    //         base_tree: baseTreeSha,
    //         tree: tree
    //       });
    //     });
    //   }).then(response => {
    //     const treeSha = response.data.sha;
    //     console.log('Tree SHA:', treeSha);
    //   }).catch(error => {
    //     console.log('Error:', error);
    //   });
}

async function createRepository(repositoryName){
    const repository = await octokit.repos.createForAuthenticatedUser({name: repositoryName})
    return repository
}