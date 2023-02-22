const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

async function run() {
    const repositoryName = "issue_testing_1"
    const REPOSITORY_OWNER = "argzdev"
    await createAndroidProject(repositoryName, REPOSITORY_OWNER)
}


async function createAndroidProject(repositoryName, repositoryOwner) {
    // Step 1 create repository
    // const { data: repository } = await octokit.repos.createForAuthenticatedUser({
    //     name: repositoryName,
    //     auto_init: false
    // });
    // console.log(`Created repository ${repository.full_name}`);

    // Step 2 create an empty file
    // const { data: file } = octokit.rest.repos.createOrUpdateFileContents({
    //     owner: repositoryOwner,
    //     repo: repositoryName,
    //     path: "README.md",
    //     message: "Initial commit",
    //     content: "",
    // })

    // Step 3 get commit SHA
    const { data: { sha: baseTreeSha } } = await octokit.git.getRef({
        repositoryOwner,
        repo: repositoryName,
        ref: 'main'
    });
    console.log(`Base tree SHA: ${baseTreeSha}`);


    // Step 4 create tree
    // const tree = await createGitTree(projectStructure, baseTreeSha);
    // const branchRef = await createBranch(tree.sha);
    // console.log(`Created new branch ${branchRef.data.ref}`);
    // const { data: { html_url } } = await octokit.projects.createForRepo({
    //     owner,
    //     repo: repoName,
    //     name: projectName
    // });
    // console.log(`Created new project ${html_url}`);
}

run();


/***
 * 
 * 
    const requestURL = 'https://api.github.com/repos/' + repoName + '/issues?sort=created&state=all&page=' + pageNo + '&per_page=100';
    const apiResults = await fetch(requestURL, {
        method: 'GET',
        headers: {
            'Accept': 'application/vnd.github.symmetra-preview+json',
            'Authorization': 'token ' + accessToken
        }
    }).then(resp => {
        return resp.json();
    });
    return apiResults;
 * 
 */