const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

async function run() {
    const repositoryName = "issue_testing_1"
    const REPOSITORY_OWNER = "argzdev"

    try {
        const response = await createAndroidProject(repositoryName, REPOSITORY_OWNER)
        console.log(`Created repository ${response.data.name} with URL ${response.data.html_url}`);
    } catch (error) {
        console.error(`Error creating repository ${repositoryName}: ${error}`);
    }
}

run();

async function createAndroidProject(repositoryName, repositoryOwner) {

    var repoName = ""

    octokit.repos.createForAuthenticatedUser({
        name: repositoryName,
        private: true,
    }).then(({ data }) => {
        console.log("created data: " + data)
        repoName = data.name

        octokit.git.createTree({
            owner: repositoryOwner,
            repo: repoName,
            tree: [{
                path: `src/main/java/com/${repositoryOwner}/${repositoryName}`,
                mode: '040000',
                type: 'tree'
            }
        ]
        }).then(({ data }) => {
            console.log('Tree created: ' + data.sha);
        }).catch((error) => {
            console.error(error);
        });
    }).catch((error) => {
        console.error(error);
    });
    


  return response
}