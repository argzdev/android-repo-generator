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


async function createAndroidProject(repositoryName, repositoryOwner) {

    const projectStructure = {
        'app': {
        'src': {
            'main': {
            'java': {},
            'res': {}
            }
        }
        }
    };
    
    const { data: repository } = await octokit.repos.createForAuthenticatedUser({
        name: repositoryName,
        auto_init: false
    });
    console.log(`Created repository ${repository.full_name}`);
    const { data: { sha: baseTreeSha } } = await octokit.git.getRef({
        repositoryOwner,
        repo: repositoryName,
        ref: 'heads/main'
    });
    console.log(`Base tree SHA: ${baseTreeSha}`);
    const tree = await createGitTree(projectStructure, baseTreeSha);
    const branchRef = await createBranch(tree.sha);
    console.log(`Created new branch ${branchRef.data.ref}`);
    const { data: { html_url } } = await octokit.projects.createForRepo({
        owner,
        repo: repoName,
        name: projectName
    });
    console.log(`Created new project ${html_url}`);
}


async function createGitTree(files, baseTreeSha) {
    const gitTree = [];
    for (let [fileName, contents] of Object.entries(files)) {
        if (typeof contents === 'object') {
        const subtree = await createGitTree(contents, baseTreeSha);
        gitTree.push({
            path: fileName,
            mode: '040000',
            type: 'tree',
            sha: subtree.sha
        });
        } else {
        if (!fileName.endsWith('.gradle') && !fileName.endsWith('.gradle.kts')) { // exclude gradle plugin files
            gitTree.push({
            path: fileName,
            mode: '100644',
            type: 'blob',
            content: contents
            });
        }
        }
    }
    const { data: { sha } } = await octokit.git.createTree({
        owner,
        repo: repoName,
        base_tree: baseTreeSha,
        tree: gitTree
    });
    return { sha };
}

async function createBranch(treeSha) {
    return await octokit.git.createRef({
        owner,
        repo: repoName,
        ref: 'refs/heads/new-branch',
        sha: treeSha
});
}

run();
