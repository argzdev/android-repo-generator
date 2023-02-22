const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

async function run() {
    const repositoryName = "issue_testing_1"
    const REPOSITORY_OWNER = "argzdev"

    try {
        await createAndroidProject(repositoryName, REPOSITORY_OWNER)
        console.log(`Created repository ${response.data.name} with URL ${response.data.html_url}`);
    } catch (error) {
        console.error(`Error creating repository ${repositoryName}: ${error}`);
    }
}

run();

async function createAndroidProject(repositoryName, repositoryOwner) {

    const owner = repositoryOwner;
    const repo = repositoryName;
    const content = 'Hello, World!';

    // Create a new repository
    octokit.repos.createForAuthenticatedUser({
        name: repo
    }).then(response => {
        const repoUrl = response.data.html_url;
        console.log('Repository URL:', repoUrl);
    
        const tree = [{
            path: 'hello.txt',
            mode: '100644',
            content: content
        }];
    
        // Get the SHA for the HEAD commit of the master branch
        return octokit.git.getRef({
                owner: owner,
                repo: repo,
                ref: 'heads/master'
            }).then(response => {
                const baseTreeSha = response.data.object.sha;
            
                // Create a new Git tree with the specified content
                return octokit.git.createTree({
                    owner: owner,
                    repo: repo,
                    base_tree: baseTreeSha,
                    tree: tree
                });
            });
    }).then(response => {
        const treeSha = response.data.sha;
        console.log('Tree SHA:', treeSha);
    }).catch(error => {
        console.log('Error:', error);
    });
}